import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '../api/index.js'
import Layout from '../components/Layout.jsx'
import ExportModal from '../components/ExportModal.jsx'
import { Card, SecondaryButton, Spinner, ErrorBox } from '../components/UI.jsx'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n || 0))
const fmtRub = (n) => `${fmt(n)} ₽`
const fmtDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

const PERIOD_OPTIONS = [
  { id: '7', label: '7 дней' },
  { id: '30', label: '30 дней' },
  { id: '90', label: '3 месяца' },
  { id: 'custom', label: 'Произвольный' },
]

function computeRange(period, customFrom, customTo) {
  if (period === 'custom') return { from: customFrom, to: customTo }
  const days = parseInt(period, 10)
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - days)
  const iso = (d) => d.toISOString().slice(0, 10)
  return { from: iso(from), to: iso(to) }
}

function buildDaily(rows) {
  const map = {}
  rows.forEach(r => {
    const day = r.sold_at?.slice(0, 10) || ''
    if (!map[day]) map[day] = { date: day, revenue: 0, quantity: 0 }
    map[day].revenue += r.revenue || 0
    map[day].quantity += r.quantity || 0
  })
  return Object.values(map)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({ ...d, dateLabel: fmtDate(d.date + 'T00:00:00Z') }))
}

function buildTop5(rows) {
  const map = {}
  rows.forEach(r => {
    if (!map[r.product_name]) map[r.product_name] = { name: r.product_name, revenue: 0, quantity: 0 }
    map[r.product_name].revenue += r.revenue || 0
    map[r.product_name].quantity += r.quantity || 0
  })
  return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
}

function FilterModal({ initial, onClose, onApply }) {
  const [period, setPeriod] = useState(initial.period)
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [category, setCategory] = useState(initial.category || 'all')

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={modalHeader}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#101828' }}>Настройка фильтров</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={fieldLabel}>Период</div>
            <select value={period} onChange={e => setPeriod(e.target.value)} style={selectStyle}>
              {PERIOD_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          {period === 'custom' && (
            <div style={{ display: 'flex', gap: 12 }}>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
              <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
            </div>
          )}
          <div>
            <div style={fieldLabel}>Категория</div>
            <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              <option value="all">Все категории</option>
              <option value="Ноутбуки">Ноутбуки</option>
              <option value="Смартфоны">Смартфоны</option>
              <option value="Бытовая техника">Бытовая техника</option>
              <option value="Аксессуары">Аксессуары</option>
              <option value="Планшеты">Планшеты</option>
            </select>
          </div>
        </div>
        <div style={modalFooter}>
          <SecondaryButton onClick={onClose}>Отмена</SecondaryButton>
          <button onClick={() => onApply({ period, from, to, category })} style={primaryBtn}>Применить</button>
        </div>
      </div>
    </div>
  )
}

const TABLE_COLS = [
  { key: 'sold_at', label: 'Дата', width: '160px', render: v => fmtDate(v) },
  { key: 'product_name', label: 'Товар', width: '1.4fr' },
  { key: 'category', label: 'Категория', width: '160px' },
  { key: 'quantity', label: 'Кол-во', width: '100px' },
  { key: 'revenue', label: 'Выручка', width: '160px', render: v => fmtRub(v) },
]

