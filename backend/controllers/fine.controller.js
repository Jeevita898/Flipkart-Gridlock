const Offender = require('../models/Offender');
const { calculateFine } = require('../services/fineEngine.service');

/**
 * POST /api/fine
 * Calculate fine for a given plate and violations
 */
exports.calculateFine = async (req, res) => {
  try {
    const { plate, violations = [] } = req.body;

    if (!plate) return res.status(400).json({ success: false, error: 'Plate number required' });

    const offender = await Offender.findOne({ plate: plate.toUpperCase() });
    const offenceCount = offender?.offenceCount || 1;

    const result = calculateFine(offenceCount, violations);

    res.json({ success: true, plate: plate.toUpperCase(), ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
