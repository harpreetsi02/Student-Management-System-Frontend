'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'

const SCOPE_VARIANT: Record<string,
  'default' | 'secondary' | 'outline'> = {
  GENERAL: 'default',
  COURSE:  'secondary',
  BATCH:   'outline',
}

export default function StudentNoticesPage() {

  const { data: notices = [], isLoading } = useQuery<any[]>({
    queryKey: ['student-notices'],
    queryFn:  async () => {
      const res = await api.get('/student/notices')
      return res.data
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Notices</h1>
        <p className="text-sm text-slate-500">
          {notices.length} notices
        </p>
      </div>

      {notices.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Bell className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No notices yet</p>
        </div>
      )}

      <div className="space-y-3">
        {(notices as any[]).map((n) => (
          <Card key={n.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-orange-50 p-2 rounded-lg shrink-0">
                  <Bell className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-slate-800 text-sm">
                      {n.title}
                    </p>
                    <Badge
                      variant={SCOPE_VARIANT[n.scope] ?? 'default'}
                      className="text-xs"
                    >
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}