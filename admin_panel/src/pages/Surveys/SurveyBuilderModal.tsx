import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { surveysApi } from '@/api'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

// ─── Question Types ───────────────────────────────────────────────────────────

const Q_TYPES = [
  { value: 'text',     label: 'Qisqa matn',  icon: '✏️' },
  { value: 'textarea', label: 'Uzun matn',   icon: '📝' },
  { value: 'radio',    label: 'Bir tanlov',  icon: '🔘' },
  { value: 'checkbox', label: "Ko'p tanlov", icon: '☑️' },
  { value: 'select',   label: 'Dropdown',    icon: '▼'  },
  { value: 'rating',   label: 'Reyting ⭐', icon: '⭐' },
  { value: 'scale',    label: 'Shkala 1-10', icon: '📊' },
  { value: 'date',     label: 'Sana',        icon: '📅' },
  { value: 'email',    label: 'Email',       icon: '📧' },
  { value: 'phone',    label: 'Telefon',     icon: '📞' },
  { value: 'number',   label: 'Son',         icon: '🔢' },
]

interface QuestionDraft {
  id: string
  question_text: string
  question_type: string
  options: string[]
  is_required: boolean
  help_text: string
}

const newQuestion = (): QuestionDraft => ({
  id: crypto.randomUUID(),
  question_text: '',
  question_type: 'text',
  options: ['Variant 1', 'Variant 2'],
  is_required: false,
  help_text: '',
})

// ─── QuestionEditor ───────────────────────────────────────────────────────────

