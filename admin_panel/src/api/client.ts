import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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

// Response interceptor — 401 da logout (faqat token bilan qilingan so'rovlarda)
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login/')
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('dentflow-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
