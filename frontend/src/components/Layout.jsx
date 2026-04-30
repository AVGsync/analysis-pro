import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

export default function Layout({ title, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      <Sidebar />
      <div style={{ marginLeft: 340, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title={title} />
        <main style={{ marginTop: 80, padding: '40px 100px 60px 60px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
