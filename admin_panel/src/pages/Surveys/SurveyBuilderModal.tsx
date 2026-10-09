import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { surveysApi } from '@/api'
import { Button, Modal } from '@/components/ui'
import { cn } from '@/utils'

// ─── Question Types ───────────────────────────────────────────────────────────

const Q_TYPES = [
  { value: 'text',     label: 'Qisqa matn',        icon: '✏️' },
  { value: 'textarea', label: 'Uzun matn',          icon: '📝' },
  { value: 'radio',    label: 'Bir tanlov',         icon: '🔘' },
  { value: 'checkbox', label: "Ko'p tanlov",        icon: '☑️' },
  { value: 'select',   label: 'Dropdown',           icon: '▼' },
  { value: 'rating',   label: 'Reyting (1-5 ⭐)',  icon: '⭐' },
  { value: 'scale',    label: 'Shkala (1-10)',      icon: '📊' },
  { value: 'date',     label: 'Sana',               icon: '📅' },
  { value: 'email',    label: 'Email',              icon: '📧' },
  { value: 'phone',    label: 'Telefon',            icon: '📞' },
  { value: 'number',   label: 'Son',                icon: '🔢' },
]

interface QuestionDraft {
  id: string  // temp id
  question_text: string
  question_type: string
  options: string[]
  is_required: boolean
  placeholder: string
  help_text: string
}

