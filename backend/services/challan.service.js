/**
 * Challan Service — PDF generation using Puppeteer
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PDF_DIR = path.join(__dirname, '..', 'generated_challans');

// Ensure PDF directory exists
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

function getChainBadgeColor(level) {
  const colors = { Critical: '#dc2626', High: '#ea580c', Moderate: '#d97706', Low: '#16a34a' };
  return colors[level] || '#6b7280';
}

/**
 * Generate a beautiful PDF challan using Puppeteer
 */
async function generateChallanPDF(challanData) {
  const {
    challanId, plate, location, violations = [], fine,
    evidenceScore, offenceCount, violationChain = {}, createdAt,
  } = challanData;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #1e293b; }
    .page { width: 794px; min-height: 1123px; margin: 0 auto; background: white; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; }
    .logo-area h1 { font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
    .logo-area p { color: #64748b; font-size: 13px; margin-top: 4px; }
    .challan-id { text-align: right; }
    .challan-id .id { font-size: 20px; font-weight: 700; color: #3b82f6; font-family: monospace; }
    .challan-id .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .status-banner { background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%); color: white; padding: 20px 28px; border-radius: 12px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; }
    .status-banner h2 { font-size: 22px; font-weight: 700; }
    .status-banner .fine-amount { font-size: 36px; font-weight: 800; }
    .status-banner .fine-label { font-size: 11px; opacity: 0.8; text-transform: uppercase; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item { background: #f8fafc; border-radius: 8px; padding: 14px 18px; border: 1px solid #e2e8f0; }
    .info-item .key { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; }
    .info-item .val { font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 4px; }
    .plate-box { background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 8px; display: inline-block; font-family: monospace; font-size: 22px; font-weight: 800; letter-spacing: 3px; margin-bottom: 20px; }
    .violation-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 8px; }
    .violation-dot { width: 8px; height: 8px; background: #dc2626; border-radius: 50%; flex-shrink: 0; }
    .violation-name { font-weight: 600; color: #991b1b; flex: 1; }
    .chain-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; background: ${getChainBadgeColor(violationChain.level)}; }
    .score-bar-wrap { background: #e2e8f0; border-radius: 999px; height: 12px; overflow: hidden; margin-top: 8px; }
    .score-bar { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #3b82f6, #06b6d4); }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; color: #94a3b8; font-size: 11px; }
    .watermark { text-align: center; margin-top: 32px; }
    .watermark p { color: #cbd5e1; font-size: 11px; }
    .fine-breakdown { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; }
    .fine-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
    .fine-row.total { border-top: 1px solid #fde68a; margin-top: 8px; padding-top: 8px; font-weight: 700; font-size: 16px; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-area">
      <h1>🚦 TrafficEye AI</h1>
      <p>Automated Traffic Enforcement System • Government of Karnataka</p>
    </div>
    <div class="challan-id">
      <div class="label">Challan ID</div>
      <div class="id">${challanId}</div>
      <div class="label" style="margin-top:6px">Issued: ${new Date(createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>

  <div class="status-banner">
    <div>
      <h2>Traffic Violation Challan</h2>
      <p style="opacity:0.8;margin-top:4px;font-size:13px">Status: ISSUED — Payment required within 30 days</p>
    </div>
    <div style="text-align:right">
      <div class="fine-label">Total Fine</div>
      <div class="fine-amount">₹${fine.toLocaleString('en-IN')}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Vehicle Details</div>
    <div class="plate-box">${plate}</div>
    <div class="info-grid">
      <div class="info-item"><div class="key">Camera ID</div><div class="val">${challanData.camera || 'N/A'}</div></div>
      <div class="info-item"><div class="key">Location</div><div class="val">${location}</div></div>
      <div class="info-item"><div class="key">Offence Count</div><div class="val">#${offenceCount}</div></div>
      <div class="info-item"><div class="key">Issued By</div><div class="val">${challanData.issuedBy || 'System Auto-Detection'}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Detected Violations <span class="chain-badge">${violationChain.level || 'Low'} Risk</span></div>
    ${violations.map((v) => `
    <div class="violation-item">
      <div class="violation-dot"></div>
      <div class="violation-name">${v}</div>
    </div>`).join('')}
  </div>

  <div class="section">
    <div class="section-title">Evidence Reliability Score</div>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px">
      <div style="font-size:36px;font-weight:800;color:#0f172a">${evidenceScore}<span style="font-size:16px;color:#64748b">/100</span></div>
      <div style="flex:1">
        <div class="score-bar-wrap"><div class="score-bar" style="width:${evidenceScore}%"></div></div>
        <div style="font-size:11px;color:#64748b;margin-top:4px">${evidenceScore >= 85 ? 'High Confidence' : evidenceScore >= 70 ? 'Medium Confidence' : 'Low Confidence'} — ${evidenceScore >= 80 ? 'Strong evidence for enforcement' : 'Officer review recommended'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Fine Breakdown</div>
    <div class="fine-breakdown">
      <div class="fine-row"><span>Base Fine (Offence #${offenceCount})</span><span>₹${offenceCount >= 3 ? '2,000' : offenceCount === 2 ? '1,000' : '500'}</span></div>
      ${violations.map((v) => `<div class="fine-row"><span>${v}</span><span>₹${challanData.violationBreakdown?.find(b => b.violation === v)?.fine || 300}</span></div>`).join('')}
      <div class="fine-row total"><span>TOTAL</span><span>₹${fine.toLocaleString('en-IN')}</span></div>
    </div>
  </div>

  <div class="footer">
    <div>TrafficEye AI — Automated Enforcement System</div>
    <div>This challan was generated electronically and is valid without signature.</div>
    <div>Helpline: 1800-XXX-XXXX</div>
  </div>
  <div class="watermark"><p>To dispute this challan, visit traffic.karnataka.gov.in/dispute with Challan ID: ${challanId}</p></div>
</div>
</body>
</html>`;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfPath = path.join(PDF_DIR, `${challanId}.pdf`);
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();

  return pdfPath;
}

module.exports = { generateChallanPDF };
