import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { surveysApi } from '@/api'
import { Button, Modal, Spinner, EmptyState, Badge } from '@/components/ui'
import { SearchInput } from '@/components/ui/SearchInput'
import { cn } from '@/utils'
import SurveyBuilderModal from './SurveyBuilderModal'

const STATUS_COLORS: Record<string, string> = {
  draft:  'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-600',
}
const STATUS_LABELS: Record<string, string> = {
  draft: 'Qoralama', active: 'Faol', closed: 'Yopilgan',
}

export default function SurveysPage() {
  const qc = useQueryClient()
  const [search, setSearch]         = useState('')
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editSurvey, setEditSurvey]  = useState<any>(null)
  const [deleteSurvey, setDeleteSurvey] = useState<any>(null)

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveysApi.list().then(r => {
      const d = r.data as any
      return Array.isArray(d) ? d : d.results ?? []
    }),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => surveysApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['surveys'] }); setDeleteSurvey(null); toast.success("O'chirildi") },
    onError: () => toast.error('Xato'),
  })

  const patchMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => surveysApi.patch(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['surveys'] }); toast.success('Yangilandi') },
  })

  const filtered = surveys.filter((s: any) => {
    const q = search.toLowerCase()
    return !q || s.title.toLowerCase().includes(q)
  })

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/survey/${slug}`
    navigator.clipboard.writeText(url)
    toast.success('Havola nusxalandi!')
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div className="min-w-[220px] flex-1 max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="So'rovnoma nomi..." />
        </div>
        <Button onClick={() => { setEditSurvey(null); setBuilderOpen(true) }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Yangi so'rovnoma
        </Button>
      </div>

      {/* List */}
      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState message="So'rovnoma topilmadi" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s: any) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary-500 to-purple-500" />
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">{s.title}</h3>
                  <Badge className={STATUS_COLORS[s.status]}>{STATUS_LABELS[s.status]}</Badge>
                </div>

                {/* Description */}
                {s.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{s.description}</p>
                )}

                {/* Stats row */}
                <div className="flex gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {s.question_count} savol
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {s.response_count} javob
                  </span>
                  {s.is_expired && <span className="text-red-500 font-medium">Muddati tugagan</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap border-t border-gray-50 pt-3">
                  {/* Status toggle */}
                  <button
                    onClick={() => patchMut.mutate({ id: s.id, data: { status: s.status === 'active' ? 'closed' : 'active' } })}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                      s.status === 'active'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    )}
                  >
                    {s.status === 'active' ? 'Yopish' : 'Faollashtirish'}
                  </button>

                  {/* Copy link */}
                  <button
                    onClick={() => copyLink(s.slug)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Havola
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => { setEditSurvey(s); setBuilderOpen(true) }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Tahrirlash
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteSurvey(s)}
                    className="ml-auto px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Builder Modal */}
      <SurveyBuilderModal
        open={builderOpen}
        onClose={() => { setBuilderOpen(false); setEditSurvey(null) }}
        editSurvey={editSurvey}
      />

      {/* Delete confirm */}
      <Modal open={!!deleteSurvey} onClose={() => setDeleteSurvey(null)} title="O'chirishni tasdiqlang" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          "<span className="font-semibold">{deleteSurvey?.title}</span>" so'rovnomasini o'chirasizmi? Barcha javoblar ham o'chadi.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteSurvey(null)}>Bekor qilish</Button>
          <Button variant="danger" onClick={() => deleteMut.mutate(deleteSurvey.id)} loading={deleteMut.isPending}>
            O'chirish
          </Button>
        </div>
      </Modal>
    </div>
  )
}
