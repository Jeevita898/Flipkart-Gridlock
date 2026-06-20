/**
 * AI Engine Service
 * - Violation Chain Engine
 * - Evidence Reliability Score
 * - Mock detection with realistic simulation
 */

// Violation definitions with severity weights
const VIOLATION_CATALOG = {
  'No Helmet': { weight: 3, fine: 500, category: 'Safety' },
  'Triple Riding': { weight: 3, fine: 500, category: 'Safety' },
  'Red Light Jump': { weight: 4, fine: 1000, category: 'Signal' },
  'Wrong Side': { weight: 4, fine: 1000, category: 'Road Rules' },
  'Illegal Parking': { weight: 2, fine: 300, category: 'Parking' },
  'No Seatbelt': { weight: 2, fine: 500, category: 'Safety' },
  'Speeding': { weight: 4, fine: 1000, category: 'Speed' },
  'Phone While Driving': { weight: 3, fine: 500, category: 'Distraction' },
  'No Rear Light': { weight: 2, fine: 300, category: 'Equipment' },
  'Overloading': { weight: 3, fine: 500, category: 'Load' },
};

const ALL_VIOLATIONS = Object.keys(VIOLATION_CATALOG);

// Violation Chain severity thresholds
const CHAIN_LEVELS = [
  { label: 'Critical', minScore: 10 },
  { label: 'High', minScore: 7 },
  { label: 'Moderate', minScore: 4 },
  { label: 'Low', minScore: 0 },
];

/**
 * Simulates AI/OCR plate detection on an uploaded image.
 * In production, replace this with actual ML model call.
 */
function simulateDetection(fileName = '') {
  const statePlates = [
    'KA05AB1234', 'KA01MH7654', 'MH12XY9988', 'DL03CD5678',
    'TN09GH3321', 'AP07EF4411', 'KA04TZ2211', 'MH20PQ8877',
    'GJ01AB1122', 'RJ14CD9900',
  ];

  const cameras = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05', 'CAM-06'];
  const locations = [
    'MG Road', 'Whitefield', 'Koramangala', 'Indiranagar',
    'Electronic City', 'Hebbal', 'Silk Board', 'Brigade Road',
  ];

  // Simulate detection variability
  const ocrConfidence = Math.floor(Math.random() * 20) + 78; // 78-98
  const detectionConfidence = Math.floor(Math.random() * 25) + 72; // 72-97
  const imageQuality = Math.floor(Math.random() * 30) + 65; // 65-95

  // Pick 1-3 random violations
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...ALL_VIOLATIONS].sort(() => Math.random() - 0.5);
  const detectedViolations = shuffled.slice(0, count);

  const plate = statePlates[Math.floor(Math.random() * statePlates.length)];
  const camera = cameras[Math.floor(Math.random() * cameras.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];

  return {
    plate,
    camera,
    location,
    violations: detectedViolations,
    ocrConfidence,
    detectionConfidence,
    imageQuality,
  };
}

/**
 * Violation Chain Engine
 * Calculates compound risk score and assigns severity level
 */
function computeViolationChain(violations = []) {
  const totalScore = violations.reduce((sum, v) => {
    const entry = VIOLATION_CATALOG[v];
    return sum + (entry ? entry.weight : 1);
  }, 0);

  const level = CHAIN_LEVELS.find((l) => totalScore >= l.minScore)?.label || 'Low';

  return {
    violations,
    score: totalScore,
    level,
    breakdown: violations.map((v) => ({
      violation: v,
      weight: VIOLATION_CATALOG[v]?.weight || 1,
      category: VIOLATION_CATALOG[v]?.category || 'Other',
    })),
  };
}

/**
 * Evidence Reliability Score
 * Formula: (OCR × 0.4) + (Detection × 0.4) + (Quality × 0.2)
 */
function computeEvidenceScore(ocrConfidence, detectionConfidence, imageQuality) {
  const score = ocrConfidence * 0.4 + detectionConfidence * 0.4 + imageQuality * 0.2;
  return Math.round(score);
}

/**
 * Main analysis function — called by the analyze controller
 */
function analyzeImage(fileName = '') {
  const raw = simulateDetection(fileName);
  const violationChain = computeViolationChain(raw.violations);
  const evidenceScore = computeEvidenceScore(
    raw.ocrConfidence,
    raw.detectionConfidence,
    raw.imageQuality
  );

  return {
    plate: raw.plate,
    camera: raw.camera,
    location: raw.location,
    violations: raw.violations,
    confidence: raw.detectionConfidence,
    ocrConfidence: raw.ocrConfidence,
    imageQuality: raw.imageQuality,
    evidenceScore,
    violationChain,
  };
}

module.exports = {
  analyzeImage,
  computeViolationChain,
  computeEvidenceScore,
  VIOLATION_CATALOG,
};
