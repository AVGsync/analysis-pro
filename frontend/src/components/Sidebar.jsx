import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const NAV = [
  {
    to: '/sales',
    label: 'Анализ продаж',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="10" width="4" height="8" rx="1" fill={active ? '#155DFC' : '#364153'} />
        <rect x="8" y="6" width="4" height="12" rx="1" fill={active ? '#155DFC' : '#364153'} />
        <rect x="14" y="2" width="4" height="16" rx="1" fill={active ? '#155DFC' : '#364153'} />
      </svg>
    ),
  },
  {
    to: '/assortment',
    label: 'Управление ассортиментом',
    icon: (active) => (
      <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
        <rect x="1" y="1" width="16" height="18" rx="2" stroke={active ? '#155DFC' : '#364153'} strokeWidth="1.6" fill="none" />
        <line x1="4" y1="6" x2="14" y2="6" stroke={active ? '#155DFC' : '#364153'} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="4" y1="10" x2="14" y2="10" stroke={active ? '#155DFC' : '#364153'} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="4" y1="14" x2="10" y2="14" stroke={active ? '#155DFC' : '#364153'} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/forecast',
    label: 'Прогнозирование спроса',
    icon: (active) => (
      <svg width="18" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 14 L7 9 L11 12 L18 4" stroke={active ? '#155DFC' : '#364153'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="18" cy="4" r="2" fill={active ? '#155DFC' : '#364153'} />
      </svg>
    ),
  },
  {
    to: '/nl-query',
    label: 'Запрос на естественном языке',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1h-7l-4 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z" stroke={active ? '#155DFC' : '#364153'} strokeWidth="1.6" strokeLinejoin="round" fill="none" />
        <circle cx="7" cy="9" r="0.9" fill={active ? '#155DFC' : '#364153'} />
        <circle cx="10" cy="9" r="0.9" fill={active ? '#155DFC' : '#364153'} />
        <circle cx="13" cy="9" r="0.9" fill={active ? '#155DFC' : '#364153'} />
      </svg>
    ),
  },
]

export default function Sidebar({ activePage }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: 0,
      width: 340,
      height: '100vh',
      backgroundColor: '#fff',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        height: 80,
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 24px',
      }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: 8,
          background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="8" width="3" height="8" rx="0.8" fill="white" />
            <rect x="7.5" y="5" width="3" height="11" rx="0.8" fill="white" />
            <rect x="13" y="1" width="3" height="15" rx="0.8" fill="white" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#101828' }}>Анализ ПРО</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 16px',
            height: 48,
            borderRadius: 10,
            textDecoration: 'none',
            backgroundColor: isActive ? 'rgba(21,93,252,0.10)' : 'transparent',
            color: isActive ? '#155DFC' : '#364153',
            fontWeight: isActive ? 700 : 500,
            fontSize: 15,
            transition: 'background 0.15s',
          })}>
            {({ isActive }) => (
              <>
                <span style={{ flexShrink: 0 }}>{icon(isActive)}</span>
                <span style={{ lineHeight: '20px' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        borderTop: '1px solid #E5E7EB',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="white" strokeWidth="1.5" />
            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.full_name || 'Пользователь'}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email || ''}
          </div>
        </div>
        <button onClick={handleLogout} title="Выйти" style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9CA3AF',
          display: 'flex', alignItems: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 2H3a1 1 0 00-1 1v12a1 1 0 001 1h4M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
