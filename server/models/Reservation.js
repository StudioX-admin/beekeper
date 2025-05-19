const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  transporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    required: true,
    enum: ['일반폐기물', '사업장폐기물', '건설폐기물', '특정폐기물']
  },
  wasteAmount: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'ton']
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  pickupAddress: {
    type: String,
    required: true
  },
  pickupContact: {
    name: String,
    phone: String
  },
  processingAddress: {
    type: String,
    required: true
  },
  processingContact: {
    name: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  documents: [{
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 인덱스 생성
reservationSchema.index({ transporter: 1, status: 1 });
reservationSchema.index({ processor: 1, status: 1 });
reservationSchema.index({ scheduledDate: 1 });
reservationSchema.index({ wasteType: 1 });

module.exports = mongoose.model('Reservation', reservationSchema); 