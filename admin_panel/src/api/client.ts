import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://clinicasi.pythonanywhere.com/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// Request interceptor — JWT token qo'shish
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — 401 da token refresh, keyin logout
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    // Token refresh urinish
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${BASE_URL}/auth/refresh/`,
            { refresh: refreshToken }
          )
          const newAccess = res.data.access
          localStorage.setItem('access_token', newAccess)
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          return apiClient(originalRequest)
        } catch {
          // Refresh ham ishlamadi — logout
        }
      }

      // Logout
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('dentflow-auth')
      window.location.replace('/login')
    }

    return Promise.reject(error)
  }
)

export default apiClient
