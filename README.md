# 🚦 TrafficEye AI

website:https://flipkart-gridlock-nine.vercel.app/

**Automated Photo Identification and Classification for Traffic Violations Using Computer Vision**

> Flipkart Grid 6.0 · Problem Statement 3 · Team 04
> Jeevita Subray Devadig · Dhanushree C S

---

## What is TrafficEye AI?

TrafficEye AI is an end-to-end traffic violation detection and enforcement platform. It goes beyond simple detection — it understands violations in compound, scores the reliability of its own evidence, and automates the challan workflow with a human always in the loop.

**Most systems detect violations. TrafficEye AI enforces them.**

---

## Future System Architecture

```
Traffic Camera / Uploaded Image
         │
         ▼
 Adaptive Preprocessing Pipeline
 (condition classify → CLAHE / dehaze / deblur / derain)
         │
         ▼
 Vehicle & Rider Detection  [Proposed: YOLOv8]
 (India-specific taxonomy: two-wheeler, auto, e-rickshaw...)
         │
         ▼
 Violation Detection
 (No Helmet · Triple Riding · Red Light · Wrong Side · Parking · Seatbelt)
         │
         ▼
 License Plate OCR  [Proposed: PaddleOCR + EasyOCR]
 (RTO prefix validation · Real-ESRGAN for blurry plates)
         │
         ▼
 Violation Chain Engine  ⭐
 (stack violations → compound risk score → Critical / High / Moderate / Low)
         │
         ▼
 AI Verification Copilot  ⭐
 (LLM generates plain-English explanation per flagged violation)
         │
         ▼
 Evidence Reliability Scoring  ⭐
 (OCR × 0.4 + Detection × 0.4 + Image Quality × 0.2 → score → route)
         │
    ┌────┴─────┐
    ▼          ▼
Officer     Auto-approved
Review      (score ≥ 85)
Queue
    └────┬─────┘
         ▼
 Evidence Generator
 (annotated image · bounding boxes · plate · timestamp · location)
         │
         ▼
 Repeat Offender Check
 (plate-linked history · rolling 30-day window)
         │
         ▼
 Progressive Fine Engine  ⭐
 (1st → ₹500 · 2nd → ₹1000 · 3rd → ₹2000 · Habitual → Escalate RTO)
         │
         ▼
 Auto-Challan Draft (PDF)
         │
         ▼
      MongoDB
   ┌────┼────┐
   ▼    ▼    ▼
Violations Challans Analytics
         │
         ▼
  React Dashboard
```

---

## Unique Features

| Feature | What it does |
|---|---|
| **⭐ Violation Chain Engine** | Detects multiple simultaneous violations on one vehicle and stacks them into a compound risk score (No Helmet + Triple Riding + Wrong Side = Critical). Most systems treat violations in isolation. |
| **⭐ Evidence Reliability Scoring** | Scores every detection before any enforcement action using `(OCR × 0.4) + (Detection × 0.4) + (Image Quality × 0.2)`. Low score → human review. High score → auto-approve. Prevents wrongful challans. |
| **⭐ Adaptive Preprocessing Pipeline** | Classifies image condition first (Night / Fog / Blur / Rain / Normal), then routes to the right enhancement filter. Normal images skip processing entirely — saving computation. |
| **⭐ Progressive Fine Engine** | Fine amount tied to offence history: 1st offence ₹500, 2nd ₹1000, 3rd+ ₹2000 base + per-violation fines, capped at ₹10,000. Habitual offenders escalated to RTO. |
| **AI Verification Copilot** | LLM generates a plain-English summary of each detection for officer review. Officers see the *why*, not just the detection output. |
| **Officer Review Queue** | Human-in-the-loop verification before any challan is issued. Approve / Reject / Flag for review. |
| **Dispute Resolution Portal** | Citizens can challenge a challan with a full evidence audit trail — OCR confidence, image quality, detection score all logged. |
| **Enforcement Recommendation Engine** | MongoDB aggregation identifies peak violation hours per camera location and recommends officer deployment. |

---

## Project Structure

```
traffic-eye-ai/
├── frontend/                  # React 18 + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Live stats, violation feed
│   │   │   ├── UploadAnalyze.jsx      # Image upload & analysis trigger
│   │   │   ├── Results.jsx            # Violation chain + evidence score
│   │   │   ├── ReviewQueue.jsx        # Officer approve/reject interface
│   │   │   ├── ChallanPage.jsx        # Challan list + PDF download
│   │   │   ├── Analytics.jsx          # Charts, trends, hotspots
│   │   │   ├── Recommendations.jsx    # Enforcement deployment suggestions
│   │   │   └── Dispute.jsx            # Citizen dispute portal
│   │   ├── App.jsx                    # Router + sidebar layout
│   │   └── index.css                  # Global styles (dark theme)
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Node.js + Express API
│   ├── server.js              # Entry point, MongoDB connect, middleware
│   ├── routes/
│   │   ├── analysis.routes.js         # POST /api/analyze (image upload)
│   │   ├── review.routes.js           # GET/POST /api/queue, /api/review
│   │   ├── fine.routes.js             # POST /api/fine
│   │   ├── challan.routes.js          # POST/GET /api/challan, PDF, dispute
│   │   └── analytics.routes.js        # GET /api/analytics, /recommendations
│   ├── controllers/
│   │   ├── analysis.controller.js     # Orchestrates AI engine + DB save
│   │   ├── review.controller.js       # Queue management
│   │   ├── fine.controller.js         # Fine calculation endpoint
│   │   ├── challan.controller.js      # Challan CRUD + PDF generation
│   │   └── analytics.controller.js    # Aggregation queries
│   ├── services/
│   │   ├── aiEngine.service.js        # Violation Chain + Evidence Score (core logic)
│   │   ├── fineEngine.service.js      # Progressive fine calculation
│   │   ├── challan.service.js         # PDF generation via Puppeteer
│   │   └── recommendation.service.js  # Hotspot + deployment suggestions
│   ├── models/
│   │   ├── Violation.js               # plate, violations, location, score, timestamp
│   │   ├── Offender.js                # plate, offenceCount, history
│   │   └── Challan.js                 # challanId, fine, status, evidenceScore
│   ├── uploads/               # Uploaded traffic images (gitignored)
│   ├── generated_challans/    # PDF challans (gitignored)
│   ├── .env.example
│   └── package.json
│
└── database/
    └── seed.js                # Seed MongoDB with sample violations + offenders
```

