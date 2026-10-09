import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { patientsApi } from '@/api'
import { Spinner, EmptyState, Modal, Badge } from '@/components/ui'
import { SearchInput } from '@/components/ui/SearchInput'
import type { Appointment, Patient } from '@/types'
import { formatDate, formatTime, STATUS_CONFIG } from '@/utils'

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null)
  const [patientHistory, setPatientHistory] = useState<Appointment[]>([])

  const { data: result, isLoading } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: () => patientsApi.list({ search: search || undefined, page }).then(r => r.data),
  })

  const patients = result?.results ?? []
  const total = result?.count ?? 0
  const totalPages = Math.ceil(total / 20)

  const openDetail = async (patient: Patient) => {
    setDetailPatient(patient)
    const history = await patientsApi.getAppointments(patient.id)
    setPatientHistory(history.data)
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="min-w-[220px] flex-1 max-w-md">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Ism, familiya yoki telefon..."
          />
        </div>
        <span className="text-sm text-gray-500">{total} ta bemor</span>
      </div>

      {/* Table */}
      {isLoading ? <Spinner /> : patients.length === 0 ? (
        <EmptyState message="Bemor topilmadi" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Bemor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Telefon</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Telegram</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tashriflar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ro'yxat sanasi</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary-700">
                          {p.first_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{p.phone || '—'}</td>
                  <td className="px-4 py-3.5">
                    {p.telegram_id ? (
                      <Badge className="bg-blue-100 text-blue-700">Bot foydalanuvchi</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs">Yo'q</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-gray-900">{p.visit_count}</span>
                    <span className="text-gray-400 text-xs ml-1">marta</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => openDetail(p)}
                      className="text-primary-600 hover:text-primary-800 text-xs font-medium"
                    >
                      Tarixi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >←</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >→</button>
        </div>
      )}

      {/* Patient history modal */}
      <Modal
        open={!!detailPatient}
        onClose={() => { setDetailPatient(null); setPatientHistory([]) }}
        title={`${detailPatient?.full_name} — Qabullar tarixi`}
        size="lg"
      >
        {patientHistory.length === 0 ? (
          <EmptyState message="Qabul tarixi topilmadi" />
        ) : (
          <div className="space-y-0">
            {patientHistory.map(appt => {
              const sc = STATUS_CONFIG[appt.status]
              return (
                <div key={appt.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appt.doctor_name}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(appt.date)} · {formatTime(appt.start_time)} · {appt.service_name ?? '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={sc.color}>{sc.label}</Badge>
                    {appt.price && <p className="text-xs text-gray-500 mt-1">{appt.price.toLocaleString()} so'm</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal>
    </div>
  )
}
