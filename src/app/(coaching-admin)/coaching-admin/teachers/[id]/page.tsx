'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Mail, Phone,
  BookOpen, Clock, Users,
} from 'lucide-react'

export default function TeacherDetailPage() {
  const { id } = useParams()
  const router  = useRouter()

  const { data: teacher, isLoading } = useQuery({
    queryKey: ['teacher-detail', id],
    queryFn: async () => {
      const res = await api.get(`/coaching-admin/teachers/${id}`)
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (!teacher)  return <p>Teacher not found</p>

  return (
    <div className="space-y-5 max-w-2xl">

      <Button variant="ghost" size="sm"
        className="text-slate-500"
        onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back
      </Button>

      {/* Profile */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100
                            flex items-center justify-center
                            text-green-700 text-2xl font-bold shrink-0">
              {teacher.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">
                  {teacher.name}
                </h1>
                <Badge variant={teacher.active ? 'default' : 'secondary'}>
                  {teacher.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {teacher.subject && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {teacher.subject}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 mt-5">
            <div className="flex items-center gap-2 text-sm
                            text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              {teacher.email}
            </div>
            <div className="flex items-center gap-2 text-sm
                            text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              {teacher.phone}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Courses */}
      {teacher.assignedCourses?.length > 0 && (
        <Card>
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800
                          flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Assigned Courses
            </p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {teacher.assignedCourses.map((c: string, i: number) => (
              <Badge key={i} variant="secondary">{c}</Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Assigned Batches */}
      {teacher.assignedBatches?.length > 0 && (
        <Card>
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800
                          flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Assigned Batches
            </p>
          </div>
          <div className="divide-y divide-slate-50">
            {teacher.assignedBatches.map((b: string, i: number) => (
              <div key={i} className="px-4 py-2.5 text-sm text-slate-700">
                {b}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}