---

## Tech Stack

### Current Prototype (Built)

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, React Router v7 |
| UI Components | Lucide React, Recharts, React Dropzone |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB Atlas |
| PDF Generation | Puppeteer (headless Chrome) |
| File Upload | Multer |

### Proposed AI Layer (Designed for integration)

| Component | Technology |
|---|---|
| Vehicle & Violation Detection | YOLOv8 (Ultralytics) |
| License Plate OCR | PaddleOCR + EasyOCR |
| Plate Enhancement | Real-ESRGAN (super-resolution) |
| Preprocessing Pipeline | OpenCV (CLAHE, dark channel prior, deblur) |
| AI Verification Copilot | LLM API |

> The current prototype uses a rule-based JS engine (`aiEngine.service.js`) that simulates detection with realistic outputs. All surrounding infrastructure — the enforcement workflow, fine engine, review queue, challan generation, dispute portal, and analytics — is fully functional.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/traffic-eye-ai.git
cd traffic-eye-ai
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your MongoDB URI:

```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/traffic-eye-ai?retryWrites=true&w=majority
NODE_ENV=development
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Backend starts on `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`

### 4. Seed the database (optional)

```bash
cd database
node seed.js
```

This populates MongoDB with sample violations, offenders, and challans for demonstration.

### 5. Demo mode (no backend needed)

The frontend works fully without a running backend. All pages fall back to rich mock data automatically. Just run:

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Upload traffic image → AI detection + chain analysis |
| `GET` | `/api/queue` | Get officer review queue (pending violations) |
| `POST` | `/api/review` | Approve / Reject / Flag a violation |
| `POST` | `/api/fine` | Calculate progressive fine for a plate |
| `POST` | `/api/challan` | Issue challan after approval |
| `GET` | `/api/challan` | List all challans |
| `GET` | `/api/challan/:id/pdf` | Download challan as PDF |
| `POST` | `/api/challan/:id/dispute` | File a dispute against a challan |
| `GET` | `/api/analytics` | Dashboard stats and violation trends |
| `GET` | `/api/analytics/recommendations` | Enforcement deployment recommendations |

---

## Core Engine Logic

### Violation Chain Engine

Each violation has a severity weight. The system sums weights across all detected violations on a single vehicle and maps to a risk level:

```
No Helmet      → weight 3
Triple Riding  → weight 3
Red Light Jump → weight 4
Wrong Side     → weight 4
Illegal Parking→ weight 2
No Seatbelt    → weight 2

Score ≥ 10 → Critical
Score ≥  7 → High
Score ≥  4 → Moderate
Score  < 4 → Low
```

Example: No Helmet (3) + Triple Riding (3) + Wrong Side (4) = **Score 10 → Critical**

### Evidence Reliability Score

```
Score = (OCR Confidence × 0.4) + (Detection Confidence × 0.4) + (Image Quality × 0.2)

Score ≥ 85  → Auto-approved, challan issued automatically
Score 70–84 → Sent to officer review queue
Score < 70  → Flagged for re-inspection
```

### Progressive Fine Engine

```
Offence count lookup per plate (rolling 30-day window):

1st offence  → ₹500  base + per-violation fines
2nd offence  → ₹1000 base + per-violation fines
3rd+ offence → ₹2000 base + per-violation fines
                        (capped at ₹10,000 total)

Habitual offender → flagged for RTO escalation / court summons
```

---

## Pages Overview

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Live violation feed, stats, hotspot summary |
| Upload & Analyze | `/upload` | Drag-drop image upload → pipeline processing |
| Results | `/results` | Violation chain, evidence score, AI copilot summary |
| Review Queue | `/review` | Officer approve / reject / flag interface |
| Challans | `/challans` | All challans, status, PDF download |
| Analytics | `/analytics` | Charts by violation type, camera, time of day |
| Recommendations | `/recommendations` | Deployment suggestions from hotspot data |
| Dispute Portal | `/dispute` | Citizen challenge with evidence audit trail |

---

## Notes for Reviewers

- **AI detection is simulated**: The `aiEngine.service.js` uses a rule-based JS engine to simulate realistic detection outputs (plate numbers, violation types, confidence scores). In a production deployment, this is replaced by a YOLOv8 inference server + PaddleOCR service.
- **All enforcement logic is real**: The Violation Chain Engine, Evidence Reliability Scorer, Progressive Fine Engine, Officer Review Queue, Challan Generator (PDF), Dispute Portal, and Analytics are fully implemented and functional.
- **Demo mode**: The app runs entirely in the browser without a backend. All pages fall back to realistic mock data so the full workflow can be demonstrated without any server setup.

---

## Team

**Team 04 · Flipkart Grid 6.0 · Problem Statement 3**

- Jeevita Subray Devadig
- Dhanushree C S
