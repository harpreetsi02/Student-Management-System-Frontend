import SidebarLink from './SidebarLink'
import {
  LayoutDashboard,
  Building2,
  Activity,
} from 'lucide-react'

const links = [
  {
    href:  '/super-admin/dashboard',
    label: 'Dashboard',
    icon:  LayoutDashboard,
  },
  {
    href:  '/super-admin/coachings',
    label: 'Coachings',
    icon:  Building2,
  },
  {
    href:  '/super-admin/activity-logs',
    label: 'Activity Logs',
    icon:  Activity,
  },
]

export default function SuperAdminSidebar() {
  return (
    <>
      {links.map((l) => (
        <SidebarLink key={l.href} {...l} />
      ))}
    </>
  )
}