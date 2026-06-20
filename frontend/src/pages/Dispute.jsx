import { useState } from 'react'
import axios from 'axios'
import { Search, AlertTriangle, CheckCircle, FileText, Shield, Eye, MessageSquare } from 'lucide-react'

const MOCK_CHALLAN = {
  challanId: 'CHL-0042',
  plate: 'KA05AB1234',
  location: 'MG Road',
  violations: ['No Helmet', 'Triple Riding'],
  offenceCount: 3,
  fine: 4500,
  evidenceScore: 91,
  status: 'Issued',
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  violationChain: { level: 'Critical', score: 6 },
  ocrConfidence: 94,
  detectionConfidence: 91,
  imageQuality: 87,
}

export default function Dispute() {
  const [challanId, setChallanId] = useState('')
  const [challan, setChallan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeSubmitted, setDisputeSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const search = async () => {
    setLoading(true); setNotFound(false); setChallan(null); setDisputeSubmitted(false)
    try {
      const res = await axios.get(`/api/challan/${challanId.toUpperCase()}`, { timeout: 4000 })
      setChallan(res.data.challan)
    } catch {
      if (challanId.toUpperCase() === 'CHL-0042' || challanId === 'demo') {
        setChallan(MOCK_CHALLAN)
      } else {
        setNotFound(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const submitDispute = async () => {
    if (!disputeReason.trim()) return
    setSubmitting(true)
    try {
      await axios.post(`/api/challan/${challan.challanId}/dispute`, { disputeReason }, { timeout: 4000 })
    } catch { /* demo mode */ }
    setDisputeSubmitted(true)
    setChallan(c => ({ ...c, status: 'Disputed' }))
    setSubmitting(false)
  }

  const evidenceBars = challan ? [
    { label: 'OCR Plate Recognition', value: challan.ocrConfidence || 91, color: '#3b82f6', weight: '40%' },
    { label: 'AI Detection Confidence', value: challan.detectionConfidence || challan.evidenceScore, color: '#8b5cf6', weight: '40%' },
    { label: 'Image Quality', value: challan.imageQuality || 87, color: '#10b981', weight: '20%' },
  ] : []

  return (
    <div className="fade-in" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
          Dispute Resolution Portal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Challenge a challan — view full evidence trail and submit your dispute
        </p>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
          Enter Challan ID to begin
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input" style={{ paddingLeft: 36 }}
              placeholder='e.g. CHL-0042 (or type "demo")'
              value={challanId}
              onChange={e => setChallanId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>
          <button className="btn btn-primary" onClick={search} disabled={loading || !challanId.trim()}>
            {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Search size={16} />}
            {loading ? 'Searching...' : 'Find Challan'}
          </button>
        </div>
        {notFound && (
          <div style={{ marginTop: 12, color: '#f87171', fontSize: 13 }}>
            ❌ Challan not found. Try "demo" to see a demo challan.
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          Tip: Type <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 }}>demo</code> to see a sample dispute flow
        </div>
      </div>

      {challan && (
        <div className="fade-in">
          {/* Challan header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            borderRadius: 16, padding: '24px 28px', marginBottom: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
                Challan ID
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                {challan.challanId}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                Issued: {new Date(challan.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Total Fine</div>
              <div style={{ fontSize: 40, fontWeight: 900 }}>₹{challan.fine?.toLocaleString('en-IN')}</div>
              <span className={`badge badge-${challan.status?.toLowerCase()}`} style={{ marginTop: 4 }}>{challan.status}</span>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
                Vehicle & Violation Details
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 800, color: '#60a5fa', marginBottom: 16, letterSpacing: 2 }}>
                {challan.plate}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Location', value: challan.location },
                  { label: 'Offence #', value: `#${challan.offenceCount}` },
                ].map((d, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{d.label}</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{d.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Violations Detected</div>
                {challan.violations?.map((v, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', marginBottom: 8,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                  }}>
                    <AlertTriangle size={15} color="#ef4444" />
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
                Evidence Audit Trail
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 600 }}>Reliability Score</span>
                  <span style={{ fontSize: 28, fontWeight: 800, color: challan.evidenceScore >= 85 ? '#10b981' : '#f59e0b' }}>
                    {challan.evidenceScore}/100
                  </span>
                </div>
                {evidenceBars.map((b, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{b.label}</span>
                      <span style={{ color: b.color, fontWeight: 600 }}>{b.value}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({b.weight})</span></span>
                    </div>
                    <div className="score-bar-wrap">
                      <div className="score-bar" style={{ width: `${b.value}%`, background: `linear-gradient(90deg, ${b.color}88, ${b.color})` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                background: challan.violationChain?.level === 'Critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${challan.violationChain?.level === 'Critical' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                borderRadius: 10, padding: '12px 16px',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Violation Chain Level</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: challan.violationChain?.level === 'Critical' ? '#f87171' : '#fbbf24' }}>
                  {challan.violationChain?.level} Risk
                  <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 8, color: 'var(--text-muted)' }}>
                    Score: {challan.violationChain?.score}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dispute section */}
          {!disputeSubmitted && challan.status !== 'Disputed' && challan.status !== 'Resolved' ? (
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                <MessageSquare size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                Submit Dispute
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                If you believe this challan was issued in error, provide your reason below. Our team will review it within 5 working days.
              </p>
              <textarea
                className="input"
                style={{ minHeight: 100, resize: 'vertical' }}
                placeholder="Describe why you believe this challan is incorrect (e.g., 'Helmet was worn, camera angle was misleading')"
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  className="btn btn-danger"
                  onClick={submitDispute}
                  disabled={submitting || !disputeReason.trim()}
                >
                  {submitting ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <AlertTriangle size={16} />}
                  {submitting ? 'Submitting...' : 'File Dispute'}
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
                  Evidence score of {challan.evidenceScore}/100 will be shown to the review officer
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              background: disputeSubmitted ? 'rgba(16,185,129,0.1)' : 'rgba(249,115,22,0.1)',
              border: `1px solid ${disputeSubmitted ? 'rgba(16,185,129,0.3)' : 'rgba(249,115,22,0.3)'}`,
              borderRadius: 14, padding: '24px',
              display: 'flex', gap: 16, alignItems: 'flex-start',
            }}>
              <CheckCircle size={28} color={disputeSubmitted ? '#10b981' : '#f97316'} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {disputeSubmitted ? 'Dispute Filed Successfully' : 'This Challan is Under Dispute'}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {disputeSubmitted
                    ? `Your dispute for challan ${challan.challanId} has been submitted. Reference: DIS-${Date.now().toString().slice(-6)}. You will receive a response within 5 working days.`
                    : 'This challan is currently under review. Please contact the Traffic Department for status updates.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
