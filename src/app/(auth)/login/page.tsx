'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { Role } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Loader2, GraduationCap } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
})

type FormData = z.infer<typeof schema>

const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN:    '/super-admin/dashboard',
  COACHING_ADMIN: '/coaching-admin/dashboard',
  TEACHER:        '/teacher/dashboard',
  STUDENT:        '/student/dashboard',
}

export default function LoginPage() {
  const router  = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      const {
        accessToken, refreshToken,
        userId, name, role, coachingId,
      } = res.data

      setAuth({
        accessToken, refreshToken,
        userId, name, role, coachingId,
      })

      toast.success(`Welcome, ${name}!`)
      router.replace(ROLE_HOME[role as Role] ?? '/login')

    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? 'Login failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center
                    justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-xl">Coaching Platform</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}