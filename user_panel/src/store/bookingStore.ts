import { create } from 'zustand'
import type { Doctor, Service, Patient } from '@/types'

interface BookingStore {
  // Qabul yozilish jarayoni
  doctor: Doctor | null
  service: Service | null
  date: string | null
  time: string | null

  // Joriy bemor
  patient: Patient | null

  // Actions
  setDoctor: (d: Doctor) => void
  setService: (s: Service) => void
  setDate: (d: string) => void
  setTime: (t: string) => void
  setPatient: (p: Patient) => void
  reset: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  doctor: null,
  service: null,
  date: null,
  time: null,
  patient: null,

  setDoctor: (doctor) => set({ doctor, service: null, date: null, time: null }),
  setService: (service) => set({ service, date: null, time: null }),
  setDate: (date) => set({ date, time: null }),
  setTime: (time) => set({ time }),
  setPatient: (patient) => set({ patient }),
  reset: () => set({ doctor: null, service: null, date: null, time: null }),
}))
