const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => 'Ошибка')
    throw new Error(text || `HTTP ${res.status}`)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

export const api = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (full_name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name, email, password }),
    }),

  me: () => request('/me'),

  updateMe: (data) =>
    request('/me', { method: 'PATCH', body: JSON.stringify(data) }),

  sellDetail: (from, to) => {
    const qs = new URLSearchParams()
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    const q = qs.toString()
    return request(`/products/sell-detail${q ? '?' + q : ''}`)
  },

  forecast: (days = 30, history = 90) =>
    request(`/products/forecast?days=${days}&history=${history}`),

  forecastMonthly: (days = 30, history = 90) =>
    request(`/products/forecast/monthly?days=${days}&history=${history}`),

  recommendations: (days = 30, history = 90) =>
    request(`/products/recommendations?days=${days}&history=${history}`),

  exportAssortment: (type = 'csv') =>
    `${BASE}/products/export/assortment?type=${type}`,

  exportForecast: (days = 30, history = 90, type = 'csv') =>
    `${BASE}/products/export/forecast?days=${days}&history=${history}&type=${type}`,

  ping: () => request('/ping'),
}
