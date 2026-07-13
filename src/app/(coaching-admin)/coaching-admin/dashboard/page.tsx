'use client'

import { useQuery } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GraduationCap, Users, BookOpen,
  Bell, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function CoachingAdminDashboard() {
  const name = useAuthStore((s) => s.name)

  const { data: students, isLoading: sl } = useQuery({
    queryKey: ['ca-students'],
    queryFn:  () => coachingAdminApi.getStudents(),
  })

  const { data: teachers, isLoading: tl } = useQuery({
    queryKey: ['ca-teachers'],
    queryFn:  () => coachingAdminApi.getTeachers(),
  })

  const { data: courses, isLoading: cl } = useQuery({
    queryKey: ['ca-courses'],
    queryFn:  () => coachingAdminApi.getCourses(),
  })

  const { data: notices, isLoading: nl } = useQuery({
    queryKey: ['ca-notices'],
    queryFn:  coachingAdminApi.getNotices,
  })

  if (sl || tl || cl || nl) return <LoadingSpinner />

  const stats = [
    {
      label: 'Students',
      value: students?.length  ?? 0,
      icon:  GraduationCap,
      color: 'text-purple-600',
      bg:    'bg-purple-50',
      href:  '/coaching-admin/students',
    },
    {
      label: 'Teachers',
      value: teachers?.length  ?? 0,
      icon:  Users,
      color: 'text-blue-600',
      bg:    'bg-blue-50',
      href:  '/coaching-admin/teachers',
    },
    {
      label: 'Courses',
      value: courses?.length   ?? 0,
      icon:  BookOpen,
      color: 'text-green-600',
      bg:    'bg-green-50',
      href:  '/coaching-admin/courses',
    },
    {
      label: 'Notices',
      value: notices?.length   ?? 0,
      icon:  Bell,
      color: 'text-orange-600',
      bg:    'bg-orange-50',
      href:  '/coaching-admin/notices',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-blue-600 rounded-xl px-5 py-4 text-white">
        <p className="text-blue-200 text-xs font-medium uppercase
                      tracking-wide">
          Welcome back
        </p>
        <h1 className="text-xl font-bold mt-0.5">{name}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <Card className="hover:shadow-md transition-shadow
                               cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className={`${s.bg} w-9 h-9 rounded-lg
                    flex items-center justify-center mb-3`}>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {s.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent Students */}
        <Card>
          <div className="px-4 py-3 border-b border-slate-100
                          flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Recent Students
            </p>
            <Link href="/coaching-admin/students">
              <Button variant="ghost" size="sm"
                className="text-xs h-7 text-blue-600">
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {students?.slice(0, 5).map((s: any) => (
              <div key={s.id}
                className="px-4 py-2.5 flex items-center
                           justify-between hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {s.name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    {s.enrollmentNumber}
                  </p>
                </div>
                <Badge
                  variant={s.active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {s.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
            {students?.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                No students yet
              </p>
            )}
          </div>
        </Card>

        {/* Recent Notices */}
        <Card>
          <div className="px-4 py-3 border-b border-slate-100
                          flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Recent Notices
            </p>
            <Link href="/coaching-admin/notices">
              <Button variant="ghost" size="sm"
                className="text-xs h-7 text-blue-600">
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {notices?.slice(0, 4).map((n: any) => (
              <div key={n.id}
                className="px-4 py-2.5 hover:bg-slate-50">
                <p className="text-sm font-medium text-slate-800">
                  {n.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {n.content}
                </p>
              </div>
            ))}
            {notices?.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                No notices yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}