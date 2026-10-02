import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/doctors':      'Shifokorlar',
  '/services':     'Xizmatlar va narxlar',
  '/appointments': 'Qabullar jadvali',
  '/patients':     'Bemorlar',
  '/stats':        'Statistika',
  '/settings':     'Sozlamalar',
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const title = PAGE_TITLES[location.pathname] ?? 'DentFlow'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="text-lg font-semibold text-gray-900 flex-1">{title}</h1>

      {/* Today date */}
      <span className="text-sm text-gray-400 hidden sm:block">
        {new Date().toLocaleDateString('uz-UZ', {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
      </span>

      {/* Logout */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-gray-500 gap-1.5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Chiqish
      </Button>
    </header>
  )
}
