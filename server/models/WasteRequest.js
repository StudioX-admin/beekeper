const mongoose = require('mongoose');

const wasteRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  wasteType: {
    type: String,
    required: true,
    enum: ['general', 'construction', 'food', 'recyclable', 'hazardous']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  photos: [
    {
      type: String // Base64 인코딩된 이미지 또는 이미지 URL
    }
  ],
  note: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  // 추가된 필드
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  estimatedTime: {
    type: Number, // 예상 수거 시간 (분)
    default: 60
  },
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  containerInfo: {
    type: String,
    size: String,
    quantity: Number
  }
});

// 요청 ID 자동 생성 미들웨어
wasteRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.requestId) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // 오늘 날짜에 대한 마지막 요청 ID 찾기
    const prefix = `REQ${year}${month}${day}`;
    const lastRequest = await this.constructor.findOne(
      { requestId: { $regex: `^${prefix}` } },
      { requestId: 1 },
      { sort: { requestId: -1 } }
    );
    
    let sequence = 1;
    if (lastRequest) {
      const lastSequence = parseInt(lastRequest.requestId.slice(-3));
      sequence = lastSequence + 1;
    }
    
    this.requestId = `${prefix}${sequence.toString().padStart(3, '0')}`;
  }
  next();
});

const WasteRequest = mongoose.model('WasteRequest', wasteRequestSchema);

module.exports = WasteRequest;
