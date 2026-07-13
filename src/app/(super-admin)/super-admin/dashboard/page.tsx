'use client'

import { useQuery } from '@tanstack/react-query'
import { superAdminApi } from '@/lib/api/superAdmin'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2, Users, GraduationCap,
  TrendingUp, Activity, BookOpen,
} from 'lucide-react'
import Link from 'next/link'

export default function SuperAdminDashboard() {

  const { data: analytics, isLoading: al } = useQuery({
    queryKey: ['sa-analytics'],
    queryFn:  superAdminApi.getAnalytics,
  })

  const { data: coachings, isLoading: cl } = useQuery({
    queryKey: ['sa-coachings'],
    queryFn:  superAdminApi.getAllCoachings,
  })

  if (al || cl) return <LoadingSpinner />

  const stats = [
    {
      label: 'Total Coachings',
      value: analytics?.totalCoachings   ?? 0,
      icon:  Building2,
      color: 'text-blue-600',
      bg:    'bg-blue-50',
    },
    {
      label: 'Active',
      value: analytics?.activeCoachings  ?? 0,
      icon:  TrendingUp,
      color: 'text-green-600',
      bg:    'bg-green-50',
    },
    {
      label: 'Students',
      value: analytics?.totalStudents    ?? 0,
      icon:  GraduationCap,
      color: 'text-purple-600',
      bg:    'bg-purple-50',
    },
    {
      label: 'Teachers',
      value: analytics?.totalTeachers    ?? 0,
      icon:  Users,
      color: 'text-orange-600',
      bg:    'bg-orange-50',
    },
    {
      label: 'Courses',
      value: analytics?.totalCourses     ?? 0,
      icon:  BookOpen,
      color: 'text-pink-600',
      bg:    'bg-pink-50',
    },
    {
      label: 'Inactive',
      value: analytics?.inactiveCoachings ?? 0,
      icon:  Activity,
      color: 'text-red-600',
      bg:    'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Platform Overview
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          All coaching centers at a glance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`${s.bg} p-2.5 rounded-lg shrink-0`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 leading-none">
                    {s.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Coachings list */}
      <Card>
        <div className="px-5 py-3.5 border-b border-slate-100
                        flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">
            All Coachings
          </h2>
          <Link
            href="/super-admin/coachings"
            className="text-xs text-blue-600 hover:underline"
          >
            Manage →
          </Link>
        </div>

        <div className="divide-y divide-slate-50">
          {coachings?.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              No coachings yet
            </p>
          )}
          {coachings?.map((c: any) => (
            <div
              key={c.id}
              className="px-5 py-3 flex items-center
                         justify-between hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {c.name}
                </p>
                <p className="text-xs text-slate-500">
                  {c.ownerName} • {c.email}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500">
                    {c.totalStudents} students
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.totalTeachers} teachers
                  </p>
                </div>
                <Badge variant={c.active ? 'default' : 'destructive'}>
                  {c.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}