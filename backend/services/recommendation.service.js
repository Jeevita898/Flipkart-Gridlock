/**
 * Enforcement Recommendation Engine
 * Analyzes violation history per location to recommend officer deployment
 */

const Violation = require('../models/Violation');

/**
 * Peak hours analysis — finds busiest violation hours per location
 */
async function getEnforcementRecommendations() {
  const pipeline = [
    {
      $group: {
        _id: {
          location: '$location',
          hour: { $hour: '$createdAt' },
        },
        count: { $sum: 1 },
        violations: { $push: '$violations' },
      },
    },
    {
      $group: {
        _id: '$_id.location',
        hourlyData: {
          $push: {
            hour: '$_id.hour',
            count: '$count',
          },
        },
        totalViolations: { $sum: '$count' },
      },
    },
    { $sort: { totalViolations: -1 } },
    { $limit: 10 },
  ];

  const results = await Violation.aggregate(pipeline);

  return results.map((loc) => {
    const sorted = [...loc.hourlyData].sort((a, b) => b.count - a.count);
    const peakHour = sorted[0] || { hour: 8, count: 0 };
    const peakEnd = (peakHour.hour + 2) % 24;

    return {
      location: loc._id,
      totalViolations: loc.totalViolations,
      peakHour: peakHour.hour,
      recommendation: `Deploy 2 officers between ${peakHour.hour}:00–${peakEnd}:00`,
      urgency: loc.totalViolations > 50 ? 'High' : loc.totalViolations > 20 ? 'Medium' : 'Low',
      hourlyBreakdown: sorted.slice(0, 6),
    };
  });
}

/**
 * Top violation types per location
 */
async function getLocationHotspots() {
  const pipeline = [
    { $unwind: '$violations' },
    {
      $group: {
        _id: { location: '$location', violation: '$violations' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.location',
        topViolations: {
          $push: { violation: '$_id.violation', count: '$count' },
        },
        total: { $sum: '$count' },
      },
    },
    { $sort: { total: -1 } },
  ];

  return Violation.aggregate(pipeline);
}

module.exports = { getEnforcementRecommendations, getLocationHotspots };
