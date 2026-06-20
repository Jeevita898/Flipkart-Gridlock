const Violation = require('../models/Violation');
const Offender = require('../models/Offender');
const Challan = require('../models/Challan');
const { getEnforcementRecommendations, getLocationHotspots } = require('../services/recommendation.service');

/**
 * GET /api/analytics
 * Full analytics dashboard data
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalViolations, totalChallans, repeatOffenders, pendingReview] = await Promise.all([
      Violation.countDocuments(),
      Challan.countDocuments(),
      Offender.countDocuments({ isRepeatOffender: true }),
      Violation.countDocuments({ status: 'Pending' }),
    ]);

    // Violations by type
    const byType = await Violation.aggregate([
      { $unwind: '$violations' },
      { $group: { _id: '$violations', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Violations by location
    const byLocation = await Violation.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Violations over last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const byDay = await Violation.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Violations by hour (today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const byHour = await Violation.aggregate([
      { $match: { createdAt: { $gte: todayStart } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Chain level distribution
    const byChainLevel = await Violation.aggregate([
      { $group: { _id: '$violationChain.level', count: { $sum: 1 } } },
    ]);

    // Recent violations
    const recent = await Violation.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      stats: { totalViolations, totalChallans, repeatOffenders, pendingReview },
      byType,
      byLocation,
      byDay,
      byHour,
      byChainLevel,
      recent,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/analytics/recommendations
 */
exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await getEnforcementRecommendations();
    const hotspots = await getLocationHotspots();
    res.json({ success: true, recommendations, hotspots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
