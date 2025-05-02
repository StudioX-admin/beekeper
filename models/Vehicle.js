const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'out-of-service'],
    default: 'available'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  lastMaintenance: {
    type: Date
  },
  maintenanceHistory: [
    {
      date: {
        type: Date
      },
      description: {
        type: String
      },
      cost: {
        type: Number
      }
    }
  ],
  registrationNumber: {
    type: String
  },
  manufacturer: {
    type: String
  },
  model: {
    type: String
  },
  year: {
    type: Number
  },
  fuelType: {
    type: String
  },
  nextInspectionDate: {
    type: Date
  },
  notes: {
    type: String
  }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
