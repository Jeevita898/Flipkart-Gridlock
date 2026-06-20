const Violation = require('../models/Violation');

/**
 * POST /api/review
 * Officer reviews a violation: Approve / Reject / Needs Review
 */
exports.reviewViolation = async (req, res) => {
  try {
    const { violationId, action, reviewedBy, notes } = req.body;

    if (!['Approved', 'Rejected', 'Reviewed'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action. Use Approved, Rejected, or Reviewed.' });
    }

    const violation = await Violation.findByIdAndUpdate(
      violationId,
      { status: action, reviewedBy: reviewedBy || 'Officer', reviewNotes: notes || '' },
      { new: true }
    );

    if (!violation) {
      return res.status(404).json({ success: false, error: 'Violation not found' });
    }

    res.json({ success: true, violation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/review/queue
 * Returns all pending violations for officer review
 */
exports.getReviewQueue = async (req, res) => {
  try {
    const { status = 'Pending', page = 1, limit = 20 } = req.query;
    const violations = await Violation.find({ status })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Violation.countDocuments({ status });

    res.json({ success: true, violations, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
