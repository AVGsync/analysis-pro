import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import { Input, PrimaryButton, ErrorBox } from '../components/UI.jsx'

const Logo = () => (
  <div style={{
    width: 64, height: 64, borderRadius: 14,
    background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px',
  }}>
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="18" width="6" height="14" rx="1.5" fill="white" />
      <rect x="15" y="11" width="6" height="21" rx="1.5" fill="white" />
      <rect x="26" y="4" width="6" height="28" rx="1.5" fill="white" />
    </svg>
  </div>
)

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const message = err.message || ''
      setError(
        message.includes('invalid email or password') || message.includes('invalid credentials') || message.includes('unauthorized')
          ? 'Неверный email или пароль'
          : message || 'Ошибка входа'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #AEC6FF 0%, #4A4C53 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 480,
        backgroundColor: '#fff',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        boxShadow: '0px 4px 16px 0px rgba(27,58,107,0.08)',
        padding: '32px 32px 44px',
      }}>
        <Logo />
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Вход в систему</h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>Введите ваши учетные данные для доступа к платформе</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <ErrorBox message={error} />}

          <Input
            label="Электронная почта"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@domain.com"
            autoComplete="email"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введите пароль"
                autoComplete="current-password"
                style={{
                  width: '100%', height: 45, borderRadius: 8,
                  border: '1px solid #CBD5E1', padding: '0 40px 0 12px',
                  fontSize: 14, fontFamily: 'Inter', outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#155DFC'}
                onBlur={e => e.target.style.borderColor = '#CBD5E1'}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
              }}>
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" fill="none"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" fill="none"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>
                }
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 12, color: '#155DFC', cursor: 'pointer' }}>Забыли пароль?</span>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#155DFC' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#364153' }}>Запомнить меня</span>
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <PrimaryButton type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Вход...' : 'Войти'}
            </PrimaryButton>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Нет аккаунта?{' '}
              <Link to="/register" style={{ color: '#155DFC', fontWeight: 600, textDecoration: 'none' }}>
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
