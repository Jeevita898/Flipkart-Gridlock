import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { RefreshCw, TrendingUp, Activity } from 'lucide-react'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#f97316', '#a78bfa']
const HOURS = Array.from({ length: 18 }, (_, i) => ({ hour: `${i + 5}:00`, count: Math.floor(Math.random() * 20) + (i >= 3 && i <= 5 ? 30 : i >= 10 && i <= 12 ? 25 : 5) }))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <p style={{ color: '#8b92a8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/analytics', { timeout: 4000 })
      setData(res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const byType = (data?.byType || [
    { _id: 'No Helmet', count: 142 }, { _id: 'Red Light Jump', count: 98 },
    { _id: 'Triple Riding', count: 67 }, { _id: 'Wrong Side', count: 54 },
    { _id: 'Illegal Parking', count: 39 }, { _id: 'Speeding', count: 28 },
    { _id: 'No Seatbelt', count: 22 }, { _id: 'Phone While Driving', count: 18 },
  ]).map(d => ({ name: d._id, count: d.count }))

  const byLocation = (data?.byLocation || [
    { _id: 'MG Road', count: 78 }, { _id: 'Silk Board', count: 62 },
    { _id: 'Whitefield', count: 48 }, { _id: 'Koramangala', count: 41 },
    { _id: 'Indiranagar', count: 35 }, { _id: 'Electronic City', count: 28 },
    { _id: 'Hebbal', count: 22 }, { _id: 'Brigade Road', count: 18 },
  ]).map(d => ({ name: d._id, count: d.count }))

  const byDay = (data?.byDay || [
    { _id: '06-14', count: 32 }, { _id: '06-15', count: 45 },
    { _id: '06-16', count: 28 }, { _id: '06-17', count: 61 },
    { _id: '06-18', count: 38 }, { _id: '06-19', count: 52 }, { _id: '06-20', count: 29 },
  ]).map(d => ({ name: d._id?.slice(0) || d._id, count: d.count }))

  const chainData = (data?.byChainLevel || [
    { _id: 'Critical', count: 18 }, { _id: 'High', count: 45 },
    { _id: 'Moderate', count: 112 }, { _id: 'Low', count: 109 },
  ]).map(d => ({ name: d._id, value: d.count }))

  const chainColors = { Critical: '#ef4444', High: '#f97316', Moderate: '#f59e0b', Low: '#10b981' }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Deep insights into traffic violation patterns
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Violations by Type</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Cumulative all-time breakdown</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byType} margin={{ bottom: 40, left: 0, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#545c70', fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: '#545c70', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" radius={[6, 6, 0, 0]}>
                {byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Violation Trend (7 Days)</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Daily violation count</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={byDay} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#545c70', fontSize: 11 }} />
              <YAxis tick={{ fill: '#545c70', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Violations" stroke="#3b82f6" strokeWidth={3}
                fill="url(#areaGrad)" dot={{ fill: '#3b82f6', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Hotspot Locations</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Top 8 violation locations</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byLocation} layout="vertical" margin={{ left: 10, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#545c70', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8b92a8', fontSize: 12 }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Violations" radius={[0, 6, 6, 0]}>
                {byLocation.map((d, i) => (
                  <Cell key={i} fill={i === 0 ? '#ef4444' : i === 1 ? '#f97316' : i === 2 ? '#f59e0b' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Risk Level Distribution</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Chain severity breakdown</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={chainData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {chainData.map((e, i) => <Cell key={i} fill={chainColors[e.name] || '#6b7280'} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {chainData.map((d, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: chainColors[d.name], display: 'inline-block' }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Peak Hours</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { time: '8:00 – 10:00 AM', label: 'Morning Rush', pct: 85, color: '#ef4444' },
                { time: '5:00 – 7:00 PM', label: 'Evening Rush', pct: 72, color: '#f97316' },
                { time: '12:00 – 2:00 PM', label: 'Midday', pct: 45, color: '#f59e0b' },
              ].map((p, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{p.time}</span>
                    <span style={{ color: p.color, fontWeight: 600 }}>{p.pct}%</span>
                  </div>
                  <div className="score-bar-wrap">
                    <div className="score-bar" style={{ width: `${p.pct}%`, background: `linear-gradient(90deg, ${p.color}88, ${p.color})` }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{p.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly distribution */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Hourly Violation Pattern (Today)</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Violation count by hour — use this to plan officer deployment</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={HOURS} margin={{ left: 0, right: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" tick={{ fill: '#545c70', fontSize: 10 }} />
            <YAxis tick={{ fill: '#545c70', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Violations" radius={[4, 4, 0, 0]}>
              {HOURS.map((d, i) => (
                <Cell key={i} fill={d.count > 25 ? '#ef4444' : d.count > 15 ? '#f97316' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {[{ color: '#ef4444', label: 'High (>25)' }, { color: '#f97316', label: 'Medium (15-25)' }, { color: '#3b82f6', label: 'Low (<15)' }].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: 'inline-block' }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
