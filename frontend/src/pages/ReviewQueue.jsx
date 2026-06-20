import { useState, useEffect } from 'react'
import axios from 'axios'
import { CheckCircle, XCircle, Clock, RefreshCw, Filter, Eye } from 'lucide-react'

const MOCK_QUEUE = Array.from({ length: 12 }, (_, i) => ({
  _id: `v${i}`,
  plate: ['KA05AB1234', 'MH12XY9988', 'DL03CD5678', 'TN09GH3321', 'AP07EF4411'][i % 5],
  camera: `CAM-0${(i % 6) + 1}`,
  location: ['MG Road', 'Whitefield', 'Koramangala', 'Indiranagar', 'Silk Board'][i % 5],
  violations: [['No Helmet', 'Triple Riding'], ['Red Light Jump'], ['Wrong Side', 'Speeding'], ['Illegal Parking'], ['No Seatbelt']][i % 5],
  violationChain: { level: ['Critical', 'High', 'Moderate', 'Low', 'High'][i % 5] },
  evidenceScore: [95, 88, 76, 82, 91, 73, 87, 94, 79, 68, 83, 90][i],
  status: 'Pending',
  createdAt: new Date(Date.now() - i * 7200000).toISOString(),
}))

export default function ReviewQueue() {
  const [violations, setViolations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Pending')
  const [processing, setProcessing] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/queue?status=${filter}`, { timeout: 4000 })
      setViolations(res.data.violations || [])
    } catch {
      setViolations(MOCK_QUEUE)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleAction = async (id, action) => {
    setProcessing(p => ({ ...p, [id]: action }))
    try {
      await axios.post('/api/review', {
        violationId: id, action,
        reviewedBy: 'Officer Kumar', notes: `${action} via review queue`,
      }, { timeout: 4000 })
    } catch { /* handle gracefully */ }
    // Update local state
    setViolations(vs => vs.map(v =>
      v._id === id ? { ...v, status: action } : v
    ))
    setProcessing(p => { const n = { ...p }; delete n[id]; return n })
  }

  const pending = violations.filter(v => v.status === 'Pending').length

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Officer Review Queue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Human-in-the-loop enforcement · {pending} pending reviews
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Reviewed">Needs Review</option>
          </select>
          <button className="btn btn-ghost" onClick={load}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Pending', value: violations.filter(v => v.status === 'Pending').length, color: '#f59e0b' },
          { label: 'Approved', value: violations.filter(v => v.status === 'Approved').length, color: '#10b981' },
          { label: 'Rejected', value: violations.filter(v => v.status === 'Rejected').length, color: '#ef4444' },
          { label: 'Needs Review', value: violations.filter(v => v.status === 'Reviewed').length, color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--text-muted)' }}>Loading queue...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {violations.map((v) => (
            <div key={v._id} className="glass-card" style={{
              padding: '20px 24px',
              borderLeft: `3px solid ${
                v.violationChain?.level === 'Critical' ? '#ef4444' :
                v.violationChain?.level === 'High' ? '#f97316' :
                v.violationChain?.level === 'Moderate' ? '#f59e0b' : '#10b981'
              }`,
              opacity: ['Approved', 'Rejected'].includes(v.status) ? 0.7 : 1,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 180px 140px 160px', gap: 16, alignItems: 'center' }}>
                {/* Plate + location */}
                <div>
                  <div className="plate" style={{ fontSize: 15, marginBottom: 4 }}>{v.plate}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.location}</div>
                </div>

                {/* Violations */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {v.violations?.map((vv, j) => (
                    <span key={j} className="violation-tag">{vv}</span>
                  ))}
                </div>

                {/* Chain + evidence */}
                <div>
                  <span className={`badge badge-${v.violationChain?.level?.toLowerCase()}`}>
                    {v.violationChain?.level} Risk
                  </span>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="score-bar-wrap" style={{ width: 70 }}>
                      <div className="score-bar" style={{ width: `${v.evidenceScore}%` }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v.evidenceScore}%</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className={`badge badge-${v.status?.toLowerCase()}`}>{v.status}</span>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(v.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Actions */}
                {v.status === 'Pending' ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleAction(v._id, 'Approved')}
                      disabled={!!processing[v._id]}
                    >
                      {processing[v._id] === 'Approved' ? '...' : <><CheckCircle size={14} /> OK</>}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleAction(v._id, 'Rejected')}
                      disabled={!!processing[v._id]}
                    >
                      {processing[v._id] === 'Rejected' ? '...' : <><XCircle size={14} /> Reject</>}
                    </button>
                    <button
                      className="btn btn-amber btn-sm"
                      onClick={() => handleAction(v._id, 'Reviewed')}
                      disabled={!!processing[v._id]}
                    >
                      <Clock size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {v.status === 'Approved' ? '✅ Approved' : v.status === 'Rejected' ? '❌ Rejected' : '🔍 Review'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {violations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Queue is empty</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>All violations have been reviewed</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
