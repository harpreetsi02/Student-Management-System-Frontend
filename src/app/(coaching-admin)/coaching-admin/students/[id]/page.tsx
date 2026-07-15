'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, GraduationCap, Mail,
  Phone, MapPin, User, Calendar,
} from 'lucide-react'

export default function StudentDetailPage() {
  const { id } = useParams()
  const router  = useRouter()

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-detail', id],
    queryFn: async () => {
      const res = await api.get(`/coaching-admin/students/${id}`)
      return res.data
    },
  })

  const { data: results = [] } = useQuery<any[]>({
    queryKey: ['student-results-detail', id],
    queryFn: async () => {
      const res = await api.get(
        `/coaching-admin/results/student/${id}`
      )
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (!student)  return <p>Student not found</p>

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Back */}
      <Button variant="ghost" size="sm"
        className="text-slate-500"
        onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back
      </Button>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100
                            flex items-center justify-center
                            text-blue-700 text-2xl font-bold shrink-0">
              {student.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-800">
                  {student.name}
                </h1>
                <Badge variant={student.active ? 'default' : 'secondary'}>
                  {student.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="font-mono text-sm text-blue-600 mt-0.5">
                {student.enrollmentNumber}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              {student.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              {student.phone}
            </div>
            {student.gender && (
              <div className="flex items-center gap-2 text-sm
                              text-slate-600">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                {student.gender}
              </div>
            )}
            {student.dateOfBirth && (
              <div className="flex items-center gap-2 text-sm
                              text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                {student.dateOfBirth}
              </div>
            )}
            {(student.city || student.state) && (
              <div className="flex items-center gap-2 text-sm
                              text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                {[student.city, student.state].filter(Boolean).join(', ')}
              </div>
            )}
            {student.fatherName && (
              <div className="flex items-center gap-2 text-sm
                              text-slate-600">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                Father: {student.fatherName}
              </div>
            )}
            {student.motherName && (
              <div className="flex items-center gap-2 text-sm
                              text-slate-600">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                Mother: {student.motherName}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Enrolled on:{' '}
            {new Date(student.createdAt).toLocaleDateString('en-IN')}
          </p>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">
              Test Results
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {results.map((r: any, idx: number) => (
              <div key={idx}
                className="flex items-center justify-between
                           px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {r.testName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.courseName} • {r.testDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold
                    ${r.percentage >= 75
                      ? 'text-green-600'
                      : 'text-red-500'
                    }`}>
                    {r.percentage}%
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.obtainedMarks}/{r.totalMarks}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}