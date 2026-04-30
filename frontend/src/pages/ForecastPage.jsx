import { useState, useEffect, useMemo } from 'react'
import { api } from '../api/index.js'
import Layout from '../components/Layout.jsx'
import ExportModal from '../components/ExportModal.jsx'
import { Card, SecondaryButton, Spinner, ErrorBox } from '../components/UI.jsx'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n || 0))

const HORIZON_OPTIONS = [
  { value: 30, label: '1 месяц' },
  { value: 60, label: '2 месяца' },
  { value: 90, label: '3 месяца' },
  { value: 180, label: '6 месяцев' },
]

const URGENCY_BADGE = {
  high: { bg: '#FEE2E2', color: '#B91C1C', label: 'Срочно' },
  medium: { bg: '#FEF3C7', color: '#92400E', label: 'Скоро' },
  ok: { bg: '#DCFCE7', color: '#166534', label: 'В норме' },
}

const TABLE_COLS = [
  { key: 'product_name', label: 'Товар', width: '1.4fr' },
  { key: 'sku', label: 'SKU', width: '160px' },
  { key: 'current_stock', label: 'Остаток', width: '100px', render: v => fmt(v) },
  { key: 'forecast_total', label: 'Прогноз', width: '110px', render: v => fmt(v) },
  { key: 'stock_days_left', label: 'Дни до сток-аута', width: '160px', render: v => `${v} дн.` },
  { key: 'recommend_order', label: 'Рекомендация', width: '160px', render: (v, row) => {
    if (v <= 0) return <span style={{ color: '#64748B' }}>Не нужен заказ</span>
    return <span style={{ fontWeight: 600, color: '#101828' }}>Заказать {fmt(v)} шт</span>
  }},
  { key: 'urgency', label: 'Статус', width: '130px', render: v => {
    const b = URGENCY_BADGE[v] || URGENCY_BADGE.ok
    return (
      <span style={{
        fontSize: 12, fontWeight: 600,
        backgroundColor: b.bg, color: b.color,
        padding: '4px 12px', borderRadius: 20,
      }}>{b.label}</span>
    )
  }},
]

export default function ForecastPage() {
  const [forecast, setForecast] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [monthly, setMonthly] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [horizon, setHorizon] = useState(90)
  const [showExport, setShowExport] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [fc, rec, mo] = await Promise.all([
        api.forecast(horizon, 90),
        api.recommendations(horizon, 90),
        api.forecastMonthly(horizon, 90),
      ])
      setForecast(Array.isArray(fc) ? fc : [])
      setRecommendations(Array.isArray(rec) ? rec : [])
      setMonthly(Array.isArray(mo) ? mo : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [horizon])

  const chartData = useMemo(() => {
    return monthly.map(m => ({
      label: formatMonth(m.month),
      qty: m.forecast_qty || 0,
    }))
  }, [monthly])

  const urgentRecs = recommendations.filter(r => r.urgency === 'high' || r.urgency === 'medium').slice(0, 5)

  return (
    <Layout title="Прогнозирование спроса">
      {showExport && (
        <ExportModal
          title="Выгрузка прогноза"
          onClose={() => setShowExport(false)}
          onExport={({ format }) => {
            setShowExport(false)
            window.open(api.exportForecast(horizon, 90, format === 'xlsx' ? 'csv' : format), '_blank')
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 28, alignItems: 'center' }}>
        <select value={horizon} onChange={e => setHorizon(Number(e.target.value))} style={selectStyle}>
          {HORIZON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <SecondaryButton>
          <FilterIcon /> Фильтры
        </SecondaryButton>
        <SecondaryButton onClick={() => setShowExport(true)}>
          <ExportIcon /> Экспорт
        </SecondaryButton>
      </div>

      {error && <ErrorBox message={error} />}

      <Card style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>
            Прогноз спроса на следующие {Math.round(horizon / 30)} месяцев
          </div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
            Модель ARIMA(7,1,1) с откатом на скользящее среднее
          </div>
        </div>
        {loading ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 12, right: 24, left: 12, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [fmt(v), 'Прогноз (шт)']} />
              <Line type="monotone" dataKey="qty" stroke="#155DFC" strokeWidth={2.5} dot={{ r: 4, fill: '#155DFC' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {urgentRecs.length > 0 && (
        <div style={{
          backgroundColor: '#FEFCE8',
          border: '1px solid #FDE68A',
          borderRadius: 16, padding: 28, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              backgroundColor: '#FDE68A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1l8 14H1L9 1z" stroke="#B45309" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
                <path d="M9 6v4M9 12v.5" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#92400E' }}>Рекомендации по закупкам</div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {urgentRecs.map((r, i) => (
              <li key={i} style={{ display: 'flex', gap: 10 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', backgroundColor: '#B45309',
                  marginTop: 7, flexShrink: 0,
                }} />
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>{r.product_name}</span>
                  <span style={{ fontSize: 14, color: '#7C2D12' }}>
                    {' — '}остаток {fmt(r.current_stock)} шт. хватит на {r.stock_days_left} дн.
                    {r.recommend_order > 0 && `, заказать ${fmt(r.recommend_order)} шт.`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Детализация прогноза по товарам</div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
            Прогноз и риск дефицита по каждой позиции
          </div>
        </div>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ ...tableHeader, gridTemplateColumns: TABLE_COLS.map(c => c.width).join(' ') }}>
              {TABLE_COLS.map(c => <div key={c.key} style={tableHeaderCell}>{c.label}</div>)}
            </div>
            {recommendations.map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: TABLE_COLS.map(c => c.width).join(' '),
                borderBottom: '1px solid #F1F5F9',
                backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC',
              }}>
                {TABLE_COLS.map(c => (
                  <div key={c.key} style={tableCell}>
                    {c.render ? c.render(row[c.key], row) : row[c.key]}
                  </div>
                ))}
              </div>
            ))}
            {recommendations.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                Нет данных для прогноза
              </div>
            )}
          </div>
        )}
      </Card>
    </Layout>
  )
}

function formatMonth(iso) {
  if (!iso) return ''
  const m = String(iso).slice(5, 7)
  const y = String(iso).slice(0, 4)
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  return `${months[parseInt(m, 10) - 1] || m} ${y}`
}

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)
const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const selectStyle = {
  height: 44, borderRadius: 10, border: '1px solid #D1D5DB',
  padding: '0 36px 0 14px', fontSize: 14, fontFamily: 'Inter',
  color: '#101828', background: '#fff', cursor: 'pointer', outline: 'none',
  appearance: 'none', minWidth: 160,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
}

const tooltipStyle = {
  borderRadius: 8, border: '1px solid #E8EDF3',
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
  fontFamily: 'Inter', fontSize: 13,
}
const tableHeader = {
  display: 'grid', backgroundColor: '#F8FAFC',
  borderBottom: '1px solid #E5E7EB',
}
const tableHeaderCell = {
  padding: '12px 24px', fontSize: 13, fontWeight: 600, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.03em',
}
const tableCell = {
  padding: '14px 24px', fontSize: 14, color: '#101828',
  display: 'flex', alignItems: 'center',
}
