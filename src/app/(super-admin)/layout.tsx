'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import SuperAdminSidebar from '@/components/layout/SuperAdminSidebar'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout sidebar={<SuperAdminSidebar />}>
      {children}
    </DashboardLayout>
  )
}