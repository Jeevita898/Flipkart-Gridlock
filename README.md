# 🚦 TrafficEye AI

> Hackathon-grade AI-powered traffic violation enforcement platform

---

## Architecture

```
React Frontend (Vite + Tailwind) 
      ↕ REST API
Node.js Backend (Express)
      ↕ Mongoose ODM
MongoDB Atlas
      ↕ Services
AI/Rule Engine (Violation Chain + Evidence Score + Fine Engine)
```

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env
# Add your MongoDB URI to .env
npm run dev    # starts on :5000
```

### 2. Frontend
```bash
cd frontend
npm run dev    # starts on :5173
```

### 3. Seed Database (optional)
```bash
cd database
node seed.js
```

---

## 5 Unique AI Features

| Feature | Description |
|---|---|
| **Violation Chain Engine** | Compound violations scored → Critical/High/Moderate/Low risk |
| **Evidence Reliability Score** | `(OCR×0.4) + (Detection×0.4) + (Quality×0.2)` |
| **Progressive Fine Engine** | 1st→₹500, 2nd→₹1000, 3rd+→₹2000 base + per-violation |
| **Officer Review Queue** | Human-in-the-loop approval before challan issuance |
| **Enforcement Recommendation Engine** | MongoDB aggregation → peak hours → deployment suggestions |
| **Dispute Resolution Portal** | Full evidence audit trail for citizen challenges |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Upload image → AI detection |
| `GET` | `/api/queue` | Officer review queue |
| `POST` | `/api/review` | Approve/Reject violation |
| `POST` | `/api/fine` | Calculate progressive fine |
| `POST` | `/api/challan` | Issue challan |
| `GET` | `/api/challan` | List all challans |
| `GET` | `/api/challan/:id/pdf` | Download challan PDF |
| `POST` | `/api/challan/:id/dispute` | File dispute |
| `GET` | `/api/analytics` | Dashboard analytics |
| `GET` | `/api/analytics/recommendations` | Enforcement recommendations |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Recharts, React Router v6
- **Backend**: Node.js, Express 4, Mongoose
- **Database**: MongoDB Atlas
- **PDF**: Puppeteer (headless Chrome)
- **AI Engine**: Rule-based JS engine (swappable with ML model)

---

## Demo Mode

The app works **without a backend**. All pages fall back to rich mock data automatically. Just run the frontend!
