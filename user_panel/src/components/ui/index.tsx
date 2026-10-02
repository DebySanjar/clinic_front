import { cn } from '@/utils'

// ─── Spinner ────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  )
}

// ─── Page Header ────────────────────────────────────────────────────────────

export function PageHeader({
  title, subtitle, back
}: { title: string; subtitle?: string; back?: () => void }) {
  return (
    <div className="px-4 pt-4 pb-2">
      {back && (
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-sm text-primary-600 mb-3 -ml-1"
        >
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

// ─── Step Indicator ──────────────────────────────────────────────────────────

export function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 px-4 pt-2 pb-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-all duration-300',
            i < current ? 'bg-primary-600' : 'bg-gray-200'
          )}
        />
      ))}
    </div>
  )
}

// ─── Selection Card ──────────────────────────────────────────────────────────

export function SelectCard({
  selected, onClick, children, className,
}: {
  selected?: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 active:scale-[0.98]',
        selected
          ? 'border-primary-600 bg-primary-50'
          : 'border-gray-100 bg-white hover:border-gray-200',
        className
      )}
    >
      {children}
    </button>
  )
}

// ─── Bottom CTA Button ───────────────────────────────────────────────────────

export function BottomBtn({
  label, onClick, disabled, loading, variant = 'primary',
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'danger'
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-white via-white to-transparent">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'w-full py-4 rounded-2xl text-white font-semibold text-base',
          'transition-all duration-150 active:scale-[0.98]',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variant === 'primary'
            ? 'bg-primary-600 shadow-lg shadow-primary-200'
            : 'bg-red-500 shadow-lg shadow-red-100'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      {desc && <p className="text-sm text-gray-400 mt-1">{desc}</p>}
    </div>
  )
}

// ─── Toast-like inline alert ──────────────────────────────────────────────────

export function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
  return (
    <div className={cn(
      'mx-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2',
      type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
    )}>
      {type === 'error' ? '❌' : '✅'} {message}
    </div>
  )
}
