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
import { Plus, Clock, BookOpen } from 'lucide-react'
import { Course, Batch, Teacher } from '@/types'
import { Trash2 } from 'lucide-react'

const schema = z.object({
  name:      z.string().min(2, 'Required'),
  courseId:  z.string().min(1, 'Select course'),
  teacherId: z.string().optional(),
  startTime: z.string().optional(),
  endTime:   z.string().optional(),
})

type FormData = z.infer<typeof schema>

function CreateBatchForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['ca-courses'],
    queryFn: () => coachingAdminApi.getCourses(),
  })

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ['ca-teachers'],
    queryFn:  () => coachingAdminApi.getTeachers(),
  })

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
    })

  const mut = useMutation({
    mutationFn: coachingAdminApi.createBatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-batches'] })
      toast.success('Batch created!')
      reset()
      onClose()
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Failed'),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit((d) => mut.mutate(d))(e)
      }}
      className="space-y-3 mt-1"
    >
      <div className="space-y-1">
        <Label>Batch Name</Label>
        <Input placeholder="Morning Batch" {...register('name')} />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
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
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.courseId && (
          <p className="text-xs text-red-500">{errors.courseId.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Assign Teacher</Label>
        <select
          className="w-full border border-slate-200 rounded-md
                     px-3 py-2 text-sm bg-white focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
          {...register('teacherId')}
        >
          <option value="">No teacher assigned</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} {t.subject ? `— ${t.subject}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Start Time</Label>
          <Input type="time" {...register('startTime')} />
        </div>
        <div className="space-y-1">
          <Label>End Time</Label>
          <Input type="time" {...register('endTime')} />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline"
          className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={mut.isPending}>
          {mut.isPending ? 'Creating...' : 'Create Batch'}
        </Button>
      </div>
    </form>
  )
}

export default function BatchesPage() {
  const [open, setOpen] = useState(false)

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['ca-courses'],
    queryFn: () => coachingAdminApi.getCourses(),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Batches</h1>
          <p className="text-sm text-slate-500">
            Manage course batches
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Batch
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Batch</DialogTitle>
          </DialogHeader>
          <CreateBatchForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Batches grouped by course */}
      <div className="space-y-4">
        {courses.map((course) => (
          <CourseBatches key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>Create courses first, then add batches</p>
        </div>
      )}
    </div>
  )
}

function CourseBatches({ course }: { course: Course }) {
  const qc = useQueryClient()

  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ['ca-batches', course.id],
    queryFn:  () => coachingAdminApi.getBatches(course.id),
  })

  const deleteMut = useMutation({
    mutationFn: coachingAdminApi.deleteBatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-batches', course.id] })
      toast.success('Batch deleted')
    },
    onError: () => toast.error('Failed to delete batch'),
  })

  return (
    <Card>
      <div className="px-4 py-3 border-b border-slate-100
                      flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-slate-800">
          {course.name}
        </p>
        <Badge variant="secondary" className="text-xs ml-auto">
          {batches.length} batches
        </Badge>
      </div>

      <div className="divide-y divide-slate-50">
        {batches.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">
            No batches yet — create one above
          </p>
        )}
        {batches.map((b) => (
          <div key={b.id}
            className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-1.5 rounded-lg">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{b.name}</p>
                <p className="text-xs text-slate-500">
                  {b.startTime && b.endTime
                    ? `${b.startTime} — ${b.endTime}`
                    : 'Time not set'
                  }
                  {b.teacherName ? ` • ${b.teacherName}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={b.active ? 'default' : 'secondary'}>
                {b.active ? 'Active' : 'Inactive'}
              </Badge>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-red-400 hover:text-red-600
                           hover:bg-red-50"
                onClick={() => {
                  if (confirm(`Delete "${b.name}"?`))
                    deleteMut.mutate(b.id)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}