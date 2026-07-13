'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserCheck, GraduationCap } from 'lucide-react'
import { Student, Course, Batch } from '@/types'

export default function EnrollStudentPage() {
  const [studentId,  setStudentId]  = useState('')
  const [courseId,   setCourseId]   = useState('')
  const [batchId,    setBatchId]    = useState('')
  const qc = useQueryClient()

  const { data: students = [], isLoading: sl } = useQuery<Student[]>({
    queryKey: ['ca-students'],
    queryFn:  () => coachingAdminApi.getStudents(),
  })

  const { data: courses = [], isLoading: cl } = useQuery<Course[]>({
    queryKey: ['ca-courses'],
    queryFn: () => coachingAdminApi.getCourses(),
  })

  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ['ca-batches', courseId],
    queryFn:  () => coachingAdminApi.getBatches(courseId),
    enabled:  !!courseId,
  })

  const enrollMut = useMutation({
    mutationFn: () =>
      coachingAdminApi.enrollStudent(studentId, courseId, batchId),
    onSuccess: () => {
      toast.success('Student enrolled successfully!')
      setStudentId('')
      setCourseId('')
      setBatchId('')
      qc.invalidateQueries({ queryKey: ['ca-students'] })
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Enrollment failed'),
  })

  if (sl || cl) return <LoadingSpinner />

  const selectedStudent = students.find((s) => s.id === studentId)
  const selectedCourse  = courses.find((c) => c.id === courseId)
  const selectedBatch   = batches.find((b) => b.id === batchId)

  const canEnroll = studentId && courseId && batchId

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Enroll Student
        </h1>
        <p className="text-sm text-slate-500">
          Assign student to a course and batch
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">

          {/* Student Select */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Select Student
            </label>
            <select
              className="w-full border border-slate-200 rounded-md
                         px-3 py-2 text-sm bg-white focus:outline-none
                         focus:ring-2 focus:ring-blue-500"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">-- Choose student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.enrollmentNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Course Select */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Select Course
            </label>
            <select
              className="w-full border border-slate-200 rounded-md
                         px-3 py-2 text-sm bg-white focus:outline-none
                         focus:ring-2 focus:ring-blue-500"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value)
                setBatchId('')
              }}
            >
              <option value="">-- Choose course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Batch Select */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Select Batch
            </label>
            <select
              className="w-full border border-slate-200 rounded-md
                         px-3 py-2 text-sm bg-white focus:outline-none
                         focus:ring-2 focus:ring-blue-500"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              disabled={!courseId}
            >
              <option value="">
                {courseId
                  ? '-- Choose batch --'
                  : 'Select course first'
                }
              </option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                  {b.startTime
                    ? ` (${b.startTime} — ${b.endTime})`
                    : ''
                  }
                </option>
              ))}
            </select>
            {courseId && batches.length === 0 && (
              <p className="text-xs text-orange-500">
                No batches for this course. Create one first.
              </p>
            )}
          </div>

          {/* Preview */}
          {canEnroll && (
            <div className="bg-blue-50 border border-blue-100
                            rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-700 uppercase
                            tracking-wide">
                Enrollment Summary
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  <p className="text-sm text-slate-800">
                    <span className="font-medium">
                      {selectedStudent?.name}
                    </span>
                    <span className="text-slate-500 font-mono text-xs ml-2">
                      {selectedStudent?.enrollmentNumber}
                    </span>
                  </p>
                </div>
                <p className="text-sm text-slate-700 pl-6">
                  📚 {selectedCourse?.name}
                </p>
                <p className="text-sm text-slate-700 pl-6">
                  🕐 {selectedBatch?.name}
                  {selectedBatch?.startTime && (
                    <span className="text-slate-500 text-xs ml-1">
                      ({selectedBatch.startTime} — {selectedBatch.endTime})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!canEnroll || enrollMut.isPending}
            onClick={() => enrollMut.mutate()}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {enrollMut.isPending ? 'Enrolling...' : 'Enroll Student'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}