import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { surveysApi } from '@/api'
import { Spinner, EmptyState, Modal } from '@/components/ui'
import { SearchInput } from '@/components/ui/SearchInput'
import { cn } from '@/utils'

export default function ApplicantsPage() {
  const [search, setSearch]     = useState('')
  const [surveyFilter, setSurveyFilter] = useState('')
  const [detail, setDetail]     = useState<any>(null)

  const { data: surveys = [] } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveysApi.list().then(r => {
      const d = r.data as any
      return Array.isArray(d) ? d : d.results ?? []
    }),
  })

  const { data: applicants = [], isLoading } = useQuery({
    queryKey: ['applicants', surveyFilter],
    queryFn: () => surveysApi.applicants(surveyFilter ? Number(surveyFilter) : undefined).then(r => {
      const d = r.data as any
      return Array.isArray(d) ? d : d.results ?? []
    }),
  })

  const filtered = applicants.filter((a: any) => {
    const q = search.toLowerCase()
    return !q ||
      (a.respondent_name || '').toLowerCase().includes(q) ||
      (a.respondent_phone || '').toLowerCase().includes(q) ||
      (a.respondent_email || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="min-w-[220px] flex-1 max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Ism, telefon, email..." />
        </div>
        <select value={surveyFilter} onChange={e => setSurveyFilter(e.target.value)}
          className="input text-sm h-10 min-w-[200px]">
          <option value="">Barcha so'rovnomalar</option>
          {surveys.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filtered.length} ta arizachi</span>
      </div>

      {/* Table */}
      {isLoading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState message="Arizachi topilmadi" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Arizachi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">So'rovnoma</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Javoblar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sana</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a: any) => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary-700">
                          {(a.respondent_name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{a.respondent_name || <span className="text-gray-400 italic">Anonim</span>}</p>
                        <p className="text-xs text-gray-400">{a.respondent_phone || a.respondent_email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs font-medium max-w-[180px]">
                    <span className="line-clamp-2">{a.survey_title || `#${a.survey}`}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                      {a.answers?.length ?? 0} javob
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    {new Date(a.submitted_at).toLocaleString('uz-UZ', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setDetail(a)}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors">
                      Ko'rish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)}
        title={detail?.respondent_name || 'Anonim arizachi'} size="lg">
        {detail && (
          <div className="space-y-4">
            {/* Contact info */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl text-sm">
              {detail.respondent_name && (
                <div><span className="text-gray-400 text-xs">Ism:</span><p className="font-semibold">{detail.respondent_name}</p></div>
              )}
              {detail.respondent_phone && (
                <div><span className="text-gray-400 text-xs">Telefon:</span><p className="font-semibold">{detail.respondent_phone}</p></div>
              )}
              {detail.respondent_email && (
                <div><span className="text-gray-400 text-xs">Email:</span><p className="font-semibold">{detail.respondent_email}</p></div>
              )}
              <div><span className="text-gray-400 text-xs">Sana:</span>
                <p className="font-semibold">{new Date(detail.submitted_at).toLocaleString('uz-UZ')}</p>
              </div>
            </div>

            {/* Answers */}
            <div className="space-y-3">
              {detail.answers?.map((ans: any, i: number) => (
                <div key={ans.id} className="p-4 bg-white border border-gray-100 rounded-xl">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                    {i + 1}. {ans.question_text}
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {ans.value || <span className="text-gray-400 italic">Javob yo'q</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