const newQuestion = (): QuestionDraft => ({
  id: crypto.randomUUID(),
  question_text: '',
  question_type: 'text',
  options: ['Variant 1', 'Variant 2'],
  is_required: false,
  placeholder: '',
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

  const addOption = () => onChange({ ...q, options: [...q.options, `Variant ${q.options.length + 1}`] })
  const removeOption = (i: number) => onChange({ ...q, options: q.options.filter((_, j) => j !== i) })
  const setOption = (i: number, val: string) => onChange({
    ...q, options: q.options.map((o, j) => j === i ? val : o),
  })

  return (
    <div className="group bg-white border-2 border-transparent hover:border-primary-200 rounded-2xl p-5
                    transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Question header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold
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

        {/* Move & delete */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onMove('up')} disabled={idx === 0}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button onClick={() => onMove('down')} disabled={idx === total - 1}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button onClick={onDelete}
            className="w-7 h-7 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Type selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Q_TYPES.map(t => (
          <button key={t.value}
            onClick={() => onChange({ ...q, question_type: t.value })}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
              q.question_type === t.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Options (for radio/checkbox/select) */}
      {hasOptions && (
        <div className="space-y-2 mb-3 pl-2">
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
              <input
                value={opt}
                onChange={e => setOption(i, e.target.value)}
                className="flex-1 text-sm border-b border-gray-200 focus:border-primary-400 outline-none pb-0.5"
                placeholder={`Variant ${i + 1}`}
              />
              {q.options.length > 1 && (
                <button onClick={() => removeOption(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button onClick={addOption}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium mt-1 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Variant qo'shish
          </button>
        </div>
      )}

      {/* Footer: required toggle + help text */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={q.is_required}
            onChange={e => onChange({ ...q, is_required: e.target.checked })}
            className="w-4 h-4 rounded accent-primary-600" />
          <span className="text-xs text-gray-500 font-medium">Majburiy</span>
        </label>
        <input
          value={q.help_text}
          onChange={e => onChange({ ...q, help_text: e.target.value })}
          placeholder="Yordam matni (ixtiyoriy)..."
          className="flex-1 text-xs text-gray-400 bg-transparent border-b border-dashed border-gray-200
                     focus:border-primary-400 outline-none pb-0.5"
        />
      </div>
    </div>
  )
}

// ─── SurveyBuilderModal ───────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  editSurvey: any
}

export default function SurveyBuilderModal({ open, onClose, editSurvey }: Props) {
  const qc = useQueryClient()

  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus]         = useState<'draft' | 'active'>('draft')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [expiresAt, setExpiresAt]   = useState('')
  const [questions, setQuestions]   = useState<QuestionDraft[]>([newQuestion()])

  // Populate when editing
  useEffect(() => {
    if (editSurvey) {
      setTitle(editSurvey.title || '')
      setDescription(editSurvey.description || '')
      setStatus(editSurvey.status || 'draft')
      setIsAnonymous(editSurvey.is_anonymous ?? true)
      setExpiresAt(editSurvey.expires_at ? editSurvey.expires_at.slice(0, 16) : '')
      if (editSurvey.questions?.length) {
        setQuestions(editSurvey.questions.map((q: any) => ({
          id: String(q.id),
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options || [],
          is_required: q.is_required,
          placeholder: q.placeholder || '',
          help_text: q.help_text || '',
        })))
      }
    } else {
      setTitle(''); setDescription(''); setStatus('draft')
      setIsAnonymous(true); setExpiresAt('')
      setQuestions([newQuestion()])
    }
  }, [editSurvey, open])

  const createMut = useMutation({
    mutationFn: (data: any) => editSurvey ? surveysApi.update(editSurvey.id, data) : surveysApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['surveys'] })
      toast.success(editSurvey ? 'Yangilandi' : "So'rovnoma yaratildi!")
      onClose()
    },
    onError: () => toast.error('Xato yuz berdi'),
  })

  const handleSave = () => {
    if (!title.trim()) { toast.error('Sarlavha kiritilmagan'); return }
    createMut.mutate({
      title: title.trim(),
      description,
      status,
      is_anonymous: isAnonymous,
      expires_at: expiresAt || null,
      questions: questions.map((q, i) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        is_required: q.is_required,
        placeholder: q.placeholder,
        help_text: q.help_text,
        order: i,
      })),
    })
  }

  const moveQuestion = (idx: number, dir: 'up' | 'down') => {
    const newQ = [...questions]
    const target = dir === 'up' ? idx - 1 : idx + 1
    ;[newQ[idx], newQ[target]] = [newQ[target], newQ[idx]]
    setQuestions(newQ)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-gray-50 rounded-3xl shadow-2xl overflow-hidden mb-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {editSurvey ? "So'rovnomani tahrirlash" : "Yangi so'rovnoma"}
            </h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="So'rovnoma sarlavhasi..."
            className="w-full bg-white/20 border-0 border-b-2 border-white/50 focus:border-white
                       text-white placeholder-white/60 text-xl font-bold outline-none pb-2 mb-3"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Tavsif (ixtiyoriy)..."
            rows={2}
            className="w-full bg-white/10 border border-white/20 rounded-xl text-white/90
                       placeholder-white/50 text-sm outline-none p-3 resize-none focus:border-white/50 transition-colors"
          />
        </div>

        {/* Settings bar */}
        <div className="bg-white border-b border-gray-100 px-8 py-3 flex flex-wrap gap-4 items-center">
          <select value={status} onChange={e => setStatus(e.target.value as any)}
            className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-primary-400">
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
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-primary-400" />
          </div>
        </div>

        {/* Questions */}
        <div className="px-8 py-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {questions.map((q, i) => (
            <QuestionEditor
              key={q.id}
              q={q}
              idx={i}
              total={questions.length}
              onChange={updated => setQuestions(qs => qs.map(x => x.id === updated.id ? updated : x))}
              onDelete={() => setQuestions(qs => qs.filter(x => x.id !== q.id))}
              onMove={dir => moveQuestion(i, dir)}
            />
          ))}

          {/* Add question button */}
          <button
            onClick={() => setQuestions(qs => [...qs, newQuestion()])}
            className="w-full py-4 border-2 border-dashed border-primary-300 rounded-2xl
                       text-primary-600 font-semibold text-sm hover:border-primary-500 hover:bg-primary-50
                       transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Savol qo'shish
          </button>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-100 px-8 py-4 flex justify-between items-center">
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
