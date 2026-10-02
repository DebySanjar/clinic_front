import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useBookingStore } from '@/store/bookingStore'
import { getDoctors, getServices, getDoctorSlots, createAppointment, findPatientByTelegramId, getOrCreatePatient } from '@/api'
import { TWA } from '@/utils/twa'
import { formatCurrency, getNextDays, formatDate, formatTime, MONTHS_UZ } from '@/utils'
import { Spinner, PageHeader, StepBar, SelectCard, BottomBtn, EmptyState } from '@/components/ui'
import type { Doctor, Service, TimeSlot } from '@/types'

// ─── Step 1: Shifokor tanlash ─────────────────────────────────────────────

function StepDoctor({ onNext }: { onNext: () => void }) {
  const { doctor, setDoctor } = useBookingStore()
  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  })

  return (
    <div className="pb-28">
      <PageHeader title="Shifokorni tanlang" subtitle="Qaysi mutaxassisga murojaat qilmoqchisiz?" />
      {isLoading ? <Spinner /> : (
        <div className="px-4 space-y-3 mt-2">
          {doctors?.map(doc => (
            <SelectCard
              key={doc.id}
              selected={doctor?.id === doc.id}
              onClick={() => { setDoctor(doc); TWA.haptic.select() }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-primary-700 text-sm">
                    {doc.first_name[0]}{doc.last_name[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Dr. {doc.full_name}</p>
                  <p className="text-xs text-gray-500">{doc.speciality}</p>
                </div>
                {doctor?.id === doc.id && (
                  <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </SelectCard>
          ))}
        </div>
      )}
      <BottomBtn label="Davom etish →" onClick={onNext} disabled={!doctor} />
    </div>
  )
}

// ─── Step 2: Xizmat tanlash ──────────────────────────────────────────────

function StepService({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { doctor, service, setService } = useBookingStore()

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', doctor?.id],
    queryFn: () => getServices(doctor!.id),
    enabled: !!doctor,
  })

  return (
    <div className="pb-28">
      <PageHeader title="Xizmatni tanlang" subtitle={`Dr. ${doctor?.full_name}`} back={onBack} />
      {isLoading ? <Spinner /> : services?.length === 0 ? (
        <EmptyState title="Xizmat topilmadi" desc="Bu shifokor uchun xizmatlar kiritilmagan" />
      ) : (
        <div className="px-4 space-y-3 mt-2">
          {services?.map(svc => (
            <SelectCard
              key={svc.id}
              selected={service?.id === svc.id}
              onClick={() => { setService(svc); TWA.haptic.select() }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{svc.name}</p>
                  {svc.category_name && (
                    <p className="text-xs text-gray-400 mt-0.5">{svc.category_name}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">⏱ {svc.duration} daqiqa</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-700 text-sm">{formatCurrency(svc.price)}</p>
                  {service?.id === svc.id && (
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center mt-1 ml-auto">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </SelectCard>
          ))}
        </div>
      )}
      <BottomBtn label="Davom etish →" onClick={onNext} disabled={!service} />
    </div>
  )
}

// ─── Step 3: Sana tanlash ────────────────────────────────────────────────

function StepDate({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { doctor, date, setDate } = useBookingStore()
  const days = getNextDays(14)

  // Shifokor ishlaydigan kunlarni filter
  const availableDays = days.filter(d =>
    doctor ? doctor.work_days.includes(d.weekdayIndex) : true
  )

  return (
    <div className="pb-28">
      <PageHeader title="Sanani tanlang" subtitle="Qaysi kuni qulayroq?" back={onBack} />
      <div className="px-4 mt-3">
        <div className="grid grid-cols-4 gap-2">
          {availableDays.map(d => (
            <button
              key={d.date}
              onClick={() => { setDate(d.date); TWA.haptic.select() }}
              className={`
                flex flex-col items-center py-3 rounded-2xl border-2 transition-all active:scale-95
                ${date === d.date
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'
                }
              `}
            >
              <span className={`text-xs font-medium ${date === d.date ? 'text-primary-500' : 'text-gray-400'}`}>
                {d.weekday}
              </span>
              <span className="text-lg font-bold mt-0.5">{d.day}</span>
              <span className={`text-[10px] ${date === d.date ? 'text-primary-500' : 'text-gray-400'}`}>
                {d.isToday ? 'Bugun' : d.month.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>
      </div>
      <BottomBtn label="Davom etish →" onClick={onNext} disabled={!date} />
    </div>
  )
}

// ─── Step 4: Vaqt tanlash ────────────────────────────────────────────────

function StepTime({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { doctor, service, date, time, setTime } = useBookingStore()

  const { data, isLoading } = useQuery({
    queryKey: ['slots', doctor?.id, date],
    queryFn: () => getDoctorSlots(doctor!.id, date!),
    enabled: !!doctor && !!date,
  })

  const slots = data?.slots ?? []
  const available = slots.filter(s => s.is_available)

  return (
    <div className="pb-28">
      <PageHeader
        title="Vaqtni tanlang"
        subtitle={date ? `${formatDate(date)} — Dr. ${doctor?.full_name}` : ''}
        back={onBack}
      />
      {isLoading ? <Spinner /> : available.length === 0 ? (
        <EmptyState
          title="Bo'sh vaqt yo'q"
          desc="Ushbu kunda barcha slotlar band. Boshqa kun tanlang."
        />
      ) : (
        <div className="px-4 mt-3">
          <div className="grid grid-cols-4 gap-2">
            {slots.map(slot => (
              <button
                key={slot.time}
                disabled={!slot.is_available}
                onClick={() => { setTime(slot.time); TWA.haptic.select() }}
                className={`
                  py-3 rounded-xl text-sm font-semibold transition-all active:scale-95
                  ${!slot.is_available
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                    : time === slot.time
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                  }
                `}
              >
                {formatTime(slot.time)}
              </button>
            ))}
          </div>
          {service && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              Xizmat davomiyligi: {service.duration} daqiqa
            </p>
          )}
        </div>
      )}
      <BottomBtn label="Davom etish →" onClick={onNext} disabled={!time} />
    </div>
  )
}

// ─── Step 5: Tasdiqlash ──────────────────────────────────────────────────

function StepConfirm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  const { doctor, service, date, time, reset } = useBookingStore()

  const mutation = useMutation({
    mutationFn: async () => {
      const userId = TWA.userId

      // Bemorni topish yoki yaratish
      let patient = userId ? await findPatientByTelegramId(userId) : null
      if (!patient && userId) {
        patient = await getOrCreatePatient({
          telegram_id: userId,
          first_name: TWA.firstName,
        })
      }
      if (!patient) throw new Error('Foydalanuvchi aniqlanmadi')

      return createAppointment({
        patient: patient.id,
        doctor: doctor!.id,
        service: service?.id ?? null,
        date: date!,
        start_time: time!,
      })
    },
    onSuccess: () => {
      TWA.haptic.success()
      reset()
      navigate('/booking-success')
    },
    onError: (err: any) => {
      TWA.haptic.error()
      const msg = err?.response?.data
      const text = typeof msg === 'object'
        ? Object.values(msg).flat().join(' ')
        : 'Xato yuz berdi. Qayta urinib ko\'ring.'
      toast.error(text)
    },
  })

  const items = [
    { icon: '👨‍⚕️', label: 'Shifokor',  value: `Dr. ${doctor?.full_name}` },
    { icon: '🦷', label: 'Xizmat',    value: service?.name ?? '—' },
    { icon: '💰', label: 'Narx',      value: service ? formatCurrency(service.price) : '—' },
    { icon: '📅', label: 'Sana',      value: date ? formatDate(date) : '—' },
    { icon: '⏰', label: 'Vaqt',      value: time ? formatTime(time) : '—' },
    { icon: '⏱', label: 'Davomiyligi', value: service ? `${service.duration} daqiqa` : '—' },
  ]

  return (
    <div className="pb-28">
      <PageHeader title="Tasdiqlash" subtitle="Ma'lumotlarni tekshiring" back={onBack} />

      <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3.5 ${i < items.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm text-gray-500 w-24 flex-shrink-0">{item.label}</span>
            <span className="text-sm font-semibold text-gray-900 flex-1">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mx-4 mt-4 p-4 bg-blue-50 rounded-2xl">
        <p className="text-xs text-blue-700 text-center">
          ℹ️ Qabul vaqtidan <b>24 soat</b> va <b>1 soat</b> oldin Telegram orqali eslatma olasiz
        </p>
      </div>

      <BottomBtn
        label="✅ Qabulga yozilish"
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
      />
    </div>
  )
}

// ─── Main Booking Page ───────────────────────────────────────────────────────

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const TOTAL = 5
  const navigate = useNavigate()

  useEffect(() => {
    TWA.ready()
  }, [])

  // Back button — TWA yoki in-app
  useEffect(() => {
    if (step === 1) {
      TWA.backButton.show(() => navigate('/'))
    } else {
      TWA.backButton.show(() => setStep(s => s - 1))
    }
    return () => TWA.backButton.hide()
  }, [step, navigate])

  const next = () => setStep(s => Math.min(s + 1, TOTAL))
  const back = () => {
    if (step === 1) navigate('/')
    else setStep(s => s - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StepBar current={step} total={TOTAL} />
      {step === 1 && <StepDoctor onNext={next} />}
      {step === 2 && <StepService onNext={next} onBack={back} />}
      {step === 3 && <StepDate onNext={next} onBack={back} />}
      {step === 4 && <StepTime onNext={next} onBack={back} />}
      {step === 5 && <StepConfirm onBack={back} />}
    </div>
  )
}
