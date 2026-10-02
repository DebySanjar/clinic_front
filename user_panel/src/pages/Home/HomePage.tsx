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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
              <path d="M12 2C9.24 2 7 4.24 7 7c0 1.5.4 2.8.9 4l.8 3.2c.3 1 .6 2.4 1.6 2.4s1.2-1.2 1.6-2.4l.8-2.4c.2-.4.3-.8.8-.8s.6.4.8.8l.8 2.4c.4 1.2.6 2.4 1.6 2.4s1.3-1.4 1.6-2.4l.8-3.2c.5-1.2.9-2.5.9-4 0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DentFlow</h1>
            <p className="text-xs text-gray-500">Stomatologiya klinikasi</p>
          </div>
        </div>

        <p className="text-2xl font-bold text-gray-900">
          Salom, {firstName}! 👋
        </p>
        <p className="text-gray-500 mt-1">
          Qulayligi uchun online qabulga yozilin
        </p>
      </div>

      {/* Action cards */}
      <div className="px-4 space-y-3 flex-1">
        <ActionCard
          icon="🦷"
          title="Qabulga yozilish"
          desc="Shifokor, xizmat va qulay vaqtni tanlang"
          color="bg-primary-600"
          onClick={() => navigate('/book')}
        />
        <ActionCard
          icon="📋"
          title="Mening qabullarim"
          desc="Barcha qabullaringizni ko'ring va boshqaring"
          color="bg-violet-600"
          onClick={() => navigate('/my-appointments')}
        />
      </div>

      {/* Info block */}
      <div className="mx-4 mb-8 mt-4 p-4 bg-gray-50 rounded-2xl">
        <p className="text-xs text-gray-500 text-center">
          🕐 Qabul vaqtidan <b>24 soat</b> va <b>1 soat</b> oldin eslatma olasiz
        </p>
      </div>
    </div>
  )
}

function ActionCard({
  icon, title, desc, color, onClick
}: {
  icon: string; title: string; desc: string; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100
                 shadow-sm active:scale-[0.98] transition-all duration-150 text-left"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-400 mt-0.5">{desc}</p>
      </div>
      <svg className="w-5 h-5 text-gray-300 ml-auto flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
