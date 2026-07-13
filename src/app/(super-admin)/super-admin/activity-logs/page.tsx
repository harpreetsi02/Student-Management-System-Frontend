'use client'

import { useQuery } from '@tanstack/react-query'
import { superAdminApi } from '@/lib/api/superAdmin'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card } from '@/components/ui/card'
import { ActivityLog } from '@/types'

const EVENT_COLORS: Record<string, string> = {
  STUDENT_CREATED:  'bg-green-100 text-green-700',
  TEACHER_CREATED:  'bg-blue-100 text-blue-700',
  COURSE_CREATED:   'bg-purple-100 text-purple-700',
  COACHING_CREATED: 'bg-orange-100 text-orange-700',
  PDF_UPLOADED:     'bg-pink-100 text-pink-700',
}

export default function ActivityLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['sa-logs'],
    queryFn:  superAdminApi.getAllLogs,
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          Activity Logs
        </h1>
        <p className="text-sm text-slate-500">
          Platform-wide activity
        </p>
      </div>

      <Card>
        {logs?.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">
            No activity yet
          </p>
        )}
        <div className="divide-y divide-slate-100">
          {logs?.map((log: ActivityLog) => (
            <div key={log.id}
              className="flex items-start gap-3 px-4 py-3
                         hover:bg-slate-50">
              <span className={`text-xs px-2 py-0.5 rounded-full
                font-medium shrink-0 mt-0.5
                ${EVENT_COLORS[log.eventType]
                  ?? 'bg-slate-100 text-slate-600'}`}>
                {log.eventType.replace(/_/g, ' ')}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">
                  {log.description}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  by {log.actorName}
                </p>
              </div>
              <p className="text-xs text-slate-400 shrink-0">
                {new Date(log.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}