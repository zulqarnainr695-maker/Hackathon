const mongoose = require('mongoose');

const AITriageSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  originalComplaint: {
    type: String,
    required: true
  },
  aiTitle: {
    type: String,
    required: true
  },
  aiCategory: {
    type: String,
    required: true
  },
  aiPriority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    required: true
  },
  possibleCauses: [
    {
      type: String
    }
  ],
  diagnosticChecks: [
    {
      type: String
    }
  ],
  editedByUser: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AITriage', AITriageSchema);
