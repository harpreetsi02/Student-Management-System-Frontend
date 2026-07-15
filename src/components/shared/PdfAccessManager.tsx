// 'use client'

// import { useState } from 'react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { coachingAdminApi } from '@/lib/api/coachingAdmin'
// import { toast } from 'sonner'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import {
//   Dialog, DialogContent,
//   DialogHeader, DialogTitle,
// } from '@/components/ui/dialog'
// import { Users, UserCheck, UserX, Unlock, Lock } from 'lucide-react'
// import LoadingSpinner from './LoadingSpinner'

// interface Props {
//   pdf: {
//     id: string
//     title: string
//     locked: boolean
//   }
//   moduleId: string
// }

// export default function PdfAccessManager({ pdf, moduleId }: Props) {
//   const [open, setOpen] = useState(false)
//   const qc = useQueryClient()

//   // Students list
//   const { data: students = [] } = useQuery<any[]>({
//     queryKey: ['ca-students'],
//     queryFn:  () => coachingAdminApi.getStudents(),
//     enabled:  open,
//   })

//   // Batches
//   const { data: courses = [] } = useQuery<any[]>({
//     queryKey: ['ca-courses'],
//     queryFn: () => coachingAdminApi.getCourses(),
//     enabled:  open,
//   })

//   const { data: allBatches = [] } = useQuery<any[]>({
//     queryKey: ['ca-all-batches-access', courses.length],
//     queryFn: async () => {
//       const all: any[] = []
//       for (const c of courses) {
//         const b = await coachingAdminApi.getBatches((c as any).id)
//         all.push(...b)
//       }
//       return all
//     },
//     enabled: open && courses.length > 0,
//   })

//   // Who has access
//   const { data: accessList = [], isLoading: al } = useQuery<any[]>({
//     queryKey: ['pdf-access', pdf.id],
//     queryFn:  () => coachingAdminApi.getPdfAccessList(pdf.id),
//     enabled:  open,
//   })

//   const grantMut = useMutation({
//     mutationFn: (studentId: string) =>
//       coachingAdminApi.grantPdfAccess(pdf.id, studentId),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['pdf-access', pdf.id] })
//       qc.invalidateQueries({ queryKey: ['ca-pdfs', moduleId] })
//       toast.success('Access granted!')
//     },
//     onError: () => toast.error('Failed to grant access'),
//   })

//   const revokeMut = useMutation({
//     mutationFn: (studentId: string) =>
//       coachingAdminApi.revokePdfAccess(pdf.id, studentId),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['pdf-access', pdf.id] })
//       qc.invalidateQueries({ queryKey: ['ca-pdfs', moduleId] })
//       toast.success('Access revoked!')
//     },
//     onError: () => toast.error('Failed to revoke'),
//   })

//   const grantBatchMut = useMutation({
//     mutationFn: (batchId: string) =>
//       coachingAdminApi.grantPdfToBatch(pdf.id, batchId),
//     onSuccess: (data: any) => {
//       qc.invalidateQueries({ queryKey: ['pdf-access', pdf.id] })
//       qc.invalidateQueries({ queryKey: ['ca-pdfs', moduleId] })
//       toast.success(data.message)
//     },
//     onError: () => toast.error('Failed'),
//   })

//   const grantedIds = accessList.map((a: any) => a.studentId)

//   return (
//     <>
//       <Button
//         variant="ghost" size="sm"
//         className="h-6 text-xs px-2 text-purple-600 hover:bg-purple-50"
//         onClick={() => setOpen(true)}
//       >
//         <Users className="h-3 w-3 mr-1" />
//         Access
//       </Button>

//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden
//                                   flex flex-col">
//           <DialogHeader>
//             <DialogTitle className="text-base">
//               PDF Access — {pdf.title}
//             </DialogTitle>
//             <p className="text-xs text-slate-500">
//               Grant or revoke access per student
//             </p>
//           </DialogHeader>

//           <div className="flex-1 overflow-y-auto space-y-4 pr-1">

