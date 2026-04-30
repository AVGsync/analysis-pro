import { useAuth } from '../App.jsx'
import { useNavigate } from 'react-router-dom'

export default function Header({ title }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header style={{
      position: 'fixed',
      left: 340,
      top: 0,
      right: 0,
      height: 80,
      backgroundColor: '#fff',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0px 1px 3px 0px rgba(27,58,107,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 100px 0 60px',
      zIndex: 90,
    }}>
      <span style={{ fontSize: 24, fontWeight: 500, color: '#0F172A' }}>{title}</span>

      <button
        onClick={() => navigate('/profile')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          borderRadius: 10, padding: '4px 12px 4px 4px',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <div style={{
          width: 32, height: 32,
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
        <span style={{ fontSize: 14, fontWeight: 500, color: '#364153' }}>
          {user?.full_name?.split(' ')[0] || 'Профиль'}
        </span>
      </button>
    </header>
  )
}
