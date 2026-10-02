import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appointmentsApi, doctorsApi } from '@/api'
import { Button, Spinner, Badge, EmptyState, Modal, Confirm } from '@/components/ui'
import type { Appointment, AppointmentStatus } from '@/types'
import { formatCurrency, formatTime, STATUS_CONFIG, getTodayString } from '@/utils'

export default function AppointmentsPage() {
  const qc = useQueryClient()
  const [filterDate, setFilterDate] = useState(getTodayString())
  const [filterDoctor, setFilterDoctor] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [detailAppt, setDetailAppt] = useState<Appointment | null>(null)
  const [cancelAppt, setCancelAppt] = useState<Appointment | null>(null)

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list({}).then(r => r.data),
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['appointments', filterDate, filterDoctor, filterStatus],
    queryFn: () => appointmentsApi.list({
      date: filterDate || undefined,
      doctor_id: filterDoctor ? Number(filterDoctor) : undefined,
      status: filterStatus || undefined,
    }).then(r => r.data),
    refetchInterval: 30_000,
  })

  const appointments = result?.results ?? []

  const startMut = useMutation({
    mutationFn: (id: number) => appointmentsApi.start(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Qabul boshlandi') },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const completeMut = useMutation({
    mutationFn: (id: number) => appointmentsApi.complete(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      const delay = res.data.delay_minutes
      toast.success(delay > 0 ? `Tugadi. Kechikish: ${delay} daqiqa` : 'Qabul tugallandi')
    },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const confirmMut = useMutation({
    mutationFn: (id: number) => appointmentsApi.confirm(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Tasdiqlandi') },
  })

  const cancelMut = useMutation({
    mutationFn: (id: number) => appointmentsApi.cancel(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); setCancelAppt(null); toast.success('Bekor qilindi') },
  })

  const noShowMut = useMutation({
    mutationFn: (id: number) => appointmentsApi.noShow(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Belgilandi') },
  })

  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: 'Barcha holatlar' },
    { value: 'pending', label: 'Kutilmoqda' },
    { value: 'confirmed', label: 'Tasdiqlangan' },
    { value: 'in_progress', label: 'Jarayonda' },
    { value: 'completed', label: 'Tugagan' },
    { value: 'cancelled', label: 'Bekor qilingan' },
    { value: 'no_show', label: 'Kelmadi' },
  ]

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="input w-40 text-sm"
        />
        <select
          value={filterDoctor}
          onChange={e => setFilterDoctor(e.target.value)}
          className="input w-48 text-sm"
        >
          <option value="">Barcha shifokorlar</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>Dr. {d.full_name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input w-44 text-sm"
        >
          {statusOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-500 self-center">
          {appointments.length} ta qabul
        </span>
      </div>

      {/* Table */}
      {isLoading ? <Spinner /> : appointments.length === 0 ? (
        <EmptyState message="Qabul topilmadi" />
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Bemor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Shifokor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Xizmat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vaqt</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Holat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Narx</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => {
                const sc = STATUS_CONFIG[appt.status]
                return (
                  <tr key={appt.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{appt.patient_name}</p>
                      <p className="text-xs text-gray-400">{appt.patient_phone}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{appt.doctor_name}</td>
                    <td className="px-4 py-3.5 text-gray-600 max-w-[140px] truncate">
                      {appt.service_name ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                      {formatTime(appt.start_time)}–{formatTime(appt.end_time)}
                      {appt.delay_minutes > 0 && (
                        <span className="ml-1 text-orange-500 text-xs">+{appt.delay_minutes}daq</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={sc.color}>{sc.label}</Badge>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900">
                      {appt.price ? formatCurrency(appt.price) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setDetailAppt(appt)}
                          title="Ko'rish">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </Button>
                        {appt.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50"
                            onClick={() => confirmMut.mutate(appt.id)} title="Tasdiqlash">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          </Button>
                        )}
                        {['pending', 'confirmed'].includes(appt.status) && (
                          <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50"
                            onClick={() => startMut.mutate(appt.id)} title="Boshlash">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                            </svg>
                          </Button>
                        )}
                        {appt.status === 'in_progress' && (
                          <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50"
                            onClick={() => completeMut.mutate(appt.id)} title="Tugatish">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
                            </svg>
                          </Button>
                        )}
                        {['pending', 'confirmed'].includes(appt.status) && (
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-100"
                            onClick={() => noShowMut.mutate(appt.id)} title="Kelmadi">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                          </Button>
                        )}
                        {!['completed', 'cancelled', 'no_show'].includes(appt.status) && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                            onClick={() => setCancelAppt(appt)} title="Bekor qilish">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detailAppt} onClose={() => setDetailAppt(null)} title="Qabul tafsilotlari" size="sm">
        {detailAppt && (
          <div className="space-y-3 text-sm">
            {[
              ['Bemor', detailAppt.patient_name],
              ['Telefon', detailAppt.patient_phone],
              ['Shifokor', detailAppt.doctor_name],
              ['Xizmat', detailAppt.service_name ?? '—'],
              ['Sana', detailAppt.date],
              ['Vaqt', `${formatTime(detailAppt.start_time)} – ${formatTime(detailAppt.end_time)}`],
              ['Narx', formatCurrency(detailAppt.price ?? 0)],
              ['Holat', STATUS_CONFIG[detailAppt.status].label],
              detailAppt.notes ? ['Izoh', detailAppt.notes] : null,
              detailAppt.delay_minutes > 0 ? ['Kechikish', `${detailAppt.delay_minutes} daqiqa`] : null,
            ].filter(Boolean).map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900 text-right max-w-[200px]">{v as string}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Confirm
        open={!!cancelAppt}
        title="Qabulni bekor qilish"
        message={`${cancelAppt?.patient_name} nomidagi qabulni bekor qilasizmi?`}
        onConfirm={() => cancelAppt && cancelMut.mutate(cancelAppt.id)}
        onCancel={() => setCancelAppt(null)}
        confirmText="Bekor qilish"
        danger
      />
    </div>
  )
}
