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
        console.log('=== LOGIN START ===', { username })
        
        // Frontend credential check
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
          console.log('=== LOGIN FAILED: Invalid credentials ===')
          return false
        }

        console.log('=== CREDENTIALS OK, fetching backend token ===')
        
        // Get JWT token from backend
        try {
          const res = await authApi.login(username, password)
          const { access, refresh } = res.data
          
          console.log('=== BACKEND TOKEN RECEIVED ===', { 
            hasAccess: !!access, 
            hasRefresh: !!refresh 
          })
          
          localStorage.setItem('access_token', access)
          localStorage.setItem('refresh_token', refresh)
          
          set({ isAuthenticated: true, token: access })
          
          console.log('=== LOGIN SUCCESS WITH BACKEND TOKEN ===', {
            isAuthenticated: true,
            willPersist: true
          })
          return true
        } catch (error) {
          console.error('=== BACKEND TOKEN ERROR ===', error)
          // Backend token olish muvaffaqiyatsiz bo'lsa ham frontend auth
          set({ isAuthenticated: true, token: null })
          console.log('=== LOGIN SUCCESS (frontend only) ===', {
            isAuthenticated: true,
            willPersist: true
          })
          return true
        }
      },

      logout: () => {
        console.log('=== LOGOUT ===')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ isAuthenticated: false, token: null })
      },
    }),
    {
      name: 'dentflow-auth',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 ZUSTAND HYDRATION:', {
          state,
          isAuthenticated: state?.isAuthenticated,
          localStorage: localStorage.getItem('dentflow-auth')
        })
        state?.setHasHydrated(true)
      },
    }
  )
)
