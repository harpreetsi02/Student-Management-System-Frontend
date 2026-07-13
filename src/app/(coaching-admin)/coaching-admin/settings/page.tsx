'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Settings, Building2, Hash,
  Save, RefreshCw,
} from 'lucide-react'
import api from '@/lib/axios'

// ── Profile Schema ──────────────────────────────────────
const profileSchema = z.object({
  coachingName: z.string().min(2, 'Required'),
  ownerName:    z.string().min(2, 'Required'),
  email:        z.string().email('Valid email required'),
  phone:        z.string().min(10, 'Required'),
  address:      z.string().optional(),
  aboutUs:      z.string().optional(),
  websiteUrl:   z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

// ── Enrollment Format Schema ────────────────────────────
const enrollmentSchema = z.object({
  template:      z.string().min(1, 'Required'),
  paddingLength: z.coerce.number().min(3).max(8),
})

type EnrollmentForm = z.infer<typeof enrollmentSchema>

// ── Profile Section ─────────────────────────────────────
function ProfileSection() {
  const qc = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['ca-profile'],
    queryFn:  coachingAdminApi.getProfile,
  })

  const {
    register, handleSubmit, formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema) as any,
    values: profile
      ? {
          coachingName: profile.name        ?? '',
          ownerName:    profile.ownerName   ?? '',
          email:        profile.email       ?? '',
          phone:        profile.phone       ?? '',
          address:      profile.address     ?? '',
          aboutUs:      profile.aboutUs     ?? '',
          websiteUrl:   profile.websiteUrl  ?? '',
        }
      : undefined,
  })

  const mut = useMutation({
    mutationFn: coachingAdminApi.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-profile'] })
      toast.success('Profile updated!')
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Failed'),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <Card>
      <div className="px-5 py-3.5 border-b border-slate-100
                      flex items-center gap-2">
        <Building2 className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-slate-800 text-sm">
          Coaching Profile
        </h2>
      </div>
      <CardContent className="p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit((d) => mut.mutate(d))(e)
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Coaching Name</Label>
              <Input placeholder="ABC Coaching"
                {...register('coachingName')} />
              {errors.coachingName && (
                <p className="text-xs text-red-500">
                  {errors.coachingName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Owner Name</Label>
              <Input placeholder="Rajesh Kumar"
                {...register('ownerName')} />
              {errors.ownerName && (
                <p className="text-xs text-red-500">
                  {errors.ownerName.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="owner@coaching.com"
                {...register('email')} />
              {errors.email && (
                <p className="text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="9876543210"
                {...register('phone')} />
              {errors.phone && (
                <p className="text-xs text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label>Address</Label>
              <Input placeholder="Delhi, India"
                {...register('address')} />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label>About Us</Label>
              <textarea
                rows={3}
                placeholder="Tell students about your coaching..."
                className="w-full border border-slate-200 rounded-md
                           px-3 py-2 text-sm resize-none
                           focus:outline-none focus:ring-2
                           focus:ring-blue-500"
                {...register('aboutUs')}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <Label>Website URL</Label>
              <Input placeholder="https://yourcoaching.com"
                {...register('websiteUrl')} />
            </div>
          </div>

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={mut.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {mut.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Enrollment Format Section ───────────────────────────
function EnrollmentSection() {
  const [preview, setPreview] = useState('ABC-0001')

  const {
    register, handleSubmit, watch,
    formState: { errors },
  } = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema) as any,
    defaultValues: {
      template:      '{PREFIX}-{NUMBER}',
      paddingLength: 4,
    },
  })

  const templateVal     = watch('template')
  const paddingLengthVal = watch('paddingLength')

  // Live preview update
  const generatePreview = () => {
    const padded = String(1).padStart(
      Number(paddingLengthVal) || 4, '0'
    )
    return (templateVal ?? '')
      .replace('{PREFIX}',  'ABC')
      .replace('{NUMBER}',  padded)
      .replace('{YEAR}',    '2026')
      .replace('{YY}',      '26')
      .replace('{COURSE}',  'PY')
  }

  const mut = useMutation({
    mutationFn: async (data: EnrollmentForm) => {
      const res = await api.post(
        '/coaching-admin/enrollment-format', data
      )
      return res.data
    },
    onSuccess: () => toast.success('Enrollment format saved!'),
    onError:   () => toast.error('Failed to save'),
  })

  return (
    <Card>
      <div className="px-5 py-3.5 border-b border-slate-100
                      flex items-center gap-2">
        <Hash className="h-4 w-4 text-purple-600" />
        <h2 className="font-semibold text-slate-800 text-sm">
          Enrollment Number Format
        </h2>
      </div>
      <CardContent className="p-5 space-y-4">

        {/* Tokens help */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-slate-600">
            Available tokens:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ['{PREFIX}',  'Coaching prefix'],
              ['{NUMBER}',  'Auto sequence'],
              ['{YEAR}',    '4-digit year'],
              ['{YY}',      '2-digit year'],
              ['{COURSE}',  'Course code'],
            ].map(([token, desc]) => (
              <div key={token}
                className="bg-white border border-slate-200
                           rounded px-2 py-1 text-xs">
                <code className="text-blue-600 font-mono">
                  {token}
                </code>
                <span className="text-slate-500 ml-1">— {desc}</span>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit((d) => mut.mutate(d))(e)
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Template</Label>
              <Input
                placeholder="{PREFIX}-{NUMBER}"
                {...register('template')}
              />
              {errors.template && (
                <p className="text-xs text-red-500">
                  {errors.template.message}
                </p>
              )}
              <p className="text-xs text-slate-400">
                e.g. ABC-{'{NUMBER}'} or ABC-{'{YEAR}'}{'{NUMBER}'}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Number Padding</Label>
              <Input
                type="number"
                min={3}
                max={8}
                placeholder="4"
                {...register('paddingLength')}
              />
              <p className="text-xs text-slate-400">
                4 = 0001, 5 = 00001
              </p>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-blue-50 border border-blue-100
                          rounded-lg p-3 flex items-center gap-3">
            <RefreshCw className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-blue-600 font-medium">
                Preview
              </p>
              <p className="text-lg font-bold font-mono text-blue-800">
                {generatePreview()}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={mut.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {mut.isPending ? 'Saving...' : 'Save Format'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ── Main Page ───────────────────────────────────────────
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800
                       flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your coaching profile and preferences
        </p>
      </div>

      <ProfileSection />
      <EnrollmentSection />
    </div>
  )
}