import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TWA } from '@/utils/twa'

export default function HomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    TWA.ready()
    TWA.backButton.hide()
  }, [])

  const firstName = TWA.firstName

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      {/* Header */}
      <div className="relative z-10 px-5 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-8 animate-slide-up">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white drop-shadow-md" fill="currentColor">
              <path d="M12 2C9.24 2 7 4.24 7 7s.81 3.19 1.41 4.46l.89 3.1c.35 1.24.7 2.44 1.7 2.44s1.35-1.2 1.7-2.44l.89-2.78c.21-.65.41-1.1.91-1.1s.7.45.91 1.1l.89 2.78c.35 1.24.7 2.44 1.7 2.44s1.35-1.2 1.7-2.44l.89-3.1C16.19 10.19 17 8.76 17 7c0-2.76-2.24-5-5-5zm-.5 15.5v4c0 .28.22.5.5.5s.5-.22.5-.5v-4c0-.28-.22-.5-.5-.5s-.5.22-.5.5z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-md">DentFlow</h1>
            <p className="text-sm text-white/80 font-medium">Zamonaviy stomatologiya</p>
          </div>
        </div>

        <div className="space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-3xl font-bold text-white drop-shadow-md">
            Salom, {firstName}! 👋
          </p>
          <p className="text-white/90 text-base font-medium">
            Online qabulga yoziling va tishlaringizni sog'lom saqlang
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="relative z-10 px-4 space-y-3 pb-8">
        <ActionCard
          icon={
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C9.24 2 7 4.24 7 7s.81 3.19 1.41 4.46l.89 3.1c.35 1.24.7 2.44 1.7 2.44s1.35-1.2 1.7-2.44l.89-2.78c.21-.65.41-1.1.91-1.1s.7.45.91 1.10l.89 2.78c.35 1.24.7 2.44 1.7 2.44s1.35-1.2 1.7-2.44l.89-3.1C16.19 10.19 17 8.76 17 7c0-2.76-2.24-5-5-5z"/>
            </svg>
          }
          title="Qabulga yozilish"
          desc="Shifokor, xizmat va qulay vaqt"
          gradient="from-dental-mint to-emerald-400"
          delay="0.2s"
          onClick={() => navigate('/book')}
        />
        <ActionCard
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          }
          title="Mening qabullarim"
          desc="Barcha qabullarni ko'rish"
          gradient="from-dental-blue to-blue-500"
          delay="0.3s"
          onClick={() => navigate('/my-appointments')}
        />
      </div>

      {/* Info block */}
      <div className="relative z-10 mx-4 mb-8 p-5 glass rounded-3xl border border-white/40 shadow-soft animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 mb-1">Eslatmalar tizimi</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Qabul vaqtidan <span className="font-bold text-primary-700">24 soat</span> va <span className="font-bold text-primary-700">1 soat</span> oldin Telegram orqali xabar olass
            </p>
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="relative z-10 px-4 pb-8 flex gap-2 flex-wrap animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <Badge icon="⚡" text="Tez va qulay" />
        <Badge icon="🔒" text="Xavfsiz" />
        <Badge icon="📱" text="24/7 onlayn" />
      </div>
    </div>
  )
}

function ActionCard({
  icon, title, desc, gradient, delay, onClick
}: {
  icon: React.ReactNode
  title: string
  desc: string
  gradient: string
  delay: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-5 bg-white rounded-3xl border border-gray-100
                 shadow-card hover:shadow-xl active:scale-[0.98] transition-all duration-200 text-left
                 animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center 
                      flex-shrink-0 shadow-lg text-white`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-base">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5 truncate">{desc}</p>
      </div>
      <svg className="w-6 h-6 text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="px-3 py-1.5 glass rounded-full border border-white/40 shadow-soft inline-flex items-center gap-1.5">
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-medium text-gray-700">{text}</span>
    </div>
  )
}
