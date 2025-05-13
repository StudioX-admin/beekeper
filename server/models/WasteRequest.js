// server/models/WasteRequest.js
const mongoose = require('mongoose');

const WasteRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true
    },
    requesterName: {
      type: String,
      required: true
    },
    requesterType: {
      type: String,
      enum: ['individual', 'company', 'institution'],
      default: 'individual'
    },
    requesterPhone: {
      type: String,
      required: true
    },
    wasteType: {
      type: String,
      required: true
    },
    estimatedWeight: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    scheduledTime: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    notes: {
      type: String
    },
    photos: [{
      type: String
    }],
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WasteRequest', WasteRequestSchema);
