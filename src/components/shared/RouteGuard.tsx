'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Role } from '@/types'

const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN:    '/super-admin/dashboard',
  COACHING_ADMIN: '/coaching-admin/dashboard',
  TEACHER:        '/teacher/dashboard',
  STUDENT:        '/student/dashboard',
}

const PROTECTED = [
  '/super-admin',
  '/coaching-admin',
  '/teacher',
  '/student',
]

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router          = useRouter()
  const pathname        = usePathname()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role            = useAuthStore((s) => s.role)

  // Hydration ke liye wait karo — localStorage load hone do
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return  // hydrate hone se pehle kuch mat karo

    const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
    const isAuthPage  = pathname === '/login'

    // Login page + logged in → dashboard
    if (isAuthPage && isAuthenticated && role) {
      router.replace(ROLE_HOME[role])
      return
    }

    // Protected + not logged in → login
    if (isProtected && !isAuthenticated) {
      router.replace('/login')
      return
    }

  }, [hydrated, pathname, isAuthenticated, role])

  // Hydrate hone se pehle — kuch mat dikhao (blank screen better than flash)
  if (!hydrated) return null

  return <>{children}</>
}