function QuestionEditor({ q, idx, onChange, onDelete, onMove, total }: {
  q: QuestionDraft
  idx: number
  onChange: (q: QuestionDraft) => void
  onDelete: () => void
  onMove: (dir: 'up' | 'down') => void
  total: number
}) {
  const hasOptions = ['radio', 'checkbox', 'select'].includes(q.question_type)

  return (
    <div className="group bg-white border-2 border-transparent hover:border-primary-200 rounded-2xl p-5
                    transition-all duration-200 shadow-sm">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold
                         flex items-center justify-center flex-shrink-0">
          {idx + 1}
        </span>
        <input
          value={q.question_text}
          onChange={e => onChange({ ...q, question_text: e.target.value })}
          placeholder="Savol matni..."
          className="flex-1 text-sm font-semibold bg-transparent border-b-2 border-gray-200
                     focus:border-primary-500 outline-none pb-1 transition-colors"
        />
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onMove('up')} disabled={idx === 0}
            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center disabled:opacity-30">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
            </svg>
          </button>
          <button type="button" onClick={() => onMove('down')} disabled={idx === total - 1}
            className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center disabled:opacity-30">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <button type="button" onClick={onDelete}
            className="w-6 h-6 rounded hover:bg-red-50 text-red-400 flex items-center justify-center">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap gap-1 mb-3">
        {Q_TYPES.map(t => (
          <button key={t.value} type="button"
            onClick={() => onChange({ ...q, question_type: t.value })}
            className={cn(
              'px-2 py-0.5 rounded-lg text-xs font-medium transition-colors',
              q.question_type === t.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Options */}
      {hasOptions && (
        <div className="space-y-1.5 mb-3 pl-2 border-l-2 border-gray-100">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-gray-300 flex-shrink-0" />
              <input value={opt} onChange={e => onChange({ ...q, options: q.options.map((o, j) => j === i ? e.target.value : o) })}
                className="flex-1 text-sm border-b border-gray-100 focus:border-primary-400 outline-none pb-0.5 bg-transparent"
                placeholder={`Variant ${i + 1}`} />
              {q.options.length > 1 && (
                <button type="button" onClick={() => onChange({ ...q, options: q.options.filter((_, j) => j !== i) })}
                  className="text-gray-300 hover:text-red-400 transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button type="button"
            onClick={() => onChange({ ...q, options: [...q.options, `Variant ${q.options.length + 1}`] })}
            className="text-xs text-primary-600 font-medium flex items-center gap-1 mt-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Variant qo'shish
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={q.is_required}
            onChange={e => onChange({ ...q, is_required: e.target.checked })}
            className="w-3.5 h-3.5 rounded accent-primary-600" />
          <span className="text-xs text-gray-500">Majburiy</span>
        </label>
        <input value={q.help_text} onChange={e => onChange({ ...q, help_text: e.target.value })}
          placeholder="Yordam matni..."
          className="flex-1 text-xs text-gray-400 bg-transparent border-b border-dashed border-gray-200
                     focus:border-primary-400 outline-none pb-0.5" />
      </div>
    </div>
  )
}

// ─── SurveyBuilderModal ───────────────────────────────────────────────────────

interface Props { open: boolean; onClose: () => void; editSurvey: any }

export default function SurveyBuilderModal({ open, onClose, editSurvey }: Props) {
  const qc = useQueryClient()
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus]           = useState<'draft' | 'active' | 'closed'>('draft')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [expiresAt, setExpiresAt]     = useState('')
  const [questions, setQuestions]     = useState<QuestionDraft[]>([newQuestion()])

  useEffect(() => {
    if (editSurvey) {
      setTitle(editSurvey.title || '')
      setDescription(editSurvey.description || '')
      setStatus(editSurvey.status || 'draft')
      setIsAnonymous(editSurvey.is_anonymous ?? true)
      setExpiresAt(editSurvey.expires_at ? editSurvey.expires_at.slice(0, 16) : '')
      setQuestions(editSurvey.questions?.length
        ? editSurvey.questions.map((q: any) => ({
            id: String(q.id), question_text: q.question_text,
            question_type: q.question_type, options: q.options || [],
            is_required: q.is_required, help_text: q.help_text || '',
          }))
        : [newQuestion()])
    } else {
      setTitle(''); setDescription(''); setStatus('draft')
      setIsAnonymous(true); setExpiresAt(''); setQuestions([newQuestion()])
    }
  }, [editSurvey, open])

  const createMut = useMutation({
    mutationFn: (data: any) =>
      editSurvey ? surveysApi.update(editSurvey.id, data) : surveysApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['surveys'] })
      toast.success(editSurvey ? 'Yangilandi' : "So'rovnoma yaratildi!")
      onClose()
    },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const handleSave = () => {
    if (!title.trim()) { toast.error('Sarlavha kiritilmagan'); return }
    const emptyQ = questions.find(q => !q.question_text.trim())
    if (emptyQ) { toast.error('Barcha savol matni kiritilishi shart'); return }
    createMut.mutate({
      title: title.trim(), description, status,
      is_anonymous: isAnonymous, expires_at: expiresAt || null,
      questions: questions.map((q, i) => ({
        question_text: q.question_text, question_type: q.question_type,
        options: q.options, is_required: q.is_required,
        help_text: q.help_text, order: i,
      })),
    })
  }

  const moveQuestion = (idx: number, dir: 'up' | 'down') => {
    const arr = [...questions]
    const t = dir === 'up' ? idx - 1 : idx + 1
    ;[arr[idx], arr[t]] = [arr[t], arr[idx]]
    setQuestions(arr)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">

        {/* Header — clean, no gradient */}
        <div className="bg-white border-b border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editSurvey ? "So'rovnomani tahrirlash" : "Yangi so'rovnoma"}
            </h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="So'rovnoma sarlavhasi *"
            className="w-full text-xl font-bold border-b-2 border-gray-200 focus:border-primary-500
                       outline-none pb-2 mb-3 text-gray-900 placeholder-gray-300 bg-transparent" />

          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Tavsif (ixtiyoriy)..." rows={2}
            className="w-full text-sm text-gray-600 border border-gray-200 rounded-xl p-3
                       resize-none outline-none focus:border-primary-400 transition-colors placeholder-gray-300" />
        </div>

        {/* Settings bar */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex flex-wrap gap-4 items-center">
          <select value={status} onChange={e => setStatus(e.target.value as any)}
            className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none">
            <option value="draft">📝 Qoralama</option>
            <option value="active">✅ Faol</option>
            <option value="closed">🔒 Yopiq</option>
          </select>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
            <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded accent-primary-600" />
            Anonim
          </label>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">Muddat:</span>
            <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white outline-none" />
          </div>
        </div>

        {/* Questions */}
        <div className="px-6 py-5 space-y-3 max-h-[55vh] overflow-y-auto bg-gray-50/50">
          {questions.map((q, i) => (
            <QuestionEditor key={q.id} q={q} idx={i} total={questions.length}
              onChange={updated => setQuestions(qs => qs.map(x => x.id === updated.id ? updated : x))}
              onDelete={() => setQuestions(qs => qs.filter(x => x.id !== q.id))}
              onMove={dir => moveQuestion(i, dir)} />
          ))}
          <button type="button"
            onClick={() => setQuestions(qs => [...qs, newQuestion()])}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400
                       font-medium text-sm hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50
                       transition-all flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Savol qo'shish
          </button>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-gray-400">{questions.length} ta savol</span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Bekor qilish</Button>
            <Button onClick={handleSave} loading={createMut.isPending}>
              {editSurvey ? 'Saqlash' : 'Yaratish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
