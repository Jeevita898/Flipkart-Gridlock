const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema(
  {
    plate: { type: String, required: true, uppercase: true, trim: true },
    camera: { type: String, required: true },
    location: { type: String, required: true },
    violations: [{ type: String }],
    confidence: { type: Number, min: 0, max: 100 },
    imageUrl: { type: String, default: null },
    evidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    violationChain: {
      level: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'], default: 'Low' },
      score: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: { type: String, default: null },
    reviewNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Violation', violationSchema);
