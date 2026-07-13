'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  CheckCircle2, XCircle, BookOpen,
  Clock, Users, Calendar,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// ── Attendance Marker ───────────────────────────────────
function AttendanceMarker({ batch }: { batch: any }) {
  const today = new Date().toISOString().split('T')[0]
  const [date,       setDate]       = useState(today)
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set())

  const markMut = useMutation({
    mutationFn: async () => {
      const res = await api.post('/teacher/attendance/mark', {
        batchId:           batch.batchId,
        date:              date,
        presentStudentIds: Array.from(presentIds),
      })
      return res.data
    },
    onSuccess: () => toast.success('Attendance saved!'),
    onError:   () => toast.error('Failed to save'),
  })

  // ✅ Pehle enrolled students fetch karo
  const { data: enrolledStudents = [], isLoading: esl } = useQuery<any[]>({
    queryKey: ['teacher-enrolled', batch.batchId],
    queryFn: async () => {
      const res = await api.get(`/teacher/batches/${batch.batchId}/students`)
      return res.data
    },
  })

  // ✅ Phir us date ki attendance fetch karo aur pre-fill karo
  const { isLoading: al } = useQuery({
    queryKey: ['teacher-attendance-date', batch.batchId, date],
    queryFn: async () => {
      const res = await api.get(
        `/coaching-admin/attendance/batch/${batch.batchId}`,
        { params: { date } }
      )
      const ids = new Set<string>(
        (res.data as any[])
          .filter((a: any) => a.present)
          .map((a: any) => a.studentId)
      )
      setPresentIds(ids)
      return res.data
    },
    enabled: !!date && enrolledStudents.length > 0,
  })

  const toggleStudent = (id: string) => {
    setPresentIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const isLoading = esl || al

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 flex items-center
                      justify-between border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {batch.batchName}
          </p>
          <p className="text-xs text-slate-500">
            {batch.course} • {batch.timing ?? 'Time not set'}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {enrolledStudents.length} students
        </Badge>
      </div>

      <div className="p-4 space-y-3">

        {/* Date Picker */}
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setPresentIds(new Set())
            }}
            className="flex-1 border border-slate-200 rounded-md
                       px-3 py-1.5 text-sm focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading && <LoadingSpinner />}

        {/* No students */}
        {!isLoading && enrolledStudents.length === 0 && (
          <div className="text-center py-6 text-slate-400">
            <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No students enrolled in this batch</p>
            <p className="text-xs mt-1">
              Ask admin to enroll students
            </p>
          </div>
        )}

        {!isLoading && enrolledStudents.length > 0 && (
          <>
            {/* Stats */}
            <div className="flex items-center justify-between
                            text-xs text-slate-500">
              <div className="flex gap-3">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  {presentIds.size} present
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                  {enrolledStudents.length - presentIds.size} absent
                </span>
              </div>
              <span className="font-medium text-slate-700">
                {enrolledStudents.length > 0
                  ? Math.round(
                      presentIds.size / enrolledStudents.length * 100
                    )
                  : 0
                }%
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                className="flex-1 text-xs h-7"
                onClick={() =>
                  setPresentIds(
                    new Set(enrolledStudents.map((s: any) => s.studentId))
                  )
                }
              >
                Mark All Present
              </Button>
              <Button
                variant="outline" size="sm"
                className="flex-1 text-xs h-7"
                onClick={() => setPresentIds(new Set())}
              >
                Mark All Absent
              </Button>
            </div>

            {/* Student List */}
            <div className="border border-slate-100 rounded-lg
                            overflow-hidden max-h-64 overflow-y-auto">
              {enrolledStudents.map((s: any) => {
                const isPresent = presentIds.has(s.studentId)
                return (
                  <div
                    key={s.studentId}
                    onClick={() => toggleStudent(s.studentId)}
                    className={`flex items-center justify-between
                                px-3 py-2.5 cursor-pointer
                                border-b border-slate-50 last:border-0
                                transition-colors
                                ${isPresent
                                  ? 'bg-green-50'
                                  : 'hover:bg-slate-50'
                                }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex
                                       items-center justify-center
                                       text-xs font-bold shrink-0
                                       ${isPresent
                                         ? 'bg-green-100 text-green-700'
                                         : 'bg-slate-100 text-slate-500'
                                       }`}>
                        {s.studentName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {s.studentName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {s.enrollmentNumber}
                        </p>
                      </div>
                    </div>
                    {isPresent
                      ? <CheckCircle2 className="h-5 w-5
                                                  text-green-500 shrink-0" />
                      : <XCircle className="h-5 w-5
                                             text-slate-300 shrink-0" />
                    }
                  </div>
                )
              })}
            </div>

            {/* Save Button */}
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => markMut.mutate()}
              disabled={markMut.isPending}
            >
              {markMut.isPending
                ? 'Saving...'
                : `Save Attendance — ${date}`
              }
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Dashboard ──────────────────────────────────────
export default function TeacherDashboard() {
  const name = useAuthStore((s) => s.name)

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const res = await api.get('/teacher/dashboard')
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />

  const batches: any[] = dashboard?.assignedBatches ?? []
  const courses: any[] = dashboard?.assignedCourses ?? []

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="bg-linear-to-r from-green-600 to-teal-600
                      rounded-xl px-5 py-4 text-white">
        <p className="text-green-200 text-xs font-medium uppercase
                      tracking-wide">
          Teacher Portal
        </p>
        <h1 className="text-xl font-bold mt-0.5">{name}</h1>
        <p className="text-green-200 text-xs mt-1">
          {courses.length} courses • {batches.length} batches
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-50 p-2.5 rounded-lg shrink-0">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {courses.length}
              </p>
              <p className="text-xs text-slate-500">Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg shrink-0">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {batches.length}
              </p>
              <p className="text-xs text-slate-500">Batches</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No batches */}
      {batches.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No batches assigned yet</p>
          <p className="text-xs mt-1">
            Ask admin to assign you to a batch
          </p>
        </div>
      )}

      {/* Attendance per batch */}
      {batches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700
                         uppercase tracking-wide flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            Mark Attendance
          </h2>
          {batches.map((batch: any) => (
            <AttendanceMarker key={batch.batchId} batch={batch} />
          ))}
        </div>
      )}
    </div>
  )
}