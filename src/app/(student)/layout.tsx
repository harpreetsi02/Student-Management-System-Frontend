'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import SidebarLink from '@/components/layout/SidebarLink'
import {
  LayoutDashboard, BookOpen, Bell,
  Wallet, BarChart3, Calendar,
} from 'lucide-react'

const links = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/roadmap',   label: 'Roadmap',   icon: BookOpen },
  { href: '/student/attendance',label: 'Attendance', icon: Calendar },
  { href: '/student/fees',      label: 'Fees',       icon: Wallet },
  { href: '/student/results',   label: 'Results',    icon: BarChart3 },
  { href: '/student/notices',   label: 'Notices',    icon: Bell },
]

export default function StudentLayout({
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