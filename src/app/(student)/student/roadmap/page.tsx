'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2, Lock, BookOpen,
  Circle, FileText, ChevronDown,
  ChevronUp, Eye,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Status config ───────────────────────────────────────
const STATUS_CONFIG = {
  completed: {
    icon:  CheckCircle2,
    color: 'text-green-600',
    bg:    'bg-green-50',
    border:'border-green-200',
    badge: 'default' as const,
    label: 'Completed',
  },
  current: {
    icon:  Circle,
    color: 'text-blue-600',
    bg:    'bg-blue-50',
    border:'border-blue-200',
    badge: 'default' as const,
    label: 'Current',
  },
  locked: {
    icon:  Lock,
    color: 'text-slate-400',
    bg:    'bg-slate-50',
    border:'border-slate-200',
    badge: 'secondary' as const,
    label: 'Locked',
  },
  upcoming: {
    icon:  BookOpen,
    color: 'text-orange-500',
    bg:    'bg-orange-50',
    border:'border-orange-200',
    badge: 'outline' as const,
    label: 'Upcoming',
  },
}

// ── PDF Viewer Modal ────────────────────────────────────
function PdfViewerModal({
  pdfId,
  title,
  onClose,
}: {
  pdfId:   string
  title:   string
  onClose: () => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['pdf-url', pdfId],
    queryFn:  async () => {
      const res = await api.get(`/pdfs/student/${pdfId}/view`)
      return res.data
    },
  })

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex
                 items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-4xl
                   max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between
                        px-5 py-3.5 border-b border-slate-100">
          <p className="font-semibold text-slate-800 text-sm">
            {title}
          </p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && <LoadingSpinner />}
          {data?.viewUrl && (
            <iframe
              src={`${data.viewUrl}#toolbar=0&navpanes=0`}
              className="w-full h-[70vh] rounded-lg border
                         border-slate-200"
              title={title}
              // Security: disable download/print
              onContextMenu={(e) => e.preventDefault()}
            />
          )}
          {!isLoading && !data?.viewUrl && (
            <p className="text-center text-slate-500 py-10">
              Unable to load PDF
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Module Card ─────────────────────────────────────────
function ModuleCard({ module }: { module: any }) {
  const [expanded, setExpanded]     = useState(false)
  const [viewingPdf, setViewingPdf] = useState<{
    id: string; title: string
  } | null>(null)

  const config = STATUS_CONFIG[
    module.status as keyof typeof STATUS_CONFIG
  ] ?? STATUS_CONFIG.upcoming

  const Icon = config.icon
  const isLocked = module.status === 'locked'

  return (
    <>
      <div className={`border rounded-xl transition-all
                       ${config.border}
                       ${isLocked ? 'opacity-60' : ''}`}>

        {/* Module Header */}
        <div
          className={`flex items-center gap-3 p-4 rounded-xl
                      ${!isLocked ? 'cursor-pointer' : ''}
                      ${config.bg}`}
          onClick={() => !isLocked && setExpanded(!expanded)}
        >
          {/* Order Index */}
          <div className={`w-8 h-8 rounded-full flex items-center
                           justify-center text-xs font-bold shrink-0
                           ${config.bg} border ${config.border}`}>
            <span className={config.color}>
              {module.orderIndex + 1}
            </span>
          </div>

          {/* Icon */}
          <Icon className={`h-5 w-5 shrink-0 ${config.color}`} />

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 text-sm truncate">
              {module.name}
            </p>
            {module.description && (
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {module.description}
              </p>
            )}
          </div>

          {/* Badge + Expand */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={config.badge} className="text-xs">
              {config.label}
            </Badge>
            {!isLocked && module.pdfs?.length > 0 && (
              expanded
                ? <ChevronUp className="h-4 w-4 text-slate-400" />
                : <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
            {isLocked && (
              <Lock className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* PDFs List */}
        {!isLocked && expanded && (
          <div className="px-4 pb-4 space-y-2">
            {module.pdfs?.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">
                No PDFs in this module
              </p>
            )}
            {module.pdfs?.map((pdf: any) => (
              <div
                key={pdf.id}
                className="flex items-center justify-between
                           bg-white border border-slate-100
                           rounded-lg px-3 py-2.5 hover:border-blue-200
                           transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-slate-700 truncate">
                    {pdf.title}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-600 hover:bg-blue-50
                             h-7 text-xs shrink-0"
                  onClick={() =>
                    setViewingPdf({ id: pdf.id, title: pdf.title })
                  }
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <PdfViewerModal
          pdfId={viewingPdf.id}
          title={viewingPdf.title}
          onClose={() => setViewingPdf(null)}
        />
      )}
    </>
  )
}

// ── Main Page ───────────────────────────────────────────
export default function RoadmapPage() {

  // Student dashboard se courses nikalo
  const { data: dashboard, isLoading: dl } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn:  async () => {
      const res = await api.get('/student/dashboard')
      return res.data
    },
  })

  const courses: any[] = dashboard?.courses ?? []
  const [selectedCourse, setSelectedCourse] = useState<string>('')

  // Selected course ka roadmap
  const { data: roadmap = [], isLoading: rl } = useQuery<any[]>({
    queryKey: ['student-roadmap', selectedCourse],
    queryFn:  async () => {
      const res = await api.get(`/student/roadmap/${selectedCourse}`)
      return res.data
    },
    enabled: !!selectedCourse,
  })

  if (dl) return <LoadingSpinner />

  // Progress calculate karo
  const completedCount = roadmap.filter(
    (m) => m.status === 'completed'
  ).length
  const totalCount     = roadmap.length
  const progressPct    = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl font-bold text-slate-800">Roadmap</h1>
        <p className="text-sm text-slate-500">
          Your learning journey
        </p>
      </div>

      {/* Course Select */}
      {courses.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {courses.map((c: any) => (
            <button
              key={c.courseId}
              onClick={() => setSelectedCourse(c.courseId)}
              className={`px-4 py-2 rounded-full text-sm font-medium
                         transition-colors border
                         ${selectedCourse === c.courseId
                           ? 'bg-blue-600 text-white border-blue-600'
                           : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                         }`}
            >
              {c.courseName}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No courses enrolled yet</p>
        </div>
      )}

      {/* Progress Bar */}
      {selectedCourse && totalCount > 0 && (
        <div className="bg-white border border-slate-200
                        rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              Progress
            </p>
            <p className="text-sm font-bold text-blue-600">
              {completedCount}/{totalCount} modules
            </p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all
                         duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-right">
            {progressPct}% complete
          </p>
        </div>
      )}

      {/* Loading */}
      {rl && <LoadingSpinner />}

      {/* Legend */}
      {selectedCourse && !rl && roadmap.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <div key={key}
                className="flex items-center gap-1.5 text-xs
                           text-slate-500">
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                {cfg.label}
              </div>
            )
          })}
        </div>
      )}

      {/* Modules */}
      {selectedCourse && !rl && (
        <div className="space-y-3">
          {roadmap.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <BookOpen className="h-8 w-8 mx-auto mb-2
                                   text-slate-300" />
              <p className="text-sm">No modules in this course yet</p>
            </div>
          )}
          {roadmap.map((module: any) => (
            <ModuleCard key={module.moduleId} module={module} />
          ))}
        </div>
      )}

      {/* No course selected */}
      {!selectedCourse && courses.length > 0 && (
        <div className="text-center py-10 text-slate-400">
          <BookOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">Select a course to view roadmap</p>
        </div>
      )}
    </div>
  )
}