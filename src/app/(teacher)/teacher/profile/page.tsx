'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { Lock, Mail, Phone, BookOpen } from 'lucide-react'

export default function TeacherProfilePage() {
  const { name } = useAuthStore()
  const [showPwForm, setShowPwForm] = useState(false)
  const [oldPw,  setOldPw]  = useState('')
  const [newPw,  setNewPw]  = useState('')
  const [confPw, setConfPw] = useState('')

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const res = await api.get('/teacher/dashboard')
      return res.data
    },
  })

  const pwMut = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/change-password', {
        oldPassword: oldPw,
        newPassword: newPw,
      })
      return res.data
    },
    onSuccess: () => {
      toast.success('Password changed!')
      setOldPw(''); setNewPw(''); setConfPw('')
      setShowPwForm(false)
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const handlePwSubmit = () => {
    if (newPw !== confPw) { toast.error('Passwords do not match!'); return }
    if (newPw.length < 6) { toast.error('Min 6 characters'); return }
    pwMut.mutate()
  }

  if (isLoading) return <LoadingSpinner />

  const courses: string[] = dashboard?.assignedCourses ?? []

  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-xl font-bold text-slate-800">My Profile</h1>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-100
                            flex items-center justify-center
                            text-green-700 text-xl font-bold">
              {name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">{name}</p>
              <p className="text-sm text-slate-500">Teacher</p>
            </div>
          </div>

          {courses.length > 0 && (
            <div className="flex items-center gap-2 text-sm
                            text-slate-600 flex-wrap">
              <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
              {courses.join(' • ')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <div className="px-4 py-3 border-b border-slate-100
                        flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800
                        flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-500" />
            Change Password
          </p>
          <Button variant="ghost" size="sm" className="text-xs"
            onClick={() => setShowPwForm(!showPwForm)}>
            {showPwForm ? 'Cancel' : 'Change'}
          </Button>
        </div>
        {showPwForm && (
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <Label>Current Password</Label>
              <Input type="password" value={oldPw}
                onChange={(e) => setOldPw(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>New Password</Label>
              <Input type="password" value={newPw}
                onChange={(e) => setNewPw(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Confirm Password</Label>
              <Input type="password" value={confPw}
                onChange={(e) => setConfPw(e.target.value)} />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700"
              onClick={handlePwSubmit}
              disabled={pwMut.isPending || !oldPw || !newPw || !confPw}>
              {pwMut.isPending ? 'Saving...' : 'Save New Password'}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}