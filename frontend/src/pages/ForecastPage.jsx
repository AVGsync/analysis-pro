import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../api/index.js'
import Layout from '../components/Layout.jsx'
import ExportModal from '../components/ExportModal.jsx'
import { Card, SecondaryButton, Spinner, ErrorBox } from '../components/UI.jsx'
import { FilterModal } from './SalesPage.jsx'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n || 0))
const fmtRub = (n) => `${fmt(n)} ₽`

const STATUS_CONFIG = {
  red:    { bg: '#FEE2E2', color: '#B91C1C', label: 'Требуется пополнение' },
  green:  { bg: '#DCFCE7', color: '#166534', label: 'Оптимально' },
  yellow: { bg: '#FEF3C7', color: '#92400E', label: 'Излишки' },
}

function computeStatus(row) {
  if ((row.recommend_order || 0) > 0) return 'red'
  if ((row.current_stock || 0) > (row.forecast_total || 0) * 1.5) return 'yellow'
  return 'green'
}

const TABLE_COLS = [
  { key: 'product_name', label: 'Товар', width: '1.6fr' },
  { key: 'current_stock', label: 'Текущий остаток', width: '160px', render: v => fmt(v) },
  { key: 'forecast_total', label: 'Прогноз', width: '120px', render: v => fmt(v) },
  { key: 'recommend_order', label: 'Рекомендованный запас', width: '210px', render: (v) => {
    if (v <= 0) return <span style={{ color: '#64748B' }}>Не требуется</span>
    return <span style={{ fontWeight: 600, color: '#101828' }}>Заказать {fmt(v)} шт</span>
  }},
  { key: '__status', label: 'Статус', width: '180px', render: (_, row) => {
    const k = computeStatus(row)
    const b = STATUS_CONFIG[k]
    return (
      <span style={{
        fontSize: 12, fontWeight: 600,
        backgroundColor: b.bg, color: b.color,
        padding: '4px 12px', borderRadius: 20,
      }}>{b.label}</span>
    )
  }},
]

function monthKey(iso) {
  if (!iso) return ''
  return String(iso).slice(0, 7)
}

function monthLabel(yyyymm) {
  const m = parseInt(yyyymm.slice(5, 7), 10)
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
  const y = yyyymm.slice(0, 4)
  return `${months[m - 1] || m} ${y}`
}

const HORIZON_OPTIONS = [
  { id: '30', label: '1 месяц' },
  { id: '60', label: '2 месяца' },
  { id: '90', label: '3 месяца' },
  { id: '180', label: '6 месяцев' },
]

const RECO_TEMPLATES = [
  { keyword: 'high', icon: 'warn', title: (r) => r.product_name, desc: (r) =>
      `Прогнозируется рост спроса. Рекомендуется пополнить запас на ${fmt(r.recommend_order)} единиц.` },
  { keyword: 'medium', icon: 'info', title: (r) => r.product_name, desc: (r) =>
      `Запас ограничен — хватит на ${fmt(r.stock_days_left)} дн. Рекомендуется пополнить на ${fmt(r.recommend_order)} единиц.` },
  { keyword: 'ok', icon: 'check', title: (r) => r.product_name, desc: () =>
      'Стабильный спрос. Текущий уровень запасов оптимален.' },
]

export default function ForecastPage() {
  const [forecast, setForecast] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [monthly, setMonthly] = useState([])
  const [historical, setHistorical] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState({ period: '90', from: '', to: '', category: 'all' })

  const horizon = useMemo(() => {
    if (filter.period === 'custom' || filter.period === 'all') return 90
    return parseInt(filter.period, 10) || 90
  }, [filter.period])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [fc, rec, mo, sales] = await Promise.all([
        api.forecast(horizon, 90),
        api.recommendations(horizon, 90),
        api.forecastMonthly(horizon, 90),
        api.sellDetail(null, null).catch(() => []),
      ])
      const fcList = Array.isArray(fc) ? fc : []
      let recList = Array.isArray(rec) ? rec : []
      const moList = Array.isArray(mo) ? mo : []
      let saleList = Array.isArray(sales) ? sales : []
      if (filter.category !== 'all') {
        saleList = saleList.filter(s => s.category === filter.category)
      }

      const histMap = {}
      saleList.forEach(s => {
        const k = monthKey(s.sold_at)
        if (!k) return
        histMap[k] = (histMap[k] || 0) + (s.revenue || 0)
      })
      const histArr = Object.entries(histMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, revenue]) => ({ month, revenue }))

      setForecast(fcList)
      setRecommendations(recList)
      setMonthly(moList)
      setHistorical(histArr)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [horizon, filter.category])

  useEffect(() => { load() }, [load])

  const chartData = useMemo(() => {
    const histLast6 = historical.slice(-6)
    const fcArr = monthly.map(m => ({
      month: monthKey(m.month),
      forecast: m.forecast_revenue || 0,
    }))

    const map = {}
    histLast6.forEach(h => {
      map[h.month] = { month: h.month, history: h.revenue, forecast: null }
    })
    fcArr.forEach(f => {
      if (!map[f.month]) map[f.month] = { month: f.month, history: null, forecast: f.forecast }
      else map[f.month].forecast = f.forecast
    })

    const arr = Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
    return arr.map(p => ({
      ...p,
      label: monthLabel(p.month),
      // if no historical for forecast months, mirror forecast as history fallback
      historyDisplay: p.history == null && p.forecast != null ? p.forecast : p.history,
    }))
  }, [historical, monthly])

  const recBlock = useMemo(() => {
    return recommendations.slice(0, 5).map(r => {
      const tpl = RECO_TEMPLATES.find(t => t.keyword === r.urgency) || RECO_TEMPLATES[2]
      return {
        urgency: r.urgency,
        title: tpl.title(r),
        desc: tpl.desc(r),
      }
    })
  }, [recommendations])

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
      {showFilter && (
        <FilterModal
          initial={filter}
          periodOptions={HORIZON_OPTIONS}
          onClose={() => setShowFilter(false)}
          onApply={(f) => { setFilter(f); setShowFilter(false) }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 28, alignItems: 'center' }}>
        <SecondaryButton onClick={() => setShowFilter(true)}>
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
            Прогноз спроса на следующие {Math.round(horizon / 30)} мес.
          </div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
            Модель ARIMA(7,1,1) с откатом на скользящее среднее. Сравнение с историческими продажами.
          </div>
        </div>
        {loading ? <Spinner /> : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 12, right: 24, left: 12, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false}
                tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [fmtRub(v), name]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="historyDisplay" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} name="Прошлый период" />
              <Line type="monotone" dataKey="forecast" stroke="#155DFC" strokeWidth={2.5} dot={{ r: 4, fill: '#155DFC' }} name="Прогноз" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Рекомендации по закупкам</div>
        </div>
        {loading ? <Spinner /> : recBlock.length === 0 ? (
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>Нет рекомендаций</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recBlock.map((r, i) => {
              const dot = r.urgency === 'high' ? '#EF4444' : r.urgency === 'medium' ? '#F59E0B' : '#10B981'
              return (
                <div key={i} style={{
                  display: 'flex', gap: 14, padding: '14px 0',
                  borderBottom: i < recBlock.length - 1 ? '1px dashed #E5E7EB' : 'none',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${dot}`, flexShrink: 0, marginTop: 2,
                  }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{r.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

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
