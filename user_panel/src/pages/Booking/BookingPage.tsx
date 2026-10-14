import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useBookingStore } from '@/store/bookingStore'
import {
  getDoctors, getServices, getDoctorSlots, createAppointment,
  findPatientByTelegramId, getOrCreatePatient,
} from '@/api'
import { TWA } from '@/utils/twa'
import { formatCurrency, getNextDays, formatDate, formatTime } from '@/utils'
import { Spinner, PageHeader, StepBar, SelectCard, BottomBtn, EmptyState } from '@/components/ui'
import { cn } from '@/utils'

// ─── Step 1: Xizmat ──────────────────────────────────────────────────────────

function StepService({ onNext }: { onNext: () => void }) {
  const { service, setService } = useBookingStore()

  const { data: services, isLoading } = useQuery({
    queryKey: ['all-services'],
    queryFn: () => getServices(),
  })

  return (
    <div className="pb-28">
      <PageHeader title="Xizmatni tanlang" subtitle="Qanday xizmat kerak?" />
      {isLoading ? <Spinner /> : !services?.length ? (
        <EmptyState title="Xizmat topilmadi" desc="Hozircha xizmatlar kiritilmagan" />
      ) : (
        <div className="px-4 space-y-2 mt-1">
          {services.map(svc => (
            <SelectCard key={svc.id} selected={service?.id === svc.id}
              onClick={() => { setService(svc); TWA.haptic.select() }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{svc.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{svc.duration} daqiqa</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-primary-700">
                    {formatCurrency(svc.price)}
                  </span>
                  {service?.id === svc.id && <CheckMark />}
                </div>
              </div>
            </SelectCard>
          ))}
        </div>
      )}
      <BottomBtn label="Davom etish" onClick={onNext} disabled={!service} />
    </div>
  )
}

// ─── Step 2: Shifokor ─────────────────────────────────────────────────────────

function StepDoctor({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { service, doctor, setDoctor } = useBookingStore()

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors-for-service', service?.id],
    queryFn: () => getDoctors(service?.id),
    enabled: !!service,
  })

  return (
    <div className="pb-28">
      <PageHeader
        title="Shifokorni tanlang"
        subtitle={service?.name}
        back={onBack}
      />
      {isLoading ? <Spinner /> : !doctors?.length ? (
        <EmptyState title="Shifokor topilmadi" desc="Bu xizmatni bajaradigan shifokor yo'q" />
      ) : (
        <div className="px-4 space-y-2 mt-1">
          {doctors.map(doc => (
            <SelectCard key={doc.id} selected={doctor?.id === doc.id}
              onClick={() => { setDoctor(doc); TWA.haptic.select() }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-700">
                    {doc.first_name[0]}{doc.last_name[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">Dr. {doc.full_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.speciality}</p>
                </div>
                {doctor?.id === doc.id && <CheckMark />}
              </div>
            </SelectCard>
          ))}
        </div>
      )}
      <BottomBtn label="Davom etish" onClick={onNext} disabled={!doctor} />
    </div>
  )
}

// ─── Step 3: Sana ────────────────────────────────────────────────────────────

function StepDate({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { doctor, date, setDate } = useBookingStore()
  const days = getNextDays(14).filter(d =>
    doctor ? doctor.work_days.includes(d.weekdayIndex) : true
  )

  return (
    <div className="pb-28">
      <PageHeader title="Sanani tanlang" subtitle="Qaysi kuni qulayroq?" back={onBack} />
      <div className="px-4 mt-2">
        <div className="grid grid-cols-4 gap-2">
          {days.map(d => (
            <button key={d.date}
              onClick={() => { setDate(d.date); TWA.haptic.select() }}
              className={cn(
                'flex flex-col items-center py-3 rounded-2xl border-2 transition-all active:scale-95',
                date === d.date
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-100 bg-white text-gray-700'
              )}>
              <span className={cn('text-[10px] font-semibold',
                date === d.date ? 'text-primary-500' : 'text-gray-400')}>
                {d.weekday}
              </span>
              <span className="text-lg font-bold mt-0.5">{d.day}</span>
              <span className={cn('text-[10px]',
                date === d.date ? 'text-primary-500' : 'text-gray-400')}>
                {d.isToday ? 'Bugun' : d.month.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>
      </div>
      <BottomBtn label="Davom etish" onClick={onNext} disabled={!date} />
    </div>
  )
}

// ─── Step 4: Vaqt ────────────────────────────────────────────────────────────

function StepTime({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { doctor, service, date, time, setTime } = useBookingStore()
  const { data, isLoading } = useQuery({
    queryKey: ['slots', doctor?.id, date],
    queryFn: () => getDoctorSlots(doctor!.id, date!),
    enabled: !!doctor && !!date,
  })

  const slots = data?.slots ?? []

  return (
    <div className="pb-28">
      <PageHeader
        title="Vaqtni tanlang"
        subtitle={date ? `${formatDate(date)} — Dr. ${doctor?.full_name}` : ''}
        back={onBack}
      />
      {isLoading ? <Spinner /> : !slots.filter(s => s.is_available).length ? (
        <EmptyState title="Bo'sh vaqt yo'q" desc="Boshqa kun tanlang" />
      ) : (
        <div className="px-4 mt-2">
          <div className="grid grid-cols-4 gap-2">
            {slots.map(slot => (
              <button key={slot.time}
                disabled={!slot.is_available}
                onClick={() => { setTime(slot.time); TWA.haptic.select() }}
                className={cn(
                  'py-3 rounded-xl text-sm font-semibold transition-all active:scale-95',
                  !slot.is_available
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                    : time === slot.time
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700'
                )}>
                {formatTime(slot.time)}
              </button>
            ))}
          </div>
          {service && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              Davomiyligi: {service.duration} daqiqa
            </p>
          )}
        </div>
      )}
      <BottomBtn label="Davom etish" onClick={onNext} disabled={!time} />
    </div>
  )
}

// ─── Step 5: Tasdiqlash ───────────────────────────────────────────────────────

function StepConfirm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  const { doctor, service, date, time, reset } = useBookingStore()

  const mutation = useMutation({
    mutationFn: async () => {
      const userId = TWA.userId
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
    onSuccess: () => { TWA.haptic.success(); reset(); navigate('/booking-success') },
    onError: (err: any) => {
      TWA.haptic.error()
      const msg = err?.response?.data
      toast.error(typeof msg === 'object'
        ? Object.values(msg).flat().join(' ')
        : 'Xato yuz berdi')
    },
  })

  const rows = [
    { label: 'Xizmat',      value: service?.name ?? '—' },
    { label: 'Narx',        value: service ? formatCurrency(service.price) : '—' },
    { label: 'Shifokor',    value: `Dr. ${doctor?.full_name}` },
    { label: 'Sana',        value: date ? formatDate(date) : '—' },
    { label: 'Vaqt',        value: time ? formatTime(time) : '—' },
    { label: 'Davomiyligi', value: service ? `${service.duration} daqiqa` : '—' },
  ]

  return (
    <div className="pb-28">
      <PageHeader title="Tasdiqlash" subtitle="Ma'lumotlarni tekshiring" back={onBack} />

      <div className="mx-4 mt-2 panel overflow-hidden">
        {rows.map((r, i) => (
          <div key={i} className={cn(
            'flex items-center px-4 py-3.5 gap-3',
            i < rows.length - 1 && 'border-b border-gray-50'
          )}>
            <span className="text-sm text-gray-400 w-24 flex-shrink-0">{r.label}</span>
            <span className="text-sm font-semibold text-gray-900 flex-1">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="mx-4 mt-3 p-4 bg-blue-50 rounded-2xl">
        <p className="text-xs text-blue-600 text-center leading-relaxed">
          Qabul vaqtidan <b>24 soat</b> va <b>1 soat</b> oldin Telegram orqali eslatma olasiz
        </p>
      </div>

      <BottomBtn
        label="Qabulga yozilish"
        onClick={() => mutation.mutate()}
        loading={mutation.isPending}
      />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const TOTAL = 5
  const navigate = useNavigate()

  useEffect(() => { TWA.ready() }, [])

  useEffect(() => {
    if (step === 1) TWA.backButton.show(() => navigate('/'))
    else            TWA.backButton.show(() => setStep(s => s - 1))
    return () => TWA.backButton.hide()
  }, [step, navigate])

  const next = () => setStep(s => Math.min(s + 1, TOTAL))
  const back = () => (step === 1 ? navigate('/') : setStep(s => s - 1))

  return (
    <div className="page-root">
      <div className="absolute inset-x-0 top-0 h-32 bg-grid-pattern bg-grid-mask pointer-events-none" />
      <div className="relative z-10 flex-1">
        <StepBar current={step} total={TOTAL} />
        {step === 1 && <StepService onNext={next} />}
        {step === 2 && <StepDoctor  onNext={next} onBack={back} />}
        {step === 3 && <StepDate    onNext={next} onBack={back} />}
        {step === 4 && <StepTime    onNext={next} onBack={back} />}
        {step === 5 && <StepConfirm onBack={back} />}
      </div>
    </div>
  )
}

// ─── CheckMark ────────────────────────────────────────────────────────────────

function CheckMark() {
  return (
    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
}
