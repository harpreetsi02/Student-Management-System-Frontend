'use client'

import { useState, useRef } from 'react'
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
  Plus, Trash2, BookOpen,
  ChevronDown, ChevronUp, Lock, Unlock,
} from 'lucide-react'
import { Course, Module } from '@/types'
import { useRouter } from 'next/navigation'
import PdfAccessManager from '@/components/shared/PdfAccessManager'

// ── Course Schema ───────────────────────────────────────
const courseSchema = z.object({
  name:             z.string().min(2, 'Required'),
  description:      z.string().optional(),
  category:         z.string().optional(),
  duration:         z.string().optional(),
  totalFees:        z.coerce.number().min(0).optional(),
  registrationFees: z.coerce.number().min(0).optional(),
  shortCode:        z.string().max(10).optional(),
  courseLanguage:   z.string().optional(),
  status:           z.enum(['ACTIVE', 'INACTIVE', 'COMPLETED'])
                     .default('ACTIVE'),
})

type CourseForm = z.infer<typeof courseSchema>

// ── Create Course Form ──────────────────────────────────
function CreateCourseForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CourseForm>({
      resolver: zodResolver(courseSchema) as any,
      defaultValues: {
        status: 'ACTIVE',
        courseLanguage: 'Hindi',
      },
    })

  const mut = useMutation({
    mutationFn: coachingAdminApi.createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-courses'] })
      toast.success('Course created!')
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
      className="space-y-3 mt-1 max-h-[65vh] overflow-y-auto pr-1"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Course Name *</Label>
          <Input placeholder="Python Full Stack"
            {...register('name')} />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Short Code</Label>
          <Input placeholder="PY" {...register('shortCode')} />
        </div>

        <div className="space-y-1">
          <Label>Category</Label>
          <Input placeholder="Programming" {...register('category')} />
        </div>

        <div className="space-y-1">
          <Label>Duration</Label>
          <Input placeholder="3 months" {...register('duration')} />
        </div>

        <div className="space-y-1">
          <Label>Language</Label>
          <Input placeholder="Hindi" {...register('courseLanguage')} />
        </div>

        <div className="space-y-1">
          <Label>Total Fees (₹)</Label>
          <Input type="number" placeholder="15000"
            {...register('totalFees')} />
        </div>

        <div className="space-y-1">
          <Label>Reg. Fees (₹)</Label>
          <Input type="number" placeholder="2000"
            {...register('registrationFees')} />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Description</Label>
          <Input placeholder="Course description..."
            {...register('description')} />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Status</Label>
          <select
            className="w-full border border-slate-200 rounded-md
                       px-3 py-2 text-sm bg-white focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
            {...register('status')}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="COMPLETED">Completed</option>
          </select>
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
          {mut.isPending ? 'Creating...' : 'Create Course'}
        </Button>
      </div>
    </form>
  )
}

// ── Module Manager ──────────────────────────────────────
function ModuleManager({ courseId }: { courseId: string }) {
  const qc              = useQueryClient()
  const [newName, setNewName]         = useState('')
  const [expandedModule, setExpanded] = useState<string | null>(null)

  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ['ca-modules', courseId],
    queryFn:  () => coachingAdminApi.getModules(courseId),
  })

  const addMut = useMutation({
    mutationFn: () =>
      coachingAdminApi.createModule(courseId, {
        name: newName.trim(),
        unlockType: 'MANUAL',
        locked: false,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-modules', courseId] })
      toast.success('Module added!')
      setNewName('')
    },
  })

  const deleteMut = useMutation({
    mutationFn: (moduleId: string) =>
      coachingAdminApi.deleteModule(courseId, moduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-modules', courseId] })
      toast.success('Module deleted')
    },
  })

  return (
    <div className="border-t border-slate-100 pt-3 mt-1 space-y-3">
      <p className="text-xs font-semibold text-slate-600 uppercase
                    tracking-wide">
        Modules ({modules.length})
      </p>

      {/* Add Module */}
      <div className="flex gap-2">
        <Input
          placeholder="Module name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="text-sm h-8"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newName.trim()) {
              e.preventDefault()
              addMut.mutate()
            }
          }}
        />
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 h-8 px-3 shrink-0"
          onClick={() => newName.trim() && addMut.mutate()}
          disabled={addMut.isPending || !newName.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Module List */}
      <div className="space-y-2">
        {modules.map((m: Module, idx: number) => (
          <div key={m.id}
            className="border border-slate-100 rounded-lg overflow-hidden">

            {/* Module Header */}
            <div className="flex items-center justify-between
                            px-3 py-2 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono w-5">
                  {idx + 1}.
                </span>
                <span className="text-sm text-slate-700">{m.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {m.locked
                  ? <Lock className="h-3 w-3 text-red-400" />
                  : <Unlock className="h-3 w-3 text-green-500" />
                }
                <Button
                  variant="ghost" size="sm"
                  className="h-6 text-xs px-2 text-blue-600"
                  onClick={() =>
                    setExpanded(
                      expandedModule === m.id ? null : m.id
                    )
                  }
                >
                  {expandedModule === m.id ? 'Hide' : 'PDFs'}
                </Button>
                <Button
                  variant="ghost" size="sm"
                  className="h-6 w-6 p-0 text-slate-300
                             hover:text-red-500"
                  onClick={() => deleteMut.mutate(m.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* PDF Section */}
            {expandedModule === m.id && (
              <PdfManager moduleId={m.id} courseId={courseId}/>
            )}
          </div>
        ))}

        {modules.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">
            No modules yet
          </p>
        )}
      </div>
    </div>
  )
}

