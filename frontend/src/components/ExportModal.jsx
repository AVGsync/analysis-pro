import { useState } from 'react'
import { SecondaryButton } from './UI.jsx'

const FORMATS = [
  { id: 'xlsx', label: 'XLSX (Excel)', sub: 'Электронная таблица' },
  { id: 'csv', label: 'CSV', sub: 'Универсальный формат' },
  { id: 'pdf', label: 'PDF', sub: 'Документ для печати' },
]

const PERIODS = [
  { id: '7', label: 'Последние 7 дней' },
  { id: '30', label: 'Последние 30 дней' },
  { id: '90', label: 'Последние 3 месяца' },
  { id: 'custom', label: 'Произвольный период' },
]

export default function ExportModal({ title = 'Выгрузка отчёта', onClose, onExport }) {
  const [format, setFormat] = useState('xlsx')
  const [period, setPeriod] = useState('30')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRecommendations, setIncludeRecommendations] = useState(false)

  const handleExport = () => {
    onExport({ format, period, from, to, includeCharts, includeRecommendations })
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#101828' }}>{title}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div style={fieldLabel}>Период данных</div>
            <select value={period} onChange={e => setPeriod(e.target.value)} style={selectStyle}>
              {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            {period === 'custom' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
                <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
              </div>
            )}
          </div>

          <div>
            <div style={fieldLabel}>Формат файла</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FORMATS.map(f => (
                <label key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: format === f.id ? '1.5px solid #155DFC' : '1px solid #E5E7EB',
                  backgroundColor: format === f.id ? 'rgba(21,93,252,0.04)' : '#fff',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}>
                  <input
                    type="radio"
                    name="format"
                    checked={format === f.id}
                    onChange={() => setFormat(f.id)}
                    style={{ accentColor: '#155DFC', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{f.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={e => setIncludeCharts(e.target.checked)}
                style={{ accentColor: '#155DFC', width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, color: '#364153' }}>Включить графики</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeRecommendations}
                onChange={e => setIncludeRecommendations(e.target.checked)}
                style={{ accentColor: '#155DFC', width: 16, height: 16, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, color: '#364153' }}>Включить рекомендации</span>
            </label>
          </div>
        </div>

        <div style={footerStyle}>
          <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
          <button onClick={handleExport} style={primaryBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Скачать отчёт
          </button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 200,
  backgroundColor: 'rgba(47,52,69,0.5)',
  backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20,
}
const modalStyle = {
  width: 520, maxWidth: '100%', backgroundColor: '#fff',
  borderRadius: 16, border: '1px solid #E2E8F0',
  boxShadow: '0px 20px 50px rgba(15,23,42,0.24)',
  maxHeight: '92vh', overflow: 'auto',
}
const headerStyle = {
  padding: '24px 28px', borderBottom: '1px solid #E5E7EB',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const footerStyle = {
  padding: '20px 28px', borderTop: '1px solid #E5E7EB',
  display: 'flex', justifyContent: 'flex-end', gap: 12,
}
const closeBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#9CA3AF', fontSize: 18, padding: 4,
}
const fieldLabel = {
  fontSize: 13, fontWeight: 600, color: '#364153', marginBottom: 8,
}
const selectStyle = {
  width: '100%', height: 44, borderRadius: 10, border: '1px solid #D1D5DB',
  padding: '0 32px 0 14px', fontSize: 14, fontFamily: 'Inter',
  color: '#0A0A0A', background: '#fff', cursor: 'pointer', outline: 'none',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
}
const inputStyle = {
  flex: 1, height: 44, borderRadius: 10, border: '1px solid #D1D5DB',
  padding: '0 14px', fontSize: 14, fontFamily: 'Inter', outline: 'none', color: '#0A0A0A',
}
const primaryBtn = {
  height: 46, borderRadius: 10, padding: '0 22px',
  background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
  color: '#fff', border: 'none', fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
}
