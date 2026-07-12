const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  issueNumber: {
    type: String,
    unique: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: [true, 'Please associate an asset with the issue']
  },
  reporterName: {
    type: String,
    required: [true, 'Reporter name is required']
  },
  reporterEmail: {
    type: String,
    required: [true, 'Reporter email is required'],
    trim: true,
    lowercase: true
  },
  reporterPhone: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Issue description is required']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Emergency'],
    default: 'Low'
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  status: {
    type: String,
    enum: [
      'Reported',
      'Assigned',
      'Inspection Started',
      'Maintenance In Progress',
      'Waiting for Parts',
      'Resolved',
      'Closed',
      'Reopened'
    ],
    default: 'Reported'
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  attachments: [
    {
      type: String
    }
  ],
  maintenanceCost: {
    type: Number,
    default: 0,
    min: [0, 'Maintenance cost cannot be negative']
  },
  inspectionNotes: {
    type: String,
    default: ''
  },
  maintenanceNotes: {
    type: String,
    default: ''
  },
  partsUsed: [
    {
      type: String
    }
  ],
  resolvedDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Auto-generate Issue Number sequential prefix
IssueSchema.pre('save', async function (next) {
  if (!this.issueNumber) {
    try {
      const count = await mongoose.model('Issue').countDocuments();
      this.issueNumber = `ISSUE-${1000 + count + 1}`;
    } catch (err) {
      return next(err);
    }
  }

  // Business Rule: Resolved issue must contain maintenance notes
  if (this.status === 'Resolved' && (!this.maintenanceNotes || this.maintenanceNotes.trim() === '')) {
    return next(new Error('A resolved issue must contain maintenance notes explaining what was fixed.'));
  }

  next();
});

module.exports = mongoose.model('Issue', IssueSchema);
