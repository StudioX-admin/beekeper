// server/models/Vehicle.js
const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      required: true
    },
    capacity: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'maintenance', 'out_of_service'],
      default: 'available'
    },
    currentDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastMaintenance: {
      type: Date
    },
    nextMaintenance: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vehicle', VehicleSchema);
