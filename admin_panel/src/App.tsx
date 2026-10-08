import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/Auth/LoginPage'
import Dashboard from '@/pages/Dashboard/Dashboard'
import DoctorsPage from '@/pages/Doctors/DoctorsPage'
import ServicesPage from '@/pages/Services/ServicesPage'
import AppointmentsPage from '@/pages/Appointments/AppointmentsPage'
import PatientsPage from '@/pages/Patients/PatientsPage'
import StatsPage from '@/pages/Stats/StatsPage'
import SettingsPage from '@/pages/Settings/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  
  console.log('🔒 ProtectedRoute check:', { 
    isAuthenticated,
    localStorage_has_auth: !!localStorage.getItem('dentflow-auth'),
    localStorage_content: localStorage.getItem('dentflow-auth')
  })
  
  if (!isAuthenticated) {
    console.log('❌ NOT AUTHENTICATED - Redirecting to login')
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
