import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import { api } from '../api/index.js'
import Layout from '../components/Layout.jsx'
import { Card, PrimaryButton, SecondaryButton, ErrorBox } from '../components/UI.jsx'

const PLAN_LABEL = {
  free: 'Стартовый',
  starter: 'Стартовый',
  pro: 'Профессиональный',
  enterprise: 'Корпоративный',
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

  const plan = user?.subscription_plan || 'free'
  const expires = user?.subscription_expires
    ? new Date(user.subscription_expires).toLocaleDateString('ru-RU')
    : '01.07.2026'
  const registered = '15.03.2024'

  return (
    <Layout title="Личный кабинет">
      {editing && (
        <EditModal
          user={user}
          onClose={() => setEditing(false)}
          onSaved={(u) => { setUser(u); setEditing(false) }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button onClick={() => setEditing(true)} style={primaryBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
          </svg>
          Редактировать профиль
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card style={{ padding: 32 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828', marginBottom: 24 }}>
            Профиль пользователя
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 700, color: '#fff',
            }}>
              {(user?.full_name || 'И').slice(0, 1).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#101828' }}>
                {user?.full_name || 'Иван Петров'}
              </div>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                {user?.email || 'ivan.petrov@example.com'}
              </div>
              <div style={{
                marginTop: 10, display: 'inline-block',
                fontSize: 12, fontWeight: 600,
                backgroundColor: 'rgba(21,93,252,0.10)', color: '#155DFC',
                padding: '4px 12px', borderRadius: 20,
              }}>
                {PLAN_LABEL[plan] || plan}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field label="ФИО" value={user?.full_name || '—'} />
            <Field label="Email" value={user?.email || '—'} />
            <Field label="Должность" value="Директор по продажам" />
            <Field label="Компания" value="ООО «Прометей»" />
            <Field label="Дата регистрации" value={registered} />
            <Field label="Роль" value={user?.role === 'admin' ? 'Администратор' : 'Пользователь'} />
          </div>
        </Card>

        <Card style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828', marginBottom: 16 }}>
            Тарифный план
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #155DFC 0%, #4F39F6 100%)',
            color: '#fff', borderRadius: 14, padding: 20, marginBottom: 16,
          }}>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Текущий тариф</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
              {PLAN_LABEL[plan] || 'Стартовый'}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 10 }}>
              Действует до {expires}
            </div>
          </div>
          <button onClick={() => navigate('/subscription')} style={primaryBtn}>
            Управление подпиской
          </button>
        </Card>
      </div>

      <Card style={{ padding: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#101828', marginBottom: 20 }}>
          Статистика использования
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          <Stat label="Прогнозов сделано" value="142" />
          <Stat label="Загружено товаров" value="3 421" />
          <Stat label="Запросов ИИ" value="58" />
          <Stat label="Дней в системе" value="412" />
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

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>{value}</div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{
      backgroundColor: '#F8FAFC', borderRadius: 12, padding: 18,
      border: '1px solid #E5E7EB',
    }}>
      <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#101828' }}>{value}</div>
    </div>
  )
}

function EditModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    position: 'Директор по продажам',
    company: 'ООО «Прометей»',
    oldPassword: '',
    newPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const updated = await api.updateMe({ full_name: form.full_name, email: form.email })
      onSaved(updated)
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
          <span style={{ fontSize: 20, fontWeight: 700, color: '#101828' }}>Редактирование профиля пользователя</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && <ErrorBox message={error} />}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="ФИО" value={form.full_name} onChange={set('full_name')} />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} />
            <Input label="Должность" value={form.position} onChange={set('position')} />
            <Input label="Компания" value={form.company} onChange={set('company')} />
          </div>

          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#364153', marginBottom: 12 }}>Изменить пароль</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Старый пароль" type="password" value={form.oldPassword} onChange={set('oldPassword')} />
              <Input label="Новый пароль" type="password" value={form.newPassword} onChange={set('newPassword')} />
            </div>
          </div>

          <div style={{ ...modalFooter, padding: '16px 0 0', borderTop: 0 }}>
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

function Input({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}</div>
      <input
        type={type} value={value} onChange={onChange}
        style={{
          width: '100%', height: 44, borderRadius: 10, border: '1px solid #D1D5DB',
          padding: '0 14px', fontSize: 14, fontFamily: 'Inter',
          color: '#0A0A0A', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#155DFC'}
        onBlur={e => e.target.style.borderColor = '#D1D5DB'}
      />
    </div>
  )
}

const primaryBtn = {
  height: 44, borderRadius: 10, padding: '0 22px',
  background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
  color: '#fff', border: 'none', fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
}
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 200,
  backgroundColor: 'rgba(47,52,69,0.5)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
}
const modalStyle = {
  width: 600, maxWidth: '100%', backgroundColor: '#fff',
  borderRadius: 16, border: '1px solid #E2E8F0',
  boxShadow: '0px 20px 50px rgba(15,23,42,0.24)',
  maxHeight: '92vh', overflow: 'auto',
}
const modalHeader = {
  padding: '24px 28px', borderBottom: '1px solid #E5E7EB',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const modalFooter = {
  padding: '20px 28px', borderTop: '1px solid #E5E7EB',
  display: 'flex', justifyContent: 'flex-end', gap: 12,
}
const closeBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#9CA3AF', fontSize: 18, padding: 4,
}
