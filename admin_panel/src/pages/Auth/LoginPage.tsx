import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  username: z.string().min(1, 'Login kiritilmagan'),
  password: z.string().min(1, 'Parol kiritilmagan'),
})
type FormData = z.infer<typeof schema>

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
      <label htmlFor={id} style={{
        display: 'block',
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '8px',
        color: 'rgba(0,150,255,0.8)',
        textShadow: '0 0 8px rgba(0,150,255,0.4)',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: '52px',
            background: 'rgba(0,12,36,0.75)',
            border: '1px solid rgba(0,150,255,0.35)',
            borderRadius: '8px',
            outline: 'none',
            padding: '0 44px 0 16px',
            color: 'rgba(0,195,255,0.95)',
            fontSize: '15px',
            letterSpacing: '0.5px',
            boxShadow: '0 0 15px rgba(0,140,255,0.2), inset 0 0 10px rgba(0,0,0,0.6)',
            transition: 'all 0.3s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(0,180,255,0.8)'
            e.target.style.boxShadow = '0 0 25px rgba(0,150,255,0.35), inset 0 0 15px rgba(0,0,0,0.7)'
            e.target.style.color = 'rgba(0,220,255,1)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(0,150,255,0.35)'
            e.target.style.boxShadow = '0 0 15px rgba(0,140,255,0.2), inset 0 0 10px rgba(0,0,0,0.6)'
            e.target.style.color = 'rgba(0,195,255,0.95)'
          }}
          {...registration}
        />
        {/* Corner decorations */}
        <span style={{ position:'absolute', top:'-1px', left:'-1px', width:'16px', height:'16px',
          borderTop:'2px solid rgba(0,200,255,0.8)', borderLeft:'2px solid rgba(0,200,255,0.8)',
          borderRadius:'8px 0 0 0', pointerEvents:'none' }} />
        <span style={{ position:'absolute', bottom:'-1px', right:'-1px', width:'16px', height:'16px',
          borderBottom:'2px solid rgba(0,200,255,0.8)', borderRight:'2px solid rgba(0,200,255,0.8)',
          borderRadius:'0 0 8px 0', pointerEvents:'none' }} />
        {/* Right icon or indicator */}
        {rightIcon ? (
          <button type="button" onClick={onRightIconClick} style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', background: 'none', border: 'none',
            cursor: 'pointer', color: 'rgba(0,150,255,0.7)', padding: '4px',
          }}>
            {rightIcon}
          </button>
        ) : (
          <span style={{
            position: 'absolute', right: '14px', top: '50%',
            transform: 'translateY(-50%)', width: '8px', height: '8px',
            background: 'rgba(0,150,255,0.6)', borderRadius: '50%',
            boxShadow: '0 0 8px rgba(0,150,255,0.8)',
          }} />
        )}
      </div>
      {error && (
        <p style={{ marginTop: '6px', fontSize: '12px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

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
    <div style={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '20px 30px',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            borderRadius: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 40px rgba(29,78,216,0.3), 0 0 0 4px white',
          }}>
            <svg viewBox="0 0 24 24" style={{ width: '44px', height: '44px' }} fill="white">
              <path d="M12 2C9.24 2 7 4.24 7 7c0 1.5.4 2.8.9 4l.8 3.2c.3 1 .6 2.4 1.6 2.4s1.2-1.2 1.6-2.4l.8-2.4c.2-.4.3-.8.8-.8s.6.4.8.8l.8 2.4c.4 1.2.6 2.4 1.6 2.4s1.3-1.4 1.6-2.4l.8-3.2c.5-1.2.9-2.5.9-4 0-2.76-2.24-5-5-5z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>DentFlow</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '6px', fontWeight: 500 }}>
            Stomatologiya boshqaruv tizimi
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(226,232,240,0.8)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '28px' }}>
            Admin sifatida kiring
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )
              }
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                boxShadow: '0 0 20px rgba(37,99,235,0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px', height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Tekshirilmoqda...
                </>
              ) : (
                <>
                  Kirish
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            DentFlow v1.0 — Stomatologiya boshqaruv tizimi
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(0,110,200,0.4); }
      `}</style>
    </div>
  )
}
