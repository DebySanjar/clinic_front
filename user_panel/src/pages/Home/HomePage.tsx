import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TWA } from '@/utils/twa'

export default function HomePage() {
  const navigate = useNavigate()
  const firstName = TWA.firstName || 'Foydalanuvchi'

  useEffect(() => {
    TWA.ready()
    TWA.backButton.hide()
  }, [])

  return (
    <div className="page-root">
      {/* Grid bg overlay — top fade */}
      <div className="absolute inset-x-0 top-0 h-48 bg-grid-pattern bg-grid-mask pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 px-5 pt-10 pb-8">

        {/* Logo + Brand */}
        <div className="flex items-center gap-3 mb-8 animate-slide-up">
          <div className="w-11 h-11 bg-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 2C9.24 2 7 4.24 7 7c0 1.5.4 2.8.9 4l.8 3.2c.3 1 .6 2.4 1.6 2.4s1.2-1.2 1.6-2.4l.8-2.4c.2-.4.3-.8.8-.8s.6.4.8.8l.8 2.4c.4 1.2.6 2.4 1.6 2.4s1.3-1.4 1.6-2.4l.8-3.2c.5-1.2.9-2.5.9-4 0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-tight">DentFlow</p>
            <p className="text-xs text-gray-400">Stomatologiya</p>
          </div>
        </div>

        {/* Greeting */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Salom, {firstName}!
          </h1>
          <p className="text-sm text-gray-500">
            Qabulga yozilib, tishlaringizni sog'lom saqlang
          </p>
        </div>

        {/* Main actions */}
        <div className="space-y-3 mb-8">
          <ActionButton
            delay="0.1s"
            title="Qabulga yozilish"
            desc="Shifokor va qulay vaqtni tanlang"
            icon={
              <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v4m-2-2h4"/>
              </svg>
            }
            onClick={() => navigate('/book')}
          />
          <ActionButton
            delay="0.15s"
            title="Mening qabullarim"
            desc="Qabullar tarixi va holati"
            icon={
              <svg className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4"/>
              </svg>
            }
            onClick={() => navigate('/my-appointments')}
          />
        </div>

        {/* Info card */}
        <div className="panel p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Eslatmalar</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Qabul vaqtidan <span className="font-semibold text-primary-600">24 soat</span> va{' '}
            <span className="font-semibold text-primary-600">1 soat</span> oldin Telegram orqali xabar olasiz
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── ActionButton ─────────────────────────────────────────────────────────────

function ActionButton({ title, desc, icon, onClick, delay }: {
  title: string
  desc: string
  icon: React.ReactNode
  onClick: () => void
  delay: string
}) {
  return (
    <button onClick={onClick}
      className="panel w-full flex items-center gap-4 p-4 text-left
                 active:scale-[0.98] transition-all duration-150 animate-slide-up"
      style={{ animationDelay: delay }}>
      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  )
}