//             {/* Grant to batch */}
//             {allBatches.length > 0 && (
//               <div className="space-y-2">
//                 <p className="text-xs font-semibold text-slate-600
//                               uppercase tracking-wide">
//                   Quick — Grant to entire batch
//                 </p>
//                 <div className="space-y-1.5">
//                   {allBatches.map((b: any) => (
//                     <div key={b.id}
//                       className="flex items-center justify-between
//                                  px-3 py-2 bg-slate-50 rounded-lg">
//                       <div>
//                         <p className="text-sm font-medium text-slate-800">
//                           {b.name}
//                         </p>
//                         <p className="text-xs text-slate-500">
//                           {b.courseName}
//                         </p>
//                       </div>
//                       <Button
//                         size="sm"
//                         className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
//                         onClick={() => grantBatchMut.mutate(b.id)}
//                         disabled={grantBatchMut.isPending}
//                       >
//                         <Unlock className="h-3 w-3 mr-1" />
//                         Grant All
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Individual students */}
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <p className="text-xs font-semibold text-slate-600
//                               uppercase tracking-wide">
//                   Individual Access
//                 </p>
//                 <p className="text-xs text-slate-500">
//                   {grantedIds.length}/{students.length} students have access
//                 </p>
//               </div>

//               {al && <LoadingSpinner />}

//               <div className="space-y-1.5 max-h-64 overflow-y-auto">
//                 {students.map((s: any) => {
//                   const hasAccess = grantedIds.includes(s.id)
//                   return (
//                     <div
//                       key={s.id}
//                       className={`flex items-center justify-between
//                                   px-3 py-2.5 rounded-lg border
//                                   transition-colors
//                                   ${hasAccess
//                                     ? 'bg-green-50 border-green-200'
//                                     : 'bg-slate-50 border-slate-100'
//                                   }`}
//                     >
//                       <div className="flex items-center gap-2.5">
//                         <div className={`w-7 h-7 rounded-full flex
//                                          items-center justify-center
//                                          text-xs font-bold shrink-0
//                                          ${hasAccess
//                                            ? 'bg-green-100 text-green-700'
//                                            : 'bg-slate-200 text-slate-500'
//                                          }`}>
//                           {s.name?.charAt(0)?.toUpperCase()}
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-slate-800">
//                             {s.name}
//                           </p>
//                           <p className="text-xs font-mono text-slate-400">
//                             {s.enrollmentNumber}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-1.5">
//                         {hasAccess && (
//                           <Badge variant="default"
//                             className="text-xs bg-green-600">
//                             ✓ Access
//                           </Badge>
//                         )}
//                         {hasAccess ? (
//                           <Button
//                             size="sm" variant="ghost"
//                             className="h-7 text-xs text-red-500
//                                        hover:bg-red-50"
//                             onClick={() => revokeMut.mutate(s.id)}
//                             disabled={revokeMut.isPending}
//                           >
//                             <Lock className="h-3 w-3 mr-1" />
//                             Revoke
//                           </Button>
//                         ) : (
//                           <Button
//                             size="sm" variant="ghost"
//                             className="h-7 text-xs text-green-600
//                                        hover:bg-green-50"
//                             onClick={() => grantMut.mutate(s.id)}
//                             disabled={grantMut.isPending}
//                           >
//                             <Unlock className="h-3 w-3 mr-1" />
//                             Grant
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coachingAdminApi } from '@/lib/api/coachingAdmin'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Users, Unlock, Lock } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

interface Props {
  pdf:      { id: string; title: string }
  moduleId: string
  courseId: string   // ✅ courseId bhi pass karo
}

