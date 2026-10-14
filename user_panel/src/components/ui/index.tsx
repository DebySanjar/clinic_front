import { cn } from '@/utils'

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="w-8 h-8 border-3 border-gray-200 border-t-primary-600 rounded-full animate-spin"
        style={{ borderWidth: 3 }} />
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeader({
  title, subtitle, back,
}: {
  title: string
  subtitle?: string
  back?: () => void
}) {
  return (
    <div className="px-5 pt-5 pb-3">
      {back && (
        <button onClick={back}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary-600
                     mb-4 -ml-0.5 active:opacity-70 transition-opacity">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Orqaga
        </button>
      )}
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

export function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-5 py-3">
      <div className="flex gap-1.5 mb-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={cn(
            'h-1 flex-1 rounded-full transition-all duration-300',
            i < current ? 'bg-primary-600' : 'bg-gray-200'
          )} />
        ))}
      </div>
      <p className="text-xs font-medium text-gray-400">
        {current}-qadam / {total}
      </p>
    </div>
  )
}

// ─── Select Card ─────────────────────────────────────────────────────────────

export function SelectCard({
  selected, onClick, children, className,
}: {
  selected?: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button onClick={onClick}
      className={cn(
        'select-card',
        selected ? 'select-card--active' : 'select-card--default',
        className
      )}>
      {children}
    </button>
  )
}

// ─── Bottom CTA Button ────────────────────────────────────────────────────────

export function BottomBtn({
  label, onClick, disabled, loading,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3
                    bg-gradient-to-t from-white via-white/95 to-transparent"
         style={{ maxWidth: 480, margin: '0 auto', left: '50%', transform: 'translateX(-50%)', width: '100%' }}>
      <button onClick={onClick} disabled={disabled || loading} className="btn-primary">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Yuklanmoqda...
          </span>
        ) : label}
      </button>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
        </svg>
      </div>
      <p className="font-bold text-gray-800">{title}</p>
      {desc && <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{desc}</p>}
    </div>
  )
}
