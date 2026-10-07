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
  label, value, sub, icon, gradient
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  gradient: string
}) {
  return (
    <div className="card group cursor-default">
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 
                        bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1 font-medium">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-2xl shadow-card-lg px-4 py-3 text-sm border border-white/40">
      <p className="font-bold text-gray-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome header */}
      <div className="glass rounded-3xl p-6 border-2 border-white/50 shadow-card-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl 
                          flex items-center justify-center shadow-glow-blue">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C9.24 2 7 4.24 7 7s.81 3.19 1.41 4.46l.89 3.1c.35 1.24.7 2.44 1.7 2.44s1.35-1.2 1.7-2.44l.89-2.78c.21-.65.41-1.1.91-1.1s.7.45.91 1.10l.89 2.78c.35 1.24.7 2.44 1.7 2.44s1.35-1.2 1.7-2.44l.89-3.1C16.19 10.19 17 8.76 17 7c0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title text-2xl">DentFlow Dashboard</h1>
            <p className="text-sm text-gray-600 font-medium mt-0.5">
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bugungi qabullar"
          value={stats.today_appointments}
          sub={`${stats.today_completed} tugagan, ${stats.today_cancelled} bekor`}
          gradient="from-blue-500 to-blue-600"
          icon={
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/>
              <path strokeLinecap="round" d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
            </svg>
          }
        />
        <StatCard
          label="Bugungi daromad"
          value={formatCurrency(stats.today_revenue)}
          sub="Tugallangan qabullar"
          gradient="from-emerald-500 to-green-600"
          icon={
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          }
        />
        <StatCard
          label="Jami bemorlar"
          value={stats.total_patients}
          sub="Ro'yxatdan o'tgan"
          gradient="from-purple-500 to-purple-600"
          icon={
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          }
        />
        <StatCard
          label="Faol shifokorlar"
          value={stats.active_doctors}
          sub="Hozirda klinikada"
          gradient="from-orange-500 to-red-500"
          icon={
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Haftalik daromad</h2>
              <p className="text-xs text-gray-500 mt-1">So'nggi 7 kunlik tushum statistikasi</p>
            </div>
            <div className="text-right glass px-4 py-2 rounded-xl border border-white/40">
              <p className="text-xs text-gray-500 font-semibold">Jami</p>
              <p className="text-lg font-bold text-primary-700">{formatCurrency(stats.week_revenue)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue?.daily ?? []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(8)}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Daromad"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Qabullar soni</h2>
              <p className="text-xs text-gray-500 mt-1">Kunlik qabullar</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue?.daily ?? []}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(8)}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="appointments"
                name="Qabullar"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Month summary */}
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            Oylik xulosa
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Qabullar', value: stats.month_appointments, icon: '📅', color: 'text-blue-600' },
              { label: 'Daromad', value: formatCurrency(stats.month_revenue), icon: '💰', color: 'text-green-600' },
              { label: 'Bekor qilingan', value: stats.today_cancelled, icon: '❌', color: 'text-red-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 glass rounded-xl border border-white/40">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent appointments */}
        <div className="card lg:col-span-2">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            So'nggi qabullar
          </h2>
          <div className="space-y-2">
            {stats.recent_appointments.slice(0, 5).map((appt) => {
              const sc = STATUS_CONFIG[appt.status]
              return (
                <div key={appt.id} className="flex items-center gap-3 p-3 glass rounded-xl border border-white/40 
                                               hover:border-primary-300 transition-all duration-200 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl 
                                  flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-sm font-bold text-white">
                      {appt.patient_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{appt.patient_name}</p>
                    <p className="text-xs text-gray-500 truncate font-medium">
                      {appt.doctor_name} · {formatDate(appt.date)} {formatTime(appt.start_time)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className={sc.color}>{sc.label}</Badge>
                    {appt.price && (
                      <p className="text-xs text-gray-600 mt-1 font-semibold">{formatCurrency(appt.price)}</p>
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
