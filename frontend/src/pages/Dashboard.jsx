import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp, Camera,
  Shield, Activity, Zap, ArrowUpRight, RefreshCw
} from 'lucide-react'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#f97316', '#a78bfa']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13
    }}>
      <p style={{ color: '#8b92a8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

// Mock analytics data for demo when backend unavailable
const MOCK_DATA = {
  stats: { totalViolations: 284, totalChallans: 97, repeatOffenders: 23, pendingReview: 41 },
  byType: [
    { _id: 'No Helmet', count: 142 },
    { _id: 'Red Light Jump', count: 98 },
    { _id: 'Triple Riding', count: 67 },
    { _id: 'Wrong Side', count: 54 },
    { _id: 'Illegal Parking', count: 39 },
    { _id: 'Speeding', count: 28 },
    { _id: 'No Seatbelt', count: 22 },
    { _id: 'Phone While Driving', count: 18 },
  ],
  byLocation: [
    { _id: 'MG Road', count: 78 },
    { _id: 'Silk Board', count: 62 },
    { _id: 'Whitefield', count: 48 },
    { _id: 'Koramangala', count: 41 },
    { _id: 'Indiranagar', count: 35 },
    { _id: 'Electronic City', count: 28 },
    { _id: 'Hebbal', count: 22 },
    { _id: 'Brigade Road', count: 18 },
  ],
  byDay: [
    { _id: '2026-06-14', count: 32 },
    { _id: '2026-06-15', count: 45 },
    { _id: '2026-06-16', count: 28 },
    { _id: '2026-06-17', count: 61 },
    { _id: '2026-06-18', count: 38 },
    { _id: '2026-06-19', count: 52 },
    { _id: '2026-06-20', count: 29 },
  ],
  byChainLevel: [
    { _id: 'Critical', count: 18 },
    { _id: 'High', count: 45 },
    { _id: 'Moderate', count: 112 },
    { _id: 'Low', count: 109 },
  ],
  recent: Array.from({ length: 8 }, (_, i) => ({
    _id: `id-${i}`,
    plate: ['KA05AB1234', 'MH12XY9988', 'DL03CD5678', 'TN09GH3321'][i % 4],
    location: ['MG Road', 'Whitefield', 'Silk Board', 'Koramangala'][i % 4],
    violations: [['No Helmet', 'Triple Riding'], ['Red Light Jump'], ['Wrong Side'], ['Speeding', 'No Seatbelt']][i % 4],
    violationChain: { level: ['Critical', 'High', 'Moderate', 'Low'][i % 4] },
    evidenceScore: [95, 88, 76, 82, 91, 73, 87, 94][i],
    status: ['Pending', 'Approved', 'Rejected', 'Reviewed'][i % 4],
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  })),
}

function StatCard({ title, value, change, icon: Icon, gradient, glowClass, prefix = '' }) {
  return (
    <div className={`glass-card ${glowClass}`} style={{ padding: '24px', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{prefix}{value?.toLocaleString('en-IN') || '—'}</div>
          {change && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: '#10b981' }}>
              <ArrowUpRight size={14} />
              <span>{change} vs yesterday</span>
            </div>
          )}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          flexShrink: 0,
        }}>
          <Icon size={22} color="white" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/analytics', { timeout: 4000 })
      setData(res.data)
    } catch {
      setData(MOCK_DATA)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = data?.stats || MOCK_DATA.stats
  const byType = (data?.byType || MOCK_DATA.byType).map(d => ({ name: d._id, count: d.count }))
  const byLocation = (data?.byLocation || MOCK_DATA.byLocation).map(d => ({ name: d._id, count: d.count }))
  const byDay = (data?.byDay || MOCK_DATA.byDay).map(d => ({
    name: d._id?.slice(5) || d._id, count: d.count
  }))
  const chainData = (data?.byChainLevel || MOCK_DATA.byChainLevel).map(d => ({ name: d._id, value: d.count }))
  const chainColors = { Critical: '#ef4444', High: '#f97316', Moderate: '#f59e0b', Low: '#10b981' }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Enforcement Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Real-time traffic violation monitoring · Bengaluru Traffic Police
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load} disabled={loading} style={{ gap: 8 }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard title="Total Violations" value={stats.totalViolations} change="+12%" icon={AlertTriangle}
          gradient="linear-gradient(135deg, #7f1d1d, #ef4444)" glowClass="stat-card-red" />
        <StatCard title="Challans Issued" value={stats.totalChallans} change="+8%" icon={FileText2}
          gradient="linear-gradient(135deg, #1e3a8a, #3b82f6)" glowClass="stat-card-blue" />
        <StatCard title="Repeat Offenders" value={stats.repeatOffenders} icon={Shield}
          gradient="linear-gradient(135deg, #4c1d95, #8b5cf6)" glowClass="stat-card-purple" />
        <StatCard title="Pending Review" value={stats.pendingReview} icon={Clock}
          gradient="linear-gradient(135deg, #78350f, #f59e0b)" glowClass="stat-card-amber" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Violations by Type */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Violations by Type</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>All-time breakdown</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byType} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#545c70', fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#545c70', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Violations" radius={[6, 6, 0, 0]}>
                {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Violations Trend */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>7-Day Violation Trend</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Daily count over last week</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={byDay} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#545c70', fontSize: 12 }} />
              <YAxis tick={{ fill: '#545c70', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Violations" stroke="#3b82f6" strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7, fill: '#60a5fa' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 20, marginBottom: 20 }}>
        {/* By Location */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Violations by Location</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Top enforcement hotspots</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byLocation} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#545c70', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b92a8', fontSize: 12 }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Violations" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chain Level Pie */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Risk Level</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Violation chain severity</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chainData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey="value" nameKey="name">
                {chainData.map((entry, i) => (
                  <Cell key={i} fill={chainColors[entry.name] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {chainData.map((d, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: chainColors[d.name], display: 'inline-block' }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Violations */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Recent Violations</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Latest detections from all cameras</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            <Activity size={14} />
            Live feed
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Plate</th>
              <th>Location</th>
              <th>Violations</th>
              <th>Chain Level</th>
              <th>Evidence</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recent || MOCK_DATA.recent).map((v, i) => (
              <tr key={v._id || i}>
                <td><span className="plate">{v.plate}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>{v.location}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {v.violations?.map((vv, j) => (
                      <span key={j} className="violation-tag">{vv}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${v.violationChain?.level?.toLowerCase()}`}>
                    {v.violationChain?.level}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="score-bar-wrap" style={{ width: 60 }}>
                      <div className="score-bar" style={{ width: `${v.evidenceScore}%` }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 32 }}>{v.evidenceScore}%</span>
                  </div>
                </td>
                <td><span className={`badge badge-${v.status?.toLowerCase()}`}>{v.status}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  {new Date(v.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Inline icon alias
function FileText2(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}
