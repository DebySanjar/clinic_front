import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import styled from 'styled-components'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'

// ─── Grid Pattern Background ─────────────────────────────────────────────────

const StyledWrapper = styled.div`
  .grid-wrapper {
    min-height: 100vh;
    width: 100%;
    position: relative;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .grid-background {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
    background-image:
      linear-gradient(to right, #e2e8f0 1px, transparent 1px),
      linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 20px 30px;
    -webkit-mask-image: radial-gradient(
      ellipse 70% 60% at 50% 0%,
      #000 60%,
      transparent 100%
    );
    mask-image: radial-gradient(
      ellipse 70% 60% at 50% 0%,
      #000 60%,
      transparent 100%
    );
  }

  .content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 400px;
  }
`

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  username: z.string().min(1, 'Login kiritilmagan'),
  password: z.string().min(1, 'Parol kiritilmagan'),
})

type FormData = z.infer<typeof schema>

// ─── Login Page ───────────────────────────────────────────────────────────────

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
    <StyledWrapper>
      <div className="grid-wrapper">
        <div className="grid-background" />

        <div className="content">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl 
                            flex items-center justify-center mx-auto mb-5 
                            shadow-xl shadow-primary-200 ring-4 ring-white">
              <svg viewBox="0 0 24 24" className="w-11 h-11" fill="white">
                <path d="M12 2C9.24 2 7 4.24 7 7c0 1.5.4 2.8.9 4l.8 3.2c.3 1 .6 2.4 1.6 2.4s1.2-1.2 1.6-2.4l.8-2.4c.2-.4.3-.8.8-.8s.6.4.8.8l.8 2.4c.4 1.2.6 2.4 1.6 2.4s1.3-1.4 1.6-2.4l.8-3.2c.5-1.2.9-2.5.9-4 0-2.76-2.24-5-5-5z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">DentFlow</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">
              Stomatologiya boshqaruv tizimi
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-card-lg p-8 
                          border border-gray-100/80 ring-1 ring-gray-900/5">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Admin sifatida kiring</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`input pr-11 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-500/50' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                               hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
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
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 py-3 text-base"
              >
                {loading ? 'Tekshirilmoqda...' : 'Kirish →'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium">
                DentFlow v1.0 — Stomatologiya boshqaruv tizimi
              </p>
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  )
}
