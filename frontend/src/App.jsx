import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { api } from './api/index.js'

import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import SalesPage from './pages/SalesPage.jsx'
import ForecastPage from './pages/ForecastPage.jsx'
import AssortmentPage from './pages/AssortmentPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import NLQueryPage from './pages/NLQueryPage.jsx'
import SubscriptionPage from './pages/SubscriptionPage.jsx'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter', color: '#64748B' }}>Загрузка...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    await api.login(email, password)
    let u
    try {
      u = await api.me()
    } catch {
      throw new Error('Не удалось получить сессию. Проверьте cookie и повторите вход.')
    }
    setUser(u)
    return u
  }

  const logout = () => {
    setUser(null)
    document.cookie = 'token=; Max-Age=0; path=/'
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
          <Route path="/" element={<RequireAuth><SalesPage /></RequireAuth>} />
          <Route path="/sales" element={<RequireAuth><SalesPage /></RequireAuth>} />
          <Route path="/assortment" element={<RequireAuth><AssortmentPage /></RequireAuth>} />
          <Route path="/forecast" element={<RequireAuth><ForecastPage /></RequireAuth>} />
          <Route path="/nl-query" element={<RequireAuth><NLQueryPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/subscription" element={<RequireAuth><SubscriptionPage /></RequireAuth>} />
          <Route path="/recommendations" element={<Navigate to="/forecast" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
