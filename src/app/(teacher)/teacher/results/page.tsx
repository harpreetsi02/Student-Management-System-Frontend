'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, BarChart3, Trophy } from 'lucide-react'
import { toast } from 'sonner'

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

export default function TeacherResultsPage() {
  const [open, setOpen]             = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [viewStudentId, setViewStudentId]     = useState('')

  const { data: dashboard } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const res = await api.get('/teacher/dashboard')
      return res.data
    },
  })

  const batches: any[] = dashboard?.assignedBatches ?? []

  // Batch ke students
  const { data: batchStudents = [] } = useQuery<any[]>({
    queryKey: ['teacher-enrolled', selectedBatchId],
    queryFn: async () => {
      const res = await api.get(
        `/teacher/batches/${selectedBatchId}/students`
      )
      return res.data
    },
    enabled: !!selectedBatchId,
  })

  // Selected student ke results
  const { data: studentResults = [], isLoading: rl } =
    useQuery<any[]>({
      queryKey: ['teacher-student-results', viewStudentId],
      queryFn: async () => {
        const res = await api.get(
          `/coaching-admin/results/student/${viewStudentId}`
        )
        return res.data
      },
      enabled: !!viewStudentId,
    })

  const { register, handleSubmit, reset, setValue,
          formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
      defaultValues: {
        testDate: new Date().toISOString().split('T')[0],
      },
    })

  const mut = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post('/teacher/results', data)
      return res.data
    },
    onSuccess: () => {
      toast.success('Result uploaded!')
      // Refresh results if viewing same student
      reset()
      setSelectedBatchId('')
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
            Upload and view test results
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

      {/* View Results Section */}
      <Card>
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">
            View Student Results
          </p>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Batch
              </label>
              <select
                className="w-full border border-slate-200 rounded-md
                           px-3 py-2 text-sm bg-white focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value)
                  setViewStudentId('')
                }}
              >
                <option value="">Select batch</option>
                {batches.map((b: any) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchName} — {b.course}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Student
              </label>
              <select
                className="w-full border border-slate-200 rounded-md
                           px-3 py-2 text-sm bg-white focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
                value={viewStudentId}
                onChange={(e) => setViewStudentId(e.target.value)}
                disabled={!selectedBatchId}
              >
                <option value="">
                  {selectedBatchId
                    ? 'Select student'
                    : 'Select batch first'
                  }
                </option>
                {batchStudents.map((s: any) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rl && <LoadingSpinner />}

          {/* Results List */}
          {viewStudentId && !rl && studentResults.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-4">
              No results for this student yet
            </p>
          )}

          <div className="space-y-2">
            {studentResults.map((r: any, idx: number) => {
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
                      <p className="text-xs text-slate-400 italic mt-0.5">
                        {r.remarks}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${grade.color}`}>
                      {grade.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.obtainedMarks}/{r.totalMarks}
                    </p>
                    <p className="text-xs font-medium text-slate-600">
                      {r.percentage}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {!viewStudentId && (
            <div className="text-center py-6 text-slate-400">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">
                Select batch and student to view results
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Result Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Test Result</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit((d) => mut.mutate(d))(e)
            }}
            className="space-y-3 mt-1"
          >
            <div className="space-y-1">
              <Label>Select Batch</Label>
              <select
                className="w-full border border-slate-200 rounded-md
                           px-3 py-2 text-sm bg-white focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value)
                  const b = batches.find(
                    (b: any) => b.batchId === e.target.value
                  )
                  if (b?.courseId) setValue('courseId', b.courseId)
                }}
              >
                <option value="">Select batch</option>
                {batches.map((b: any) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchName} — {b.course}
                  </option>
                ))}
              </select>
            </div>

            <input type="hidden" {...register('courseId')} />

            <div className="space-y-1">
              <Label>Select Student</Label>
              <select
                className="w-full border border-slate-200 rounded-md
                           px-3 py-2 text-sm bg-white focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
                disabled={!selectedBatchId}
                {...register('studentId')}
              >
                <option value="">Select student</option>
                {batchStudents.map((s: any) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentName} — {s.enrollmentNumber}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <p className="text-xs text-red-500">
                  {errors.studentId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <Label>Obtained</Label>
                <Input type="number" placeholder="85"
                  {...register('obtainedMarks')} />
              </div>

              <div className="space-y-1">
                <Label>Test Date</Label>
                <Input type="date" {...register('testDate')} />
              </div>

              <div className="space-y-1">
                <Label>Remarks</Label>
                <Input placeholder="Optional"
                  {...register('remarks')} />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline"
                className="flex-1"
                onClick={() => {
                  setOpen(false)
                  reset()
                }}>
                Cancel
              </Button>
              <Button type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={mut.isPending}>
                {mut.isPending ? 'Uploading...' : 'Upload Result'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}