const WasteRequest = require('../models/WasteRequest');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// 대시보드 통계 조회
exports.getDashboardStats = async (req, res) => {
  try {
    // 전체 요청 통계
    const totalRequests = await WasteRequest.countDocuments();
    const pendingRequests = await WasteRequest.countDocuments({ status: 'pending' });
    const inProgressRequests = await WasteRequest.countDocuments({ status: 'in_progress' });
    const completedRequests = await WasteRequest.countDocuments({ status: 'completed' });

    // 차량 통계
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'available' });
    const inUseVehicles = await Vehicle.countDocuments({ status: 'in_use' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });

    // 기사 통계
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const activeDrivers = await User.countDocuments({ role: 'driver', vehicle: { $ne: null } });
    const inactiveDrivers = totalDrivers - activeDrivers;

    // 최근 요청 목록
    const recentRequests = await WasteRequest.find()
      .populate('user', 'name email')
      .populate('vehicle', 'plateNumber model')
      .sort({ createdAt: -1 })
      .limit(5);

    // 요청 유형별 통계
    const requestsByType = await WasteRequest.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // 일별 요청 통계 (최근 7일)
    const dailyStats = await WasteRequest.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        inProgress: inProgressRequests,
        completed: completedRequests,
        byType: requestsByType,
        daily: dailyStats
      },
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        inUse: inUseVehicles,
        maintenance: maintenanceVehicles
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
        inactive: inactiveDrivers
      },
      recentRequests
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: '대시보드 통계 조회 중 오류가 발생했습니다.' });
  }
};

// 요청 관리
exports.getRequests = async (req, res) => {
  try {
    const { status, type, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    // 필터 적용
    if (status) query.status = status;
    if (type) query.type = type;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const requests = await WasteRequest.find(query)
      .populate('user', 'name email')
      .populate('vehicle', 'plateNumber model')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await WasteRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: '요청 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 차량 관리
exports.getVehicles = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const vehicles = await Vehicle.find(query)
      .populate('driver', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(query);

    res.json({
      vehicles,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: '차량 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 기사 관리
exports.getDrivers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { role: 'driver' };

    if (status === 'active') {
      query.vehicle = { $ne: null };
    } else if (status === 'inactive') {
      query.vehicle = null;
    }

    const drivers = await User.find(query)
      .select('-password')
      .populate('vehicle', 'plateNumber model')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      drivers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: '기사 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 보고서 생성
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (type) query.type = type;

    const requests = await WasteRequest.find(query)
      .populate('user', 'name email')
      .populate('vehicle', 'plateNumber model')
      .sort({ createdAt: -1 });

    // 요청 유형별 통계
    const typeStats = await WasteRequest.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // 상태별 통계
    const statusStats = await WasteRequest.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 일별 통계
    const dailyStats = await WasteRequest.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      requests,
      statistics: {
        byType: typeStats,
        byStatus: statusStats,
        byDate: dailyStats
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: '보고서 생성 중 오류가 발생했습니다.' });
  }
}; 