// ── PDF Manager ─────────────────────────────────────────
function PdfManager({ moduleId, courseId }: { moduleId: string; courseId: string }) {
  const qc = useQueryClient()
  const [pdfTitle, setPdfTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: pdfs = [] } = useQuery<any[]>({
    queryKey: ['ca-pdfs', moduleId],
    queryFn:  () => coachingAdminApi.getPdfs(moduleId),
  })

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file || !pdfTitle.trim()) {
      toast.error('Add a title first')
      return
    }
    setUploading(true)
    try {
      await coachingAdminApi.uploadPdf(moduleId, pdfTitle, file)
      qc.invalidateQueries({ queryKey: ['ca-pdfs', moduleId] })
      toast.success('PDF uploaded!')
      setPdfTitle('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteMut = useMutation({
    mutationFn: coachingAdminApi.deletePdf,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-pdfs', moduleId] })
      toast.success('PDF deleted')
    },
  })

  const lockMut = useMutation({
    mutationFn: ({ id, locked }: { id: string; locked: boolean }) =>
      locked
        ? coachingAdminApi.unlockPdf(id)
        : coachingAdminApi.lockPdf(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-pdfs', moduleId] })
    },
  })

  return (
    <div className="p-3 space-y-3 bg-white">

      {/* Upload */}
      <div className="space-y-2">
        <Input
          placeholder="PDF title..."
          value={pdfTitle}
          onChange={(e) => setPdfTitle(e.target.value)}
          className="text-xs h-8"
        />
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 flex-1"
            disabled={uploading || !pdfTitle.trim()}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Uploading...' : '📎 Upload PDF'}
          </Button>
        </div>
      </div>

      {/* PDF List */}
      <div className="space-y-1.5">
        {pdfs.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-1">
            No PDFs yet
          </p>
        )}
        {pdfs.map((pdf: any) => (
          <div key={pdf.id}
            className="flex items-center justify-between
                       px-2 py-1.5 bg-slate-50 rounded">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs">📄</span>
              <p className="text-xs text-slate-700 truncate">{pdf.title}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Access management */}
              <PdfAccessManager pdf={pdf} moduleId={moduleId} courseId={courseId} />
                
              {/* Delete */}
              <Button
                variant="ghost" size="sm"
                className="h-6 w-6 p-0 text-slate-300 hover:text-red-500"
                onClick={() => {
                  if (confirm('Delete PDF?'))
                    deleteMut.mutate(pdf.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Course Card ─────────────────────────────────────────
function CourseCard({
  course,
  onDelete,
}: {
  course: Course
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const statusVariant = {
    ACTIVE:    'default',
    INACTIVE:  'secondary',
    COMPLETED: 'outline',
  } as const

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg shrink-0">
              <BookOpen className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">
                {course.name}
              </p>
              <p className="text-xs text-slate-500">
                {course.category ?? 'General'} •{' '}
                {course.duration ?? 'N/A'}
              </p>
            </div>
          </div>
          <Badge
            variant={
              statusVariant[course.status] ?? 'default'
            }
            className="shrink-0"
          >
            {course.status}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-xs text-slate-400">Fees</p>
            <p className="text-sm font-semibold text-slate-800">
              ₹{(course.totalFees ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-xs text-slate-400">Batches</p>
            <p className="text-sm font-semibold text-slate-800">
              {course.totalBatches}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-xs text-slate-400">Code</p>
            <p className="text-sm font-semibold font-mono text-slate-800">
              {course.shortCode ?? '—'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded
              ? <><ChevronUp className="h-3 w-3 mr-1" />Hide</>
              : <><ChevronDown className="h-3 w-3 mr-1" />Modules</>
            }
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-600
                       hover:bg-red-50 px-2"
            onClick={() => {
              if (confirm(`Delete ${course.name}?`))
                onDelete(course.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Module Manager */}
        {expanded && <ModuleManager courseId={course.id} />}
      </CardContent>
    </Card>
  )
}

// ── Main Page ───────────────────────────────────────────
export default function CoursesPage() {
  const [open, setOpen] = useState(false)
  const qc              = useQueryClient()

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['ca-courses'],
    queryFn: () => coachingAdminApi.getCourses(),
  })

  const deleteMut = useMutation({
    mutationFn: coachingAdminApi.deleteCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-courses'] })
      toast.success('Course deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Courses</h1>
          <p className="text-sm text-slate-500">
            {(courses ?? []).length} courses
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Course
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <CreateCourseForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {(courses ?? []).length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No courses yet</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(courses ?? []).map((c: Course) => (
          <CourseCard
            key={c.id}
            course={c}
            onDelete={(id) => deleteMut.mutate(id)}
          />
        ))}
      </div>
    </div>
  )
}