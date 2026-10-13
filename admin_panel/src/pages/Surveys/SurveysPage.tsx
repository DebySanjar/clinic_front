import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { surveysApi } from '@/api'
import { Button, Modal, Spinner, EmptyState } from '@/components/ui'
import { SearchInput } from '@/components/ui/SearchInput'
import { cn } from '@/utils'
import SurveyBuilderModal from './SurveyBuilderModal'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; label: string; dot: string }> = {
  draft:  { color: 'bg-gray-100 text-gray-600',   label: 'Qoralama', dot: 'bg-gray-400'  },
  active: { color: 'bg-green-100 text-green-700', label: 'Faol',     dot: 'bg-green-500' },
  closed: { color: 'bg-red-100 text-red-600',     label: 'Yopilgan', dot: 'bg-red-400'   },
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const EyeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  </svg>
)
const LinkIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
  </svg>
)
const EditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
)
const TrashIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
)
const PowerIcon = ({ active }: { active: boolean }) => active ? (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
  </svg>
) : (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 12.728M12 3v9"/>
  </svg>
)

// ─── SurveyCard ───────────────────────────────────────────────────────────────

function SurveyCard({ s, onEdit, onDelete, onToggle, onCopyLink, onPreview }: {
  s: any
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onCopyLink: () => void
  onPreview: () => void
}) {
  const sc = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.draft

  return (
    <div className={cn(
      'group relative bg-white rounded-2xl border border-gray-100 overflow-hidden',
      'transition-all duration-300 cursor-default',
      'shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
      'hover:shadow-[0_12px_32px_rgba(79,70,229,0.15),0_4px_12px_rgba(0,0,0,0.08)]',
      'hover:-translate-y-1.5 hover:border-primary-100',
    )}>
      {/* Left accent bar */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300',
        s.status === 'active' ? 'bg-green-400' : s.status === 'closed' ? 'bg-red-300' : 'bg-gray-200'
      )} />

      <div className="pl-4 pr-4 pt-4 pb-3 ml-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 flex-1 pr-1">
            {s.title}
          </h3>
          {/* Status badge */}
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1', sc.color)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
            {sc.label}
          </span>
        </div>

        {/* Description */}
        {s.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mb-3">{s.description}</p>
        )}

        {/* Stats chips */}
        <div className="flex gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {s.question_count} savol
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs font-semibold">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {s.response_count} javob
          </span>
          {s.is_expired && (
            <span className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-xs font-semibold">Muddati tugagan</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 pt-2.5 border-t border-gray-50">
          {/* Preview */}
          <button onClick={onPreview} title="Ko'rish"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                       hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <EyeIcon />
          </button>

          {/* Copy link */}
          <button onClick={onCopyLink} title="Havolani nusxalash"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                       hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
            <LinkIcon />
          </button>

          {/* Edit */}
          <button onClick={onEdit} title="Tahrirlash"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                       hover:bg-amber-50 hover:text-amber-600 transition-colors">
            <EditIcon />
          </button>

          {/* Toggle active/closed */}
          <button onClick={onToggle}
            title={s.status === 'active' ? 'Yopish' : 'Faollashtirish'}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              s.status === 'active'
                ? 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
            )}>
            <PowerIcon active={s.status === 'active'} />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Delete */}
          <button onClick={onDelete} title="O'chirish"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300
                       hover:bg-red-50 hover:text-red-500 transition-colors">
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SurveysPage ──────────────────────────────────────────────────────────────

export default function SurveysPage() {
  const qc = useQueryClient()
  const [search,       setSearch]       = useState('')
  const [builderOpen,  setBuilderOpen]  = useState(false)
  const [editSurvey,   setEditSurvey]   = useState<any>(null)
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }),
  })

  const filtered = surveys.filter((s: any) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase())
  )

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/survey/${slug}`)
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

      {/* Cards */}
      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState message="So'rovnoma topilmadi" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s: any) => (
            <SurveyCard
              key={s.id}
              s={s}
              onEdit={() => { setEditSurvey(s); setBuilderOpen(true) }}
              onDelete={() => setDeleteSurvey(s)}
              onToggle={() => patchMut.mutate({
                id: s.id,
                data: { status: s.status === 'active' ? 'closed' : 'active' }
              })}
              onCopyLink={() => copyLink(s.slug)}
              onPreview={() => window.open(`/survey/${s.slug}`, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Builder */}
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
