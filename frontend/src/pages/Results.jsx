import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import {
  AlertTriangle, Shield, Camera, MapPin, Zap, ChevronRight,
  CheckCircle2, FileText, ArrowRight, BarChart3, RefreshCw
} from 'lucide-react'

function EvidenceBreakdown({ ocr, detection, quality, total }) {
  const bars = [
    { label: 'OCR Confidence', value: ocr, weight: '40%', color: '#3b82f6' },
    { label: 'Detection Confidence', value: detection, weight: '40%', color: '#8b5cf6' },
    { label: 'Image Quality', value: quality, weight: '20%', color: '#10b981' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {bars.map((b, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{b.label}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>weight {b.weight}</span>
              <span style={{ color: b.color, fontWeight: 600 }}>{b.value}%</span>
            </div>
          </div>
          <div className="score-bar-wrap">
            <div className="score-bar" style={{ width: `${b.value}%`, background: `linear-gradient(90deg, ${b.color}88, ${b.color})` }} />
          </div>
        </div>
      ))}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border)',
      }}>
        <span style={{ fontWeight: 600 }}>Evidence Reliability Score</span>
        <div style={{
          fontSize: 32, fontWeight: 800,
          background: total >= 85 ? 'linear-gradient(135deg, #10b981, #06b6d4)' : total >= 70 ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, #ef4444, #f97316)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {total}<span style={{ fontSize: 16, opacity: 0.7 }}>/100</span>
        </div>
      </div>
    </div>
  )
}

function ViolationChainViz({ chain }) {
  if (!chain?.breakdown?.length) return null
  const levelConfig = {
    Critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', emoji: '🚨' },
    High: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', emoji: '⚠️' },
    Moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', emoji: '⚡' },
    Low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', emoji: '✅' },
  }
  const cfg = levelConfig[chain.level] || levelConfig.Low

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>{cfg.emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: cfg.color }}>{chain.level} Risk Chain</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: cfg.color, fontWeight: 600 }}>
          Score: {chain.score}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        {chain.breakdown.map((b, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`,
              color: cfg.color, padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            }}>
              {b.violation}
              <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 4 }}>×{b.weight}</span>
            </span>
            {i < chain.breakdown.length - 1 && (
              <span style={{ color: cfg.color, fontSize: 18, fontWeight: 700 }}>+</span>
            )}
          </span>
        ))}
        <span style={{ color: cfg.color, fontSize: 18, fontWeight: 700 }}>=</span>
        <span style={{ color: cfg.color, fontWeight: 800, fontSize: 15 }}>{chain.level} Risk</span>
      </div>
    </div>
  )
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [issuing, setIssuing] = useState(false)
  const [challanIssued, setChallanIssued] = useState(null)

  const result = state?.result

  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Analysis Result</div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Please upload an image to analyze first.</p>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <RefreshCw size={16} /> Go to Upload
        </button>
      </div>
    )
  }

  const issueChallan = async () => {
    setIssuing(true)
    try {
      const res = await axios.post('/api/challan', { violationId: result.violationId })
      setChallanIssued(res.data.challan)
    } catch {
      // Mock challan for demo
      setChallanIssued({
        challanId: 'CHL-DEMO01',
        plate: result.plate,
        fine: result.offenceCount >= 3 ? 4500 : result.offenceCount === 2 ? 2500 : 1300,
        status: 'Issued',
      })
    } finally {
      setIssuing(false)
    }
  }

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/upload')}>
          ← Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Analysis Results
        </h1>
        {result.isRepeatOffender && (
          <span className="badge badge-rejected" style={{ marginLeft: 8 }}>
            ⚠️ Repeat Offender
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Vehicle Info */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: 11, letterSpacing: '1px' }}>
            Vehicle Detected
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 30, fontWeight: 800,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 20, letterSpacing: 3,
          }}>
            {result.plate}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Camera', value: result.camera, icon: Camera },
              { label: 'Location', value: result.location, icon: MapPin },
              { label: 'Confidence', value: `${result.confidence}%`, icon: BarChart3 },
              { label: 'Offence #', value: `#${result.offenceCount || 1}`, icon: Shield },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 10,
                padding: '12px', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon size={12} /> {label}
                </div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Violations */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 18, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Violations Detected ({result.violations?.length || 0})
          </div>
          {result.violations?.map((v, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', marginBottom: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
            }}>
              <AlertTriangle size={18} color="#ef4444" />
              <span style={{ fontWeight: 600, flex: 1 }}>{v}</span>
              <span style={{ fontSize: 12, color: '#f87171' }}>Detected</span>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Detection Confidence</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="score-bar-wrap" style={{ flex: 1 }}>
                <div className="score-bar" style={{ width: `${result.confidence}%` }} />
              </div>
              <span style={{ fontWeight: 700, color: '#60a5fa' }}>{result.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Violation Chain */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Violation Chain Analysis
        </div>
        <ViolationChainViz chain={result.violationChain} />
      </div>

      {/* Evidence Score */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Evidence Reliability Score
        </div>
        <EvidenceBreakdown
          ocr={result.ocrConfidence || 91}
          detection={result.confidence}
          quality={result.imageQuality || 87}
          total={result.evidenceScore}
        />
      </div>

      {/* Challan Issued banner */}
      {challanIssued && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 14, padding: '20px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <CheckCircle2 size={32} color="#10b981" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#10b981' }}>Challan Issued!</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {challanIssued.challanId} · Fine: ₹{challanIssued.fine?.toLocaleString('en-IN')} · Status: {challanIssued.status}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => navigate('/challans')}>
            View Challans <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => navigate('/review')} style={{ padding: '12px 28px' }}>
          <ChevronRight size={18} /> Send to Review Queue
        </button>
        {!challanIssued && (
          <button className="btn btn-success" onClick={issueChallan} disabled={issuing} style={{ padding: '12px 28px' }}>
            {issuing ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Issuing...</> : <><FileText size={18} /> Issue Challan</>}
          </button>
        )}
        <button className="btn btn-ghost" onClick={() => navigate('/upload')}>
          Analyze Another
        </button>
      </div>
    </div>
  )
}
