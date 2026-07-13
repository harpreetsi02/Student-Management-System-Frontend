'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap, Clock, Users,
  BookOpen, CheckCircle, Lock,
  Bell, Wallet, BarChart3,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function StudentDashboard() {
  const name = useAuthStore((s) => s.name)

  const { data: dashboard, isLoading: dl } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn:  async () => {
      const res = await api.get('/student/dashboard')
      return res.data
    },
  })

  const { data: results = [], isLoading: rl } = useQuery<any[]>({
    queryKey: ['student-results'],
    queryFn:  async () => {
      const res = await api.get('/student/results')
      return res.data
    },
  })

  const { data: notices = [], isLoading: nl } = useQuery<any[]>({
    queryKey: ['student-notices'],
    queryFn:  async () => {
      const res = await api.get('/student/notices')
      return res.data
    },
  })

  if (dl || rl || nl) return <LoadingSpinner />

  const courses: any[] = dashboard?.courses ?? []

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600
                      rounded-xl p-5 text-white">
        <p className="text-blue-200 text-xs font-medium uppercase
                      tracking-wide">
          Student Portal
        </p>
        <h1 className="text-xl font-bold mt-0.5">{name}</h1>
        {dashboard?.enrollmentNumber && (
          <p className="text-blue-200 text-sm mt-1 font-mono">
            {dashboard.enrollmentNumber}
          </p>
        )}
      </div>

      {/* Courses */}
      {courses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700
                         uppercase tracking-wide">
            My Courses
          </h2>
          {courses.map((c: any) => (
            <Card key={c.courseId}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {c.courseName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.batchName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <Users className="h-3.5 w-3.5 text-slate-400
                                      mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Teacher</p>
                    <p className="text-xs font-medium text-slate-700
                                  truncate">
                      {c.teacherName}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400
                                      mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Timing</p>
                    <p className="text-xs font-medium text-slate-700">
                      {c.batchTiming}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <GraduationCap className="h-3.5 w-3.5 text-green-500
                                              mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Attendance</p>
                    <p className="text-xs font-bold text-green-700">
                      {c.attendancePct}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Results */}
        <Card>
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800
                          flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Recent Results
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {(results as any[]).slice(0, 4).map((r, idx) => (
              <div key={idx}
                className="px-4 py-2.5 flex items-center
                           justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {r.testName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.courseName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">
                    {r.percentage}%
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.obtainedMarks}/{r.totalMarks}
                  </p>
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                No results yet
              </p>
            )}
          </div>
        </Card>

        {/* Notices */}
        <Card>
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800
                          flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-500" />
              Notices
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {(notices as any[]).slice(0, 4).map((n: any) => (
              <div key={n.id} className="px-4 py-2.5">
                <p className="text-sm font-medium text-slate-800">
                  {n.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {n.content}
                </p>
              </div>
            ))}
            {notices.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                No notices
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}