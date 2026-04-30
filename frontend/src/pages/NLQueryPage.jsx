import { useState } from 'react'
import { api } from '../api/index.js'
import Layout from '../components/Layout.jsx'
import { Card, SecondaryButton, Spinner, ErrorBox } from '../components/UI.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n || 0))
const fmtRub = (n) => `${fmt(n)} ₽`

const SUGGESTIONS = [
  'Что у меня продаётся лучше всего в этом месяце?',
  'Покажи выручку по категориям',
  'Какие товары приносят больше всего прибыли?',
  'Какие товары самые непредсказуемые?',
  'Сколько мы заработали за прошлую неделю?',
]

function classifyQuery(q) {
  const lower = q.toLowerCase()
  if (lower.includes('категор')) return 'by-category'
  if (lower.includes('непредсказ') || lower.includes('xyz')) return 'unstable'
  if (lower.includes('недел')) return 'last-week'
  if (lower.includes('лучше') || lower.includes('лидер') || lower.includes('топ')) return 'top'
  if (lower.includes('прибыл') || lower.includes('выруч') || lower.includes('заработ')) return 'revenue'
  return 'top'
}

function buildAnswer(intent, rows) {
  if (intent === 'by-category') {
    const map = {}
    rows.forEach(r => {
      const k = r.category || 'Прочее'
      if (!map[k]) map[k] = { name: k, revenue: 0, quantity: 0 }
      map[k].revenue += r.revenue || 0
      map[k].quantity += r.quantity || 0
    })
    const list = Object.values(map).sort((a, b) => b.revenue - a.revenue)
    return {
      summary: `Найдено ${list.length} категорий. Лидер — «${list[0]?.name || '—'}» с выручкой ${fmtRub(list[0]?.revenue || 0)}.`,
      chart: list,
      chartLabel: 'Выручка',
      chartKey: 'revenue',
      chartFormat: fmtRub,
      table: list.map(c => ({ name: c.name, value: fmtRub(c.revenue), extra: `${fmt(c.quantity)} шт.` })),
      tableHeader: ['Категория', 'Выручка', 'Количество'],
    }
  }
  if (intent === 'unstable') {
    const map = {}
    rows.forEach(r => {
      const k = r.product_name
      if (!map[k]) map[k] = { name: k, daily: {}, total: 0 }
      const d = r.sold_at?.slice(0, 10) || ''
      map[k].daily[d] = (map[k].daily[d] || 0) + (r.quantity || 0)
      map[k].total += r.quantity || 0
    })
    const list = Object.values(map).map(p => {
      const v = Object.values(p.daily)
      const mean = v.reduce((a, b) => a + b, 0) / (v.length || 1)
      const variance = v.reduce((a, b) => a + (b - mean) ** 2, 0) / (v.length || 1)
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 0
      return { name: p.name, cv: cv * 100, total: p.total }
    }).sort((a, b) => b.cv - a.cv).slice(0, 8)
    return {
      summary: `Топ непредсказуемых товаров: «${list[0]?.name || '—'}» с разбросом ${list[0]?.cv.toFixed(0) || 0}%.`,
      chart: list.map(i => ({ name: i.name, revenue: Math.round(i.cv) })),
      chartLabel: 'Коэф. вариации',
      chartKey: 'revenue',
      chartFormat: v => `${v}%`,
      table: list.map(c => ({ name: c.name, value: `${c.cv.toFixed(0)}%`, extra: `${fmt(c.total)} шт.` })),
      tableHeader: ['Товар', 'CV', 'Всего продано'],
    }
  }
  if (intent === 'last-week') {
    const since = Date.now() - 7 * 24 * 3600 * 1000
    const filtered = rows.filter(r => new Date(r.sold_at).getTime() >= since)
    const total = filtered.reduce((s, r) => s + (r.revenue || 0), 0)
    const qty = filtered.reduce((s, r) => s + (r.quantity || 0), 0)
    const map = {}
    filtered.forEach(r => {
      const d = r.sold_at?.slice(0, 10) || ''
      if (!map[d]) map[d] = { name: d.slice(5), revenue: 0 }
      map[d].revenue += r.revenue || 0
    })
    return {
      summary: `За последнюю неделю выручка составила ${fmtRub(total)} (${fmt(qty)} продаж).`,
      chart: Object.values(map).sort((a, b) => a.name.localeCompare(b.name)),
      chartLabel: 'Выручка по дням',
      chartKey: 'revenue',
      chartFormat: fmtRub,
      table: filtered.slice(0, 10).map(r => ({
        name: r.product_name, value: fmtRub(r.revenue), extra: `${r.quantity} шт.`,
      })),
      tableHeader: ['Товар', 'Выручка', 'Количество'],
    }
  }
  // default top / revenue
  const map = {}
  rows.forEach(r => {
    const k = r.product_name
    if (!map[k]) map[k] = { name: k, revenue: 0, quantity: 0 }
    map[k].revenue += r.revenue || 0
    map[k].quantity += r.quantity || 0
  })
  const list = Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 8)
  return {
    summary: `Лидер по выручке — «${list[0]?.name || '—'}» (${fmtRub(list[0]?.revenue || 0)}).`,
    chart: list,
    chartLabel: 'Выручка',
    chartKey: 'revenue',
    chartFormat: fmtRub,
    table: list.map(c => ({ name: c.name, value: fmtRub(c.revenue), extra: `${fmt(c.quantity)} шт.` })),
    tableHeader: ['Товар', 'Выручка', 'Количество'],
  }
}

