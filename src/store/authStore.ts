import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Role } from '@/types'

interface AuthStore {
  accessToken:     string | null
  refreshToken:    string | null
  userId:          string | null
  name:            string | null
  role:            Role   | null
  coachingId:      string | null
  isAuthenticated: boolean

  setAuth: (payload: {
    accessToken:  string
    refreshToken: string
    userId:       string
    name:         string
    role:         string
    coachingId:   string | null
  }) => void

  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken:     null,
      refreshToken:    null,
      userId:          null,
      name:            null,
      role:            null,
      coachingId:      null,
      isAuthenticated: false,

      setAuth: (payload) =>
        set({
          accessToken:     payload.accessToken,
          refreshToken:    payload.refreshToken,
          userId:          payload.userId,
          name:            payload.name,
          role:            payload.role as Role,
          coachingId:      payload.coachingId,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken:     null,
          refreshToken:    null,
          userId:          null,
          name:            null,
          role:            null,
          coachingId:      null,
          isAuthenticated: false,
        }),
    }),
    { name: 'coaching-auth' }
  )
)