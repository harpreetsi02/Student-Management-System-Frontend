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
import {
  Plus, Search, Trash2,
  GraduationCap, UserCheck, UserX,
} from 'lucide-react'
import { Student } from '@/types'

// ── Schema ─────────────────────────────────────────────
const schema = z.object({
  name:     z.string().min(2, 'Name required'),
  email:    z.string().email('Valid email required'),
  phone:    z.string().min(10, 'Valid phone required'),
  password: z.string().min(6, 'Min 6 characters'),
  gender:   z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  city:     z.string().optional(),
  state:    z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ── Create Form ─────────────────────────────────────────
function CreateStudentForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
    })

  const mut = useMutation({
    mutationFn: coachingAdminApi.createStudent,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['ca-students'] })
      toast.success(
        `Student created! Enrollment: ${data.enrollmentNumber}`
      )
      reset()
      onClose()
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? 'Failed to create'),
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
          <Label>Full Name</Label>
          <Input placeholder="Rahul Sharma" {...register('name')} />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Phone</Label>
          <Input placeholder="9999999999" {...register('phone')} />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Email</Label>
          <Input type="email" placeholder="rahul@gmail.com"
            {...register('email')} />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Password</Label>
          <Input type="password" placeholder="Min 6 characters"
            {...register('password')} />
          {errors.password && (
            <p className="text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Gender</Label>
          <select
            className="w-full border border-slate-200 rounded-md
                       px-3 py-2 text-sm focus:outline-none
                       focus:ring-2 focus:ring-blue-500 bg-white"
            {...register('gender')}
          >
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label>City</Label>
          <Input placeholder="Delhi" {...register('city')} />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>State</Label>
          <Input placeholder="Delhi" {...register('state')} />
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
          {mut.isPending ? 'Creating...' : 'Create Student'}
        </Button>
      </div>
    </form>
  )
}

// ── Main Page ───────────────────────────────────────────
export default function StudentsPage() {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const qc                  = useQueryClient()

  const { data: students, isLoading } = useQuery({
    queryKey: ['ca-students', search],
    queryFn:  () => coachingAdminApi.getStudents(search || undefined),
  })

  const deleteMut = useMutation({
    mutationFn: coachingAdminApi.deleteStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-students'] })
      toast.success('Student deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      coachingAdminApi.toggleStudentStatus(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-students'] })
      toast.success('Status updated')
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500">
            {students?.length ?? 0} enrolled
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Student
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <CreateStudentForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Empty */}
      {students?.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <GraduationCap className="h-10 w-10 mx-auto mb-2
                                    text-slate-300" />
          <p>No students found</p>
        </div>
      )}

      {/* Table */}
      {(students?.length ?? 0) > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-medium
                                   text-slate-500 uppercase tracking-wide">
                      Enrollment
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium
                                   text-slate-500 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium
                                   text-slate-500 uppercase tracking-wide
                                   hidden md:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium
                                   text-slate-500 uppercase tracking-wide
                                   hidden md:table-cell">
                      Phone
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium
                                   text-slate-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium
                                   text-slate-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students?.map((s: Student) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-blue-50
                                         text-blue-700 px-2 py-0.5
                                         rounded-md">
                          {s.enrollmentNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500
                                     hidden md:table-cell">
                        {s.email}
                      </td>
                      <td className="px-4 py-3 text-slate-500
                                     hidden md:table-cell">
                        {s.phone}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.active ? 'default' : 'secondary'}>
                          {s.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400
                                       hover:text-blue-600"
                            title={s.active ? 'Deactivate' : 'Activate'}
                            onClick={() =>
                              toggleMut.mutate({
                                id: s.id,
                                active: s.active,
                              })
                            }
                          >
                            {s.active
                              ? <UserX className="h-3.5 w-3.5" />
                              : <UserCheck className="h-3.5 w-3.5" />
                            }
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400
                                       hover:text-red-600"
                            onClick={() => {
                              if (confirm(`Delete ${s.name}?`))
                                deleteMut.mutate(s.id)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}