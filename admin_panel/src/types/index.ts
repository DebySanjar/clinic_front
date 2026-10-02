// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

// ─── Doctor ──────────────────────────────────────────────────────────────────

export interface Doctor {
  id: number
  first_name: string
  last_name: string
  full_name: string
  speciality: string
  phone: string
  telegram_id: number | null
  photo: string | null
  slot_duration: number
  work_start: string
  work_end: string
  break_start: string | null
  break_end: string | null
  work_days: number[]
  is_active: boolean
  services: Service[]
  today_appointments: number
  created_at: string
  updated_at?: string
}

export type DoctorFormData = Omit<Doctor,
  'id' | 'full_name' | 'today_appointments' | 'created_at' | 'updated_at' | 'services'
> & { service_ids?: number[] }

// ─── Service ─────────────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: number
  name: string
  icon: string
  order: number
}

export interface Service {
  id: number
  name: string
  name_ru: string
  description: string
  price: number
  price_formatted: string
  duration: number
  category: number | null
  category_name: string | null
  is_active: boolean
  doctors?: number[]
}

export type ServiceFormData = Omit<Service, 'id' | 'price_formatted'>

// ─── Patient ─────────────────────────────────────────────────────────────────

export interface Patient {
  id: number
  telegram_id: number | null
  first_name: string
  last_name: string
  full_name: string
  phone: string
  notes: string
  visit_count: number
  created_at: string
}

// ─── Appointment ─────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show'

export interface Appointment {
  id: number
  patient: number
  patient_name: string
  patient_phone: string
  doctor: number
  doctor_name: string
  service: number | null
  service_name: string | null
  date: string
  start_time: string
  end_time: string
  actual_start: string | null
  actual_end: string | null
  status: AppointmentStatus
  status_display: string
  notes: string
  price: number | null
  delay_minutes: number
  created_at: string
  updated_at: string
}

export interface AppointmentCreateData {
  patient: number
  doctor: number
  service: number | null
  date: string
  start_time: string
  notes?: string
}

// ─── Slot ────────────────────────────────────────────────────────────────────

export interface TimeSlot {
  time: string
  is_available: boolean
  appointment_id: number | null
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface DashboardStats {
  today_appointments: number
  today_completed: number
  today_cancelled: number
  today_revenue: number
  week_appointments: number
  week_revenue: number
  month_appointments: number
  month_revenue: number
  total_patients: number
  active_doctors: number
  recent_appointments: Appointment[]
}

export interface DailyRevenue {
  date: string
  revenue: number
  appointments: number
}

export interface TopDoctor {
  doctor__id: number
  doctor__first_name: string
  doctor__last_name: string
  revenue: number
  count: number
}

export interface TopService {
  service__id: number
  service__name: string
  revenue: number
  count: number
}

export interface RevenueStats {
  period: string
  daily: DailyRevenue[]
  top_doctors: TopDoctor[]
  top_services: TopService[]
}

// ─── Clinic Settings ─────────────────────────────────────────────────────────

export interface ClinicSettings {
  id: number
  name: string
  address: string
  phone: string
  telegram_bot_token: string
  work_start: string
  work_end: string
  reminder_24h: boolean
  reminder_1h: boolean
  reminder_24h_template: string
  reminder_1h_template: string
  updated_at: string
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
