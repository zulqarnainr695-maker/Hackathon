const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  assetCode: {
    type: String,
    required: [true, 'Please add a unique asset code'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add an asset name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  status: {
    type: String,
    enum: [
      'Operational',
      'Issue Reported',
      'Under Inspection',
      'Under Maintenance',
      'Out of Service',
      'Retired'
    ],
    default: 'Operational'
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastServiceDate: {
    type: Date,
    default: null
  },
  nextServiceDate: {
    type: Date,
    default: null
  },
  qrCode: {
    type: String,
    default: ''
  },
  publicUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', AssetSchema);
