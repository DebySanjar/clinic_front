import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({ baseURL: BASE, timeout: 12_000 })

// Bot dan kelgan initData ni header ga qo'shish (backend verify uchun)
api.interceptors.request.use((cfg) => {
  const initData = (window as any).Telegram?.WebApp?.initData
  if (initData) cfg.headers['X-Telegram-Init-Data'] = initData
  return cfg
})

// ─── Doctors ─────────────────────────────────────────────────────────────────

export const getDoctors = () =>
  api.get<import('@/types').Doctor[]>('/doctors/', { params: { is_active: true } })
    .then(r => r.data)

export const getDoctor = (id: number) =>
  api.get<import('@/types').Doctor>(`/doctors/${id}/`).then(r => r.data)

export const getDoctorSlots = (doctorId: number, date: string) =>
  api.get<{ slots: import('@/types').TimeSlot[]; message?: string }>(
    `/doctors/${doctorId}/slots/`, { params: { date } }
  ).then(r => r.data)

// ─── Services ────────────────────────────────────────────────────────────────

export const getServices = (doctorId?: number) =>
  api.get<import('@/types').Service[]>('/services/', {
    params: { is_active: true, doctor_id: doctorId }
  }).then(r => r.data)

// ─── Patient ─────────────────────────────────────────────────────────────────

export const getOrCreatePatient = (data: {
  telegram_id: number
  first_name: string
  last_name?: string
  phone?: string
}) =>
  api.post<import('@/types').Patient>('/patients/', data).then(r => r.data)

export const findPatientByTelegramId = (telegramId: number) =>
  api.get<{ results: import('@/types').Patient[] }>(
    `/patients/?telegram_id=${telegramId}`
  ).then(r => r.data.results[0] ?? null)

// ─── Appointments ─────────────────────────────────────────────────────────────

export const createAppointment = (data: {
  patient: number
  doctor: number
  service: number | null
  date: string
  start_time: string
  notes?: string
}) => api.post<import('@/types').Appointment>('/appointments/', data).then(r => r.data)

export const getPatientAppointments = (patientId: number) =>
  api.get<{ results: import('@/types').Appointment[] }>(
    `/appointments/?patient_id=${patientId}`
  ).then(r => r.data.results)

export const cancelAppointment = (id: number) =>
  api.post<import('@/types').Appointment>(`/appointments/${id}/cancel/`).then(r => r.data)
