import axios from 'axios'
import type { Doctor, Service, Patient, Appointment, TimeSlot } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({ baseURL: BASE, timeout: 12_000 })

api.interceptors.request.use((cfg) => {
  const initData = (window as any).Telegram?.WebApp?.initData
  if (initData) cfg.headers['X-Telegram-Init-Data'] = initData
  return cfg
})

// Paginated yoki array response dan array olish
function toArray<T>(data: T[] | { results: T[] }): T[] {
  return Array.isArray(data) ? data : (data?.results ?? [])
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

export const getDoctors = () =>
  api.get<Doctor[] | { results: Doctor[] }>('/doctors/', { params: { is_active: true } })
    .then(r => toArray(r.data))

export const getDoctor = (id: number) =>
  api.get<Doctor>(`/doctors/${id}/`).then(r => r.data)

export const getDoctorSlots = (doctorId: number, date: string) =>
  api.get<{ slots: TimeSlot[]; message?: string }>(
    `/doctors/${doctorId}/slots/`, { params: { date } }
  ).then(r => r.data)

// ─── Services ────────────────────────────────────────────────────────────────

export const getServices = (doctorId?: number) =>
  api.get<Service[] | { results: Service[] }>('/services/', {
    params: { is_active: true, ...(doctorId ? { doctor_id: doctorId } : {}) }
  }).then(r => toArray(r.data))

// ─── Patient ─────────────────────────────────────────────────────────────────

export const getOrCreatePatient = (data: {
  telegram_id: number
  first_name: string
  last_name?: string
  phone?: string
}) =>
  api.post<Patient>('/patients/', data).then(r => r.data)

export const findPatientByTelegramId = (telegramId: number) =>
  api.get<Patient[] | { results: Patient[] }>(
    '/patients/', { params: { telegram_id: telegramId } }
  ).then(r => toArray(r.data)[0] ?? null)

// ─── Appointments ─────────────────────────────────────────────────────────────

export const createAppointment = (data: {
  patient: number
  doctor: number
  service: number | null
  date: string
  start_time: string
  notes?: string
}) =>
  api.post<Appointment>('/appointments/', data).then(r => r.data)

export const getPatientAppointments = (patientId: number) =>
  api.get<Appointment[] | { results: Appointment[] }>(
    '/appointments/', { params: { patient_id: patientId } }
  ).then(r => toArray(r.data))

export const cancelAppointment = (id: number) =>
  api.post<Appointment>(`/appointments/${id}/cancel/`).then(r => r.data)
