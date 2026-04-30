import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import { api } from '../api/index.js'
import Layout from '../components/Layout.jsx'
import { Card, SecondaryButton, ErrorBox } from '../components/UI.jsx'

const PLAN_LABEL = {
  free: 'Стартовый',
  starter: 'Стартовый',
  pro: 'Professional',
  professional: 'Professional',
  enterprise: 'Корпоративный',
}

const INDUSTRIES = [
  'Розничная торговля',
  'Оптовая торговля',
  'Электронная коммерция',
  'Производство',
  'Услуги',
  'Иное',
]

const LOCAL_KEY = 'analysispro_profile_extra'

function loadExtras() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
  } catch { return {} }
}

function saveExtras(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)) } catch {}
}

const fmtDate = (d) => {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt)) return ''
  return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [extras, setExtras] = useState(loadExtras())

  useEffect(() => { setExtras(loadExtras()) }, [editing])

  const plan = user?.subscription_plan || 'free'
  const expires = user?.subscription_expires
    ? fmtDate(user.subscription_expires)
    : '01.03.2027'
  const registered = extras.registered_at
    ? fmtDate(extras.registered_at)
    : fmtDate(new Date())

  return (
    <Layout title="Личный кабинет">
      {editing && (
        <EditModal
          user={user}
          extras={extras}
          onClose={() => setEditing(false)}
          onSaved={(u, ex) => {
            if (u) setUser(u)
            saveExtras(ex)
            setExtras(ex)
            setEditing(false)
          }}
        />
      )}

      <Card style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Профиль пользователя</div>
          <button onClick={() => setEditing(true)} style={primaryBtn}>Редактировать профиль</button>
        </div>

        <div style={fieldGrid}>
          <Field label="Полное имя"
            value={user?.full_name}
            placeholder="Заполните имя" />
          <Field label="Электронная почта"
            value={user?.email}
            placeholder="—" />
          <Field label="Дата регистрации" value={registered} />
          <Field label="Компания"
            value={extras.company}
            placeholder="Заполните название компании" />
          <Field label="Местоположение"
            value={extras.location}
            placeholder="Укажите местоположение" />
          <Field label="Отрасль"
            value={extras.industry || 'Розничная торговля'} />
        </div>
      </Card>

      <Card style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Подписка</div>
          <button onClick={() => navigate('/subscription')} style={primaryBtn}>Управлять подпиской</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
          <Field label="Текущий план" value={PLAN_LABEL[plan] || 'Стартовый'} />
          <div>
            <div style={fieldLabelStyle}>Статус</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#166534' }}>Активен</span>
            </div>
          </div>
          <Field label="Действует до" value={expires} />
        </div>
      </Card>

      <Card style={{ padding: 32 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#101828', marginBottom: 22 }}>
          Статистика использования
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <Field label="Загружено отчетов" value={String(extras.reports_count || 0)} />
          <Field label="Выполнено запросов" value={String(extras.queries_count || 0)} />
        </div>
      </Card>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => { logout(); navigate('/login') }} style={{
          background: 'none', border: '1px solid #FECACA', color: '#B91C1C',
          borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'Inter',
        }}>
          Выйти из аккаунта
        </button>
      </div>
    </Layout>
  )
}

const fieldGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22 }
const fieldLabelStyle = { fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 6 }

function Field({ label, value, placeholder }) {
  const isEmpty = !value
  return (
    <div>
      <div style={fieldLabelStyle}>{label}</div>
      <div style={{
        fontSize: 15, fontWeight: 500,
        color: isEmpty ? '#94A3B8' : '#101828',
      }}>
        {isEmpty ? (placeholder || '—') : value}
      </div>
    </div>
  )
}

function EditModal({ user, extras, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    location: extras.location || '',
    company: extras.company || '',
    industry: extras.industry || 'Розничная торговля',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (form.newPassword || form.confirmPassword || form.oldPassword) {
        if (form.newPassword !== form.confirmPassword) {
          throw new Error('Пароли не совпадают')
        }
        if (form.newPassword.length < 8) {
          throw new Error('Минимум 8 символов в новом пароле')
        }
      }

      let updated = user
      const patch = {}
      if (form.full_name && form.full_name !== user?.full_name) patch.full_name = form.full_name
      if (form.email && form.email !== user?.email) patch.email = form.email
      if (Object.keys(patch).length > 0) {
        updated = await api.updateMe(patch)
      }

      const ex = {
        ...extras,
        location: form.location,
        company: form.company,
        industry: form.industry,
        registered_at: extras.registered_at || new Date().toISOString(),
      }
      onSaved(updated, ex)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#101828' }}>Редактировать профиль пользователя</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && <ErrorBox message={error} />}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input label="Полное имя" placeholder="Введите имя"
              value={form.full_name} onChange={set('full_name')} />
            <Input label="Местоположение" placeholder="Укажите местоположение"
              value={form.location} onChange={set('location')} />
            <Input label="Компания" placeholder="Укажите название компании"
              value={form.company} onChange={set('company')} />
            <Select label="Отрасль" value={form.industry} onChange={set('industry')}
              options={INDUSTRIES} />
          </div>

          <Input label="Электронная почта" type="email" placeholder="ivan@biolab.ru"
            value={form.email} onChange={set('email')} disabled />

          <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 14 }}>
              Изменить пароль
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Текущий пароль" type="password" placeholder="Введите текущий пароль"
                value={form.oldPassword} onChange={set('oldPassword')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Новый пароль" type="password" placeholder="Создайте новый пароль"
                  value={form.newPassword} onChange={set('newPassword')} />
                <Input label="Подтверждение нового пароля" type="password" placeholder="Повторите новый пароль"
                  value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #E5E7EB', paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? 'Сохранение…' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Input({ label, type = 'text', value, onChange, placeholder, disabled }) {
  return (
    <div>
      <div style={fieldLabelStyle}>{label}</div>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', height: 44, borderRadius: 10,
          border: '1px solid #D1D5DB',
          padding: '0 14px', fontSize: 14, fontFamily: 'Inter',
          color: disabled ? '#94A3B8' : '#0A0A0A',
          backgroundColor: disabled ? '#F8FAFC' : '#fff',
          outline: 'none',
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = '#155DFC' }}
        onBlur={e => { if (!disabled) e.target.style.borderColor = '#D1D5DB' }}
      />
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <div style={fieldLabelStyle}>{label}</div>
      <select value={value} onChange={onChange} style={{
        width: '100%', height: 44, borderRadius: 10, border: '1px solid #D1D5DB',
        padding: '0 32px 0 14px', fontSize: 14, fontFamily: 'Inter',
        color: '#0A0A0A', background: '#fff', cursor: 'pointer', outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
      }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

const primaryBtn = {
  height: 42, borderRadius: 10, padding: '0 18px',
  background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
  color: '#fff', border: 'none', fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
}
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 200,
  backgroundColor: 'rgba(47,52,69,0.5)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
}
const modalStyle = {
  width: 640, maxWidth: '100%', backgroundColor: '#fff',
  borderRadius: 16, border: '1px solid #E2E8F0',
  boxShadow: '0px 20px 50px rgba(15,23,42,0.24)',
  maxHeight: '92vh', overflow: 'auto',
}
const modalHeader = {
  padding: '24px 28px', borderBottom: '1px solid #E5E7EB',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const closeBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#9CA3AF', fontSize: 18, padding: 4,
}
