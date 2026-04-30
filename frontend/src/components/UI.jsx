/* Shared UI primitives matching Figma design tokens */

/* Primary button — blue gradient */
export function PrimaryButton({ children, onClick, disabled, style = {}, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 48,
        borderRadius: 10,
        background: disabled
          ? '#CBD5E1'
          : 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
        color: '#fff',
        border: 'none',
        fontFamily: 'Inter',
        fontSize: 15,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'opacity 0.15s',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.9' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

/* Secondary button — outlined */
export function SecondaryButton({ children, onClick, style = {}, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        height: 46,
        borderRadius: 10,
        background: '#fff',
        color: '#364153',
        border: '1px solid #D1D5DB',
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 0.15s, border-color 0.15s',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#155DFC'; e.currentTarget.style.color = '#155DFC' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#364153' }}
    >
      {children}
    </button>
  )
}

/* Form input */
export function Input({ label, type = 'text', value, onChange, placeholder, error, autoComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          height: 45,
          borderRadius: 8,
          border: error ? '1.5px solid #E7000B' : '1px solid #CBD5E1',
          padding: '0 12px',
          fontSize: 14,
          fontFamily: 'Inter',
          color: '#0A0A0A',
          outline: 'none',
          width: '100%',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = '#155DFC' }}
        onBlur={e => { if (!error) e.target.style.borderColor = '#CBD5E1' }}
      />
      {error && <span style={{ fontSize: 12, color: '#E7000B' }}>{error}</span>}
    </div>
  )
}

/* Card container */
export function Card({ children, style = {} }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      boxShadow: '0px 0px 12px 0px rgba(37,99,235,0.12)',
      ...style,
    }}>
      {children}
    </div>
  )
}

/* Stat card (KPI metric) */
export function StatCard({ label, value, delta, icon }) {
  const isPositive = typeof delta === 'string' ? delta.startsWith('+') : delta >= 0
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      boxShadow: '0px 0px 12px 0px rgba(37,99,235,0.12)',
      padding: '24px 28px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#101828' }}>{value}</div>
          {delta !== undefined && (
            <div style={{ fontSize: 13, color: isPositive ? '#00A63E' : '#E7000B', marginTop: 6, fontWeight: 500 }}>
              {delta}
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            width: 44, height: 44,
            borderRadius: 10,
            background: 'rgba(21,93,252,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

/* Badge */
export function Badge({ label, variant = 'default' }) {
  const colors = {
    high:    { bg: '#FEE2E2', color: '#E7000B' },
    medium:  { bg: '#FEF3C7', color: '#B45309' },
    ok:      { bg: '#DCFCE7', color: '#00A63E' },
    default: { bg: '#E8F3FF', color: '#155DFC' },
  }
  const c = colors[variant] || colors.default
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      backgroundColor: c.bg,
      color: c.color,
    }}>
      {label}
    </span>
  )
}

/* Table header row */
export function TableHeader({ columns }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: columns.map(c => c.width || '1fr').join(' '),
      backgroundColor: '#E8F3FF',
      borderBottom: '1px solid #E5E7EB',
    }}>
      {columns.map((col, i) => (
        <div key={i} style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, color: '#364153' }}>
          {col.label}
        </div>
      ))}
    </div>
  )
}

/* Table row */
export function TableRow({ columns, row, index }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: columns.map(c => c.width || '1fr').join(' '),
      borderBottom: '1px solid #E5E7EB',
      backgroundColor: index % 2 === 0 ? '#fff' : 'rgba(241,245,249,0.5)',
    }}>
      {columns.map((col, i) => (
        <div key={i} style={{ padding: '14px 24px', fontSize: 15, color: '#101828', display: 'flex', alignItems: 'center' }}>
          {col.render ? col.render(row[col.key], row) : row[col.key]}
        </div>
      ))}
    </div>
  )
}

/* Loading spinner */
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #E5E7EB',
        borderTopColor: '#155DFC',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* Error box */
export function ErrorBox({ message }) {
  return (
    <div style={{
      backgroundColor: '#FEE2E2',
      border: '1px solid #FECACA',
      borderRadius: 10,
      padding: '12px 16px',
      color: '#E7000B',
      fontSize: 14,
    }}>
      {message}
    </div>
  )
}
