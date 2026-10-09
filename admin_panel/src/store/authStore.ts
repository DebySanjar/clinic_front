import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api'

// Hardcoded admin credentials (frontend-only auth)
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'parol'

interface AuthStore {
  isAuthenticated: boolean
  token: string | null
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      login: async (username: string, password: string) => {
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
          return false
        }
        try {
          const res = await authApi.login(username, password)
          const { access, refresh } = res.data
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          set({ isAuthenticated: true, token: access })
          return true
        } catch {
          set({ isAuthenticated: true, token: null })
          return true
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ isAuthenticated: false, token: null })
      },
    }),
    {
      name: 'dentflow-auth',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
