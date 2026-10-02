import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from '@/pages/Home/HomePage'
import BookingPage from '@/pages/Booking/BookingPage'
import BookingSuccessPage from '@/pages/Booking/BookingSuccessPage'
import MyAppointmentsPage from '@/pages/MyAppointments/MyAppointmentsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/book"              element={<BookingPage />} />
        <Route path="/booking-success"   element={<BookingSuccessPage />} />
        <Route path="/my-appointments"   element={<MyAppointmentsPage />} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
