import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import Layout from '../components/Layout.jsx'
import { Card } from '../components/UI.jsx'

const PLANS = [
  {
    id: 'starter',
    name: 'Стартовый',
    price: 1990,
    features: [
      'До 100 товаров в каталоге',
      'Базовая аналитика',
      'Экспорт в CSV',
      '1 пользователь',
      'Email поддержка',
    ],
  },
  {
    id: 'pro',
    name: 'Профессиональный',
    price: 4990,
    highlight: true,
    features: [
      'До 1000 товаров в каталоге',
      'Расширенная аналитика',
      'ABC/XYZ анализ',
      'Прогнозирование (ARIMA)',
      'Экспорт в XLSX и PDF',
      'До 5 пользователей',
      'Приоритетная поддержка',
      'Запросы на естественном языке',
    ],
  },
  {
    id: 'enterprise',
    name: 'Корпоративный',
    price: 9990,
    features: [
      'Неограниченное количество товаров',
      'Полная аналитика',
      'Все функции платформы',
      'Многоразовые отчёты',
      'API доступ',
      'Неограниченные пользователи',
      'Персональный менеджер',
      'SLA-поддержка 24/7',
    ],
  },
]

const PLAN_LABEL = {
  free: 'starter',
  starter: 'starter',
  pro: 'pro',
  enterprise: 'enterprise',
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const currentPlan = PLAN_LABEL[user?.subscription_plan || 'free'] || 'starter'
  const currentPlanInfo = PLANS.find(p => p.id === currentPlan) || PLANS[1]
  const expires = user?.subscription_expires
    ? new Date(user.subscription_expires).toLocaleDateString('ru-RU')
    : '01.07.2026'

  return (
    <Layout title="Управление подпиской">
      {confirmingCancel && (
        <CancelModal
          onClose={() => setConfirmingCancel(false)}
          onConfirm={() => {
            setConfirmingCancel(false)
            // TODO wire to backend when /me/subscription/cancel exists
          }}
        />
      )}

      <Card style={{
        padding: 28, marginBottom: 32,
        background: 'linear-gradient(135deg, #155DFC 0%, #4F39F6 100%)',
        border: 'none', color: '#fff',
        boxShadow: '0 8px 24px rgba(21,93,252,0.30)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 6 }}>Текущий тарифный план</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{currentPlanInfo.name}</div>
            <div style={{ fontSize: 18, marginTop: 6 }}>
              <strong>{fmtPrice(currentPlanInfo.price)}</strong> / месяц
            </div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.16)', padding: '12px 18px', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="3" width="14" height="13" rx="2" stroke="#fff" strokeWidth="1.6" fill="none" />
              <line x1="2" y1="7" x2="16" y2="7" stroke="#fff" strokeWidth="1.6" />
              <line x1="6" y1="1" x2="6" y2="5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="12" y1="1" x2="12" y2="5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 14 }}>Следующее списание {expires}</span>
          </div>
        </div>
      </Card>

      <div style={{ fontSize: 22, fontWeight: 700, color: '#101828', textAlign: 'center', marginBottom: 24 }}>
        Доступные тарифные планы
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlan}
            onSelect={() => navigate(`/subscription/checkout/${plan.id}`)}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setConfirmingCancel(true)} style={{
          background: 'none', border: 'none', color: '#B91C1C',
          fontSize: 15, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline',
          fontFamily: 'Inter',
        }}>
          Отменить подписку
        </button>
      </div>
    </Layout>
  )
}

function PlanCard({ plan, isCurrent, onSelect }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 16,
      border: isCurrent ? '2px solid #155DFC' : '1px solid #E5E7EB',
      boxShadow: isCurrent
        ? '0 0 0 4px rgba(21,93,252,0.10), 0 8px 24px rgba(21,93,252,0.16)'
        : '0px 0px 12px 0px rgba(37,99,235,0.08)',
      padding: 26, position: 'relative',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>{plan.name}</div>
        {isCurrent && (
          <span style={{
            fontSize: 12, fontWeight: 600,
            backgroundColor: 'rgba(21,93,252,0.10)', color: '#155DFC',
            padding: '4px 10px', borderRadius: 20,
          }}>Текущий</span>
        )}
      </div>

      <div style={{ marginBottom: 22 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: '#101828' }}>{fmtPrice(plan.price)}</span>
        <span style={{ fontSize: 14, color: '#64748B', marginLeft: 6 }}>/ месяц</span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 22 }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#364153' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M3 8.5L6.5 12L13 4" stroke="#00A63E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <button disabled style={{
          height: 46, borderRadius: 10,
          backgroundColor: '#F1F5F9', color: '#64748B',
          border: '1px solid #E5E7EB', fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
          cursor: 'not-allowed',
        }}>
          Подключён
        </button>
      ) : (
        <button onClick={onSelect} style={{
          height: 46, borderRadius: 10,
          background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
          color: '#fff', border: 'none', fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
          cursor: 'pointer',
        }}>
          Выбрать этот план
        </button>
      )}
    </div>
  )
}

function CancelModal({ onClose, onConfirm }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(47,52,69,0.5)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        width: 460, backgroundColor: '#fff', borderRadius: 16,
        border: '1px solid #E2E8F0', boxShadow: '0px 20px 50px rgba(15,23,42,0.24)',
        padding: 28,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#101828', marginBottom: 8 }}>
          Отменить подписку?
        </div>
        <div style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
          После отмены вы продолжите пользоваться текущим тарифом до конца оплаченного периода. Затем аккаунт переключится на бесплатный план.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            height: 44, borderRadius: 10, padding: '0 18px',
            backgroundColor: '#fff', color: '#364153',
            border: '1px solid #D1D5DB', fontFamily: 'Inter', fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
          }}>Не отменять</button>
          <button onClick={onConfirm} style={{
            height: 44, borderRadius: 10, padding: '0 18px',
            backgroundColor: '#B91C1C', color: '#fff',
            border: 'none', fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}>Отменить подписку</button>
        </div>
      </div>
    </div>
  )
}

function fmtPrice(n) {
  return `${new Intl.NumberFormat('ru-RU').format(n)} ₽`
}
