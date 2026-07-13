'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import CoachingAdminSidebar from '@/components/layout/CoachingAdminSidebar'

export default function CoachingAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout sidebar={<CoachingAdminSidebar />}>
      {children}
    </DashboardLayout>
  )
}