export default function PdfAccessManager({
  pdf, moduleId, courseId,
}: Props) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  // ✅ Sirf is course ke batches
  const { data: batches = [], isLoading: bl } = useQuery<any[]>({
    queryKey: ['ca-batches', courseId],
    queryFn:  () => coachingAdminApi.getBatches(courseId),
    enabled:  open,
  })

  // ✅ Sirf is course ke enrolled students
  // Har batch ke enrolled students nikalo
  const { data: batchStudents = [], isLoading: sl } = useQuery<any[]>({
    queryKey: ['course-enrolled-students', courseId, batches.length],
    queryFn: async () => {
      const allStudents: any[] = []
      const seenIds = new Set<string>()

      for (const batch of batches) {
        const students = await fetch(
          `/api/teacher/batches/${batch.id}/students`,
          {
            headers: {
              Authorization: `Bearer ${
                (await import('@/store/authStore'))
                  .useAuthStore.getState().accessToken
              }`,
            },
          }
        ).then((r) => r.json())

        for (const s of students) {
          if (!seenIds.has(s.studentId)) {
            seenIds.add(s.studentId)
            allStudents.push({
              ...s,
              batchName: batch.name,
              batchId:   batch.id,
            })
          }
        }
      }
      return allStudents
    },
    enabled: open && batches.length > 0,
  })

  // Who has access
  const { data: accessList = [], isLoading: al } = useQuery<any[]>({
    queryKey: ['pdf-access', pdf.id],
    queryFn:  () => coachingAdminApi.getPdfAccessList(pdf.id),
    enabled:  open,
  })

  const grantMut = useMutation({
    mutationFn: (studentId: string) =>
      coachingAdminApi.grantPdfAccess(pdf.id, studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdf-access', pdf.id] })
      toast.success('Access granted!')
    },
  })

  const revokeMut = useMutation({
    mutationFn: (studentId: string) =>
      coachingAdminApi.revokePdfAccess(pdf.id, studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pdf-access', pdf.id] })
      toast.success('Access revoked!')
    },
  })

  const grantBatchMut = useMutation({
    mutationFn: (batchId: string) =>
      coachingAdminApi.grantPdfToBatch(pdf.id, batchId),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['pdf-access', pdf.id] })
      toast.success(data.message)
    },
  })

  const grantedIds = new Set(accessList.map((a: any) => a.studentId))
  const isLoading  = bl || sl || al

  // Batch wise group karo students
  const batchGroups = batches.map((b: any) => ({
    batch:    b,
    students: batchStudents.filter((s) => s.batchId === b.id),
  }))

  return (
    <>
      <Button
        variant="ghost" size="sm"
        className="h-6 text-xs px-2 text-purple-600 hover:bg-purple-50"
        onClick={() => setOpen(true)}
      >
        <Users className="h-3 w-3 mr-1" />
        Access
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col
                                  overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base">
              PDF Access — {pdf.title}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {grantedIds.size}/{batchStudents.length} students have access
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2">
            {isLoading && <LoadingSpinner />}

            {!isLoading && batches.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                No batches in this course
              </p>
            )}

            {/* Batch wise sections */}
            {!isLoading && batchGroups.map(({ batch, students }) => (
              <div key={batch.id} className="space-y-2">

                {/* Batch header with Grant All */}
                <div className="flex items-center justify-between
                                px-3 py-2 bg-slate-100 rounded-lg">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      {batch.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {students.length} students •{' '}
                      {batch.startTime
                        ? `${batch.startTime} — ${batch.endTime}`
                        : 'Time not set'
                      }
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                    onClick={() => grantBatchMut.mutate(batch.id)}
                    disabled={grantBatchMut.isPending}
                  >
                    <Unlock className="h-3 w-3 mr-1" />
                    Grant All
                  </Button>
                </div>

                {/* Students in this batch */}
                <div className="space-y-1 pl-2">
                  {students.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">
                      No students enrolled
                    </p>
                  )}
                  {students.map((s: any) => {
                    const hasAccess = grantedIds.has(s.studentId)
                    return (
                      <div
                        key={s.studentId}
                        className={`flex items-center justify-between
                                    px-3 py-2 rounded-lg border
                                    transition-colors
                                    ${hasAccess
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-white border-slate-100'
                                    }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex
                                           items-center justify-center
                                           text-xs font-bold shrink-0
                                           ${hasAccess
                                             ? 'bg-green-100 text-green-700'
                                             : 'bg-slate-100 text-slate-500'
                                           }`}>
                            {s.studentName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800
                                          truncate">
                              {s.studentName}
                            </p>
                            <p className="text-xs font-mono text-slate-400">
                              {s.enrollmentNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {hasAccess && (
                            <Badge
                              className="text-xs bg-green-600 text-white">
                              ✓
                            </Badge>
                          )}
                          {hasAccess ? (
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 text-xs text-red-500
                                         hover:bg-red-50"
                              onClick={() => revokeMut.mutate(s.studentId)}
                              disabled={revokeMut.isPending}
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              Revoke
                            </Button>
                          ) : (
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 text-xs text-green-600
                                         hover:bg-green-50"
                              onClick={() => grantMut.mutate(s.studentId)}
                              disabled={grantMut.isPending}
                            >
                              <Unlock className="h-3 w-3 mr-1" />
                              Grant
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}