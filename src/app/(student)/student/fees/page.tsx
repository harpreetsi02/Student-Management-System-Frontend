'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingUp } from 'lucide-react'

function FeeCard({ courseId, courseName }: {
  courseId: string
  courseName: string
}) {
  const { data: fees, isLoading } = useQuery({
    queryKey: ['student-fees', courseId],
    queryFn: async () => {
      const res = await api.get(`/student/fees/${courseId}`)
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <Card>
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-800">
          {courseName}
        </p>
      </div>
      <CardContent className="p-4 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">Total Fees</p>
            <p className="text-lg font-bold text-slate-800">
              ₹{(fees?.totalFees ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 mb-1">Paid</p>
            <p className="text-lg font-bold text-green-700">
              ₹{(fees?.paidAmount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-red-500 mb-1">Due</p>
            <p className="text-lg font-bold text-red-600">
              ₹{(fees?.dueAmount ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        {fees?.totalFees > 0 && (
          <div className="space-y-1">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (fees.paidAmount / fees.totalFees) * 100
                    )
                  )}%`
                }}
              />
            </div>
            <p className="text-xs text-slate-500 text-right">
              {Math.round(
                (fees.paidAmount / fees.totalFees) * 100
              )}% paid
            </p>
          </div>
        )}

        {/* Payment History */}
        {fees?.paymentHistory?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600
                          uppercase tracking-wide">
              Payment History
            </p>
            {fees.paymentHistory.map((p: any, idx: number) => (
              <div key={idx}
                className="flex items-center justify-between
                           px-3 py-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-700">
                      {p.type}
                    </p>
                    <p className="text-xs text-slate-400">{p.date}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-green-700">
                  +₹{p.amount?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {fees?.paymentHistory?.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">
            No payments yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function StudentFeesPage() {
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
        <h1 className="text-xl font-bold text-slate-800">Fees</h1>
        <p className="text-sm text-slate-500">
          Your fee payment status
        </p>
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Wallet className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No courses enrolled yet</p>
        </div>
      )}

      <div className="space-y-4">
        {courses.map((c: any) => (
          <FeeCard
            key={c.courseId}
            courseId={c.courseId}
            courseName={c.courseName}
          />
        ))}
      </div>
    </div>
  )
}