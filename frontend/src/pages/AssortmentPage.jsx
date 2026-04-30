import { useState, useEffect, useMemo, useCallback } from 'react'
import { api } from '../api/index.js'
import Layout from '../components/Layout.jsx'
import ExportModal from '../components/ExportModal.jsx'
import { Card, SecondaryButton, Spinner, ErrorBox } from '../components/UI.jsx'
import { FilterModal } from './SalesPage.jsx'

const fmt = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n || 0))
const fmtRub = (n) => `${fmt(n)} ₽`

const CELL_COLORS = {
  AX: 'green', AY: 'green', AZ: 'green',
  BX: 'yellow', BY: 'yellow', BZ: 'yellow',
  CX: 'red', CY: 'red', CZ: 'red',
}

const GROUP_BG = {
  green: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
  yellow: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  red: { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
}

function buildAssortment(rows) {
  const map = {}
  rows.forEach(r => {
    const k = r.product_name
    if (!map[k]) map[k] = { product_name: k, sku: r.sku || k, category: r.category, revenue: 0, quantity: 0, daily: {} }
    map[k].revenue += r.revenue || 0
    map[k].quantity += r.quantity || 0
    const day = r.sold_at?.slice(0, 10) || ''
    map[k].daily[day] = (map[k].daily[day] || 0) + (r.quantity || 0)
  })

  const items = Object.values(map).sort((a, b) => b.revenue - a.revenue)
  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0) || 1

  let cum = 0
  return items.map(item => {
    cum += item.revenue
    const pct = cum / totalRevenue
    const abc = pct <= 0.8 ? 'A' : pct <= 0.95 ? 'B' : 'C'

    const values = Object.values(item.daily)
    let xyz = 'Z'
    if (values.length >= 3) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 1
      xyz = cv <= 0.25 ? 'X' : cv <= 0.6 ? 'Y' : 'Z'
    } else {
      xyz = values.length === 0 ? 'Z' : 'Y'
    }

    const group = `${abc}${xyz}`
    return {
      ...item,
      abc, xyz, abc_xyz: group,
      revenuePct: (item.revenue / totalRevenue * 100).toFixed(1),
      colorKey: CELL_COLORS[group],
    }
  })
}

function buildMatrix(items) {
  const matrix = {}
  for (const a of ['A', 'B', 'C']) for (const x of ['X', 'Y', 'Z']) matrix[`${a}${x}`] = 0
  items.forEach(i => { matrix[i.abc_xyz] = (matrix[i.abc_xyz] || 0) + 1 })
  return matrix
}

