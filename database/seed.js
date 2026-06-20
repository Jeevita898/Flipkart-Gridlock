/**
 * Database Seed Script
 * Populates MongoDB with realistic demo data
 * Run: node database/seed.js
 */

require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');

// Inline simplified models for seed script
const violationSchema = new mongoose.Schema({
  plate: String, camera: String, location: String,
  violations: [String], confidence: Number, evidenceScore: Number,
  violationChain: { level: String, score: Number },
  status: { type: String, default: 'Pending' },
  reviewedBy: String,
}, { timestamps: true });

const offenderSchema = new mongoose.Schema({
  plate: { type: String, unique: true }, offenceCount: Number,
  totalFines: Number, lastViolation: Date, isRepeatOffender: Boolean,
}, { timestamps: true });

const challanSchema = new mongoose.Schema({
  challanId: String, violationId: mongoose.Schema.Types.ObjectId,
  plate: String, location: String, violations: [String],
  offenceCount: Number, fine: Number, evidenceScore: Number,
  status: { type: String, default: 'Issued' },
}, { timestamps: true });

const Violation = mongoose.model('Violation', violationSchema);
const Offender = mongoose.model('Offender', offenderSchema);
const Challan = mongoose.model('Challan', challanSchema);

const plates = [
  'KA05AB1234', 'KA01MH7654', 'MH12XY9988', 'DL03CD5678',
  'TN09GH3321', 'AP07EF4411', 'KA04TZ2211', 'MH20PQ8877',
  'GJ01AB1122', 'RJ14CD9900', 'KA11ZZ9090', 'UP32CD4455',
  'WB10GH2233', 'HR26AB7788', 'PB65CD0011',
];

const cameras = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05', 'CAM-06'];

const locations = [
  'MG Road', 'Whitefield', 'Koramangala', 'Indiranagar',
  'Electronic City', 'Hebbal', 'Silk Board', 'Brigade Road',
];

const violationTypes = [
  'No Helmet', 'Triple Riding', 'Red Light Jump', 'Wrong Side',
  'Illegal Parking', 'No Seatbelt', 'Speeding', 'Phone While Driving',
];

const weights = { 'No Helmet': 3, 'Triple Riding': 3, 'Red Light Jump': 4, 'Wrong Side': 4, 'Illegal Parking': 2, 'No Seatbelt': 2, 'Speeding': 4, 'Phone While Driving': 3 };

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateViolations() {
  const count = rand(1, 3);
  const shuffled = [...violationTypes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function chainScore(vs) { return vs.reduce((s, v) => s + (weights[v] || 1), 0); }
function chainLevel(score) {
  if (score >= 10) return 'Critical';
  if (score >= 7) return 'High';
  if (score >= 4) return 'Moderate';
  return 'Low';
}

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, daysAgo));
  d.setHours(rand(6, 22), rand(0, 59), 0, 0);
  return d;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([Violation.deleteMany(), Offender.deleteMany(), Challan.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    const offenderMap = {};
    const savedViolations = [];

    // Generate 60 violations
    for (let i = 0; i < 60; i++) {
      const plate = pick(plates);
      const vs = generateViolations();
      const score = chainScore(vs);
      const evidenceScore = rand(65, 98);
      const confidence = rand(72, 97);
      const status = pick(['Pending', 'Pending', 'Approved', 'Rejected', 'Reviewed']);
      const date = randomDate(14);

      const violation = new Violation({
        plate, camera: pick(cameras), location: pick(locations),
        violations: vs, confidence, evidenceScore,
        violationChain: { level: chainLevel(score), score },
        status, createdAt: date, updatedAt: date,
      });

      await violation.save();
      savedViolations.push(violation);

      if (!offenderMap[plate]) offenderMap[plate] = { count: 0, last: date, history: [] };
      offenderMap[plate].count++;
      offenderMap[plate].last = date > offenderMap[plate].last ? date : offenderMap[plate].last;
      offenderMap[plate].history.push(violation._id);
    }

    console.log(`✅ Created ${savedViolations.length} violations`);

    // Create offenders
    for (const [plate, data] of Object.entries(offenderMap)) {
      await new Offender({
        plate, offenceCount: data.count,
        totalFines: data.count * rand(500, 2000),
        lastViolation: data.last,
        isRepeatOffender: data.count >= 3,
      }).save();
    }

    console.log(`✅ Created ${Object.keys(offenderMap).length} offender records`);

    // Create 20 challans from approved violations
    const approved = savedViolations.filter(v => v.status === 'Approved').slice(0, 20);
    let challanCount = 1;

    for (const v of approved) {
      const offender = offenderMap[v.plate];
      const offenceCount = offender?.count || 1;
      const baseFine = offenceCount >= 3 ? 2000 : offenceCount === 2 ? 1000 : 500;
      const fine = Math.min(baseFine + rand(300, 1500), 5000);

      await new Challan({
        challanId: `CHL-${String(challanCount++).padStart(4, '0')}`,
        violationId: v._id, plate: v.plate, location: v.location,
        violations: v.violations, offenceCount, fine,
        evidenceScore: v.evidenceScore,
        status: pick(['Issued', 'Issued', 'Paid', 'Disputed']),
        createdAt: v.createdAt, updatedAt: v.updatedAt,
      }).save();
    }

    console.log(`✅ Created ${approved.length} challans`);
    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
