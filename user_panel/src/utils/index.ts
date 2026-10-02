import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | null): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('uz-UZ').format(Number(amount)) + " so'm"
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

export function formatTime(t: string): string {
  return t?.slice(0, 5) ?? '—'
}

export const WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
export const MONTHS_UZ = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

/** Keyingi N kunni qaytaradi */
export function getNextDays(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const str = d.toISOString().split('T')[0]
    const wd = d.getDay() === 0 ? 6 : d.getDay() - 1
    return {
      date: str,
      day: d.getDate(),
      month: MONTHS_UZ[d.getMonth()],
      weekday: WEEKDAYS[wd],
      weekdayIndex: wd,
      isToday: i === 0,
    }
  })
}

export type AppStatus =
  | 'pending' | 'confirmed' | 'in_progress'
  | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'

export const STATUS_MAP: Record<AppStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Kutilmoqda',     color: '#d97706', bg: '#fef3c7' },
  confirmed:   { label: 'Tasdiqlangan',   color: '#2563eb', bg: '#dbeafe' },
  in_progress: { label: 'Jarayonda',      color: '#7c3aed', bg: '#ede9fe' },
  completed:   { label: 'Tugagan',        color: '#059669', bg: '#d1fae5' },
  cancelled:   { label: 'Bekor qilingan', color: '#dc2626', bg: '#fee2e2' },
  rescheduled: { label: "Ko'chirilgan",   color: '#ea580c', bg: '#ffedd5' },
  no_show:     { label: 'Kelmadi',        color: '#6b7280', bg: '#f3f4f6' },
}
