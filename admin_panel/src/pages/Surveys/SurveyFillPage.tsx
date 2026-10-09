import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import styled from 'styled-components'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// ─── Loader animation ─────────────────────────────────────────────────────────

const StyledLoader = styled.div`
  .loader {
    transform: rotateX(70deg);
  }
  .loader .element {
    display: block;
    border-left: 5px solid rgb(120, 47, 255);
    border-right: 5px solid rgb(120, 47, 255);
    border-top: dotted 2px rgb(92, 5, 114);
    width: 10rem;
    height: 1rem;
    margin-top: 0.5rem;
    perspective: 1000px;
    animation: rotate 5s infinite linear;
    animation-delay: calc(var(--i, 1) * 0.2s);
  }
  @keyframes rotate {
    100% { transform: rotateY(360deg); }
  }
  .success-check {
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }
`

function Loader() {
  return (
    <StyledLoader>
      <div className="loader">
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} style={{ '--i': i + 1 } as React.CSSProperties} className="element" />
        ))}
      </div>
    </StyledLoader>
  )
}

function SuccessCheck() {
  return (
    <StyledLoader>
      <div className="success-check flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900">Rahmat!</h3>
          <p className="text-gray-500 mt-1">Javobingiz muvaffaqiyatli yuborildi.</p>
        </div>
      </div>
    </StyledLoader>
  )
}

// ─── Question renderer ────────────────────────────────────────────────────────

function QuestionField({ q, value, onChange }: {
  q: any; value: string; onChange: (v: string) => void
}) {
  const base = "w-full border-b-2 border-gray-200 focus:border-primary-500 outline-none bg-transparent py-2 text-gray-800 text-sm transition-colors"

  switch (q.question_type) {
    case 'textarea':
      return (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={4}
          placeholder={q.placeholder || 'Javobingizni kiriting...'}
          className="w-full border-2 border-gray-200 focus:border-primary-500 outline-none rounded-xl p-3 text-sm resize-none transition-colors" />
      )
    case 'radio':
      return (
        <div className="space-y-2 mt-2">
          {q.options?.map((opt: string) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                              ${value === opt ? 'border-primary-600 bg-primary-600' : 'border-gray-300 group-hover:border-primary-400'}`}>
                {value === opt && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm text-gray-700">{opt}</span>
              <input type="radio" className="sr-only" checked={value === opt} onChange={() => onChange(opt)} />
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <div className="space-y-2 mt-2">
          {q.options?.map((opt: string) => {
            let selected: string[] = []
            try { selected = JSON.parse(value || '[]') } catch { selected = [] }
            const checked = selected.includes(opt)
            return (
              <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                                ${checked ? 'border-primary-600 bg-primary-600' : 'border-gray-300 group-hover:border-primary-400'}`}>
                  {checked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span className="text-sm text-gray-700">{opt}</span>
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => {
                  const next = checked ? selected.filter(x => x !== opt) : [...selected, opt]
                  onChange(JSON.stringify(next))
                }} />
              </label>
            )
          })}
        </div>
      )
    case 'select':
      return (
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full border-2 border-gray-200 focus:border-primary-500 outline-none rounded-xl p-3 text-sm bg-white">
          <option value="">Tanlang...</option>
          {q.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )
    case 'rating':
      return (
        <div className="flex gap-2 mt-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button" onClick={() => onChange(String(n))}
              className={`text-3xl transition-transform hover:scale-110 ${Number(value) >= n ? '' : 'opacity-30'}`}>
              ⭐
            </button>
          ))}
        </div>
      )
    case 'scale':
      return (
        <div className="mt-3">
          <input type="range" min={1} max={10} value={value || 5} onChange={e => onChange(e.target.value)}
            className="w-full accent-primary-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span><span className="font-bold text-primary-600 text-sm">{value || 5}</span><span>10</span>
          </div>
        </div>
      )
    case 'date':
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} className={base} />
    case 'email':
      return <input type="email" value={value} onChange={e => onChange(e.target.value)} placeholder={q.placeholder || 'email@example.com'} className={base} />
    case 'phone':
      return <input type="tel" value={value} onChange={e => onChange(e.target.value)} placeholder={q.placeholder || '+998 90 000 00 00'} className={base} />
    case 'number':
      return <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={q.placeholder || '0'} className={base} />
    default:
      return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={q.placeholder || 'Javobingizni kiriting...'} className={base} />
  }
}

// ─── SurveyFillPage ───────────────────────────────────────────────────────────

export default function SurveyFillPage() {
  const { slug } = useParams<{ slug: string }>()
  const [answers, setAnswers]   = useState<Record<number, string>>({})
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('+998')
  const [email, setEmail]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  const { data: survey, isLoading, isError } = useQuery({
    queryKey: ['public-survey', slug],
    queryFn: () => axios.get(`${BASE_URL}/public/survey/${slug}/`).then(r => r.data),
    retry: false,
  })

  const setAnswer = (qId: number, val: string) =>
    setAnswers(prev => ({ ...prev, [qId]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!survey) return

    // Validate required
    for (const q of survey.questions) {
      if (q.is_required && !answers[q.id]?.trim()) {
        setError(`"${q.question_text}" majburiy javob berilmagan`)
        return
      }
    }
    setError('')
    setSubmitting(true)

    try {
      await axios.post(`${BASE_URL}/public/survey/${slug}/`, {
        respondent_name:  name,
        respondent_phone: phone,
        respondent_email: email,
        answers: survey.questions.map((q: any) => ({
          question_id: q.id,
          value: answers[q.id] || '',
        })),
      })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Xato yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <Loader />
        <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
      </div>
    </div>
  )

  if (isError || !survey) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="text-xl font-bold text-gray-800">So'rovnoma topilmadi</h2>
        <p className="text-gray-500 mt-2">Havola noto'g'ri yoki so'rovnoma faol emas.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50/30 to-indigo-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Survey header card */}
        <div className="rounded-3xl overflow-hidden shadow-lg">
          <div className="h-2.5 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
          <div className="bg-white px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h1>
            {survey.description && <p className="text-gray-500">{survey.description}</p>}
          </div>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 flex flex-col items-center">
            <SuccessCheck />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact (if not anonymous) */}
            {!survey.is_anonymous && (
              <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Aloqa ma'lumotlari</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Ism Familiya</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Alisher Karimov"
                      className="w-full border-b-2 border-gray-200 focus:border-primary-500 outline-none pb-2 text-sm transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Telefon</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full border-b-2 border-gray-200 focus:border-primary-500 outline-none pb-2 text-sm transition-colors" />
                  </div>
                </div>
              </div>
            )}

            {/* Questions */}
            {survey.questions?.map((q: any, i: number) => (
              <div key={q.id} className="bg-white rounded-3xl shadow-sm p-6 border-l-4 border-primary-400">
                <div className="flex items-start gap-2 mb-4">
                  <span className="text-xs font-bold text-primary-600 mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-900 leading-snug">
                      {q.question_text}
                      {q.is_required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    {q.help_text && <p className="text-xs text-gray-400 mt-0.5">{q.help_text}</p>}
                  </div>
                </div>
                <QuestionField q={q} value={answers[q.id] || ''} onChange={v => setAnswer(q.id, v)} />
              </div>
            ))}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between bg-white rounded-3xl shadow-sm px-6 py-4">
              <p className="text-xs text-gray-400">
                {Object.keys(answers).length} / {survey.questions?.length || 0} savol javoblandi
              </p>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-purple-600
                           text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-lg">
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    Yuborish
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
