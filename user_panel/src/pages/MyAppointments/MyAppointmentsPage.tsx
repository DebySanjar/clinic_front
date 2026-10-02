import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { findPatientByTelegramId, getPatientAppointments, cancelAppointment } from '@/api'
import { TWA } from '@/utils/twa'
import { formatDate, formatTime, formatCurrency, STATUS_MAP } from '@/utils'
import { Spinner, EmptyState, PageHeader } from '@/components/ui'
import type { Appointment, AppStatus } from '@/types'

// ─── Qabul Kartasi ────────────────────────────────────────────────────────────

function AppointmentCard({
  appt, onCancel,
}: { appt: Appointment; onCancel: (a: Appointment) => void }) {
  const s = STATUS_MAP[appt.status]
  const canCancel = ['pending', 'confirmed'].includes(appt.status)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Status bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: s.color }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-base">{appt.doctor_name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{appt.service_name ?? '—'}</p>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            style={{ color: s.color, backgroundColor: s.bg }}
          >
            {s.label}
          </span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="font-medium">{formatDate(appt.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
            <span className="font-medium">
              {formatTime(appt.start_time)} – {formatTime(appt.end_time)}
            </span>
          </div>
        </div>

        {appt.price && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatCurrency(appt.price)}</span>
          </div>
        )}

        {/* Cancel button */}
        {canCancel && (
          <button
            onClick={() => onCancel(appt)}
            className="mt-4 w-full py-2.5 rounded-xl border border-red-200 text-red-500
                       text-sm font-medium active:bg-red-50 transition-colors"
          >
            Bekor qilish
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Confirm Sheet ────────────────────────────────────────────────────────────

function ConfirmSheet({
  appt, onConfirm, onClose, loading,
}: {
  appt: Appointment
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl px-5 pt-6 pb-8 shadow-xl">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Bekor qilish</h3>
        <p className="text-sm text-gray-500 mb-1">
          Quyidagi qabulni bekor qilmoqchimisiz?
        </p>
        <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm space-y-1">
          <p><span className="text-gray-400">Shifokor:</span> <b>{appt.doctor_name}</b></p>
          <p><span className="text-gray-400">Sana:</span> <b>{formatDate(appt.date)}</b></p>
          <p><span className="text-gray-400">Vaqt:</span> <b>{formatTime(appt.start_time)}</b></p>
        </div>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full py-4 bg-red-500 text-white rounded-2xl font-semibold
                     active:scale-[0.98] transition-all disabled:opacity-50 mb-2"
        >
          {loading ? 'Yuklanmoqda...' : '❌ Ha, bekor qilaman'}
        </button>
        <button
          onClick={onClose}
          className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold active:bg-gray-200"
        >
          Qaytish
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabKey = 'upcoming' | 'past'

export default function MyAppointmentsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<TabKey>('upcoming')
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)

  useEffect(() => {
    TWA.ready()
    TWA.backButton.show(() => navigate('/'))
    return () => TWA.backButton.hide()
  }, [navigate])

  const userId = TWA.userId

  // Bemorni topish
  const { data: patient } = useQuery({
    queryKey: ['patient', userId],
    queryFn: () => findPatientByTelegramId(userId!),
    enabled: !!userId,
  })

  // Qabullar
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
    onError: () => {
      TWA.haptic.error()
      toast.error('Xato yuz berdi')
    },
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <PageHeader title="Mening qabullarim" />
        {/* Tabs */}
        <div className="flex mx-4 mb-3 bg-gray-100 rounded-xl p-1 gap-1">
          {([
            { key: 'upcoming', label: `Kelgusi (${upcoming.length})` },
            { key: 'past',     label: `O'tgan (${past.length})` },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">
        {isLoading ? (
          <Spinner />
        ) : shown.length === 0 ? (
          <EmptyState
            title={tab === 'upcoming' ? 'Kelgusi qabul yo\'q' : 'O\'tgan qabul yo\'q'}
            desc={tab === 'upcoming' ? 'Yangi qabul yaratish uchun "Qabulga yozilish" tugmasini bosing' : ''}
          />
        ) : (
          shown.map(appt => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              onCancel={setCancelTarget}
            />
          ))
        )}
      </div>

      {/* Yangi qabul tugmasi */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent">
        <button
          onClick={() => navigate('/book')}
          className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold text-base
                     shadow-lg shadow-primary-200 active:scale-[0.98] transition-all"
        >
          + Yangi qabul yaratish
        </button>
      </div>

      {/* Cancel confirm sheet */}
      {cancelTarget && (
        <ConfirmSheet
          appt={cancelTarget}
          onConfirm={() => cancelMut.mutate(cancelTarget.id)}
          onClose={() => setCancelTarget(null)}
          loading={cancelMut.isPending}
        />
      )}
    </div>
  )
}
