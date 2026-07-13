'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Trash2, Users } from 'lucide-react'
import { Teacher } from '@/types'

const schema = z.object({
  name:     z.string().min(2, 'Required'),
  email:    z.string().email('Valid email required'),
  phone:    z.string().min(10, 'Valid phone required'),
  password: z.string().min(6, 'Min 6 characters'),
  subject:  z.string().optional(),
})

type FormData = z.infer<typeof schema>

function CreateTeacherForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
    })

  const mut = useMutation({
    mutationFn: coachingAdminApi.createTeacher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-teachers'] })
      toast.success('Teacher created!')
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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input placeholder="Amit Sir" {...register('name')} />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Subject</Label>
          <Input placeholder="Python, Math..." {...register('subject')} />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Email</Label>
          <Input type="email" placeholder="amit@coaching.com"
            {...register('email')} />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Phone</Label>
          <Input placeholder="9999999999" {...register('phone')} />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Password</Label>
          <Input type="password" placeholder="Min 6 chars"
            {...register('password')} />
          {errors.password && (
            <p className="text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline"
          className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={mut.isPending}
        >
          {mut.isPending ? 'Creating...' : 'Create Teacher'}
        </Button>
      </div>
    </form>
  )
}

export default function TeachersPage() {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const qc                  = useQueryClient()

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['ca-teachers', search],
    queryFn:  () => coachingAdminApi.getTeachers(search || undefined),
  })

  const deleteMut = useMutation({
    mutationFn: coachingAdminApi.deleteTeacher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-teachers'] })
      toast.success('Teacher deleted')
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Teachers</h1>
          <p className="text-sm text-slate-500">
            {teachers?.length ?? 0} teachers
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Teacher
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <CreateTeacherForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search teachers..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {teachers?.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Users className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No teachers yet</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teachers?.map((t: Teacher) => (
          <Card key={t.id}
            className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100
                                  flex items-center justify-center
                                  text-blue-700 font-bold text-sm
                                  shrink-0">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t.subject ?? 'No subject'}
                    </p>
                  </div>
                </div>
                <Badge variant={t.active ? 'default' : 'secondary'}>
                  {t.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="text-xs text-slate-500 space-y-0.5">
                <p>📧 {t.email}</p>
                <p>📞 {t.phone}</p>
                {t.assignedCourses?.length > 0 && (
                  <p>📚 {t.assignedCourses.join(', ')}</p>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-red-400 hover:text-red-600
                           hover:bg-red-50 text-xs"
                onClick={() => {
                  if (confirm(`Delete ${t.name}?`))
                    deleteMut.mutate(t.id)
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Teacher
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}