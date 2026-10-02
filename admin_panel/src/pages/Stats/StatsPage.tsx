import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { statsApi } from '@/api'
import { Spinner, Card } from '@/components/ui'
import { formatCurrency, formatDate } from '@/utils'

const COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706']

type Period = 'week' | 'month' | 'year'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">
            {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>('week')

  const { data: revenue, isLoading } = useQuery({
    queryKey: ['revenue', period],
    queryFn: () => statsApi.revenue(period).then(r => r.data),
  })

  const totalRevenue = revenue?.daily.reduce((s, d) => s + d.revenue, 0) ?? 0
  const totalAppointments = revenue?.daily.reduce((s, d) => s + d.appointments, 0) ?? 0

  if (isLoading) return <Spinner />

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'year'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p === 'week' ? '7 kun' : p === 'month' ? '30 kun' : '1 yil'}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs text-gray-500 mb-1">Jami tushum</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500 mb-1">Jami qabullar</p>
          <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
        </Card>
      </div>

      {/* Revenue trend */}
      <Card>
        <h2 className="section-title mb-5">Tushum dinamikasi</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={revenue?.daily}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => v.slice(5)}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Tushum" stroke="#2563eb" strokeWidth={2} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top doctors */}
        <Card>
          <h2 className="section-title mb-5">Top shifokorlar</h2>
          {(revenue?.top_doctors ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Ma'lumot yo'q</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue?.top_doctors} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category"
                  dataKey={(d: any) => `${d.doctor__first_name} ${d.doctor__last_name}`.slice(0, 12)}
                  tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Tushum" fill="#2563eb" radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top services */}
        <Card>
          <h2 className="section-title mb-5">Mashhur xizmatlar</h2>
          {(revenue?.top_services ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Ma'lumot yo'q</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={revenue?.top_services}
                  dataKey="count"
                  nameKey="service__name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {revenue?.top_services.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, n: string) => [v, n]} />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ fontSize: 11 }}>
                      {value.length > 16 ? value.slice(0, 16) + '…' : value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Daily table */}
      <Card>
        <h2 className="section-title mb-4">Kunlik ma'lumotlar</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Sana</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Qabullar</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Tushum</th>
              </tr>
            </thead>
            <tbody>
              {[...(revenue?.daily ?? [])].reverse().map(d => (
                <tr key={d.date} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 text-gray-600">{formatDate(d.date)}</td>
                  <td className="py-2.5 text-right font-medium">{d.appointments}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">{formatCurrency(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
