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
import { Plus, Bell, Trash2 } from 'lucide-react'
import { Notice } from '@/types'

const schema = z.object({
  title:   z.string().min(2, 'Required'),
  content: z.string().min(5, 'Required'),
  scope:   z.enum(['GENERAL', 'COURSE', 'BATCH']).default('GENERAL'),
})

type FormData = z.infer<typeof schema>

function CreateNoticeForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
      defaultValues: { scope: 'GENERAL' },
    })

  const mut = useMutation({
    mutationFn: coachingAdminApi.createNotice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-notices'] })
      toast.success('Notice posted!')
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
        <Label>Title</Label>
        <Input placeholder="Holiday Notice"
          {...register('title')} />
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Content</Label>
        <textarea
          rows={4}
          placeholder="Notice content..."
          className="w-full border border-slate-200 rounded-md px-3
                     py-2 text-sm resize-none focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
          {...register('content')}
        />
        {errors.content && (
          <p className="text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Scope</Label>
        <select
          className="w-full border border-slate-200 rounded-md
                     px-3 py-2 text-sm bg-white focus:outline-none
                     focus:ring-2 focus:ring-blue-500"
          {...register('scope')}
        >
          <option value="GENERAL">General — All Students</option>
          <option value="COURSE">Course Specific</option>
          <option value="BATCH">Batch Specific</option>
        </select>
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
          {mut.isPending ? 'Posting...' : 'Post Notice'}
        </Button>
      </div>
    </form>
  )
}

const SCOPE_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  GENERAL: 'default',
  COURSE:  'secondary',
  BATCH:   'outline',
}

export default function NoticesPage() {
  const [open, setOpen] = useState(false)
  const qc              = useQueryClient()

  const { data: notices, isLoading } = useQuery({
    queryKey: ['ca-notices'],
    queryFn:  coachingAdminApi.getNotices,
  })

  const deleteMut = useMutation({
    mutationFn: coachingAdminApi.deleteNotice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-notices'] })
      toast.success('Notice deleted')
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notices</h1>
          <p className="text-sm text-slate-500">
            {notices?.length ?? 0} notices
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Post Notice
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post New Notice</DialogTitle>
          </DialogHeader>
          <CreateNoticeForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {notices?.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Bell className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No notices yet</p>
        </div>
      )}

      <div className="space-y-3">
        {notices?.map((n: Notice) => (
          <Card key={n.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm">
                      {n.title}
                    </p>
                    <Badge variant={SCOPE_VARIANT[n.scope] ?? 'default'}
                      className="text-xs">
                      {n.scope}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {n.content}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(n.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-red-500
                             hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                  onClick={() => {
                    if (confirm('Delete this notice?'))
                      deleteMut.mutate(n.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}