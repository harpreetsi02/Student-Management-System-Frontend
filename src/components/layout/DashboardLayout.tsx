'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GraduationCap, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  children: React.ReactNode
  sidebar:  React.ReactNode
}

export default function DashboardLayout({ children, sidebar }: Props) {
  const { name, role, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.replace('/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200
                        flex flex-col shrink-0 fixed h-full z-10">

        {/* Logo */}
        <div className="px-4 py-3.5 border-b border-slate-100
                        flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-sm truncate">
            CoachingPro
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {sidebar}
        </nav>

        {/* User + Logout */}
        <div className="px-2 py-3 border-t border-slate-100 space-y-1">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="bg-slate-100 rounded-full p-1.5 shrink-0">
              <User className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">
                {name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {role?.replace('_', ' ')}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-xs text-slate-500
                       hover:text-red-600 hover:bg-red-50 h-8"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56 min-h-screen overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}