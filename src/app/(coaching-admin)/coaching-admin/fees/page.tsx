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
import { Wallet, Plus, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { Student, Course } from '@/types'


const schema = z.object({
  studentId:   z.string().min(1, 'Select student'),
  courseId:    z.string().min(1, 'Select course'),
  amount:      z.coerce.number().min(1, 'Amount required'),
  paymentType: z.enum(['REGISTRATION','MONTHLY','FULL','PARTIAL']),
  paymentDate: z.string().min(1, 'Date required'),
  remarks:     z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function FeesPage() {
  const [open, setOpen]           = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [selectedCourse,  setSelectedCourse]  = useState<string>('')
  const qc = useQueryClient()

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['ca-students'],
    queryFn:  () => coachingAdminApi.getStudents(),
  })

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['ca-courses'],
    queryFn:  () => coachingAdminApi.getCourses(),
  })

  const { data: recentPayments = [] } = useQuery<any[]>({
    queryKey: ['ca-recent-payments'],
    queryFn:  coachingAdminApi.getRecentPayments,
  })

  const { data: feesSummary, isLoading: fl } = useQuery({
    queryKey: ['ca-fees', selectedStudent, selectedCourse],
    queryFn:  () =>
      coachingAdminApi.getFeesSummary(selectedStudent, selectedCourse),
    enabled: !!selectedStudent && !!selectedCourse,
  })

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
      defaultValues: {
        paymentType: 'REGISTRATION',
        paymentDate: new Date().toISOString().split('T')[0],
      },
    })

  const mut = useMutation({
    mutationFn: coachingAdminApi.addPayment,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['ca-fees', selectedStudent, selectedCourse],
      })
      toast.success('Payment recorded!')
      reset()
      setOpen(false)
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Failed'),
  })

  return (
    
    <div className="space-y-5">
      

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Fees</h1>
          <p className="text-sm text-slate-500">
            Track student fee payments
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Payment
        </Button>
      </div>

      

      {/* Add Payment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit((d) => mut.mutate(d))(e)
            }}
            className="space-y-3 mt-1"
          >
            <div className="space-y-1">
              <Label>Student</Label>
              <select
                className="w-full border border-slate-200 rounded-md
                           px-3 py-2 text-sm bg-white focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
                {...register('studentId')}
              >
                <option value="">Select student</option>
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
                <option value="">Select course</option>
                {(courses as Course[]).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.courseId && (
                <p className="text-xs text-red-500">
                  {errors.courseId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Amount (₹)</Label>
                <Input type="number" placeholder="5000"
                  {...register('amount')} />
                {errors.amount && (
                  <p className="text-xs text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Payment Type</Label>
                <select
                  className="w-full border border-slate-200 rounded-md
                             px-3 py-2 text-sm bg-white focus:outline-none
                             focus:ring-2 focus:ring-blue-500"
                  {...register('paymentType')}
                >
                  <option value="REGISTRATION">Registration</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="FULL">Full</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Payment Date</Label>
              <Input type="date" {...register('paymentDate')} />
            </div>

            <div className="space-y-1">
              <Label>Remarks</Label>
              <Input placeholder="Optional note..."
                {...register('remarks')} />
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
                {mut.isPending ? 'Saving...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      

      {/* View Summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            View Fee Summary
          </p>
          <div className="flex flex-wrap gap-3">
            <select
              className="flex-1 min-w-40 border border-slate-200
                         rounded-md px-3 py-2 text-sm bg-white
                         focus:outline-none focus:ring-2
                         focus:ring-blue-500"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Select student</option>
              {(students as Student[]).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              className="flex-1 min-w-40 border border-slate-200
                         rounded-md px-3 py-2 text-sm bg-white
                         focus:outline-none focus:ring-2
                         focus:ring-blue-500"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select course</option>
              {(courses as Course[]).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {fl && <LoadingSpinner />}

          {feesSummary && (
            <div className="space-y-4 mt-2">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500">Total Fees</p>
                  <p className="text-lg font-bold text-slate-800">
                    ₹{feesSummary.totalFees?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600">Paid</p>
                  <p className="text-lg font-bold text-green-700">
                    ₹{feesSummary.paidAmount?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-red-500">Due</p>
                  <p className="text-lg font-bold text-red-600">
                    ₹{feesSummary.dueAmount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <p className="text-xs font-semibold text-slate-600
                              uppercase tracking-wide mb-2">
                  Payment History
                </p>
                <div className="space-y-2">
                  {feesSummary.paymentHistory?.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No payments yet
                    </p>
                  )}
                  {feesSummary.paymentHistory?.map(
                    (p: any, idx: number) => (
                      <div key={idx}
                        className="flex items-center justify-between
                                   px-3 py-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5
                                                  text-green-500" />
                          <div>
                            <p className="text-xs font-medium
                                         text-slate-700">
                              {p.type}
                            </p>
                            <p className="text-xs text-slate-400">
                              {p.date}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold
                                       text-green-700">
                          +₹{p.amount?.toLocaleString()}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {!selectedStudent && !selectedCourse && (
            <div className="text-center py-8 text-slate-400">
              <Wallet className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">
                Select student and course to view summary
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <div className="px-4 py-3 border-b border-slate-100
                        flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-600" />
          <p className="text-sm font-semibold text-slate-800">
            Recent Payments
          </p>
          <Badge variant="secondary" className="text-xs ml-auto">
            Last 5
          </Badge>
        </div>

        <div className="divide-y divide-slate-50">
          {recentPayments.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-6">
              No payments yet
            </p>
          )}
          {recentPayments.map((p: any, idx: number) => (
            <div key={idx}
              className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100
                                flex items-center justify-center
                                text-green-700 text-xs font-bold shrink-0">
                  {p.studentName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {p.studentName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.courseName} • {p.paymentType} • {p.paymentDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                <p className="text-sm font-bold text-green-700">
                  ₹{p.amount?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}