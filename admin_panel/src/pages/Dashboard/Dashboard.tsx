import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { statsApi } from '@/api'
import { Spinner, Badge } from '@/components/ui'
import { formatCurrency, formatDate, formatTime, STATUS_CONFIG } from '@/utils'

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon, color
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card-md px-3 py-2 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{
            p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value
          }</span>
        </p>
      ))}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => statsApi.dashboard().then(r => r.data),
    refetchInterval: 60_000,
  })

  const { data: revenue } = useQuery({
    queryKey: ['revenue', 'week'],
    queryFn: () => statsApi.revenue('week').then(r => r.data),
  })

  if (statsLoading || !stats) return <Spinner />

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bugungi qabullar"
          value={stats.today_appointments}
          sub={`${stats.today_completed} tugagan`}
          color="bg-blue-50"
          icon={
            <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          }
        />
        <StatCard
          label="Bugungi tushum"
          value={formatCurrency(stats.today_revenue)}
          sub="Tugagan qabullar"
          color="bg-green-50"
          icon={
            <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
        />
        <StatCard
          label="Jami bemorlar"
          value={stats.total_patients}
          sub="Ro'yxatga olingan"
          color="bg-purple-50"
          icon={
            <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          }
        />
        <StatCard
          label="Faol shifokorlar"
          value={stats.active_doctors}
          sub="Klinikada"
          color="bg-orange-50"
          icon={
            <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Haftalik tushum</h2>
            <div className="text-right">
              <p className="text-xs text-gray-400">Bu hafta</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(stats.week_revenue)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue?.daily ?? []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(8)}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Tushum"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Qabullar</h2>
            <span className="text-xs text-gray-400">7 kun</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenue?.daily ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(8)}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="appointments"
                name="Qabullar"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month summary + Recent appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Month summary */}
        <div className="card space-y-4">
          <h2 className="section-title">Bu oy</h2>
          <div className="space-y-3">
            {[
              { label: 'Jami qabullar', value: stats.month_appointments, icon: '📅' },
              { label: 'Tushum', value: formatCurrency(stats.month_revenue), icon: '💰' },
              { label: 'Bekor qilingan', value: stats.today_cancelled, icon: '❌' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent appointments */}
        <div className="card lg:col-span-2">
          <h2 className="section-title mb-4">So'nggi qabullar</h2>
          <div className="space-y-0">
            {stats.recent_appointments.slice(0, 6).map((appt) => {
              const sc = STATUS_CONFIG[appt.status]
              return (
                <div key={appt.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-700">
                      {appt.patient_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{appt.patient_name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {appt.doctor_name} · {formatDate(appt.date)} {formatTime(appt.start_time)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className={sc.color}>{sc.label}</Badge>
                    {appt.price && (
                      <p className="text-xs text-gray-400 mt-1">{formatCurrency(appt.price)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
