'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import SidebarLink from '@/components/layout/SidebarLink'
import { LayoutDashboard, Bell, BarChart3, Calendar, BookOpen, Map } from 'lucide-react'

const links = [
  { href: '/teacher/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/teacher/courses',     label: 'Courses',     icon: BookOpen },
  { href: '/teacher/roadmap',     label: 'Roadmap',     icon: Map },
  { href: '/teacher/attendance',  label: 'Attendance',  icon: Calendar },
  { href: '/teacher/results',     label: 'Results',     icon: BarChart3 },
  { href: '/teacher/notices',     label: 'Notices',     icon: Bell },
]

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout
      sidebar={
        <>
          {links.map((l) => (
            <SidebarLink key={l.href} {...l} />
          ))}
        </>
      }
    >
      {children}
    </DashboardLayout>
  )
}