const { analyzeImage } = require('../services/aiEngine.service');
const Violation = require('../models/Violation');
const Offender = require('../models/Offender');

/**
 * POST /api/analyze
 * Accepts image upload, runs AI engine, saves violation to DB
 */
exports.analyzeImage = async (req, res) => {
  try {
    const fileName = req.file?.originalname || 'test.jpg';

    // Run AI engine
    const result = analyzeImage(fileName);

    // Save violation to DB
    const violation = new Violation({
      plate: result.plate,
      camera: result.camera,
      location: result.location,
      violations: result.violations,
      confidence: result.confidence,
      evidenceScore: result.evidenceScore,
      violationChain: {
        level: result.violationChain.level,
        score: result.violationChain.score,
      },
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'Pending',
    });

    await violation.save();

    // Update offender record
    let offender = await Offender.findOne({ plate: result.plate });
    if (!offender) {
      offender = new Offender({ plate: result.plate, offenceCount: 0, violationHistory: [] });
    }
    offender.offenceCount += 1;
    offender.lastViolation = new Date();
    offender.violationHistory.push(violation._id);
    await offender.save();

    res.json({
      success: true,
      violationId: violation._id,
      plate: result.plate,
      camera: result.camera,
      location: result.location,
      violations: result.violations,
      confidence: result.confidence,
      ocrConfidence: result.ocrConfidence,
      imageQuality: result.imageQuality,
      evidenceScore: result.evidenceScore,
      violationChain: result.violationChain,
      offenceCount: offender.offenceCount,
      isRepeatOffender: offender.isRepeatOffender,
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
