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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Animatsiya */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <svg className="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Qabul yaratildi! 🎉
      </h1>
      <p className="text-gray-500 mb-2">
        Siz muvaffaqiyatli qabulga yozildingiz.
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Qabul vaqtidan 24 soat va 1 soat oldin eslatma yuboriladi.
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={() => navigate('/my-appointments')}
          className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold text-base
                     shadow-lg shadow-primary-200 active:scale-[0.98] transition-all"
        >
          📋 Qabullarimni ko'rish
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-base
                     active:scale-[0.98] transition-all"
        >
          🏠 Bosh sahifa
        </button>
      </div>
    </div>
  )
}
