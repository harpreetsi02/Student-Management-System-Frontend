'use client'

import SidebarLink from './SidebarLink'
import {
  LayoutDashboard, GraduationCap, Users,
  BookOpen, Calendar, Wallet,
  BarChart3, Bell, Settings,
  Table, Clock, UserCheck, UsersRound
} from 'lucide-react'

const links = [
  { href: '/coaching-admin/dashboard',         label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/coaching-admin/students',          label: 'Students',       icon: GraduationCap },
  { href: '/coaching-admin/students/enroll',   label: 'Enroll Student', icon: UserCheck },
  { href: '/coaching-admin/teachers',          label: 'Teachers',       icon: Users },
  { href: '/coaching-admin/courses',           label: 'Courses',        icon: BookOpen },
  { href: '/coaching-admin/batches',           label: 'Batches',        icon: Clock },
  { href: '/coaching-admin/batches/students',  label: 'Batch Students', icon: UsersRound },
  { href: '/coaching-admin/attendance',        label: 'Mark Attendance',icon: Calendar },
  { href: '/coaching-admin/attendance/sheet',  label: 'Attend. Sheet',  icon: Table },
  { href: '/coaching-admin/fees',              label: 'Fees',           icon: Wallet },
  { href: '/coaching-admin/results',           label: 'Results',        icon: BarChart3 },
  { href: '/coaching-admin/notices',           label: 'Notices',        icon: Bell },
  { href: '/coaching-admin/settings',          label: 'Settings',       icon: Settings },
]

export default function CoachingAdminSidebar() {
  return (
    <>
      {links.map((l) => (
        <SidebarLink key={l.href} {...l} />
      ))}
    </>
  )
}