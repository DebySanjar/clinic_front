import apiClient from './client'
import type {
  Doctor, DoctorFormData, Service, ServiceFormData, ServiceCategory,
  Patient, Appointment, AppointmentCreateData,
  DashboardStats, RevenueStats, ClinicSettings, TimeSlot,
  PaginatedResponse
} from '@/types'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<{ access: string; refresh: string }>('/auth/login/', { username, password }),

  refresh: (refresh: string) =>
    apiClient.post<{ access: string }>('/auth/refresh/', { refresh }),
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

export const doctorsApi = {
  list: (params?: { is_active?: boolean }) =>
    apiClient.get<Doctor[]>('/doctors/', { params }),

  get: (id: number) =>
    apiClient.get<Doctor>(`/doctors/${id}/`),

  create: (data: DoctorFormData) =>
    apiClient.post<Doctor>('/doctors/', data),

  update: (id: number, data: Partial<DoctorFormData>) =>
    apiClient.put<Doctor>(`/doctors/${id}/`, data),

  patch: (id: number, data: Partial<DoctorFormData>) =>
    apiClient.patch<Doctor>(`/doctors/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/doctors/${id}/`),

  getSlots: (id: number, date: string) =>
    apiClient.get<{ slots: TimeSlot[]; message?: string }>(`/doctors/${id}/slots/`, { params: { date } }),

  getLeaves: (id: number) =>
    apiClient.get<any[]>(`/doctors/${id}/leaves/`),

  addLeave: (id: number, data: { date: string; reason?: string }) =>
    apiClient.post(`/doctors/${id}/leaves/`, data),
}

// ─── Services ────────────────────────────────────────────────────────────────

export const servicesApi = {
  list: (params?: { is_active?: boolean; doctor_id?: number; category?: number }) =>
    apiClient.get<Service[]>('/services/', { params }),

  get: (id: number) =>
    apiClient.get<Service>(`/services/${id}/`),

  create: (data: ServiceFormData) =>
    apiClient.post<Service>('/services/', data),

  update: (id: number, data: Partial<ServiceFormData>) =>
    apiClient.put<Service>(`/services/${id}/`, data),

  patch: (id: number, data: Partial<ServiceFormData>) =>
    apiClient.patch<Service>(`/services/${id}/`, data),

  delete: (id: number) =>
    apiClient.delete(`/services/${id}/`),

  categories: () =>
    apiClient.get<ServiceCategory[]>('/service-categories/'),

  createCategory: (data: Omit<ServiceCategory, 'id'>) =>
    apiClient.post<ServiceCategory>('/service-categories/', data),
}

// ─── Patients ────────────────────────────────────────────────────────────────

export const patientsApi = {
  list: (params?: { search?: string; page?: number }) =>
    apiClient.get<PaginatedResponse<Patient>>('/patients/', { params }),

  get: (id: number) =>
    apiClient.get<Patient>(`/patients/${id}/`),

  create: (data: Partial<Patient>) =>
    apiClient.post<Patient>('/patients/', data),

  update: (id: number, data: Partial<Patient>) =>
    apiClient.patch<Patient>(`/patients/${id}/`, data),

  getAppointments: (id: number) =>
    apiClient.get<Appointment[]>(`/patients/${id}/appointments/`),
}

// ─── Appointments ────────────────────────────────────────────────────────────

export const appointmentsApi = {
  list: (params?: {
    date?: string; doctor_id?: number; patient_id?: number;
    status?: string; date_from?: string; date_to?: string; page?: number
  }) =>
    apiClient.get<PaginatedResponse<Appointment>>('/appointments/', { params }),

  get: (id: number) =>
    apiClient.get<Appointment>(`/appointments/${id}/`),

  create: (data: AppointmentCreateData) =>
    apiClient.post<Appointment>('/appointments/', data),

  update: (id: number, data: Partial<AppointmentCreateData>) =>
    apiClient.patch<Appointment>(`/appointments/${id}/`, data),

  start: (id: number) =>
    apiClient.post<Appointment>(`/appointments/${id}/start/`),

  complete: (id: number) =>
    apiClient.post<Appointment & { delay_minutes: number }>(`/appointments/${id}/complete/`),

  cancel: (id: number, reason?: string) =>
    apiClient.post<Appointment>(`/appointments/${id}/cancel/`, { reason }),

  confirm: (id: number) =>
    apiClient.post<Appointment>(`/appointments/${id}/confirm/`),

  noShow: (id: number) =>
    apiClient.post<Appointment>(`/appointments/${id}/no-show/`),
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export const statsApi = {
  dashboard: () =>
    apiClient.get<DashboardStats>('/stats/dashboard/'),

  revenue: (period: 'week' | 'month' | 'year' = 'week') =>
    apiClient.get<RevenueStats>('/stats/revenue/', { params: { period } }),
}

// ─── Clinic Settings ─────────────────────────────────────────────────────────

export const settingsApi = {
  get: () =>
    apiClient.get<ClinicSettings>('/settings/'),

  update: (data: Partial<ClinicSettings>) =>
    apiClient.patch<ClinicSettings>('/settings/', data),
}
