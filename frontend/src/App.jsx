import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Upload, ClipboardList, FileText,
  BarChart3, MapPin, MessageSquare, Shield, ChevronRight, Zap
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import UploadAnalyze from './pages/UploadAnalyze'
import Results from './pages/Results'
import ReviewQueue from './pages/ReviewQueue'
import ChallanPage from './pages/ChallanPage'
import Analytics from './pages/Analytics'
import Recommendations from './pages/Recommendations'
import Dispute from './pages/Dispute'
import './index.css'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/upload', icon: Upload, label: 'Upload & Analyze' },
  { path: '/review', icon: ClipboardList, label: 'Review Queue' },
  { path: '/challans', icon: FileText, label: 'Challans' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/recommendations', icon: MapPin, label: 'Recommendations' },
  { path: '/dispute', icon: MessageSquare, label: 'Dispute Portal' },
]

function Sidebar() {
  return (
    <aside style={{
      width: 260,
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
          }}>
            <Zap size={20} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>TrafficEye</div>
            <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600, letterSpacing: '1px' }}>AI ENFORCEMENT</div>
          </div>
        </div>
      </div>

      {/* Live status */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <div className="pulse-dot" />
          <span>System Online</span>
          <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 600 }}>6 cameras</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1.2px', padding: '6px 8px 10px', textTransform: 'uppercase' }}>Main Menu</div>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              marginBottom: 2,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#60a5fa' : 'var(--text-secondary)',
              background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Officer Kumar</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Traffic Dept. KA</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Layout({ children }) {
  const location = useLocation()
  const currentPage = navItems.find(n =>
    n.path === '/' ? location.pathname === '/' : location.pathname.startsWith(n.path)
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 260, flex: 1, minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Top bar */}
        <div style={{
          padding: '16px 32px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>TrafficEye AI</span>
          <ChevronRight size={14} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
            {currentPage?.label || 'Page'}
          </span>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            {new Date().toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div style={{ padding: '32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadAnalyze />} />
          <Route path="/results" element={<Results />} />
          <Route path="/review" element={<ReviewQueue />} />
          <Route path="/challans" element={<ChallanPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/dispute" element={<Dispute />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
