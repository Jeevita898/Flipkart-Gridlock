const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const challanSchema = new mongoose.Schema(
  {
    challanId: {
      type: String,
      default: () => `CHL-${uuidv4().slice(0, 8).toUpperCase()}`,
      unique: true,
    },
    violationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Violation', required: true },
    plate: { type: String, required: true, uppercase: true },
    location: { type: String },
    violations: [{ type: String }],
    offenceCount: { type: Number, default: 1 },
    fine: { type: Number, required: true },
    evidenceScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Issued', 'Paid', 'Disputed', 'Resolved', 'Cancelled'],
      default: 'Issued',
    },
    issuedBy: { type: String, default: 'System' },
    disputeReason: { type: String, default: null },
    disputeResolution: { type: String, default: null },
    pdfPath: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Challan', challanSchema);
