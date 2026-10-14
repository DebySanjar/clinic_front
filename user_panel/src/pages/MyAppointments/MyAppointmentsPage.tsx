import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { findPatientByTelegramId, getPatientAppointments, cancelAppointment } from '@/api'
import { TWA } from '@/utils/twa'
import { formatDate, formatTime, formatCurrency, STATUS_MAP } from '@/utils'
import { Spinner, EmptyState, PageHeader } from '@/components/ui'
import { cn } from '@/utils'
import type { Appointment } from '@/types'

// ─── Appointment Card ─────────────────────────────────────────────────────────

function AppointmentCard({ appt, onCancel }: {
  appt: Appointment
  onCancel: (a: Appointment) => void
}) {
  const s = STATUS_MAP[appt.status]
  const canCancel = ['pending', 'confirmed'].includes(appt.status)

  return (
    <div className="panel overflow-hidden animate-slide-up">
      {/* Status bar */}
      <div className="h-1 w-full" style={{ backgroundColor: s.color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">{appt.doctor_name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{appt.service_name ?? '—'}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ color: s.color, backgroundColor: s.bg }}>
            {s.label}
          </span>
        </div>

        {/* Date + Time */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            <span className="font-medium">{formatDate(appt.date)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/>
            </svg>
            <span className="font-medium">{formatTime(appt.start_time)} – {formatTime(appt.end_time)}</span>
          </span>
        </div>

        {appt.price && (
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {formatCurrency(appt.price)}
          </p>
        )}

        {canCancel && (
          <button onClick={() => onCancel(appt)}
            className="mt-3 w-full py-2.5 rounded-xl border border-red-200 text-red-500
                       text-xs font-semibold active:bg-red-50 transition-colors">
            Bekor qilish
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Cancel Bottom Sheet ──────────────────────────────────────────────────────

function CancelSheet({ appt, onConfirm, onClose, loading }: {
  appt: Appointment
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ maxWidth: 480, margin: '0 auto', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-xl animate-slide-up">
        <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-base font-bold text-gray-900 mb-1">Bekor qilish</h3>
        <p className="text-sm text-gray-500 mb-3">Ushbu qabulni bekor qilmoqchimisiz?</p>

        <div className="bg-gray-50 rounded-xl p-3 mb-5 space-y-1 text-sm">
          <p className="text-gray-500">Shifokor: <b className="text-gray-900">{appt.doctor_name}</b></p>
          <p className="text-gray-500">Sana: <b className="text-gray-900">{formatDate(appt.date)}</b></p>
          <p className="text-gray-500">Vaqt: <b className="text-gray-900">{formatTime(appt.start_time)}</b></p>
        </div>

        <button onClick={onConfirm} disabled={loading}
          className="w-full py-4 bg-red-500 text-white rounded-2xl font-semibold
                     text-sm active:scale-[0.98] transition-all disabled:opacity-50 mb-2">
          {loading ? 'Yuklanmoqda...' : 'Ha, bekor qilaman'}
        </button>
        <button onClick={onClose} className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold text-sm">
          Qaytish
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = 'upcoming' | 'past'

export default function MyAppointmentsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)

  useEffect(() => {
    TWA.ready()
    TWA.backButton.show(() => navigate('/'))
    return () => TWA.backButton.hide()
  }, [navigate])

  const userId = TWA.userId

  const { data: patient } = useQuery({
    queryKey: ['patient', userId],
    queryFn: () => findPatientByTelegramId(userId!),
    enabled: !!userId,
  })

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['my-appointments', patient?.id],
    queryFn: () => getPatientAppointments(patient!.id),
    enabled: !!patient,
    refetchInterval: 30_000,
  })

  const cancelMut = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-appointments'] })
      setCancelTarget(null)
      TWA.haptic.success()
      toast.success('Qabul bekor qilindi')
    },
    onError: () => { TWA.haptic.error(); toast.error('Xato yuz berdi') },
  })

  const today = new Date().toISOString().split('T')[0]
  const upcoming = appointments.filter(a =>
    a.date >= today && !['cancelled', 'completed', 'no_show'].includes(a.status)
  )
  const past = appointments.filter(a =>
    a.date < today || ['cancelled', 'completed', 'no_show'].includes(a.status)
  )
  const shown = tab === 'upcoming' ? upcoming : past

  return (
    <div className="page-root">
      <div className="absolute inset-x-0 top-0 h-32 bg-grid-pattern bg-grid-mask pointer-events-none" />

      {/* Sticky header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0">
        <PageHeader title="Mening qabullarim" />
        {/* Tabs */}
        <div className="flex mx-4 mb-3 bg-gray-100 rounded-xl p-1 gap-1">
          {([
            { key: 'upcoming' as Tab, label: `Kelgusi (${upcoming.length})` },
            { key: 'past'     as Tab, label: `O'tgan (${past.length})`     },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              )}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-4 py-4 space-y-3 pb-28">
        {isLoading ? <Spinner /> : shown.length === 0 ? (
          <EmptyState
            title={tab === 'upcoming' ? 'Kelgusi qabul yo\'q' : 'O\'tgan qabul yo\'q'}
            desc={tab === 'upcoming' ? 'Yangi qabul yaratish uchun tugmani bosing' : ''}
          />
        ) : (
          shown.map(appt => (
            <AppointmentCard key={appt.id} appt={appt} onCancel={setCancelTarget} />
          ))
        )}
      </div>

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3
                      bg-gradient-to-t from-white via-white/95 to-transparent"
           style={{ maxWidth: 480, margin: '0 auto', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
        <button onClick={() => navigate('/book')} className="btn-primary">
          Yangi qabul yaratish
        </button>
      </div>

      {cancelTarget && (
        <CancelSheet
          appt={cancelTarget}
          onConfirm={() => cancelMut.mutate(cancelTarget.id)}
          onClose={() => setCancelTarget(null)}
          loading={cancelMut.isPending}
        />
      )}
    </div>
  )
}
