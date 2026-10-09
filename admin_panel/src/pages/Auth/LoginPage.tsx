import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import styled from 'styled-components'
import { useAuthStore } from '@/store/authStore'

// ─── Grid Pattern Background ──────────────────────────────────────────────────

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
    top: 0; right: 0; bottom: 0; left: 0;
    z-index: 0;
    background-image:
      linear-gradient(to right, #e2e8f0 1px, transparent 1px),
      linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
    background-size: 20px 30px;
    -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%);
    mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%);
  }

  .content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
  }

  /* ── Holo Input ── */
  .input-field-container {
    position: relative;
    width: 100%;
    margin-top: 8px;
  }

  .holo-input {
    width: 100%;
    height: 52px;
    background: rgba(0, 12, 36, 0.75);
    border: none;
    outline: none;
    padding: 0 48px 0 18px;
    color: rgba(0, 195, 255, 0.95);
    font-family: 'Inter', 'Orbitron', sans-serif;
    font-size: 15px;
    letter-spacing: 0.5px;
    border-radius: 6px;
    box-shadow: 0 0 15px rgba(0, 140, 255, 0.25), inset 0 0 10px rgba(0, 0, 0, 0.7);
    transition: all 0.3s ease;
    text-shadow: 0 0 5px rgba(0, 160, 255, 0.6);
    z-index: 1;
    position: relative;
  }

  .holo-input::placeholder {
    color: rgba(0, 110, 200, 0.4);
  }

  .input-border {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    border: 1px solid rgba(0, 150, 255, 0.35);
    border-radius: 6px;
    z-index: 2;
  }

  .input-border::before, .input-border::after {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    border: 1.5px solid rgba(0, 150, 255, 0.6);
    transition: all 0.3s ease;
  }
  .input-border::before { top: -1px; left: -1px; border-right: none; border-bottom: none; }
  .input-border::after  { bottom: -1px; right: -1px; border-left: none; border-top: none; }

  .holo-scan-line {
    position: absolute;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(0,150,255,0.5) 20%, rgba(255,255,255,0.8) 50%, rgba(0,150,255,0.5) 80%, transparent 100%);
    top: 0; left: 0;
    opacity: 0;
    filter: blur(1px);
    z-index: 3;
    pointer-events: none;
  }

  .input-glow {
    position: absolute;
    width: 100%; height: 100%;
    top: 0; left: 0;
    background: radial-gradient(ellipse at center, rgba(0,150,255,0.08) 0%, transparent 70%);
    opacity: 0;
    border-radius: 6px;
    z-index: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .input-active-indicator {
    position: absolute;
    width: 8px; height: 8px;
    background: rgba(0, 150, 255, 0.6);
    border-radius: 50%;
    right: 16px; top: 50%;
    transform: translateY(-50%);
    opacity: 0.3;
    box-shadow: 0 0 8px rgba(0, 150, 255, 0.5);
    transition: all 0.3s ease;
    z-index: 5;
  }

  .power-indicator {
    position: absolute;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, rgba(0,180,255,0.8) 0%, rgba(0,180,255,0.2) 100%);
    bottom: 0; left: 0;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
    z-index: 3;
    border-radius: 0 0 6px 6px;
  }

  .interface-lines { position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; z-index: 2; }
  .interface-line { position: absolute; background: rgba(0, 150, 255, 0.25); transition: all 0.3s ease; }
  .interface-line:nth-child(1) { width: 16px; height: 1px; top: 12px; right: 12px; }
  .interface-line:nth-child(2) { width: 1px; height: 16px; top: 12px; right: 12px; }
  .interface-line:nth-child(3) { width: 1px; height: 16px; bottom: 12px; left: 12px; }
  .interface-line:nth-child(4) { width: 16px; height: 1px; bottom: 12px; left: 12px; }

  /* Focus states */
  @keyframes scan-animation {
    0%   { top: 0; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  .holo-input:focus {
    background: rgba(0, 22, 46, 0.85);
    box-shadow: 0 0 25px rgba(0, 150, 255, 0.35), inset 0 0 15px rgba(0, 0, 0, 0.8);
    color: rgba(0, 220, 255, 1);
  }
  .holo-input:focus ~ .input-border { border-color: rgba(0, 180, 255, 0.65); }
  .holo-input:focus ~ .input-border::before,
  .holo-input:focus ~ .input-border::after { border-color: rgba(0, 200, 255, 1); width: 22px; height: 22px; }
  .holo-input:focus ~ .holo-scan-line { opacity: 1; animation: scan-animation 2s infinite ease-in-out; }
  .holo-input:focus ~ .input-glow { opacity: 1; }
  .holo-input:focus ~ .input-active-indicator { opacity: 1; background: rgba(0,210,255,1); box-shadow: 0 0 12px rgba(0,210,255,0.8); transform: translateY(-50%) scale(1.2); }
  .holo-input:focus ~ .power-indicator { transform: scaleX(1); }
  .holo-input:focus ~ .interface-lines .interface-line { background: rgba(0, 200, 255, 0.5); }
`

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  username: z.string().min(1, 'Login kiritilmagan'),
  password: z.string().min(1, 'Parol kiritilmagan'),
})
type FormData = z.infer<typeof schema>

// ─── Holo Input Component ─────────────────────────────────────────────────────

function HoloInput({
  id, label, type = 'text', placeholder, error, registration,
  rightIcon, onRightIconClick,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  error?: string
  registration: object
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: 'rgba(0,150,255,0.7)', textShadow: '0 0 5px rgba(0,150,255,0.4)' }}>
        {label}
      </label>
      <div className="input-field-container">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="holo-input"
          {...registration}
        />
        <div className="input-border" />
        <div className="holo-scan-line" />
        <div className="input-glow" />
        {rightIcon ? (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 transition-colors"
            style={{ color: 'rgba(0,150,255,0.6)' }}
          >
            {rightIcon}
          </button>
        ) : (
          <div className="input-active-indicator" />
        )}
        <div className="power-indicator" />
        <div className="interface-lines">
          <div className="interface-line" />
          <div className="interface-line" />
          <div className="interface-line" />
          <div className="interface-line" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium flex items-center gap-1" style={{ color: '#f87171' }}>
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

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
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 100)
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
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5
                            shadow-2xl ring-4 ring-white"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' }}>
              <svg viewBox="0 0 24 24" className="w-11 h-11" fill="white">
                <path d="M12 2C9.24 2 7 4.24 7 7c0 1.5.4 2.8.9 4l.8 3.2c.3 1 .6 2.4 1.6 2.4s1.2-1.2 1.6-2.4l.8-2.4c.2-.4.3-.8.8-.8s.6.4.8.8l.8 2.4c.4 1.2.6 2.4 1.6 2.4s1.3-1.4 1.6-2.4l.8-3.2c.5-1.2.9-2.5.9-4 0-2.76-2.24-5-5-5z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">DentFlow</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Stomatologiya boshqaruv tizimi</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl p-8 border border-gray-100/80 ring-1 ring-gray-900/5"
            style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', boxShadow: '0 10px 40px -5px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.08)' }}>

            <h2 className="text-xl font-bold text-gray-800 mb-7">Admin sifatida kiring</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              <HoloInput
                id="username"
                label="Login"
                placeholder="admin"
                error={errors.username?.message}
                registration={register('username')}
              />

              <HoloInput
                id="password"
                label="Parol"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                registration={register('password')}
                onRightIconClick={() => setShowPassword(!showPassword)}
                rightIcon={
                  showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )
                }
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-bold text-base
                           transition-all duration-200 active:scale-[0.98] mt-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading ? 'rgba(0,100,200,0.6)' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  boxShadow: '0 0 20px rgba(37,99,235,0.4), 0 4px 15px rgba(37,99,235,0.3)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Tekshirilmoqda...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Kirish
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            <div className="mt-7 pt-5 border-t border-gray-100 text-center">
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
