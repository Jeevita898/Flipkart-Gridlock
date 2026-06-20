/**
 * Progressive Fine Engine
 * 1st offence → ₹500
 * 2nd offence → ₹1000
 * 3rd+ offence → ₹2000
 * Additional per-violation base fines added on top
 */

const { VIOLATION_CATALOG } = require('./aiEngine.service');

const FINE_TIERS = [
  { minCount: 3, baseFine: 2000, label: 'Habitual Offender' },
  { minCount: 2, baseFine: 1000, label: 'Repeat Offender' },
  { minCount: 1, baseFine: 500, label: 'First Offence' },
];

/**
 * Calculate fine based on offence count and detected violations
 */
function calculateFine(offenceCount, violations = []) {
  const tier = FINE_TIERS.find((t) => offenceCount >= t.minCount) || FINE_TIERS[2];

  // Add per-violation fines
  const violationFines = violations.reduce((sum, v) => {
    return sum + (VIOLATION_CATALOG[v]?.fine || 300);
  }, 0);

  // Cap at reasonable maximum
  const total = Math.min(tier.baseFine + violationFines, 10000);

  return {
    offenceCount,
    tier: tier.label,
    baseFine: tier.baseFine,
    violationFines,
    total,
    breakdown: violations.map((v) => ({
      violation: v,
      fine: VIOLATION_CATALOG[v]?.fine || 300,
    })),
  };
}

module.exports = { calculateFine };
