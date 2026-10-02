import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'

const schema = z.object({
  username: z.string().min(1, 'Login kiritilmagan'),
  password: z.string().min(1, 'Parol kiritilmagan'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    const ok = await login(data.username, data.password)
    setLoading(false)
    if (ok) {
      navigate('/dashboard')
    } else {
      toast.error("Login yoki parol noto'g'ri")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
            <svg viewBox="0 0 24 24" className="w-9 h-9" fill="white">
              <path d="M12 2C9.24 2 7 4.24 7 7c0 1.5.4 2.8.9 4l.8 3.2c.3 1 .6 2.4 1.6 2.4s1.2-1.2 1.6-2.4l.8-2.4c.2-.4.3-.8.8-.8s.6.4.8.8l.8 2.4c.4 1.2.6 2.4 1.6 2.4s1.3-1.4 1.6-2.4l.8-3.2c.5-1.2.9-2.5.9-4 0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DentFlow</h1>
          <p className="text-gray-500 text-sm mt-1">Admin panel — kirish</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-card-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="username"
              label="Login"
              placeholder="admin"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />

            <div className="w-full">
              <label htmlFor="password" className="label">Parol</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  autoComplete="current-password"
                  className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 py-2.5"
            >
              Kirish
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            DentFlow v1.0 — Stomatologiya boshqaruv tizimi
          </p>
        </div>
      </div>
    </div>
  )
}
