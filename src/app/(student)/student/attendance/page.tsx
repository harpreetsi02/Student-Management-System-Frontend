'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, CheckCircle2, XCircle } from 'lucide-react'

function AttendanceCard({ batchId, courseName, batchName }: {
  batchId: string
  courseName: string
  batchName: string
}) {
  const { data: att, isLoading } = useQuery({
    queryKey: ['student-attendance', batchId],
    queryFn: async () => {
      const res = await api.get(`/student/attendance/${batchId}`)
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />

  const pct = att?.percentage ?? 0

  return (
    <Card>
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-800">
          {courseName}
        </p>
        <p className="text-xs text-slate-500">{batchName}</p>
      </div>
      <CardContent className="p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">
              {att?.presentDays ?? 0}
            </p>
            <p className="text-xs text-green-600 mt-0.5">Present</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">
              {att?.absentDays ?? 0}
            </p>
            <p className="text-xs text-red-500 mt-0.5">Absent</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {pct}%
            </p>
            <p className="text-xs text-blue-600 mt-0.5">Rate</p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all
                ${pct >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-center">
            {pct >= 75
              ? <span className="text-green-600">
                  Good attendance!
                </span>
              : <span className="text-red-500">
                  Below 75% — attend more classes
                </span>
            }
          </p>
        </div>

        {/* Records */}
        {att?.records?.length > 0 && (
          <div className="border border-slate-100 rounded-lg
                          overflow-hidden max-h-48 overflow-y-auto">
            {att.records.map((r: any, idx: number) => (
              <div key={idx}
                className="flex items-center justify-between
                           px-3 py-2 border-b border-slate-50
                           last:border-0">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-xs text-slate-700">{r.date}</p>
                </div>
                {r.present
                  ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                  : <XCircle className="h-4 w-4 text-red-400" />
                }
              </div>
            ))}
          </div>
        )}

        {att?.records?.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">
            No records yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function StudentAttendancePage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await api.get('/student/dashboard')
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />

  const courses = dashboard?.courses ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-500">Your attendance records</p>
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No courses enrolled yet</p>
        </div>
      )}

      <div className="space-y-4">
        {courses.map((c: any) => (
          <AttendanceCard
            key={c.batchId}
            batchId={c.batchId}
            courseName={c.courseName}
            batchName={c.batchName}
          />
        ))}
      </div>
    </div>
  )
}