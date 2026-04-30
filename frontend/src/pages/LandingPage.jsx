import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const COLORS = {
  primary: '#155DFC',
  primaryDark: '#1E3A8A',
  text: '#0F172A',
  muted: '#64748B',
  bg: '#F8FAFC',
  border: '#E2E8F0',
  orange: '#F97316',
}

const NAV = [
  { id: 'features', label: 'Возможности' },
  { id: 'tools', label: 'Функционал' },
  { id: 'pricing', label: 'Тарифы' },
  { id: 'contact', label: 'Связаться с нами' },
]

const STATS_HERO = [
  { value: '5000+', label: 'Компаний' },
  { value: '40%', label: 'Рост продаж' },
  { value: '24/7', label: 'Поддержка' },
]

const PROBLEMS = [
  { color: '#FECACA', accent: '#EF4444', icon: '↘',
    title: 'Потери прибыли',
    desc: 'Упущенные продажи из-за неоптимального управления ассортиментом' },
  { color: '#FED7AA', accent: '#F97316', icon: '◈',
    title: 'Избыток товаров',
    desc: 'Затоваривание складов и замораживание оборотных средств в невостребованной продукции' },
  { color: '#FEF3C7', accent: '#F59E0B', icon: 'ⓘ',
    title: 'Сложный анализ',
    desc: 'Отсутствие централизованной системы для анализа данных о продажах и прогнозирования' },
  { color: '#DBEAFE', accent: '#3B82F6', icon: '☰',
    title: 'Ручная работа',
    desc: 'Большие временные затраты менеджеров на рутинные операции по обработке данных' },
]

const SOLUTION_STATS = [
  { value: '98%', label: 'Точность прогнозов' },
  { value: '60%', label: 'Экономия времени' },
  { value: '35%', label: 'Рост эффективности' },
]

const TOOLS = [
	{
		id: 'sales',
		label: 'Анализ продаж',
		title: 'Анализ продаж',
		desc: 'Детальная аналитика продаж в режиме реального времени с интерактивными дашбордами и отчётами',
	},
	{
		id: 'assortment',
		label: 'Управление ассортиментом',
		title: 'Управление ассортиментом',
		desc: 'ABC×XYZ-анализ для оптимального формирования товарных групп и приоритетов',
	},
	{
		id: 'forecast',
		label: 'Прогнозирование спроса',
		title: 'Прогнозирование спроса',
		desc: 'Адаптивный статистический прогноз продаж. Для товаров без продаж используется нулевой прогноз, для товаров с малым количеством данных — среднее значение за период, для редких продаж — метод Croston/SBA, для регулярных продаж — EWMA-прогноз с учетом недельной сезонности и тренда.',
	},
	{
		id: 'reports',
		label: 'Аналитика и отчёты',
		title: 'Аналитика и отчёты',
		desc: 'Готовые отчёты с экспортом в CSV/XML и кастомизация под нужды бизнеса',
	},
]

const PLANS = [
  { id: 'starter', title: 'Стартовый', subtitle: 'Идеально для малого бизнеса',
    price: '9 900 ₽', priceUnit: '/месяц',
    features: [
      'До 5 пользователей',
      'Базовая аналитика продаж',
      'Управление ассортиментом',
      'Облачное хранилище 10 ГБ',
      'Email-поддержка',
    ],
    cta: 'Начать бесплатно', accent: false, highlight: false },
  { id: 'pro', title: 'Профессиональный', subtitle: 'Для растущих компаний',
    price: '24 990 ₽', priceUnit: '/месяц',
    features: [
      'До 20 пользователей',
      'Расширенная аналитика',
      'AI-прогнозирование спроса',
      'Приоритетная поддержка 24/7',
      'До 10 пользователей',
      'Облачное хранилище 100 ГБ',
      'API интеграция',
      'Кастомные отчеты',
    ],
    cta: 'Попробовать 14 дней', accent: true, highlight: true },
  { id: 'enterprise', title: 'Корпоративный', subtitle: 'Для крупного бизнеса',
    price: 'По запросу', priceUnit: '',
    features: [
      'Неограниченное количество пользователей',
      'Полный набор функций',
      'Персональный менеджер',
      'SLA 99.9%',
      'Безлимитное хранилище',
      'Индивидуальная настройка',
      'On-premise решение',
    ],
    cta: 'Связаться с нами', accent: false, highlight: false },
]

