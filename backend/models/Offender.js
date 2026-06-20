const mongoose = require('mongoose');

const offenderSchema = new mongoose.Schema(
  {
    plate: { type: String, required: true, unique: true, uppercase: true, trim: true },
    offenceCount: { type: Number, default: 0 },
    totalFines: { type: Number, default: 0 },
    lastViolation: { type: Date, default: null },
    violationHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Violation' }],
    isRepeatOffender: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-flag repeat offenders (3+ offences)
offenderSchema.pre('save', function () {
  this.isRepeatOffender = this.offenceCount >= 3;
});

module.exports = mongoose.model('Offender', offenderSchema);
