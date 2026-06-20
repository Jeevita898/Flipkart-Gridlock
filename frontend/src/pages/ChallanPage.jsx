import { useState, useEffect } from 'react'
import axios from 'axios'
import { Download, RefreshCw, FileText, AlertTriangle, CheckCircle, Search } from 'lucide-react'

const MOCK_CHALLANS = Array.from({ length: 10 }, (_, i) => ({
  challanId: `CHL-${String(i + 1).padStart(4, '0')}`,
  plate: ['KA05AB1234', 'MH12XY9988', 'DL03CD5678', 'TN09GH3321', 'AP07EF4411'][i % 5],
  location: ['MG Road', 'Whitefield', 'Koramangala', 'Indiranagar', 'Silk Board'][i % 5],
  violations: [['No Helmet', 'Triple Riding'], ['Red Light Jump'], ['Wrong Side'], ['Speeding'], ['Illegal Parking']][i % 5],
  offenceCount: [3, 1, 2, 1, 3, 2, 1, 3, 2, 1][i],
  fine: [4500, 1300, 2800, 1300, 4200, 2600, 1100, 3800, 2400, 1500][i],
  evidenceScore: [95, 88, 76, 82, 91, 73, 87, 94, 79, 84][i],
  status: ['Issued', 'Paid', 'Disputed', 'Issued', 'Issued', 'Paid', 'Issued', 'Disputed', 'Paid', 'Issued'][i],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export default function ChallanPage() {
  const [challans, setChallans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [downloading, setDownloading] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/challan?limit=50', { timeout: 4000 })
      setChallans(res.data.challans || [])
    } catch {
      setChallans(MOCK_CHALLANS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const downloadPDF = async (challanId) => {
    setDownloading(d => ({ ...d, [challanId]: true }))
    try {
      const res = await axios.get(`/api/challan/${challanId}/pdf`, {
        responseType: 'blob', timeout: 15000,
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = `${challanId}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('PDF generation requires backend. Start the backend to download PDFs.')
    } finally {
      setDownloading(d => { const n = { ...d }; delete n[challanId]; return n })
    }
  }

  const filtered = challans.filter(c => {
    const matchSearch = !search || c.plate?.includes(search.toUpperCase()) || c.challanId?.includes(search.toUpperCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalFines = challans.reduce((s, c) => s + (c.fine || 0), 0)
  const paidFines = challans.filter(c => c.status === 'Paid').reduce((s, c) => s + (c.fine || 0), 0)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Challans
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Traffic violation challans · {challans.length} total issued
          </p>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Challans', value: challans.length, color: '#3b82f6' },
          { label: 'Total Fines', value: `₹${totalFines.toLocaleString('en-IN')}`, color: '#ef4444' },
          { label: 'Collected', value: `₹${paidFines.toLocaleString('en-IN')}`, color: '#10b981' },
          { label: 'Disputed', value: challans.filter(c => c.status === 'Disputed').length, color: '#f97316' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search by plate or challan ID..."
            style={{ paddingLeft: 36 }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="Issued">Issued</option>
          <option value="Paid">Paid</option>
          <option value="Disputed">Disputed</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Challan ID</th>
              <th>Plate</th>
              <th>Location</th>
              <th>Violations</th>
              <th>Offence #</th>
              <th>Fine</th>
              <th>Evidence</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.challanId || i}>
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#60a5fa' }}>{c.challanId}</td>
                <td><span className="plate">{c.plate}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.location}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {c.violations?.slice(0, 2).map((v, j) => <span key={j} className="violation-tag">{v}</span>)}
                    {c.violations?.length > 2 && <span className="violation-tag">+{c.violations.length - 2}</span>}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    background: c.offenceCount >= 3 ? 'rgba(239,68,68,0.15)' : c.offenceCount === 2 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                    color: c.offenceCount >= 3 ? '#f87171' : c.offenceCount === 2 ? '#fbbf24' : '#34d399',
                  }}>
                    #{c.offenceCount}
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: '#fbbf24', fontSize: 15 }}>
                  ₹{c.fine?.toLocaleString('en-IN')}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="score-bar-wrap" style={{ width: 50 }}>
                      <div className="score-bar" style={{ width: `${c.evidenceScore}%` }} />
                    </div>
                    <span style={{ fontSize: 11 }}>{c.evidenceScore}</span>
                  </div>
                </td>
                <td><span className={`badge badge-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => downloadPDF(c.challanId)}
                    disabled={!!downloading[c.challanId]}
                    title="Download PDF"
                  >
                    {downloading[c.challanId]
                      ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      : <Download size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <FileText size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div>No challans found</div>
          </div>
        )}
      </div>
    </div>
  )
}