const CONTACT_BENEFITS = [
  { icon: '💬', title: 'Бесплатная демонстрация', desc: 'Покажем все возможности платформы' },
  { icon: '🎯', title: 'Индивидуальное решение', desc: 'Настроим систему под ваши задачи' },
  { icon: '⚡', title: 'Быстрый старт', desc: 'Запуск в течение 24 часов' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeTool, setActiveTool] = useState(TOOLS[0].id)
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [contactSent, setContactSent] = useState(false)

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const submitContact = (e) => {
    e.preventDefault()
    setContactSent(true)
    setTimeout(() => setContactSent(false), 4000)
    setContact({ name: '', email: '', phone: '' })
  }

  return (
    <div style={{ background: '#fff', color: COLORS.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Header onNav={scrollTo} onLogin={() => navigate('/login')} />

      <Hero scrollTo={scrollTo} navigate={navigate} />

      <ProblemsSection />

      <FeaturesSection />

      <ToolsSection active={activeTool} setActive={setActiveTool} />

      <PricingSection navigate={navigate} scrollTo={scrollTo} />

      <ContactSection
        contact={contact} setContact={setContact}
        sent={contactSent} onSubmit={submitContact}
      />

      <Footer scrollTo={scrollTo} />
    </div>
  )
}

function Logo({ light }) {
  const fg = light ? '#fff' : COLORS.primary
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
          <rect x="4" y="18" width="6" height="14" rx="1.5" fill="white" />
          <rect x="15" y="11" width="6" height="21" rx="1.5" fill="white" />
          <rect x="26" y="4" width="6" height="28" rx="1.5" fill="white" />
        </svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: light ? '#fff' : COLORS.text }}>Анализ ПРО</div>
    </div>
  )
}

function Header({ onNav, onLogin }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff', borderBottom: `1px solid ${COLORS.border}`,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '16px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />
        <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => onNav(n.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, color: COLORS.text, fontFamily: 'inherit',
            }}>{n.label}</button>
          ))}
          <button onClick={onLogin} style={{
            background: 'none', border: `1px solid ${COLORS.border}`,
            color: COLORS.text, padding: '8px 18px', borderRadius: 8,
            fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}>Войти</button>
        </nav>
      </div>
    </header>
  )
}

