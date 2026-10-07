import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api'

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
        try {
          const res = await authApi.login(username, password)
          const { access, refresh } = res.data
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          set({ isAuthenticated: true, token: access })
          return true
        } catch {
          return false
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
      // token ham saqlansin — refresh bo'lganda ishlaydi
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
)
