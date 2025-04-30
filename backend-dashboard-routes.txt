const express = require('express');
const WasteRequest = require('../models/WasteRequest');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const auth = require('../middlewares/auth');

const router = express.Router();

// 대시보드 데이터 조회 (관리자용)
router.get('/', auth, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    // 요청 상태별 통계
    const pendingRequests = await WasteRequest.countDocuments({ status: 'pending' });
    const assignedRequests = await WasteRequest.countDocuments({ status: 'assigned' });
    const inProgressRequests = await WasteRequest.countDocuments({ status: 'in-progress' });
    const completedRequests = await WasteRequest.countDocuments({ status: 'completed' });
    const cancelledRequests = await WasteRequest.countDocuments({ status: 'cancelled' });
    
    // 차량 상태별 통계
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const inUseVehicles = await Vehicle.countDocuments({ status: 'in-use' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });
    const outOfServiceVehicles = await Vehicle.countDocuments({ status: 'out-of-service' });
    
    // 사용자 역할별 통계
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const driverUsers = await User.countDocuments({ role: 'driver' });
    const staffUsers = await User.countDocuments({ role: 'staff' });
    
    // 일별 완료된 요청 수 (최근 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyCompletedRequests = await WasteRequest.aggregate([
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
    
    // 폐기물 유형별 통계
    const wasteTypeStats = await WasteRequest.aggregate([
      {
        $group: {
          _id: '$wasteType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);
    
    // 최근 요청 목록
    const recentRequests = await WasteRequest.find()
      .populate('assignedTo', 'name')
      .sort({ requestDate: -1 })
      .limit(5);
    
    // 응답 데이터 구성
    res.json({
      requestStats: {
        pending: pendingRequests,
        assigned: assignedRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        cancelled: cancelledRequests,
        total: pendingRequests + assignedRequests + inProgressRequests + completedRequests + cancelledRequests
      },
      vehicleStats: {
        available: availableVehicles,
        inUse: inUseVehicles,
        maintenance: maintenanceVehicles,
        outOfService: outOfServiceVehicles,
        total: availableVehicles + inUseVehicles + maintenanceVehicles + outOfServiceVehicles
      },
      userStats: {
        admin: adminUsers,
        driver: driverUsers,
        staff: staffUsers,
        total: adminUsers + driverUsers + staffUsers
      },
      dailyCompletedRequests,
      wasteTypeStats,
      recentRequests
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 기사용 대시보드 데이터
router.get('/driver', auth, async (req, res) => {
  try {
    // 기사 권한 확인
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    // 기사에게 배정된 요청 통계
    const assignedRequests = await WasteRequest.countDocuments({ 
      assignedTo: req.user.id,
      status: 'assigned'
    });
    
    const inProgressRequests = await WasteRequest.countDocuments({ 
      assignedTo: req.user.id,
      status: 'in-progress'
    });
    
    // 오늘 완료한 요청 수
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = await WasteRequest.countDocuments({
      assignedTo: req.user.id,
      status: 'completed',
      completedAt: { $gte: today }
    });
    
    // 할당된 차량 정보
    const assignedVehicle = await Vehicle.findOne({ assignedTo: req.user.id });
    
    // 진행 중인 요청 목록
    const activeRequests = await WasteRequest.find({
      assignedTo: req.user.id,
      status: { $in: ['assigned', 'in-progress'] }
    }).sort({ requestDate: 1 });
    
    // 완료한 요청 목록 (최근 5개)
    const completedRequests = await WasteRequest.find({
      assignedTo: req.user.id,
      status: 'completed'
    }).sort({ completedAt: -1 }).limit(5);
    
    // 일별 완료한 요청 수 (최근 7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await WasteRequest.aggregate([
      {
        $match: {
          assignedTo: mongoose.Types.ObjectId(req.user.id),
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
      stats: {
        assigned: assignedRequests,
        inProgress: inProgressRequests,
        completedToday
      },
      vehicle: assignedVehicle,
      activeRequests,
      completedRequests,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

module.exports = router;