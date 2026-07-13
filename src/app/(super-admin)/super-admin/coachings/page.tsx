'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminApi } from '@/lib/api/superAdmin'
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
import { Plus, Building2, GraduationCap, Users } from 'lucide-react'

const schema = z.object({
  coachingName:  z.string().min(2, 'Required'),
  ownerName:     z.string().min(2, 'Required'),
  email:         z.string().email('Valid email required'),
  phone:         z.string().min(10, 'Valid phone required'),
  address:       z.string().optional(),
  adminPassword: z.string().min(8, 'Min 8 characters'),
  plan:          z.string().default('BASIC'),
})

type FormData = z.infer<typeof schema>

function CreateForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
      defaultValues: { plan: 'BASIC' },
    })

  const mut = useMutation({
    mutationFn: superAdminApi.createCoaching,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-coachings'] })
      qc.invalidateQueries({ queryKey: ['sa-analytics'] })
      toast.success('Coaching created!')
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
        <div className="col-span-2 space-y-1">
          <Label>Coaching Name</Label>
          <Input placeholder="ABC Coaching"
            {...register('coachingName')} />
          {errors.coachingName && (
            <p className="text-xs text-red-500">
              {errors.coachingName.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Owner Name</Label>
          <Input placeholder="Rajesh Kumar"
            {...register('ownerName')} />
          {errors.ownerName && (
            <p className="text-xs text-red-500">
              {errors.ownerName.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Phone</Label>
          <Input placeholder="9876543210"
            {...register('phone')} />
          {errors.phone && (
            <p className="text-xs text-red-500">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Email</Label>
          <Input type="email" placeholder="owner@coaching.com"
            {...register('email')} />
          {errors.email && (
            <p className="text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Address</Label>
          <Input placeholder="Delhi, India"
            {...register('address')} />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Admin Password</Label>
          <Input type="password" placeholder="Min 8 characters"
            {...register('adminPassword')} />
          {errors.adminPassword && (
            <p className="text-xs text-red-500">
              {errors.adminPassword.message}
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
          {mut.isPending ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

export default function CoachingsPage() {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { data: coachings, isLoading } = useQuery({
    queryKey: ['sa-coachings'],
    queryFn:  superAdminApi.getAllCoachings,
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active
        ? superAdminApi.deactivateCoaching(id)
        : superAdminApi.activateCoaching(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-coachings'] })
      qc.invalidateQueries({ queryKey: ['sa-analytics'] })
      toast.success('Status updated!')
    },
    onError: () => toast.error('Something went wrong'),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Coachings</h1>
          <p className="text-sm text-slate-500">
            {coachings?.length ?? 0} registered
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Coaching
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Coaching</DialogTitle>
          </DialogHeader>
          <CreateForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Empty */}
      {coachings?.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Building2 className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No coachings yet</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coachings?.map((c: any) => (
          <Card key={c.id}
            className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">

              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {c.name}
                    </p>
                    <p className="text-xs text-slate-500">{c.ownerName}</p>
                  </div>
                </div>
                <Badge variant={c.active ? 'default' : 'destructive'}>
                  {c.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Info */}
              <div className="text-xs text-slate-500 space-y-0.5">
                <p>📧 {c.email}</p>
                <p>📞 {c.phone}</p>
                {c.address && <p>📍 {c.address}</p>}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-lg p-2
                                flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-400">Students</p>
                    <p className="text-sm font-semibold">
                      {c.totalStudents}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2
                                flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-400">Teachers</p>
                    <p className="text-sm font-semibold">
                      {c.totalTeachers}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                disabled={toggleMut.isPending}
                onClick={() =>
                  toggleMut.mutate({ id: c.id, active: c.active })
                }
              >
                {c.active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}