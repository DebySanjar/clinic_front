import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AppointmentStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | null): string {
  if (amount === null || amount === undefined) return '—'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('uz-UZ').format(num) + " so'm"
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '—'
  return timeStr.slice(0, 5)
}

export function formatDateTime(dtStr: string): string {
  if (!dtStr) return '—'
  const dt = new Date(dtStr)
  return dt.toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string }> = {
  pending:     { label: 'Kutilmoqda',      color: 'bg-yellow-100 text-yellow-700' },
  confirmed:   { label: 'Tasdiqlangan',    color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Jarayonda',       color: 'bg-purple-100 text-purple-700' },
  completed:   { label: 'Tugagan',         color: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Bekor qilingan',  color: 'bg-red-100 text-red-700' },
  rescheduled: { label: "Ko'chirilgan",    color: 'bg-orange-100 text-orange-700' },
  no_show:     { label: 'Kelmadi',         color: 'bg-gray-100 text-gray-600' },
}

export const WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
export const WEEKDAYS_FULL = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getNextDays(count: number): { date: string; label: string; weekday: string }[] {
  const days = []
  for (let i = 0; i < count; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const weekday = WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]
    const label = i === 0 ? 'Bugun' : i === 1 ? 'Ertaga' : formatDate(dateStr)
    days.push({ date: dateStr, label, weekday })
  }
  return days
}
