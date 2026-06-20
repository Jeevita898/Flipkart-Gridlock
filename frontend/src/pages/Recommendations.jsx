import { useState, useEffect } from 'react'
import axios from 'axios'
import { MapPin, Users, Clock, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react'

const MOCK_RECS = [
  { location: 'MG Road', totalViolations: 142, peakHour: 8, urgency: 'High', recommendation: 'Deploy 2 officers between 8:00–10:00', hourlyBreakdown: [{ hour: 8, count: 28 }, { hour: 9, count: 24 }, { hour: 17, count: 19 }, { hour: 18, count: 16 }] },
  { location: 'Silk Board', totalViolations: 98, peakHour: 17, urgency: 'High', recommendation: 'Deploy 2 officers between 17:00–19:00', hourlyBreakdown: [{ hour: 17, count: 22 }, { hour: 18, count: 20 }, { hour: 8, count: 14 }] },
  { location: 'Whitefield', totalViolations: 67, peakHour: 9, urgency: 'Medium', recommendation: 'Deploy 1 officer between 9:00–11:00', hourlyBreakdown: [{ hour: 9, count: 15 }, { hour: 10, count: 12 }, { hour: 8, count: 10 }] },
  { location: 'Koramangala', totalViolations: 54, peakHour: 12, urgency: 'Medium', recommendation: 'Deploy 1 officer between 12:00–14:00', hourlyBreakdown: [{ hour: 12, count: 11 }, { hour: 13, count: 10 }, { hour: 9, count: 8 }] },
  { location: 'Indiranagar', totalViolations: 41, peakHour: 18, urgency: 'Low', recommendation: 'Monitor during 18:00–20:00', hourlyBreakdown: [{ hour: 18, count: 8 }, { hour: 19, count: 7 }, { hour: 17, count: 6 }] },
  { location: 'Electronic City', totalViolations: 35, peakHour: 7, urgency: 'Low', recommendation: 'Monitor during 7:00–9:00', hourlyBreakdown: [{ hour: 7, count: 7 }, { hour: 8, count: 6 }] },
]

const urgencyConfig = {
  High: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', badge: 'badge-rejected', icon: '🚨' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', badge: 'badge-moderate', icon: '⚠️' },
  Low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', badge: 'badge-low', icon: '✅' },
}

export default function Recommendations() {
  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/analytics/recommendations', { timeout: 4000 })
      setRecs(res.data.recommendations || [])
    } catch {
      setRecs(MOCK_RECS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const high = recs.filter(r => r.urgency === 'High').length
  const medium = recs.filter(r => r.urgency === 'Medium').length

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Enforcement Recommendations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            AI-driven officer deployment suggestions based on violation patterns
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'High Priority Zones', value: high, color: '#ef4444', icon: '🚨' },
          { label: 'Medium Priority Zones', value: medium, color: '#f59e0b', icon: '⚠️' },
          { label: 'Total Locations Analyzed', value: recs.length, color: '#3b82f6', icon: '📍' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--text-muted)' }}>Analyzing violation patterns...</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {recs.map((r, i) => {
            const cfg = urgencyConfig[r.urgency] || urgencyConfig.Low
            return (
              <div key={i} className="glass-card" style={{
                padding: '24px',
                borderTop: `3px solid ${cfg.color}`,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{r.location}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        <MapPin size={11} style={{ display: 'inline', marginRight: 3 }} />
                        Bengaluru, KA
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${cfg.badge}`}>{r.urgency}</span>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>{r.totalViolations}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Violations</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#60a5fa' }}>{r.peakHour}:00</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Peak Hour</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa' }}>
                      {r.urgency === 'High' ? 2 : 1}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Officers Needed</div>
                  </div>
                </div>

                {/* Recommendation box */}
                <div style={{
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  borderRadius: 10, padding: '12px 16px', marginBottom: 16,
                }}>
                  <div style={{ fontSize: 11, color: cfg.color, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🎯 Recommendation
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.recommendation}</div>
                </div>

                {/* Top hours */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    Top Violation Hours
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(r.hourlyBreakdown || []).slice(0, 4).map((h, j) => (
                      <div key={j} style={{
                        background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 12px',
                        fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                        {h.hour}:00 <span style={{ color: cfg.color }}>({h.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
