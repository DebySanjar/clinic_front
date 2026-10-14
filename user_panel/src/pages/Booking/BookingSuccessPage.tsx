import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TWA } from '@/utils/twa'

export default function BookingSuccessPage() {
  const navigate = useNavigate()

  useEffect(() => {
    TWA.ready()
    TWA.backButton.hide()
    TWA.haptic.success()
  }, [])

  return (
    <div className="page-root items-center justify-center text-center px-6">
      <div className="absolute inset-x-0 top-0 h-48 bg-grid-pattern bg-grid-mask pointer-events-none" />

      <div className="relative z-10 animate-slide-up w-full max-w-sm mx-auto">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Qabul yaratildi!</h1>
        <p className="text-gray-500 text-sm mb-1">Muvaffaqiyatli qabulga yozildingiz.</p>
        <p className="text-xs text-gray-400 mb-8 leading-relaxed">
          24 soat va 1 soat oldin Telegram orqali eslatma olasiz
        </p>

        <div className="space-y-3 w-full">
          <button onClick={() => navigate('/my-appointments')} className="btn-primary">
            Qabullarimni ko'rish
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Bosh sahifa
          </button>
        </div>
      </div>
    </div>
  )
}
