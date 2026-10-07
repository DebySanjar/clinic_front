import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api'

// Hardcoded admin credentials (frontend-only auth)
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'parol'

interface AuthStore {
  isAuthenticated: boolean
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,

      login: async (username: string, password: string) => {
        // Frontend credential check
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
          return false
        }

        // Get JWT token from backend
        try {
          const res = await authApi.login(username, password)
          const { access, refresh } = res.data
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          set({ isAuthenticated: true, token: access })
          return true
        } catch {
          // Backend token olish muvaffaqiyatsiz bo'lsa ham frontend auth
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
    }
  )
)
