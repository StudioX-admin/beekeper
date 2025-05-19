// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'transporter', 'processor', 'platform_admin'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  company: {
    name: {
      type: String,
      required: true
    },
    businessNumber: {
      type: String,
      required: true,
      unique: true
    },
    address: {
      type: String,
      required: true
    },
    representative: {
      type: String,
      required: true
    },
    contactPhone: {
      type: String,
      required: true
    },
    businessType: {
      type: String,
      enum: ['transporter', 'processor'],
      required: true
    },
    licenseNumber: {
      type: String,
      required: true
    },
    licenseExpiryDate: {
      type: Date,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'pending'
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

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 검증 메소드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 비밀번호 필드 제외
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);