export default function NLQueryPage() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (q) => {
    if (!q.trim()) return
    setLoading(true); setError(''); setAnswer(null)
    try {
      const rows = await api.sellDetail(null, null)
      const intent = classifyQuery(q)
      setAnswer({ query: q, ...buildAnswer(intent, Array.isArray(rows) ? rows : []) })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Запрос на естественном языке">
      {error && <ErrorBox message={error} />}

      <Card style={{ padding: '40px 36px', marginBottom: 24, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, margin: '0 auto 20px',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(21,93,252,0.30)',
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 8h20a2 2 0 012 2v12a2 2 0 01-2 2H14l-6 5v-5H6a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" fill="none" />
            <circle cx="12" cy="16" r="1.5" fill="#fff" />
            <circle cx="16" cy="16" r="1.5" fill="#fff" />
            <circle cx="20" cy="16" r="1.5" fill="#fff" />
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#101828', marginBottom: 6 }}>
          Спросите что-то о ваших данных
        </div>
        <div style={{ fontSize: 15, color: '#64748B', marginBottom: 26 }}>
          Сформулируйте вопрос на естественном языке — система найдёт ответ в ваших продажах.
        </div>

        <form onSubmit={e => { e.preventDefault(); submit(query) }}
          style={{
            display: 'flex', gap: 10, maxWidth: 720, margin: '0 auto',
          }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Например: Какие товары продавались лучше всего за последнюю неделю?"
            style={{
              flex: 1, height: 52, borderRadius: 12, border: '1px solid #D1D5DB',
              padding: '0 18px', fontSize: 15, fontFamily: 'Inter',
              outline: 'none', color: '#0A0A0A',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = '#155DFC'; e.target.style.boxShadow = '0 0 0 3px rgba(21,93,252,0.15)' }}
            onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none' }}
          />
          <button type="submit" disabled={!query.trim() || loading} style={{
            height: 52, width: 52, borderRadius: 12,
            background: query.trim() ? 'linear-gradient(180deg, #155DFC 0%, #4F39F6 100%)' : '#CBD5E1',
            border: 'none', cursor: query.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'opacity 0.15s',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10h12m-4-4l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </Card>

      {!answer && !loading && (
        <Card style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 16 }}>Популярные запросы</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); submit(s) }}
                style={{
                  textAlign: 'left',
                  padding: '14px 18px',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#fff',
                  fontFamily: 'Inter', fontSize: 14, color: '#364153',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#155DFC'; e.currentTarget.style.backgroundColor = 'rgba(21,93,252,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#fff' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: '#155DFC' }}>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path d="M6 7a2 2 0 014 0c0 1-1 1.4-1 2M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {s}
              </button>
            ))}
          </div>
          <div style={{
            marginTop: 20, padding: '14px 18px', borderRadius: 10,
            backgroundColor: 'rgba(21,93,252,0.04)',
            border: '1px solid rgba(21,93,252,0.12)',
            fontSize: 13, color: '#475569',
          }}>
            <span style={{ fontWeight: 600, color: '#155DFC' }}>Подсказка:</span>{' '}
            используйте конкретные слова — категория, неделя, прибыль, выручка, лидер. Чем чётче вопрос — тем точнее ответ.
          </div>
        </Card>
      )}

      {loading && <Card style={{ padding: 32 }}><Spinner /></Card>}

      {answer && (
        <Card style={{ padding: 28 }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 14, color: '#64748B', marginBottom: 4 }}>Ваш запрос</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#101828' }}>«{answer.query}»</div>
          </div>

          <div style={{
            backgroundColor: 'rgba(21,93,252,0.05)',
            border: '1px solid rgba(21,93,252,0.15)',
            borderRadius: 12, padding: 18, marginBottom: 22,
            color: '#1E3A8A', fontSize: 15, fontWeight: 500,
          }}>
            {answer.summary}
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 14 }}>{answer.chartLabel}</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={answer.chart} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip formatter={v => answer.chartFormat(v)} contentStyle={tooltipStyle} />
                <Bar dataKey={answer.chartKey} radius={[6, 6, 0, 0]} barSize={36}>
                  {answer.chart.map((_, idx) => (
                    <Cell key={idx} fill={idx === 0 ? '#155DFC' : '#93C5FD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#101828', marginBottom: 14 }}>Детализация</div>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB',
              }}>
                {answer.tableHeader.map(h => (
                  <div key={h} style={tableHeaderCell}>{h}</div>
                ))}
              </div>
              {answer.table.map((row, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
                  borderBottom: '1px solid #F1F5F9',
                  backgroundColor: i % 2 === 0 ? '#fff' : '#FAFBFC',
                }}>
                  <div style={tableCell}>{row.name}</div>
                  <div style={tableCell}>{row.value}</div>
                  <div style={tableCell}>{row.extra}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <SecondaryButton onClick={() => { setAnswer(null); setQuery('') }}>Новый запрос</SecondaryButton>
          </div>
        </Card>
      )}
    </Layout>
  )
}

const tooltipStyle = {
  borderRadius: 8, border: '1px solid #E8EDF3',
  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
  fontFamily: 'Inter', fontSize: 13,
}
const tableHeaderCell = {
  padding: '12px 18px', fontSize: 12, fontWeight: 600, color: '#475569',
  textTransform: 'uppercase', letterSpacing: '0.03em',
}
const tableCell = {
  padding: '12px 18px', fontSize: 14, color: '#101828',
  display: 'flex', alignItems: 'center',
}
