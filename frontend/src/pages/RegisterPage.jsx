import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/index.js'
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

function PasswordStrength({ password }) {
  const checks = [
    { label: 'Минимум 8 символов', ok: password.length >= 8 },
    { label: 'Заглавная буква', ok: /[A-Z]/.test(password) },
    { label: 'Строчная буква', ok: /[a-z]/.test(password) },
    { label: 'Цифра', ok: /\d/.test(password) },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
      {checks.map(c => (
        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            {c.ok
              ? <><circle cx="6" cy="6" r="6" fill="#00A63E"/><path d="M3 6l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>
              : <circle cx="6" cy="6" r="5.5" stroke="#D1D5DB"/>
            }
          </svg>
          <span style={{ fontSize: 12, color: c.ok ? '#00A63E' : '#9CA3AF' }}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return }
    if (form.password.length < 8) { setError('Пароль должен быть не менее 8 символов'); return }
    setLoading(true)
    try {
      await api.register(form.full_name, form.email, form.password)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} style={{
      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
    }}>
      {show
        ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" fill="none"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" fill="none"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg>
      }
    </button>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #AEC6FF 0%, #4A4C53 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 0',
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
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Создание аккаунта</h1>
          <p style={{ fontSize: 14, color: '#64748B' }}>Создайте учетную запись для доступа к платформе</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && <ErrorBox message={error} />}

          <Input label="Полное имя" value={form.full_name} onChange={set('full_name')} placeholder="Иван Иванов" autoComplete="name" />
          <Input label="Электронная почта" type="email" value={form.email} onChange={set('email')} placeholder="example@domain.com" autoComplete="email" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Введите пароль"
                style={{ width: '100%', height: 45, borderRadius: 8, border: '1px solid #CBD5E1', padding: '0 40px 0 12px', fontSize: 14, fontFamily: 'Inter', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#155DFC'}
                onBlur={e => e.target.style.borderColor = '#CBD5E1'}
              />
              {eyeBtn(showPass, () => setShowPass(v => !v))}
            </div>
            {form.password && <PasswordStrength password={form.password} />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Подтверждение пароля</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Повторите пароль"
                style={{ width: '100%', height: 45, borderRadius: 8, border: form.confirm && form.confirm !== form.password ? '1.5px solid #E7000B' : '1px solid #CBD5E1', padding: '0 40px 0 12px', fontSize: 14, fontFamily: 'Inter', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#155DFC'}
                onBlur={e => e.target.style.borderColor = '#CBD5E1'}
              />
              {eyeBtn(showConfirm, () => setShowConfirm(v => !v))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <PrimaryButton type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </PrimaryButton>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              Уже есть аккаунт?{' '}
              <Link to="/login" style={{ color: '#155DFC', fontWeight: 600, textDecoration: 'none' }}>Войти</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
