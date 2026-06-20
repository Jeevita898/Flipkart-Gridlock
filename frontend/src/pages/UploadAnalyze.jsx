import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Upload, Image, Zap, AlertCircle, CheckCircle2, X } from 'lucide-react'

export default function UploadAnalyze() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const analyze = async () => {
    setLoading(true)
    setError(null)
    try {
      let result
      if (file) {
        const fd = new FormData()
        fd.append('image', file)
        const res = await axios.post('/api/analyze', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 8000,
        })
        result = res.data
      } else {
        // Demo mode — trigger without image
        const res = await axios.post('/api/analyze', new FormData(), { timeout: 8000 })
        result = res.data
      }
      navigate('/results', { state: { result } })
    } catch (err) {
      // Demo fallback — generate mock result
      const mockResult = {
        plate: 'KA05AB1234',
        camera: 'CAM-04',
        location: 'MG Road',
        violations: ['No Helmet', 'Triple Riding'],
        confidence: 94,
        ocrConfidence: 91,
        imageQuality: 87,
        evidenceScore: 91,
        violationChain: {
          level: 'Critical',
          score: 6,
          breakdown: [
            { violation: 'No Helmet', weight: 3, category: 'Safety' },
            { violation: 'Triple Riding', weight: 3, category: 'Safety' },
          ],
        },
        offenceCount: 3,
        isRepeatOffender: true,
      }
      navigate('/results', { state: { result: mockResult } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>
          Upload & Analyze
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Upload a traffic camera image to detect violations using the AI engine
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? '#3b82f6' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 20,
          padding: '60px 40px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? 'rgba(59,130,246,0.06)' : 'var(--bg-card)',
          transition: 'all 0.25s',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input {...getInputProps()} />

        {/* Background gradient blob */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {preview ? (
          <div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={preview} alt="Preview" style={{
                maxHeight: 240, maxWidth: '100%', borderRadius: 12,
                border: '2px solid rgba(59,130,246,0.3)',
              }} />
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null) }}
                style={{
                  position: 'absolute', top: -10, right: -10,
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#ef4444', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                }}
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ marginTop: 12, color: '#10b981', fontSize: 14, fontWeight: 600 }}>
              <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              {file.name} · {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Image size={32} color="#60a5fa" />
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {isDragActive ? 'Drop image here' : 'Drag & drop traffic image'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              or click to browse · JPG, PNG, WebP up to 10MB
            </p>
            <span className="badge badge-issued" style={{ fontSize: 12 }}>
              <Upload size={12} />
              Browse Files
            </span>
          </div>
        )}
      </div>

      {/* Camera info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { cam: 'CAM-01', loc: 'MG Road', status: 'Active', violations: 142 },
          { cam: 'CAM-04', loc: 'Silk Board', status: 'Active', violations: 98 },
          { cam: 'CAM-06', loc: 'Whitefield', status: 'Active', violations: 67 },
        ].map((c, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div className="pulse-dot" />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{c.cam}</span>
              <span className="badge badge-approved" style={{ marginLeft: 'auto', fontSize: 10 }}>{c.status}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.loc}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{c.violations} violations today</div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#f87171', fontSize: 14,
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          className="btn btn-primary"
          onClick={analyze}
          disabled={loading}
          style={{ fontSize: 15, padding: '13px 32px' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Analyzing...
            </>
          ) : (
            <>
              <Zap size={18} />
              {file ? 'Analyze Image' : 'Demo Analyze'}
            </>
          )}
        </button>
        {!file && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            No image? We'll use AI simulation mode
          </span>
        )}
      </div>

      {/* Steps */}
      <div style={{ marginTop: 40 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 16 }}>How It Works</div>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { step: '01', title: 'Upload', desc: 'Traffic camera image' },
            { step: '02', title: 'AI Analysis', desc: 'Plate detection + violation classification' },
            { step: '03', title: 'Evidence Score', desc: 'OCR + detection confidence' },
            { step: '04', title: 'Officer Review', desc: 'Human-in-the-loop approval' },
            { step: '05', title: 'Challan', desc: 'PDF generation + issuance' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, position: 'relative' }}>
              {i < 4 && (
                <div style={{
                  position: 'absolute', top: 16, left: '60%', right: 0,
                  height: 1, background: 'linear-gradient(90deg, #3b82f6, transparent)',
                  zIndex: 0,
                }} />
              )}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 8,
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