export default function SalesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ period: '30', from: '', to: '', category: 'all' })
  const [showFilter, setShowFilter] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const range = useMemo(() => computeRange(filter.period, filter.from, filter.to), [filter])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await api.sellDetail(range.from || null, range.to || null)
      let list = Array.isArray(data) ? data : []
      if (filter.category !== 'all') list = list.filter(r => r.category === filter.category)
      setRows(list)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [range.from, range.to, filter.category])

  useEffect(() => { load() }, [load])

  const daily = useMemo(() => buildDaily(rows), [rows])
  const top5 = useMemo(() => buildTop5(rows), [rows])

  const totalRevenue = rows.reduce((s, r) => s + (r.revenue || 0), 0)
  const totalQty = rows.reduce((s, r) => s + (r.quantity || 0), 0)
  const profit = Math.round(totalRevenue * 0.18)

  const handleExport = ({ format }) => {
    setShowExport(false)
    window.open(api.exportAssortment(format === 'xlsx' ? 'csv' : format), '_blank')
  }

  return (
    <Layout title="Аналитика продаж">
      {showFilter && <FilterModal initial={filter} onClose={() => setShowFilter(false)} onApply={(f) => { setFilter(f); setShowFilter(false) }} />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} onExport={handleExport} />}

      <div style={actionBar}>
        <SecondaryButton onClick={() => setShowFilter(true)}>
          <FilterIcon /> Фильтры
        </SecondaryButton>
        <SecondaryButton onClick={() => setShowExport(true)}>
          <ExportIcon /> Экспорт
        </SecondaryButton>
      </div>

      {error && <ErrorBox message={error} />}

      <div style={kpiRow}>
        <KpiCard
          label="Выручка"
          value={fmtRub(totalRevenue)}
          delta="+12.5% к прошлому периоду"
          icon={<RubIcon />}
        />
        <KpiCard
          label="Прибыль"
          value={fmtRub(profit)}
          delta="+8.3% к прошлому периоду"
          icon={<TrendIcon />}
        />
        <KpiCard
          label="Количество продаж"
          value={fmt(totalQty)}
          delta={`${rows.length} транзакций`}
          icon={<BarsIcon />}
          deltaColor="#64748B"
        />
      </div>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <ChartTitle title="Динамика выручки" subtitle="Сумма продаж по дням за выбранный период" />
        {loading ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false}
                tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={v => [fmtRub(v), 'Выручка']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#155DFC" strokeWidth={2.5} dot={{ r: 3, fill: '#155DFC' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <ChartTitle title="Топ-5 товаров по продажам" subtitle="Лидеры по выручке" />
        {loading ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top5} layout="vertical" margin={{ left: 8, right: 24, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} width={180} tickLine={false} axisLine={false} />
              <Tooltip formatter={v => fmtRub(v)} contentStyle={tooltipStyle} />
              <Bar dataKey="revenue" fill="#155DFC" radius={[0, 6, 6, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card style={{ padding: 24, marginBottom: 24 }}>
        <ChartTitle title="Динамика продаж" subtitle="Количество проданных позиций по дням" />
        {loading ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={daily} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [fmt(v), 'Кол-во']} />
              <Bar dataKey="quantity" fill="#155DFC" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Детализация продаж</div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Список транзакций за выбранный период</div>
        </div>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ ...tableHeader, gridTemplateColumns: TABLE_COLS.map(c => c.width).join(' ') }}>
              {TABLE_COLS.map(c => <div key={c.key} style={tableHeaderCell}>{c.label}</div>)}
            </div>
            {rows.slice(0, 50).map((row, i) => (
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
            {rows.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                Нет данных за выбранный период
              </div>
            )}
          </div>
        )}
      </Card>
    </Layout>
  )
}

function KpiCard({ label, value, delta, icon, deltaColor }) {
  const isPositive = typeof delta === 'string' && delta.startsWith('+')
  const color = deltaColor || (isPositive ? '#00A63E' : '#64748B')
  return (
    <div style={{
      flex: 1, backgroundColor: '#fff', borderRadius: 16,
      border: '1px solid #E5E7EB', boxShadow: '0px 0px 12px 0px rgba(37,99,235,0.10)',
      padding: '22px 26px', minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#101828' }}>{value}</div>
          <div style={{ fontSize: 12, color, marginTop: 6, fontWeight: 500 }}>{delta}</div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'rgba(21,93,252,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ChartTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>{title}</div>
      <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>{subtitle}</div>
    </div>
  )
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
const RubIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M7 4h5a4 4 0 010 8H7v2h6M7 14v3M5 9h7" stroke="#155DFC" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)
const TrendIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M3 16 L9 10 L13 13 L19 6" stroke="#155DFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 6h5v5" stroke="#155DFC" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)
const BarsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <rect x="3" y="11" width="4" height="8" rx="1" fill="#155DFC" />
    <rect x="9" y="7" width="4" height="12" rx="1" fill="#155DFC" />
    <rect x="15" y="3" width="4" height="16" rx="1" fill="#155DFC" />
  </svg>
)

const actionBar = { display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 28 }
const kpiRow = { display: 'flex', gap: 20, marginBottom: 28 }
const overlay = {
  position: 'fixed', inset: 0, zIndex: 200,
  backgroundColor: 'rgba(47,52,69,0.5)', backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const modal = {
  width: 520, backgroundColor: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
  boxShadow: '0px 20px 50px rgba(15,23,42,0.24)',
}
const modalHeader = {
  padding: '24px 28px', borderBottom: '1px solid #E5E7EB',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}
const modalFooter = {
  padding: '20px 28px', borderTop: '1px solid #E5E7EB',
  display: 'flex', justifyContent: 'flex-end', gap: 12,
}
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 18 }
const fieldLabel = { fontSize: 13, fontWeight: 600, color: '#364153', marginBottom: 8 }
const selectStyle = {
  width: '100%', height: 44, borderRadius: 10, border: '1px solid #D1D5DB',
  padding: '0 32px 0 14px', fontSize: 14, fontFamily: 'Inter',
  color: '#0A0A0A', background: '#fff', cursor: 'pointer', outline: 'none',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
}
const inputStyle = {
  flex: 1, height: 44, borderRadius: 10, border: '1px solid #D1D5DB',
  padding: '0 14px', fontSize: 14, fontFamily: 'Inter', outline: 'none', color: '#0A0A0A',
}
const primaryBtn = {
  height: 46, borderRadius: 10, padding: '0 22px',
  background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
  color: '#fff', border: 'none', fontFamily: 'Inter', fontSize: 14, fontWeight: 600, cursor: 'pointer',
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
