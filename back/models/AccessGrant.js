const mongoose = require('mongoose');

const accessGrantSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active'
  },
  grantedAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique active grant per patient-doctor pair
accessGrantSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

module.exports = mongoose.model('AccessGrant', accessGrantSchema);
