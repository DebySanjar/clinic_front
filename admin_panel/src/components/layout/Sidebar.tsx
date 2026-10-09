import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/utils'
import { useAuthStore } from '@/store/authStore'

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    path: '/appointments',
    label: 'Qabullar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    path: '/doctors',
    label: 'Shifokorlar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    path: '/patients',
    label: 'Bemorlar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    path: '/services',
    label: 'Xizmatlar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" />
      </svg>
    ),
  },
  {
    path: '/stats',
    label: 'Statistika',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'Sozlamalar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50
                      pointer-events-none opacity-0 group-hover/tip:opacity-100
                      transition-opacity duration-150">
        <div className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
        </div>
      </div>
    </div>
  )
}

// ─── Logout Dialog ────────────────────────────────────────────────────────────

function LogoutDialog({ open, onConfirm, onCancel }: {
  open: boolean; onConfirm: () => void; onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4"
        style={{ animation: 'dialogPop 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <h3 className="text-center text-base font-bold text-gray-900 mb-1">Chiqishni tasdiqlaysizmi?</h3>
        <p className="text-center text-sm text-gray-500 mb-6">Tizimdan chiqib ketasiz. Qayta kirish uchun parol kerak bo'ladi.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Bekor qilish
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors shadow-md shadow-red-500/30">
            Chiqish
          </button>
        </div>
      </div>
      <style>{`@keyframes dialogPop { from{opacity:0;transform:scale(0.85) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const handleLogoutConfirm = () => { logout(); navigate('/login') }

  return (
    <>
      <LogoutDialog open={logoutOpen} onConfirm={handleLogoutConfirm} onCancel={() => setLogoutOpen(false)} />

      <aside className={cn(
        'flex-shrink-0 flex flex-col h-screen bg-[#0f1535] shadow-2xl',
        'transition-[width] duration-300 ease-in-out',
        expanded ? 'w-60' : 'w-[68px]'
      )}>

        {/* Logo */}
        <div className="h-16 flex items-center border-b border-white/10 flex-shrink-0 px-3 gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl
                          flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-900/50">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
              <path d="M12 2C9.24 2 7 4.24 7 7c0 1.5.4 2.8.9 4l.8 3.2c.3 1 .6 2.4 1.6 2.4s1.2-1.2 1.6-2.4l.8-2.4c.2-.4.3-.8.8-.8s.6.4.8.8l.8 2.4c.4 1.2.6 2.4 1.6 2.4s1.3-1.4 1.6-2.4l.8-3.2c.5-1.2.9-2.5.9-4 0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
          <div className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap',
            expanded ? 'opacity-100 w-36' : 'opacity-0 w-0'
          )}>
            <p className="text-white font-bold text-base leading-tight">DentFlow</p>
            <p className="text-white/40 text-[10px] font-medium">Admin Panel</p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mx-auto mt-3 mb-1 w-8 h-8 rounded-lg flex items-center justify-center
                     text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={cn('w-4 h-4 transition-transform duration-300', !expanded && 'rotate-180')}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {/* Section label */}
          <div className={cn(
            'overflow-hidden transition-all duration-300',
            expanded ? 'max-h-8 opacity-100 mb-1' : 'max-h-0 opacity-0'
          )}>
            <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-2 pt-1">Asosiy</p>
          </div>

          {NAV.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')

            const linkEl = (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl transition-all duration-200 group overflow-hidden',
                  // collapsed: icon exactly centered in 44x44
                  expanded ? 'px-3 py-2.5' : 'w-11 h-11 mx-auto justify-center p-0',
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                )}
              >
                {/* Active left bar (expanded only) */}
                {isActive && expanded && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5
                                   bg-white/80 rounded-r-full" />
                )}

                {/* Hover shimmer */}
                {!isActive && (
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                   bg-gradient-to-r from-white/0 via-white/5 to-white/0 pointer-events-none" />
                )}

                {/* Icon */}
                <span className={cn(
                  'transition-all duration-200',
                  isActive ? 'text-white' : 'text-white/50 group-hover:text-white',
                  !expanded && isActive && 'scale-110'
                )}>
                  {item.icon}
                </span>

                {/* Label */}
                <span className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-sm font-semibold',
                  expanded ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0'
                )}>
                  {item.label}
                </span>

                {/* Active dot */}
                {isActive && expanded && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                )}
              </NavLink>
            )

            return expanded ? linkEl : <Tooltip key={item.path} label={item.label}>{linkEl}</Tooltip>
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-white/10" />

        {/* Logout */}
        <div className="p-3">
          {expanded ? (
            <button onClick={() => setLogoutOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                         text-white/50 hover:bg-red-500/20 hover:text-red-400
                         transition-all duration-200 group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-semibold">Chiqish</span>
            </button>
          ) : (
            <Tooltip label="Chiqish">
              <button onClick={() => setLogoutOpen(true)}
                className="w-11 h-11 mx-auto flex items-center justify-center rounded-xl
                           text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </Tooltip>
          )}
        </div>
      </aside>
    </>
  )
}
