'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  BookOpen, Plus, Trash2,
  ChevronDown, ChevronUp,
  FileText, Lock, Unlock,
} from 'lucide-react'
import PdfAccessManager from '@/components/shared/PdfAccessManager'

// Teacher ka assigned courses page
export default function TeacherCoursesPage() {
  const { data: dashboard, isLoading: dl } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn:  async () => {
      const res = await api.get('/teacher/dashboard')
      return res.data
    },
  })

  const batches: any[] = dashboard?.assignedBatches ?? []

  // Unique courses from batches
  const courses = batches.reduce((acc: any[], b: any) => {
    if (!acc.find((c) => c.courseId === b.courseId)) {
      acc.push({ courseId: b.courseId, courseName: b.course })
    }
    return acc
  }, [])

  if (dl) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          My Courses
        </h1>
        <p className="text-sm text-slate-500">
          Manage modules and PDFs for your courses
        </p>
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No courses assigned yet</p>
        </div>
      )}

      <div className="space-y-4">
        {courses.map((c: any) => (
          <TeacherCourseCard
            key={c.courseId}
            courseId={c.courseId}
            courseName={c.courseName}
          />
        ))}
      </div>
    </div>
  )
}

// Course card with modules + PDFs
function TeacherCourseCard({ courseId, courseName }: {
  courseId: string
  courseName: string
}) {
  const qc             = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [newModule, setNewModule] = useState('')

  const { data: modules = [] } = useQuery<any[]>({
    queryKey: ['ca-modules', courseId],
    queryFn:  () => coachingAdminApi.getModules(courseId),
    enabled:  expanded,
  })

  const addModuleMut = useMutation({
    mutationFn: () =>
      coachingAdminApi.createModule(courseId, {
        name:       newModule.trim(),
        unlockType: 'MANUAL',
        locked:     false,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-modules', courseId] })
      toast.success('Module added!')
      setNewModule('')
    },
    onError: () => toast.error('Failed to add module'),
  })

  const deleteModuleMut = useMutation({
    mutationFn: (moduleId: string) =>
      coachingAdminApi.deleteModule(courseId, moduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-modules', courseId] })
      toast.success('Module deleted')
    },
  })

  return (
    <Card>
      <div
        className="px-4 py-3 flex items-center justify-between
                   cursor-pointer hover:bg-slate-50 rounded-t-lg"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <BookOpen className="h-4 w-4 text-green-600" />
          </div>
          <p className="font-semibold text-slate-800 text-sm">
            {courseName}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-slate-400" />
          : <ChevronDown className="h-4 w-4 text-slate-400" />
        }
      </div>

      {expanded && (
        <CardContent className="p-4 space-y-4 border-t border-slate-100">

          {/* Add module */}
          <div className="flex gap-2">
            <Input
              placeholder="New module name..."
              value={newModule}
              onChange={(e) => setNewModule(e.target.value)}
              className="text-sm h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newModule.trim())
                  addModuleMut.mutate()
              }}
            />
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-8 shrink-0"
              onClick={() => newModule.trim() && addModuleMut.mutate()}
              disabled={addModuleMut.isPending || !newModule.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Module list */}
          <div className="space-y-2">
            {modules.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">
                No modules yet
              </p>
            )}
            {modules.map((m: any, idx: number) => (
              <TeacherModuleRow
                key={m.id}
                module={m}
                index={idx}
                courseId={courseId}
                onDelete={() => deleteModuleMut.mutate(m.id)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Module row with PDF management
function TeacherModuleRow({ module, index, courseId, onDelete }: {
  module: any
  index: number
  courseId: string
  onDelete: () => void
}) {
  const qc               = useQueryClient()
  const [showPdfs, setShowPdfs] = useState(false)
  const [pdfTitle, setPdfTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef          = useRef<HTMLInputElement>(null)

  const { data: pdfs = [] } = useQuery<any[]>({
    queryKey: ['ca-pdfs', module.id],
    queryFn:  () => coachingAdminApi.getPdfs(module.id),
    enabled:  showPdfs,
  })

  const deletePdfMut = useMutation({
    mutationFn: coachingAdminApi.deletePdf,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ca-pdfs', module.id] })
      toast.success('PDF deleted')
    },
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !pdfTitle.trim()) {
      toast.error('Add a title first')
      return
    }
    setUploading(true)
    try {
      await coachingAdminApi.uploadPdf(module.id, pdfTitle, file)
      qc.invalidateQueries({ queryKey: ['ca-pdfs', module.id] })
      toast.success('PDF uploaded!')
      setPdfTitle('')
      if (fileRef.current) fileRef.current.value = ''
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">

      {/* Module header */}
      <div className="flex items-center justify-between
                      px-3 py-2.5 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono w-5">
            {index + 1}.
          </span>
          <span className="text-sm text-slate-700 font-medium">
            {module.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            className="h-6 text-xs px-2 text-blue-600"
            onClick={() => setShowPdfs(!showPdfs)}
          >
            {showPdfs ? 'Hide' : 'PDFs'}
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-6 w-6 p-0 text-slate-300 hover:text-red-500"
            onClick={() => {
              if (confirm(`Delete "${module.name}"?`)) onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* PDF section */}
      {showPdfs && (
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
                size="sm" variant="outline"
                className="text-xs h-8 flex-1"
                disabled={uploading || !pdfTitle.trim()}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? 'Uploading...' : '📎 Upload PDF'}
              </Button>
            </div>
          </div>

          {/* PDF list */}
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
                  <FileText className="h-3.5 w-3.5 text-red-400
                                       shrink-0" />
                  <p className="text-xs text-slate-700 truncate">
                    {pdf.title}
                  </p>
                </div>
                <PdfAccessManager pdf={pdf} moduleId={module.id} courseId={courseId} />
                <Button
                  variant="ghost" size="sm"
                  className="h-6 w-6 p-0 text-slate-300
                             hover:text-red-500"
                  onClick={() => {
                    if (confirm('Delete PDF?'))
                      deletePdfMut.mutate(pdf.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}