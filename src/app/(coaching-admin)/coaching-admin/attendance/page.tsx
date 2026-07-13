'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calendar, CheckCircle2, XCircle,
} from 'lucide-react'

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0]

  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedDate,  setSelectedDate]  = useState(today)
  const [presentIds,    setPresentIds]    = useState<Set<string>>(
    new Set()
  )

  const qc = useQueryClient()

  // Saare courses nikalo
  const { data: courses = [] } = useQuery<any[]>({
    queryKey: ['ca-courses'],
    queryFn: () => coachingAdminApi.getCourses(),
  })

  // Har course ki batches
  const { data: allBatches = [] } = useQuery<any[]>({
    queryKey: ['ca-all-batches', courses],
    queryFn: async () => {
      const all: any[] = []
      for (const c of courses) {
        const b = await coachingAdminApi.getBatches(c.id)
        all.push(...b)
      }
      return all
    },
    enabled: courses.length > 0,
  })

  // Selected batch + date ki existing attendance
  // Response mein students bhi aate hain ab
  const { data: attendanceData = [], isLoading: al } = useQuery<any[]>({
    queryKey: ['ca-attendance', selectedBatch, selectedDate],
    queryFn: async () => {
      const data = await coachingAdminApi.getBatchAttendance(
        selectedBatch, selectedDate
      )
      // Pre-fill present students
      const ids = new Set<string>(
        data.filter((a: any) => a.present).map((a: any) => a.studentId)
      )
      setPresentIds(ids)
      return data
    },
    enabled: !!selectedBatch && !!selectedDate,
  })

  const markMut = useMutation({
    mutationFn: () =>
      coachingAdminApi.markAttendance({
        batchId:           selectedBatch,
        date:              selectedDate,
        presentStudentIds: Array.from(presentIds),
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['ca-attendance', selectedBatch, selectedDate],
      })
      toast.success('Attendance saved!')
    },
    onError: () => toast.error('Failed to save'),
  })

  const toggleStudent = (id: string) => {
    setPresentIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedBatchInfo = allBatches.find(
    (b) => b.id === selectedBatch
  )

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-bold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-500">Mark daily attendance</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-45 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Select Batch
            </label>
            <select
              className="w-full border border-slate-200 rounded-md
                         px-3 py-2 text-sm bg-white focus:outline-none
                         focus:ring-2 focus:ring-blue-500"
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value)
                setPresentIds(new Set())
              }}
            >
              <option value="">-- Select Batch --</option>
              {allBatches.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.courseName} — {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-40 space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Date
            </label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-md
                         px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setPresentIds(new Set())
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      {selectedBatch && (
        <Card>
          <div className="px-4 py-3 border-b border-slate-100
                          flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-800 flex
                            items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                {selectedDate}
              </p>
              <p className="text-xs text-slate-500">
                {selectedBatchInfo?.courseName} — {selectedBatchInfo?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  {presentIds.size} / {attendanceData.length} present
                </p>
                <p className="text-xs font-semibold text-blue-600">
                  {attendanceData.length > 0
                    ? Math.round(
                        presentIds.size / attendanceData.length * 100
                      )
                    : 0
                  }%
                </p>
              </div>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                onClick={() => markMut.mutate()}
                disabled={markMut.isPending || attendanceData.length === 0}
              >
                {markMut.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          {attendanceData.length > 0 && (
            <div className="px-4 py-2 flex gap-2 border-b
                            border-slate-50">
              <Button
                variant="outline" size="sm"
                className="text-xs h-7 flex-1"
                onClick={() =>
                  setPresentIds(
                    new Set(attendanceData.map((s: any) => s.studentId))
                  )
                }
              >
                Mark All Present
              </Button>
              <Button
                variant="outline" size="sm"
                className="text-xs h-7 flex-1"
                onClick={() => setPresentIds(new Set())}
              >
                Mark All Absent
              </Button>
            </div>
          )}

          {al && <LoadingSpinner />}

          <div className="divide-y divide-slate-50">
            {!al && attendanceData.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-8">
                No students enrolled in this batch
              </p>
            )}

            {/* ✅ attendanceData se students aa rahe hain — batch specific */}
            {attendanceData.map((s: any) => {
              const isPresent = presentIds.has(s.studentId)
              return (
                <div
                  key={s.studentId}
                  className={`flex items-center justify-between
                              px-4 py-3 cursor-pointer transition-colors
                              ${isPresent
                                ? 'bg-green-50'
                                : 'hover:bg-slate-50'
                              }`}
                  onClick={() => toggleStudent(s.studentId)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center
                                     justify-center text-sm font-bold
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
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isPresent ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {isPresent ? 'Present' : 'Absent'}
                    </Badge>
                    {isPresent
                      ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                      : <XCircle className="h-5 w-5 text-slate-300" />
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {!selectedBatch && (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>Select a batch to mark attendance</p>
        </div>
      )}
    </div>
  )
}