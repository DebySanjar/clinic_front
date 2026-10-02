export interface Doctor {
  id: number
  full_name: string
  first_name: string
  last_name: string
  speciality: string
  photo: string | null
  slot_duration: number
  work_start: string
  work_end: string
  work_days: number[]
  services: Service[]
}

export interface Service {
  id: number
  name: string
  price: number
  price_formatted: string
  duration: number
  category_name: string | null
}

export interface TimeSlot {
  time: string
  is_available: boolean
  appointment_id: number | null
}

export interface Patient {
  id: number
  telegram_id: number | null
  first_name: string
  last_name: string
  full_name: string
  phone: string
}

export type AppStatus =
  | 'pending' | 'confirmed' | 'in_progress'
  | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'

export interface Appointment {
  id: number
  patient: number
  patient_name: string
  doctor: number
  doctor_name: string
  service: number | null
  service_name: string | null
  date: string
  start_time: string
  end_time: string
  status: AppStatus
  status_display: string
  notes: string
  price: number | null
}

export interface BookingState {
  doctor: Doctor | null
  service: Service | null
  date: string | null
  time: string | null
}
