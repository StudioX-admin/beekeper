// server.js - Express 서버 설정
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

// 사용자 모델
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'driver', 'staff'], default: 'staff' },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 폐기물 수거 요청 모델
const wasteRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  wasteType: { type: String, required: true },
  quantity: { type: Number, required: true },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'assigned', 'in-progress', 'completed'], default: 'pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date },
  photos: [{ type: String }]
});

// 차량 모델
const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'in-use', 'maintenance'], default: 'available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastMaintenance: { type: Date }
});

const User = mongoose.model('User', userSchema);
const WasteRequest = mongoose.model('WasteRequest', wasteRequestSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: '인증 토큰이 필요합니다' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: '유효하지 않은 토큰입니다' });
    req.user = user;
    next();
  });
};

// 라우트 - 인증
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, role, phone } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 사용자입니다' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      role,
      phone
    });
    
    await newUser.save();
    
    res.status(201).json({ message: '사용자 등록 성공' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '사용자가 존재하지 않습니다' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다' });
    }
    
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 라우트 - 폐기물 수거 요청
app.post('/api/waste-requests', authenticateToken, async (req, res) => {
  try {
    const { address, wasteType, quantity, photos } = req.body;
    
    const requestId = 'REQ' + Date.now().toString().slice(-8);
    
    const newRequest = new WasteRequest({
      requestId,
      address,
      wasteType,
      quantity,
      photos,
      status: 'pending'
    });
    
    await newRequest.save();
    
    res.status(201).json({ message: '수거 요청 등록 성공', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

app.get('/api/waste-requests', authenticateToken, async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    // 관리자는 모든 요청을 볼 수 있고, 드라이버는 자신에게 할당된 요청만 볼 수 있음
    if (req.user.role === 'driver') {
      filter.assignedTo = req.user.userId;
    }
    
    const requests = await WasteRequest.find(filter).sort({ requestDate: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

app.put('/api/waste-requests/:id', authenticateToken, async (req, res) => {
  try {
    const { status, assignedTo, completedAt, photos } = req.body;
    
    const request = await WasteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다' });
    }
    
    if (status) request.status = status;
    if (assignedTo) request.assignedTo = assignedTo;
    if (completedAt) request.completedAt = completedAt;
    if (photos) request.photos = photos;
    
    await request.save();
    
    res.json({ message: '요청 업데이트 성공', request });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 라우트 - 차량
app.post('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다' });
    }
    
    const { vehicleId, type, capacity } = req.body;
    
    const newVehicle = new Vehicle({
      vehicleId,
      type,
      capacity,
      status: 'available'
    });
    
    await newVehicle.save();
    
    res.status(201).json({ message: '차량 등록 성공', vehicle: newVehicle });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

app.get('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    const vehicles = await Vehicle.find(filter);
    
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

app.put('/api/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'driver') {
      return res.status(403).json({ message: '권한이 없습니다' });
    }
    
    const { status, assignedTo, lastMaintenance } = req.body;
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다' });
    }
    
    if (status) vehicle.status = status;
    if (assignedTo) vehicle.assignedTo = assignedTo;
    if (lastMaintenance) vehicle.lastMaintenance = lastMaintenance;
    
    await vehicle.save();
    
    res.json({ message: '차량 업데이트 성공', vehicle });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 라우트 - 대시보드 데이터
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다' });
    }
    
    const pendingRequests = await WasteRequest.countDocuments({ status: 'pending' });
    const inProgressRequests = await WasteRequest.countDocuments({ status: 'in-progress' });
    const completedRequests = await WasteRequest.countDocuments({ status: 'completed' });
    
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const inUseVehicles = await Vehicle.countDocuments({ status: 'in-use' });
    
    // 일별 완료된 요청 수 (최근 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await WasteRequest.aggregate([
      { 
        $match: { 
          status: 'completed',
          completedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      requestStats: {
        pending: pendingRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        total: pendingRequests + inProgressRequests + completedRequests
      },
      vehicleStats: {
        available: availableVehicles,
        inUse: inUseVehicles,
        total: availableVehicles + inUseVehicles
      },
      dailyCompletedRequests: dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
});
