import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton, SecondaryButton } from '../components/UI.jsx'

const STEPS = [
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="6" y="28" width="10" height="22" rx="2" fill="white" />
        <rect x="23" y="18" width="10" height="32" rx="2" fill="white" />
        <rect x="40" y="8" width="10" height="42" rx="2" fill="white" />
      </svg>
    ),
    title: 'Анализируйте продажи',
    desc: 'Получайте детальную аналитику по продажам с интерактивными графиками и отчетами. Отслеживайте ключевые метрики и выявляйте тренды.',
  },
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="6" y="6" width="44" height="44" rx="4" stroke="white" strokeWidth="3" fill="none" />
        <line x1="14" y1="20" x2="42" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="28" x2="42" y2="28" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <line x1="14" y1="36" x2="30" y2="36" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    title: 'Управляйте ассортиментом',
    desc: 'Проводите ABC/XYZ анализ товаров, оптимизируйте товарные запасы и принимайте обоснованные решения о закупках.',
  },
  {
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M6 38 L18 24 L28 30 L48 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="48" cy="10" r="5" fill="white" />
      </svg>
    ),
    title: 'Прогнозируйте спрос',
    desc: 'Используйте машинное обучение для точного прогнозирования спроса и автоматических рекомендаций по пополнению запасов.',
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else navigate('/')
  }

  const skip = () => navigate('/')

  const s = STEPS[step]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #EBF1FF 0%, #8D9199 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 678,
        backgroundColor: '#fff',
        borderRadius: 16,
        boxShadow: '0px 0px 12px 0px rgba(37,99,235,0.12)',
        padding: '52px',
      }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{
            width: 96, height: 96, borderRadius: 16,
            background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {s.icon}
          </div>
        </div>

        {/* Text */}
        <h2 style={{ fontSize: 36, fontWeight: 700, textAlign: 'center', color: '#0A0A0A', marginBottom: 12 }}>
          {s.title}
        </h2>
        <p style={{ fontSize: 18, textAlign: 'center', color: '#4A5565', lineHeight: '28px', marginBottom: 32 }}>
          {s.desc}
        </p>

        {/* Progress */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: '#4A5565' }}>Шаг {step + 1} из {STEPS.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 32 : 8,
              height: 8, borderRadius: 4,
              backgroundColor: i === step ? '#155DFC' : '#D1D5DB',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SecondaryButton onClick={skip}>Пропустить</SecondaryButton>
          <PrimaryButton onClick={goNext} style={{ width: 164 }}>
            {step < STEPS.length - 1 ? 'Далее' : 'Начать'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
