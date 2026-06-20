const Challan = require('../models/Challan');
const Violation = require('../models/Violation');
const Offender = require('../models/Offender');
const { calculateFine } = require('../services/fineEngine.service');
const { generateChallanPDF } = require('../services/challan.service');
const path = require('path');

/**
 * POST /api/challan
 * Issue a challan for an approved violation
 */
exports.issueChallan = async (req, res) => {
  try {
    const { violationId, issuedBy = 'System' } = req.body;

    const violation = await Violation.findById(violationId);
    if (!violation) return res.status(404).json({ success: false, error: 'Violation not found' });

    const offender = await Offender.findOne({ plate: violation.plate });
    const offenceCount = offender?.offenceCount || 1;
    const fineResult = calculateFine(offenceCount, violation.violations);

    const challan = new Challan({
      violationId: violation._id,
      plate: violation.plate,
      location: violation.location,
      violations: violation.violations,
      offenceCount,
      fine: fineResult.total,
      evidenceScore: violation.evidenceScore,
      issuedBy,
    });

    await challan.save();
    if (offender) {
      offender.totalFines = (offender.totalFines || 0) + fineResult.total;
      await offender.save();
    }

    res.json({ success: true, challan, fineBreakdown: fineResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/challan
 * List all challans
 */
exports.listChallans = async (req, res) => {
  try {
    const { status, plate, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (plate) query.plate = plate.toUpperCase();

    const challans = await Challan.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Challan.countDocuments(query);
    res.json({ success: true, challans, total });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/challan/:id/pdf
 * Generate and download challan PDF
 */
exports.downloadPDF = async (req, res) => {
  try {
    const challan = await Challan.findOne({ challanId: req.params.id });
    if (!challan) return res.status(404).json({ success: false, error: 'Challan not found' });

    const violation = await Violation.findById(challan.violationId);
    const offender = await Offender.findOne({ plate: challan.plate });
    const fineResult = calculateFine(challan.offenceCount, challan.violations);

    const pdfPath = await generateChallanPDF({
      ...challan.toObject(),
      camera: violation?.camera,
      violationChain: violation?.violationChain || { level: 'Low', score: 0 },
      violationBreakdown: fineResult.breakdown,
    });

    res.download(pdfPath, `${challan.challanId}.pdf`);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/challan/:id/dispute
 * Citizen disputes a challan
 */
exports.disputeChallan = async (req, res) => {
  try {
    const { disputeReason } = req.body;
    const challan = await Challan.findOneAndUpdate(
      { challanId: req.params.id },
      { status: 'Disputed', disputeReason },
      { new: true }
    );
    if (!challan) return res.status(404).json({ success: false, error: 'Challan not found' });
    res.json({ success: true, challan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/challan/:id
 * Get single challan with full evidence trail
 */
exports.getChallan = async (req, res) => {
  try {
    const challan = await Challan.findOne({ challanId: req.params.id });
    if (!challan) return res.status(404).json({ success: false, error: 'Challan not found' });

    const violation = await Violation.findById(challan.violationId);
    const offender = await Offender.findOne({ plate: challan.plate });

    res.json({
      success: true,
      challan,
      violation,
      offender: offender ? { offenceCount: offender.offenceCount, isRepeatOffender: offender.isRepeatOffender } : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
