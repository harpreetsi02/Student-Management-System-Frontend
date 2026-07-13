'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, BookOpen, Clock, GraduationCap } from 'lucide-react'
import { Course, Batch } from '@/types'

function BatchStudentList({ batch }: { batch: Batch }) {
  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ['batch-students', batch.id],
    queryFn: async () => {
      const res = await api.get(
        `/teacher/batches/${batch.id}/students`
      )
      return res.data
    },
  })

  return (
    <Card>
      {/* Batch Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg shrink-0">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {batch.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500">
                  {batch.courseName}
                </p>
                {batch.startTime && (
                  <p className="text-xs text-slate-400">
                    • {batch.startTime} — {batch.endTime}
                  </p>
                )}
                {batch.teacherName && (
                  <p className="text-xs text-slate-400">
                    • {batch.teacherName}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            {isLoading ? '...' : students.length} students
          </Badge>
        </div>
      </div>

      {/* Students */}
      <CardContent className="p-0">
        {isLoading && (
          <div className="py-4">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && students.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <GraduationCap className="h-8 w-8 mx-auto mb-2
                                      text-slate-300" />
            <p className="text-sm">No students enrolled yet</p>
          </div>
        )}

        {!isLoading && students.length > 0 && (
          <div className="divide-y divide-slate-50">
            {/* Header row */}
            <div className="grid grid-cols-12 px-4 py-2
                            bg-slate-50 text-xs font-medium
                            text-slate-500 uppercase tracking-wide">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Name</div>
              <div className="col-span-4">Enrollment No.</div>
              <div className="col-span-2">Status</div>
            </div>

            {students.map((s: any, idx: number) => (
              <div key={s.studentId}
                className="grid grid-cols-12 px-4 py-3
                           hover:bg-slate-50 items-center">
                <div className="col-span-1 text-xs text-slate-400
                                font-mono">
                  {idx + 1}
                </div>
                <div className="col-span-5 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100
                                  flex items-center justify-center
                                  text-blue-700 text-xs font-bold
                                  shrink-0">
                    {s.studentName?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    {s.studentName}
                  </p>
                </div>
                <div className="col-span-4">
                  <span className="font-mono text-xs bg-blue-50
                                   text-blue-700 px-2 py-0.5
                                   rounded-md">
                    {s.enrollmentNumber}
                  </span>
                </div>
                <div className="col-span-2">
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CourseBatchStudents({ course }: { course: Course }) {
  const { data: batches = [], isLoading: bl } = useQuery<Batch[]>({
    queryKey: ['ca-batches', course.id],
    queryFn:  () => coachingAdminApi.getBatches(course.id),
  })

  if (bl) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-green-100 p-1.5 rounded-lg">
          <BookOpen className="h-4 w-4 text-green-600" />
        </div>
        <h2 className="text-base font-semibold text-slate-800">
          {course.name}
        </h2>
        <Badge variant="outline" className="text-xs">
          {batches.length} batches
        </Badge>
      </div>

      {batches.length === 0 && (
        <p className="text-xs text-slate-400 pl-9">
          No batches for this course
        </p>
      )}

      <div className="space-y-3 pl-2">
        {batches.map((b: Batch) => (
          <BatchStudentList key={b.id} batch={b} />
        ))}
      </div>
    </div>
  )
}

export default function BatchStudentsPage() {
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['ca-courses'],
    queryFn: () => coachingAdminApi.getCourses(),
  })

  const [selectedCourse, setSelectedCourse] = useState<string>('')

  if (isLoading) return <LoadingSpinner />

  const displayCourses = selectedCourse
    ? courses.filter((c) => c.id === selectedCourse)
    : courses

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-bold text-slate-800
                       flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Batch Students
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          See which students are in each batch
        </p>
      </div>

      {/* Course Filter */}
      {courses.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCourse('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium
                        border transition-colors
                        ${!selectedCourse
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
          >
            All Courses
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourse(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                          border transition-colors
                          ${selectedCourse === c.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {courses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No courses yet</p>
        </div>
      )}

      <div className="space-y-8">
        {displayCourses.map((course: Course) => (
          <CourseBatchStudents key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}