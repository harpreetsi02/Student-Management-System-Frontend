'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BarChart3, Plus, Trophy } from 'lucide-react'
import { Student, Course } from '@/types'

const schema = z.object({
  studentId:     z.string().min(1, 'Required'),
  courseId:      z.string().min(1, 'Required'),
  testName:      z.string().min(2, 'Required'),
  totalMarks:    z.coerce.number().min(1, 'Required'),
  obtainedMarks: z.coerce.number().min(0, 'Required'),
  testDate:      z.string().min(1, 'Required'),
  remarks:       z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ResultsPage() {
  const [open, setOpen]                       = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const qc = useQueryClient()

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['ca-students'],
    queryFn:  () => coachingAdminApi.getStudents(),
  })

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['ca-courses'],
    queryFn:  () => coachingAdminApi.getCourses(),
  })

  const { data: results = [], isLoading: rl } = useQuery<any[]>({
    queryKey: ['ca-results', selectedStudent],
    queryFn:  () => coachingAdminApi.getStudentResults(selectedStudent),
    enabled:  !!selectedStudent,
  })

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
      defaultValues: {
        testDate: new Date().toISOString().split('T')[0],
      },
    })

  const mut = useMutation({
    mutationFn: coachingAdminApi.addResult,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-results'] })
      toast.success('Result added!')
      reset()
      setOpen(false)
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Failed'),
  })

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'A+', color: 'text-green-600' }
    if (pct >= 75) return { label: 'A',  color: 'text-green-500' }
    if (pct >= 60) return { label: 'B',  color: 'text-blue-500' }
    if (pct >= 45) return { label: 'C',  color: 'text-orange-500' }
    return { label: 'F', color: 'text-red-500' }
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Results</h1>
          <p className="text-sm text-slate-500">
            Track student performance
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Result
        </Button>
      </div>

      {/* Add Result Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Test Result</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit((d) => mut.mutate(d))(e)
            }}
            className="space-y-3 mt-1"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Student</Label>
                <select
                  className="w-full border border-slate-200 rounded-md
                             px-3 py-2 text-sm bg-white focus:outline-none
                             focus:ring-2 focus:ring-blue-500"
                  {...register('studentId')}
                >
                  <option value="">Select</option>
                  {(students as Student[]).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.studentId && (
                  <p className="text-xs text-red-500">
                    {errors.studentId.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Course</Label>
                <select
                  className="w-full border border-slate-200 rounded-md
                             px-3 py-2 text-sm bg-white focus:outline-none
                             focus:ring-2 focus:ring-blue-500"
                  {...register('courseId')}
                >
                  <option value="">Select</option>
                  {(courses as Course[]).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <Label>Test Name</Label>
                <Input placeholder="Unit Test 1"
                  {...register('testName')} />
                {errors.testName && (
                  <p className="text-xs text-red-500">
                    {errors.testName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Total Marks</Label>
                <Input type="number" placeholder="100"
                  {...register('totalMarks')} />
              </div>

              <div className="space-y-1">
                <Label>Obtained Marks</Label>
                <Input type="number" placeholder="85"
                  {...register('obtainedMarks')} />
              </div>

              <div className="space-y-1">
                <Label>Test Date</Label>
                <Input type="date" {...register('testDate')} />
              </div>

              <div className="space-y-1">
                <Label>Remarks</Label>
                <Input placeholder="Good performance"
                  {...register('remarks')} />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={mut.isPending}>
                {mut.isPending ? 'Saving...' : 'Save Result'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Results */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            View Student Results
          </p>
          <select
            className="w-full border border-slate-200 rounded-md
                       px-3 py-2 text-sm bg-white focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Select student</option>
            {(students as Student[]).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {rl && <LoadingSpinner />}

          {selectedStudent && !rl && results.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">
              No results yet
            </p>
          )}

          <div className="space-y-3">
            {(results as any[]).map((r, idx) => {
              const grade = getGrade(r.percentage)
              return (
                <div key={idx}
                  className="flex items-center justify-between
                             p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {r.testName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.courseName} • {r.testDate}
                    </p>
                    {r.remarks && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {r.remarks}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${grade.color}`}>
                      {grade.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.obtainedMarks}/{r.totalMarks}
                    </p>
                    <p className="text-xs text-slate-400">
                      {r.percentage}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {!selectedStudent && (
            <div className="text-center py-8 text-slate-400">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">
                Select a student to view results
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}