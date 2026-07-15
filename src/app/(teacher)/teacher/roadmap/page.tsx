'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen, ChevronDown, ChevronUp,
  Eye, FileText, Lock, Unlock,
} from 'lucide-react'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import PdfAccessManager from '@/components/shared/PdfAccessManager'
import { Button } from '@/components/ui/button'

function ModuleRow({ module, courseId }: {
  module:   any
  courseId: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [viewingPdf, setViewingPdf] = useState<{
    id: string; title: string
  } | null>(null)

  const { data: pdfs = [], isLoading } = useQuery<any[]>({
    queryKey: ['ca-pdfs', module.id],
    queryFn:  () => coachingAdminApi.getPdfs(module.id),
    enabled:  expanded,
  })

  return (
    <>
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3
                     bg-slate-50 cursor-pointer hover:bg-slate-100"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white
                            flex items-center justify-center text-xs
                            font-bold shrink-0">
              {module.orderIndex + 1}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">
                {module.name}
              </p>
              {module.description && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {module.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={module.locked ? 'secondary' : 'default'}
              className="text-xs">
              {module.locked ? '🔒 Locked' : '🔓 Open'}
            </Badge>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-slate-400" />
              : <ChevronDown className="h-4 w-4 text-slate-400" />
            }
          </div>
        </div>

        {/* PDFs */}
        {expanded && (
          <div className="p-3 bg-white space-y-2 border-t border-slate-100">
            {isLoading && <LoadingSpinner />}

            {!isLoading && pdfs.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">
                No PDFs in this module
              </p>
            )}

            {pdfs.map((pdf: any) => (
              <div key={pdf.id}
                className="flex items-center justify-between
                           px-3 py-2 bg-slate-50 rounded-lg
                           border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-sm text-slate-700 truncate">
                    {pdf.title}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* ✅ Teacher bhi access manage kar sakta hai */}
                  <PdfAccessManager
                    pdf={pdf}
                    moduleId={module.id}
                    courseId={courseId}
                  />

                  {/* View PDF */}
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 text-xs text-blue-600 hover:bg-blue-50"
                    onClick={() =>
                      setViewingPdf({ id: pdf.id, title: pdf.title })
                    }
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer */}
      {viewingPdf && (
        <PdfViewer
          pdfId={viewingPdf.id}
          title={viewingPdf.title}
          onClose={() => setViewingPdf(null)}
        />
      )}
    </>
  )
}

function CourseRoadmap({ courseId, courseName }: {
  courseId: string
  courseName: string
}) {
  const [open, setOpen] = useState(false)

  const { data: modules = [], isLoading } = useQuery<any[]>({
    queryKey: ['ca-modules', courseId],
    queryFn:  () => coachingAdminApi.getModules(courseId),
    enabled:  open,
  })

  return (
    <Card>
      <div
        className="px-4 py-3 flex items-center justify-between
                   cursor-pointer hover:bg-slate-50 transition-colors
                   rounded-lg"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {courseName}
            </p>
            <p className="text-xs text-slate-500">
              {open ? `${modules.length} modules` : 'Click to view roadmap'}
            </p>
          </div>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-slate-400" />
          : <ChevronDown className="h-4 w-4 text-slate-400" />
        }
      </div>

      {open && (
        <CardContent className="px-4 pb-4 space-y-2 border-t
                                border-slate-100 pt-3">
          {isLoading && <LoadingSpinner />}
          {!isLoading && modules.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              No modules yet
            </p>
          )}
          {modules.map((m: any) => (
            <ModuleRow key={m.id} module={m} courseId={courseId} />
          ))}
        </CardContent>
      )}
    </Card>
  )
}

export default function TeacherRoadmapPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const res = await api.get('/teacher/dashboard')
      return res.data
    },
  })

  const batches: any[] = dashboard?.assignedBatches ?? []

  // Unique courses
  const courses = batches.reduce((acc: any[], b: any) => {
    if (!acc.find((c) => c.courseId === b.courseId)) {
      acc.push({ courseId: b.courseId, courseName: b.course })
    }
    return acc
  }, [])

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Roadmap</h1>
        <p className="text-sm text-slate-500">
          Course modules and learning path
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
          <CourseRoadmap
            key={c.courseId}
            courseId={c.courseId}
            courseName={c.courseName}
          />
        ))}
      </div>
    </div>
  )
}

function PdfViewer({ pdfId, title, onClose }: {
  pdfId:   string
  title:   string
  onClose: () => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-pdf-url', pdfId],
    queryFn: async () => {
      const res = await api.get(`/pdfs/${pdfId}/view`)
      return res.data
    },
  })

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex
                 items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl
                   max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between
                        px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-red-500" />
            <p className="font-semibold text-slate-800 text-sm">
              {title}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}
            className="h-7 w-7 p-0">✕</Button>
        </div>
        <div className="flex-1 p-4">
          {isLoading && <LoadingSpinner />}
          {data?.viewUrl && (
            <iframe
              src={`${data.viewUrl}#toolbar=0`}
              className="w-full h-[75vh] rounded-lg border
                         border-slate-200"
              title={title}
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
        </div>
      </div>
    </div>
  )
}