const TABLE_COLS = [
  { key: 'product_name', label: 'Товар', width: '1.6fr' },
  { key: 'category', label: 'Категория', width: '180px' },
  { key: 'abc_xyz', label: 'Группа', width: '140px', render: (v, row) => {
    const c = GROUP_BG[row.colorKey]
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 48, height: 28, padding: '0 12px', borderRadius: 14,
        backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`,
        fontSize: 13, fontWeight: 700,
      }}>{v}</span>
    )
  }},
  { key: 'revenue', label: 'Выручка', width: '160px', render: v => fmtRub(v) },
  { key: 'quantity', label: 'Продано', width: '110px', render: v => fmt(v) },
]

function computeRange(period, customFrom, customTo) {
  if (period === 'all') return { from: '', to: '' }
  if (period === 'custom') return { from: customFrom, to: customTo }
  const days = parseInt(period, 10)
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - days)
  const iso = (d) => d.toISOString().slice(0, 10)
  return { from: iso(from), to: iso(to) }
}

const PERIOD_OPTIONS = [
  { id: 'all', label: 'Всё время' },
  { id: '7', label: '7 дней' },
  { id: '30', label: '30 дней' },
  { id: '90', label: '3 месяца' },
  { id: 'custom', label: 'Произвольный' },
]

export default function AssortmentPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [activeCell, setActiveCell] = useState(null)
  const [filter, setFilter] = useState({ period: 'all', from: '', to: '', category: 'all' })

  const range = useMemo(() => computeRange(filter.period, filter.from, filter.to), [filter])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await api.sellDetail(range.from || null, range.to || null)
      let list = Array.isArray(data) ? data : []
      if (filter.category !== 'all') list = list.filter(r => r.category === filter.category)
      setRows(buildAssortment(list))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [range.from, range.to, filter.category])

  useEffect(() => { load() }, [load])

  const matrix = useMemo(() => buildMatrix(rows), [rows])
  const filtered = activeCell ? rows.filter(r => r.abc_xyz === activeCell) : rows

  return (
    <Layout title="Управление ассортиментом">
      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          onExport={({ format }) => {
            setShowExport(false)
            window.open(api.exportAssortment(format === 'xlsx' ? 'csv' : format), '_blank')
          }}
        />
      )}
      {showFilter && (
        <FilterModal
          initial={filter}
          periodOptions={PERIOD_OPTIONS}
          onClose={() => setShowFilter(false)}
          onApply={(f) => { setFilter(f); setShowFilter(false) }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 28 }}>
        <SecondaryButton onClick={() => setShowFilter(true)}>
          <FilterIcon /> Фильтры
        </SecondaryButton>
        <SecondaryButton onClick={() => setShowExport(true)}>
          <ExportIcon /> Экспорт
        </SecondaryButton>
      </div>

      {error && <ErrorBox message={error} />}

      <Card style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Матрица ABC×XYZ-анализа</div>
          <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
            ABC — по доле в выручке, XYZ — по стабильности спроса. Кликните на ячейку, чтобы отфильтровать таблицу.
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '170px repeat(3, 1fr)',
            gap: 10,
          }}>
            <div />
            {['X-стабильный', 'Y-переменный', 'Z-непредсказуемый'].map(label => (
              <div key={label} style={{
                fontSize: 13, fontWeight: 600, color: '#475569', textAlign: 'center', padding: '6px 0',
              }}>{label}</div>
            ))}

            {[
              { key: 'A', label: 'Высокая выручка' },
              { key: 'B', label: 'Средняя выручка' },
              { key: 'C', label: 'Низкая выручка' },
            ].map(row => (
              <RowCells
                key={row.key}
                rowKey={row.key}
                rowLabel={row.label}
                matrix={matrix}
                activeCell={activeCell}
                onCellClick={(group) => setActiveCell(activeCell === group ? null : group)}
              />
            ))}
          </div>
        )}
      </Card>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ padding: 24, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#101828' }}>Детализация по товарам</div>
            <div style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
              {activeCell ? `Группа ${activeCell}` : 'Все товары'} — {filtered.length} позиций
            </div>
          </div>
          {activeCell && (
            <button onClick={() => setActiveCell(null)} style={{
              background: 'none', border: '1px solid #D1D5DB', color: '#475569',
              borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer',
            }}>Сбросить фильтр</button>
          )}
        </div>

        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ ...tableHeader, gridTemplateColumns: TABLE_COLS.map(c => c.width).join(' ') }}>
              {TABLE_COLS.map(c => <div key={c.key} style={tableHeaderCell}>{c.label}</div>)}
            </div>
            {filtered.map((row, i) => (
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
            {filtered.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                Нет товаров в выбранной группе
              </div>
            )}
          </div>
        )}
      </Card>
    </Layout>
  )
}

function RowCells({ rowKey, rowLabel, matrix, activeCell, onCellClick }) {
  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingRight: 4,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color: '#64748B', textAlign: 'right', lineHeight: 1.2,
        }}>{rowLabel}</div>
        <div style={{
          fontSize: 18, fontWeight: 700, color: '#475569', minWidth: 18, textAlign: 'center',
        }}>{rowKey}</div>
      </div>
      {['X', 'Y', 'Z'].map(x => {
        const group = `${rowKey}${x}`
        const status = CELL_COLORS[group]
        const colors = GROUP_BG[status]
        const isActive = activeCell === group
        return (
          <button
            key={group}
            onClick={() => onCellClick(group)}
            style={{
              padding: '20px 16px', borderRadius: 12,
              backgroundColor: colors.bg,
              border: isActive ? `2px solid ${colors.border}` : `1px solid ${colors.border}`,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              transition: 'transform 0.1s, box-shadow 0.15s',
              boxShadow: isActive ? `0 0 0 3px ${colors.bg}` : 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, opacity: 0.8 }}>{group}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: colors.text }}>{matrix[group] || 0}</div>
            <div style={{ fontSize: 12, color: colors.text, opacity: 0.85 }}>товаров</div>
          </button>
        )
      })}
    </>
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
