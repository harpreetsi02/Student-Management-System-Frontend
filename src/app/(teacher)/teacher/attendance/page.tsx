'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

function TeacherAttendanceSheet({ batch }: { batch: any }) {
  // Last 7 days
  const getDates = () => {
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const dates = getDates()

  // Enrolled students pehle fetch karo
  const { data: enrolledStudents = [], isLoading: el } =
    useQuery<any[]>({
      queryKey: ['teacher-enrolled', batch.batchId],
      queryFn: async () => {
        const res = await api.get(
          `/teacher/batches/${batch.batchId}/students`
        )
        return res.data
      },
    })

  // Phir har date ki attendance
  const { data: attendanceByDate = {}, isLoading: al } = useQuery({
    queryKey: ['teacher-att-sheet', batch.batchId],
    queryFn: async () => {
      const result: Record<string, any[]> = {}
      await Promise.all(
        dates.map(async (date) => {
          try {
            const res = await api.get(
              `/coaching-admin/attendance/batch/${batch.batchId}`,
              { params: { date } }
            )
            result[date] = res.data
          } catch {
            result[date] = []
          }
        })
      )
      return result
    },
    enabled: enrolledStudents.length > 0,
  })

  if (el || al) return <LoadingSpinner />

  return (
    <Card>
      <div className="px-4 py-3 border-b border-slate-100
                      flex items-center gap-2">
        <Calendar className="h-4 w-4 text-green-600" />
        <p className="text-sm font-semibold text-slate-800">
          {batch.batchName}
        </p>
        <p className="text-xs text-slate-500">— {batch.course}</p>
        <Badge variant="secondary" className="text-xs ml-auto">
          {enrolledStudents.length} students
        </Badge>
      </div>

      {enrolledStudents.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          No students enrolled in this batch
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold
                               text-slate-600 sticky left-0 bg-slate-50
                               border-r border-slate-100 min-w-45">
                  Student
                </th>
                {dates.map((date) => {
                  const d   = new Date(date)
                  const day = d.getDate().toString().padStart(2, '0')
                  const mon = (d.getMonth() + 1)
                              .toString().padStart(2, '0')
                  return (
                    <th key={date}
                      className="text-center px-3 py-3 text-xs
                                 font-semibold text-slate-600
                                 min-w-17.5">
                      <div>{day}/{mon}</div>
                      <div className="text-slate-400 font-normal">
                        {d.toLocaleDateString('en-IN', {
                          weekday: 'short'
                        })}
                      </div>
                    </th>
                  )
                })}
                <th className="text-center px-3 py-3 text-xs
                               font-semibold text-slate-600
                               border-l border-slate-100 min-w-15">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {enrolledStudents.map((student: any) => {
                let pCount = 0
                let tCount = 0

                return (
                  <tr key={student.studentId}
                    className="hover:bg-slate-50">

                    {/* Student */}
                    <td className="px-4 py-3 sticky left-0 bg-white
                                   border-r border-slate-100">
                      <p className="text-sm font-medium text-slate-800">
                        {student.studentName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {student.enrollmentNumber}
                      </p>
                    </td>

                    {/* Per date */}
                    {dates.map((date) => {
                      const dayData = attendanceByDate[date] ?? []
                      const record  = dayData.find(
                        (d: any) => d.studentId === student.studentId
                      )
                      const hasRecord = !!record
                      const present   = record?.present ?? false

                      if (hasRecord) tCount++
                      if (present)   pCount++

                      return (
                        <td key={date}
                          className="text-center px-2 py-3">
                          {present ? (
                            <span className="inline-flex items-center
                                             justify-center w-7 h-7
                                             rounded-full bg-green-100
                                             text-green-700 text-xs
                                             font-bold">
                              P
                            </span>
                          ) : hasRecord ? (
                            <span className="inline-flex items-center
                                             justify-center w-7 h-7
                                             rounded-full bg-red-100
                                             text-red-600 text-xs
                                             font-bold">
                              A
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">
                              —
                            </span>
                          )}
                        </td>
                      )
                    })}

                    {/* % */}
                    <td className="text-center px-3 py-3
                                   border-l border-slate-100">
                      {tCount > 0 ? (
                        <span className={`text-xs font-bold
                          ${Math.round(pCount / tCount * 100) >= 75
                            ? 'text-green-600'
                            : 'text-red-500'
                          }`}>
                          {Math.round(pCount / tCount * 100)}%
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-2 border-t border-slate-100 flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center
                           w-5 h-5 rounded-full bg-green-100
                           text-green-700 text-xs font-bold">P</span>
          <span className="text-xs text-slate-500">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center
                           w-5 h-5 rounded-full bg-red-100
                           text-red-600 text-xs font-bold">A</span>
          <span className="text-xs text-slate-500">Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 font-bold text-xs">—</span>
          <span className="text-xs text-slate-500">Not marked</span>
        </div>
      </div>
    </Card>
  )
}

export default function TeacherAttendancePage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const res = await api.get('/teacher/dashboard')
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />

  const batches: any[] = dashboard?.assignedBatches ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Attendance Sheet
        </h1>
        <p className="text-sm text-slate-500">
          Last 7 days — P = Present, A = Absent
        </p>
      </div>

      {batches.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No batches assigned yet</p>
        </div>
      )}

      <div className="space-y-6">
        {batches.map((b: any) => (
          <TeacherAttendanceSheet key={b.batchId} batch={b} />
        ))}
      </div>
    </div>
  )
}