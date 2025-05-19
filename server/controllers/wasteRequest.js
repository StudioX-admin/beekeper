const WasteRequest = require('../models/WasteRequest');
const Vehicle = require('../models/Vehicle');

// 모든 요청 조회
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await WasteRequest.find()
      .populate('user', 'name email')
      .populate('vehicle', 'plateNumber model')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: '요청 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 단일 요청 조회
exports.getRequest = async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id)
      .populate('user', 'name email')
      .populate('vehicle', 'plateNumber model');

    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ message: '요청 조회 중 오류가 발생했습니다.' });
  }
};

// 요청 생성
exports.createRequest = async (req, res) => {
  try {
    const { type, address, description, scheduledDate } = req.body;
    const image = req.file ? req.file.path : null;

    const request = new WasteRequest({
      user: req.user._id,
      type,
      address,
      description,
      scheduledDate,
      image,
      status: 'pending'
    });

    await request.save();

    res.status(201).json(request);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: '요청 생성 중 오류가 발생했습니다.' });
  }
};

// 요청 수정
exports.updateRequest = async (req, res) => {
  try {
    const { type, address, description, scheduledDate } = req.body;
    const image = req.file ? req.file.path : undefined;

    const request = await WasteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (request.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '이 요청을 수정할 권한이 없습니다.' });
    }

    const updateData = {
      type,
      address,
      description,
      scheduledDate,
      ...(image && { image })
    };

    const updatedRequest = await WasteRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email')
     .populate('vehicle', 'plateNumber model');

    res.json(updatedRequest);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: '요청 수정 중 오류가 발생했습니다.' });
  }
};

// 요청 삭제
exports.deleteRequest = async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (request.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '이 요청을 삭제할 권한이 없습니다.' });
    }

    await request.remove();
    res.json({ message: '요청이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: '요청 삭제 중 오류가 발생했습니다.' });
  }
};

// 기사 전용: 요청 목록 조회
exports.getDriverRequests = async (req, res) => {
  try {
    const requests = await WasteRequest.find({ vehicle: req.user.vehicle })
      .populate('user', 'name email')
      .sort({ scheduledDate: 1 });

    res.json(requests);
  } catch (error) {
    console.error('Get driver requests error:', error);
    res.status(500).json({ message: '요청 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 기사 전용: 요청 상태 업데이트
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await WasteRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    }

    if (request.vehicle.toString() !== req.user.vehicle.toString()) {
      return res.status(403).json({ message: '이 요청을 처리할 권한이 없습니다.' });
    }

    request.status = status;
    if (status === 'completed') {
      request.completedAt = new Date();
    }

    await request.save();
    res.json(request);
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: '요청 상태 업데이트 중 오류가 발생했습니다.' });
  }
};

// 관리자 전용: 대시보드 통계
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await WasteRequest.countDocuments();
    const pendingRequests = await WasteRequest.countDocuments({ status: 'pending' });
    const inProgressRequests = await WasteRequest.countDocuments({ status: 'in_progress' });
    const completedRequests = await WasteRequest.countDocuments({ status: 'completed' });

    const requestsByType = await WasteRequest.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      totalRequests,
      pendingRequests,
      inProgressRequests,
      completedRequests,
      requestsByType
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: '대시보드 통계 조회 중 오류가 발생했습니다.' });
  }
};

// 관리자 전용: 요청 할당
exports.assignRequest = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const request = await WasteRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }

    request.vehicle = vehicleId;
    request.status = 'assigned';
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Assign request error:', error);
    res.status(500).json({ message: '요청 할당 중 오류가 발생했습니다.' });
  }
}; 