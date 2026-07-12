const mongoose = require('mongoose');

const MaintenanceHistorySchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    default: null
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'Asset Created',
      'Issue Reported',
      'Assigned',
      'Inspection Started',
      'Maintenance Started',
      'Maintenance Completed',
      'Status Changed',
      'Technician Changed',
      'Asset Updated'
    ]
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Enforce Read-Only history restriction at the schema level
MaintenanceHistorySchema.pre('validate', function (next) {
  if (!this.isNew) {
    return next(new Error('Maintenance History is read-only and cannot be modified.'));
  }
  next();
});

const blockAction = function (next) {
  next(new Error('Maintenance History is read-only and cannot be updated or deleted.'));
};

MaintenanceHistorySchema.pre('updateOne', blockAction);
MaintenanceHistorySchema.pre('findOneAndUpdate', blockAction);
MaintenanceHistorySchema.pre('updateMany', blockAction);
MaintenanceHistorySchema.pre('deleteOne', blockAction);
MaintenanceHistorySchema.pre('deleteMany', blockAction);
MaintenanceHistorySchema.pre('findOneAndDelete', blockAction);

module.exports = mongoose.model('MaintenanceHistory', MaintenanceHistorySchema);
