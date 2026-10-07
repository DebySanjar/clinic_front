import { cn } from '@/utils'

// ─── Spinner ────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-accent-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      </div>
    </div>
  )
}

// ─── Page Header ────────────────────────────────────────────────────────────

export function PageHeader({
  title, subtitle, back
}: { title: string; subtitle?: string; back?: () => void }) {
  return (
    <div className="px-5 pt-5 pb-3">
      {back && (
        <button
          onClick={back}
          className="flex items-center gap-1.5 text-sm font-medium text-primary-600 mb-4 -ml-1 active:scale-95 transition-transform"
        >
          <div className="w-7 h-7 bg-primary-50 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          Orqaga
        </button>
      )}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 font-medium">{subtitle}</p>}
    </div>
  )
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

export function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex gap-2 px-5 py-4">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              i < current 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-sm' 
                : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      <div className="px-5 pb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Qadam {current} / {total}
        </p>
      </div>
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
        'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98]',
        selected
          ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-purple-50 shadow-lg shadow-primary-100'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md',
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
    <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'w-full py-4 rounded-2xl text-white font-bold text-base',
          'transition-all duration-200 active:scale-[0.97]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
          variant === 'primary'
            ? 'bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg shadow-primary-200 hover:shadow-xl'
            : 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-100 hover:shadow-xl'
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
        <svg className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="font-bold text-gray-800 text-lg">{title}</p>
      {desc && <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs">{desc}</p>}
    </div>
  )
}

// ─── Toast-like inline alert ──────────────────────────────────────────────────

export function Alert({ type, message }: { type: 'error' | 'success' | 'info'; message: string }) {
  return (
    <div className={cn(
      'mx-4 p-4 rounded-2xl text-sm font-medium flex items-center gap-3 shadow-soft',
      type === 'error' && 'bg-red-50 text-red-700 border border-red-100',
      type === 'success' && 'bg-green-50 text-green-700 border border-green-100',
      type === 'info' && 'bg-blue-50 text-blue-700 border border-blue-100'
    )}>
      <span className="text-lg">
        {type === 'error' && '❌'}
        {type === 'success' && '✅'}
        {type === 'info' && 'ℹ️'}
      </span>
      <span className="flex-1">{message}</span>
    </div>
  )
}
