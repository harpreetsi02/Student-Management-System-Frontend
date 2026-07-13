'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

function AttendanceSheet({ batchId, batchName }: {
  batchId: string
  batchName: string
}) {
  // Last 30 days generate karo
  const getDates = () => {
    const dates: string[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const dates = getDates()

  // Har date ki attendance fetch karo
  const { data: attendanceByDate = {}, isLoading } = useQuery({
    queryKey: ['attendance-sheet', batchId],
    queryFn: async () => {
      const result: Record<string, any[]> = {}

      // Sirf last 7 days fetch karo for performance
      const last7 = dates.slice(-7)
      await Promise.all(
        last7.map(async (date) => {
          try {
            const data = await coachingAdminApi.getBatchAttendance(
              batchId, date
            )
            result[date] = data
          } catch {
            result[date] = []
          }
        })
      )
      return result
    },
  })

  if (isLoading) return <LoadingSpinner />

  // Students nikalo — pehli date se
  const firstDateData = Object.values(attendanceByDate)[0] ?? []
  const students = firstDateData

  // Display dates — last 7 days
  const displayDates = dates.slice(-7)

  if (students.length === 0) {
    return (
      <Card>
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">
            {batchName}
          </p>
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-slate-400 text-center py-4">
            No students enrolled in this batch
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <div className="px-4 py-3 border-b border-slate-100
                      flex items-center gap-2">
        <Calendar className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-slate-800">
          {batchName}
        </p>
        <Badge variant="secondary" className="text-xs ml-auto">
          {students.length} students
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold
                             text-slate-600 min-w-35 sticky left-0
                             bg-slate-50 z-10 border-r border-slate-100">
                Student
              </th>
              {displayDates.map((date) => {
                const d     = new Date(date)
                const day   = d.getDate().toString().padStart(2, '0')
                const month = (d.getMonth() + 1)
                              .toString().padStart(2, '0')
                return (
                  <th
                    key={date}
                    className="text-center px-3 py-3 text-xs
                               font-semibold text-slate-600
                               min-w-20"
                  >
                    <div>{day}/{month}</div>
                    <div className="text-slate-400 font-normal">
                      {d.toLocaleDateString('en-IN', {
                        weekday: 'short'
                      })}
                    </div>
                  </th>
                )
              })}
              <th className="text-center px-3 py-3 text-xs
                             font-semibold text-slate-600 min-w-20
                             border-l border-slate-100">
                %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((student: any) => {
              let presentCount = 0
              let totalCount   = 0

              return (
                <tr key={student.studentId}
                  className="hover:bg-slate-50 transition-colors">

                  {/* Student Name */}
                  <td className="px-4 py-3 sticky left-0 bg-white
                                 border-r border-slate-100 z-10">
                    <p className="text-sm font-medium text-slate-800">
                      {student.studentName}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {student.enrollmentNumber}
                    </p>
                  </td>

                  {/* Attendance per date */}
                  {displayDates.map((date) => {
                    const dayData = attendanceByDate[date] ?? []
                    const record  = dayData.find(
                      (d: any) => d.studentId === student.studentId
                    )
                    const present = record?.present ?? false

                    if (record) totalCount++
                    if (present) presentCount++

                    return (
                      <td key={date}
                        className="text-center px-3 py-3">
                        {present ? (
                          <span className="inline-flex items-center
                                           justify-center w-7 h-7
                                           rounded-full bg-green-100
                                           text-green-700 text-xs
                                           font-bold">
                            P
                          </span>
                        ) : record ? (
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

                  {/* Percentage */}
                  <td className="text-center px-3 py-3
                                 border-l border-slate-100">
                    {totalCount > 0 ? (
                      <span className={`text-xs font-bold
                        ${Math.round(presentCount / totalCount * 100) >= 75
                          ? 'text-green-600'
                          : 'text-red-500'
                        }`}>
                        {Math.round(presentCount / totalCount * 100)}%
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-slate-100 flex gap-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center
                           w-5 h-5 rounded-full bg-green-100
                           text-green-700 text-xs font-bold">
            P
          </span>
          <span className="text-xs text-slate-500">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center
                           w-5 h-5 rounded-full bg-red-100
                           text-red-600 text-xs font-bold">
            A
          </span>
          <span className="text-xs text-slate-500">Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 text-xs font-bold">—</span>
          <span className="text-xs text-slate-500">Not marked</span>
        </div>
      </div>
    </Card>
  )
}

export default function AttendanceSheetPage() {
  const { data: courses = [], isLoading: cl } = useQuery<any[]>({
    queryKey: ['ca-courses'],
    queryFn: () => coachingAdminApi.getCourses(),
  })

  const { data: allBatches = [], isLoading: bl } = useQuery<any[]>({
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

  const [selectedBatch, setSelectedBatch] = useState<string>('')

  if (cl || bl) return <LoadingSpinner />

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

      {/* Batch Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedBatch('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium
                      border transition-colors
                      ${!selectedBatch
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
        >
          All Batches
        </button>
        {allBatches.map((b: any) => (
          <button
            key={b.id}
            onClick={() => setSelectedBatch(b.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium
                        border transition-colors
                        ${selectedBatch === b.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
          >
            {b.courseName} — {b.name}
          </button>
        ))}
      </div>

      {allBatches.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No batches yet</p>
        </div>
      )}

      {/* Sheets */}
      <div className="space-y-6">
        {(selectedBatch
          ? allBatches.filter((b: any) => b.id === selectedBatch)
          : allBatches
        ).map((b: any) => (
          <AttendanceSheet
            key={b.id}
            batchId={b.id}
            batchName={`${b.courseName} — ${b.name}`}
          />
        ))}
      </div>
    </div>
  )
}