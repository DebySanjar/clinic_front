import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/doctors':            'Shifokorlar',
  '/services':           'Xizmatlar va narxlar',
  '/appointments':       'Qabullar jadvali',
  '/patients':           'Bemorlar',
  '/stats':              'Statistika',
  '/settings':           'Sozlamalar',
  '/surveys/list':       "So'rovnomalar",
  '/surveys/applicants': 'Arizachilar',
}

export default function Header() {
  const [logoutOpen, setLogoutOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const title = PAGE_TITLES[location.pathname] ?? 'DentFlow'

  const handleLogoutConfirm = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Logout Dialog */}
      {logoutOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            style={{ animation: 'fadeIn 0.15s ease' }}
            onClick={() => setLogoutOpen(false)}
          />
          <div
            className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4"
            style={{ animation: 'dialogPop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-6 h-6 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-center text-base font-bold text-gray-900 mb-1">
              Chiqishni tasdiqlaysizmi?
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              Tizimdan chiqib ketasiz. Qayta kirish uchun parol kerak bo'ladi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLogoutOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold
                           text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold
                           text-white transition-colors shadow-md shadow-red-500/30"
              >
                Chiqish
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
            @keyframes dialogPop {
              from { opacity:0; transform: scale(0.85) translateY(10px) }
              to   { opacity:1; transform: scale(1) translateY(0) }
            }
          `}</style>
        </div>
      )}

      <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
        <h1 className="text-lg font-semibold text-gray-900 flex-1">{title}</h1>

        {/* Today date */}
        <span className="text-sm text-gray-400 hidden sm:block">
          {new Date().toLocaleDateString('uz-UZ', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </span>

        {/* Logout button */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                     text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Chiqish
        </button>
      </header>
    </>
  )
}
