'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Trophy } from 'lucide-react'

export default function StudentResultsPage() {

  const { data: results = [], isLoading } = useQuery<any[]>({
    queryKey: ['student-results'],
    queryFn:  async () => {
      const res = await api.get('/student/results')
      return res.data
    },
  })

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'A+', color: 'text-green-600' }
    if (pct >= 75) return { label: 'A',  color: 'text-green-500' }
    if (pct >= 60) return { label: 'B',  color: 'text-blue-500' }
    if (pct >= 45) return { label: 'C',  color: 'text-orange-500' }
    return { label: 'F', color: 'text-red-500' }
  }

  if (isLoading) return <LoadingSpinner />

  const avg = results.length > 0
    ? Math.round(
        results.reduce((s, r) => s + r.percentage, 0) / results.length
      )
    : 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Results</h1>
        <p className="text-sm text-slate-500">Your test performance</p>
      </div>

      {results.length > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-yellow-50 p-3 rounded-xl">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Average Score</p>
              <p className="text-2xl font-bold text-slate-800">{avg}%</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-500">Tests Taken</p>
              <p className="text-2xl font-bold text-slate-800">
                {results.length}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <BarChart3 className="h-10 w-10 mx-auto mb-2 text-slate-300" />
          <p>No results yet</p>
        </div>
      )}

      <div className="space-y-3">
        {(results as any[]).map((r, idx) => {
          const grade = getGrade(r.percentage)
          return (
            <Card key={idx}>
              <CardContent className="p-4 flex items-center
                                      justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {r.testName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.courseName} • {r.testDate}
                  </p>
                  {r.remarks && (
                    <p className="text-xs text-slate-400 mt-0.5 italic">
                      "{r.remarks}"
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-2xl font-bold ${grade.color}`}>
                    {grade.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.obtainedMarks}/{r.totalMarks}
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    {r.percentage}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}