function Hero({ scrollTo, navigate }) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #F0F4FF 0%, #ffffff 100%)',
      padding: '60px 0 100px',
    }}>
      <img src="/landing/gradient-1.svg" alt="" style={{
        position: 'absolute', top: -100, left: -200, width: 800, opacity: 0.6, pointerEvents: 'none',
      }} />
      <img src="/landing/gradient-2.svg" alt="" style={{
        position: 'absolute', bottom: -80, right: -200, width: 700, opacity: 0.5, pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 32px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center',
        position: 'relative',
      }}>
        <div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
            {STATS_HERO.map(s => (
              <div key={s.label} style={{
                background: '#fff',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 14, padding: '18px 24px',
                boxShadow: '0 4px 16px rgba(21,93,252,0.08)',
                flex: 1, textAlign: 'center',
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.primary }}>{s.value}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <h1 style={{
            fontSize: 48, lineHeight: 1.05, fontWeight: 800,
            color: COLORS.text, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px',
          }}>
            Управление продажами<br />нового поколения
          </h1>
          <p style={{ fontSize: 16, color: COLORS.muted, marginTop: 20, lineHeight: 1.6 }}>
            Автоматизируйте анализ продаж, управление ассортиментом и
            прогнозирование спроса. Увеличьте эффективность бизнеса с помощью
            искусственного интеллекта.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
            <button onClick={() => navigate('/register')} style={{
              background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
              color: '#fff', border: 'none', padding: '16px 36px',
              borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(21,93,252,0.30)', fontFamily: 'inherit',
            }}>Попробовать бесплатно</button>
            <button onClick={() => scrollTo('tools')} style={{
              background: '#fff', color: COLORS.text,
              border: `1px solid ${COLORS.border}`, padding: '16px 28px',
              borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Посмотреть функционал</button>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <img src="/landing/pc-1.svg" alt="" style={{
            width: '100%', maxWidth: 600, display: 'block',
          }} />
        </div>
      </div>
    </section>
  )
}

function ProblemsSection() {
  return (
    <section id="features" style={{
      padding: '80px 32px', background: 'linear-gradient(180deg, #ffffff 0%, #F0F4FF 100%)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, margin: 0 }}>
            Решаем реальные проблемы бизнеса
          </h2>
          <p style={{ fontSize: 16, color: COLORS.muted, marginTop: 12 }}>
            Мы понимаем вызовы, с которыми сталкиваются современные компании
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        }}>
          {PROBLEMS.map(p => (
            <div key={p.title} style={{
              background: '#fff', border: `1px solid ${COLORS.border}`,
              borderRadius: 14, padding: '28px 24px',
              boxShadow: '0 4px 12px rgba(15,23,42,0.05)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: p.accent, fontWeight: 700, marginBottom: 18,
              }}>{p.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, marginBottom: 10 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.55 }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section style={{ padding: '80px 32px', background: '#fff' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        background: 'linear-gradient(135deg, #E8EDFF 0%, #F0F4FF 100%)',
        borderRadius: 24, padding: '50px 60px',
        border: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, margin: 0 }}>
            АнализПРО — комплексное решение для роста бизнеса
          </h2>
          <p style={{ fontSize: 15, color: COLORS.muted, marginTop: 14, maxWidth: 800, margin: '14px auto 0', lineHeight: 1.6 }}>
            Наша платформа объединяет мощные инструменты для автоматизации анализа продаж,
            интеллектуального управления ассортиментом и точного прогнозирования спроса.
            С помощью технологий искусственного интеллекта мы помогаем принимать решения на
            основе данных, оптимизировать складские запасы и увеличивать прибыль.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {SOLUTION_STATS.map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 14, padding: '28px 24px',
              border: `1px solid ${COLORS.border}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.primary }}>{s.value}</div>
              <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ToolsSection({ active, setActive }) {
  const tool = TOOLS.find(t => t.id === active) || TOOLS[0]
  return (
    <section id="tools" style={{ padding: '80px 32px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, margin: 0 }}>
            Мощные инструменты для вашего роста
          </h2>
          <p style={{ fontSize: 16, color: COLORS.muted, marginTop: 12 }}>
            Всё необходимое для управления продажами в одной платформе
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          marginBottom: 40,
        }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              padding: '14px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              background: active === t.id ? 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)' : '#fff',
              color: active === t.id ? '#fff' : COLORS.text,
              border: `1px solid ${active === t.id ? COLORS.primary : COLORS.border}`,
              boxShadow: active === t.id ? '0 6px 16px rgba(21,93,252,0.20)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center',
        }}>
          <div>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 22,
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="14" width="5" height="10" rx="1" fill="white" />
                <rect x="11.5" y="9" width="5" height="15" rx="1" fill="white" />
                <rect x="19" y="4" width="5" height="20" rx="1" fill="white" />
              </svg>
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, margin: 0 }}>{tool.title}</h3>
            <p style={{ fontSize: 15, color: COLORS.muted, marginTop: 14, lineHeight: 1.65 }}>{tool.desc}</p>
          </div>
          <div>
            <img src="/landing/pc-2.svg" alt="" style={{ width: '100%', maxWidth: 540, display: 'block' }} />
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingSection({ navigate, scrollTo }) {
  return (
    <section id="pricing" style={{
      padding: '80px 32px', background: 'linear-gradient(180deg, #F0F4FF 0%, #ffffff 100%)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text, margin: 0 }}>
            Прозрачные тарифы для любого бизнеса
          </h2>
          <p style={{ fontSize: 16, color: COLORS.muted, marginTop: 12 }}>
            Выберите оптимальный план и начните увеличивать прибыль уже сегодня
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch',
        }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              position: 'relative', background: '#fff',
              border: plan.highlight ? `2px solid ${COLORS.orange}` : `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: '36px 28px',
              boxShadow: plan.highlight ? '0 12px 32px rgba(249,115,22,0.18)' : '0 4px 12px rgba(15,23,42,0.05)',
              display: 'flex', flexDirection: 'column',
            }}>
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: COLORS.orange, color: '#fff',
                  padding: '6px 18px', borderRadius: 14,
                  fontSize: 12, fontWeight: 700,
                }}>Популярный выбор</div>
              )}
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{plan.title}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 6 }}>{plan.subtitle}</div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: COLORS.text }}>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: 'center', marginTop: 28, marginBottom: 18 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.text }}>
                  {plan.price}
                </div>
                {plan.priceUnit && (
                  <span style={{ fontSize: 14, color: COLORS.muted }}>{plan.priceUnit}</span>
                )}
              </div>
              <button
                onClick={() => plan.id === 'enterprise' ? scrollTo('contact') : navigate('/register')}
                style={{
                  padding: '14px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                  background: plan.highlight ? COLORS.orange : '#fff',
                  color: plan.highlight ? '#fff' : COLORS.text,
                  border: plan.highlight ? 'none' : `1px solid ${COLORS.border}`,
                }}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection({ contact, setContact, sent, onSubmit }) {
  return (
    <section id="contact" style={{ padding: '80px 32px', background: '#fff' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        background: 'linear-gradient(135deg, #E8EDFF 0%, #DDE7FF 100%)',
        borderRadius: 22, padding: '50px',
        border: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, margin: 0, lineHeight: 1.15 }}>
              Начните увеличивать прибыль уже сегодня
            </h2>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 14, lineHeight: 1.6 }}>
              Оставьте заявку, и наш специалист свяжется с вами для бесплатной
              консультации и демонстрации возможностей платформы.
            </p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CONTACT_BENEFITS.map(b => (
                <div key={b.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 18,
                  }}>{b.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{b.title}</div>
                    <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <Label>Имя</Label>
              <input value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })}
                placeholder="Иван Иванов" style={inputStyle} required />
            </div>
            <div>
              <Label>Email</Label>
              <input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })}
                placeholder="ivan@example.com" style={inputStyle} required />
            </div>
            <div>
              <Label>Телефон</Label>
              <input value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67" style={inputStyle} required />
            </div>
            <button type="submit" style={{
              marginTop: 6,
              background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
              color: '#fff', border: 'none', padding: '16px',
              borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>{sent ? 'Заявка отправлена!' : 'Отправить заявку'}</button>
            <div style={{ fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 4 }}>
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function Footer({ scrollTo }) {
  return (
    <footer style={{ background: '#1E2A47', color: '#fff', padding: '60px 32px 30px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 60,
          paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.10)',
        }}>
          <div>
            <Logo light />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 14, maxWidth: 420, lineHeight: 1.6 }}>
              Платформа для автоматизации анализа продаж и управления ассортиментом
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FooterLink onClick={() => scrollTo('features')}>Преимущества</FooterLink>
            <FooterLink onClick={() => scrollTo('tools')}>Функционал</FooterLink>
            <FooterLink onClick={() => scrollTo('pricing')}>Тарифы</FooterLink>
            <FooterLink onClick={() => scrollTo('contact')}>Оставить заявку</FooterLink>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 32, alignItems: 'center',
          padding: '30px 0',
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6, maxWidth: 600 }}>
            «Проект реализован при поддержке Фонда содействия инновациям в рамках программы «Студенческий стартап»
            мероприятия «Платформа университетского технологического предпринимательства» федерального проекта «Технологии».
          </p>
          <img src="/landing/tech-project.svg" alt="" style={{ height: 56 }} />
          <img src="/landing/fund.svg" alt="" style={{ height: 56 }} />
        </div>
        <div style={{
          textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.45)',
          paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.10)',
        }}>
          © 2025 ИНН: 0000000. Все права защищены.
        </div>
      </div>
    </footer>
  )
}

function Label({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>{children}</div>
}

function FooterLink({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      fontSize: 14, color: 'rgba(255,255,255,0.85)', fontFamily: 'inherit',
      textAlign: 'left', padding: 0,
    }}>{children}</button>
  )
}

const inputStyle = {
  width: '100%', height: 46, borderRadius: 10,
  border: `1px solid ${COLORS.border}`,
  padding: '0 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  color: COLORS.text, background: '#fff',
}
