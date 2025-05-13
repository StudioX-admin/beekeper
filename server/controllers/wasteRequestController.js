// server/controllers/wasteRequestController.js
const WasteRequest = require('../models/WasteRequest');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');
const { uploadToStorage } = require('../utils/fileUpload');

// 모든 폐기물 요청 조회
exports.getAllWasteRequests = async (req, res) => {
  try {
    const { status, date, driver, search, page = 1, limit = 10 } = req.query;
    const query = {};
    
    // 필터링 옵션 적용
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.scheduledDate = { $gte: startDate, $lte: endDate };
    }
    
    if (driver) {
      query.driverId = mongoose.Types.ObjectId(driver);
    }
    
    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { requesterName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 페이지네이션 및 데이터 조회
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const wasteRequests = await WasteRequest.find(query)
      .populate('driverId', 'name')
      .populate('vehicleId', 'plateNumber type')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await WasteRequest.countDocuments(query);
    
    res.json({
      wasteRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all waste requests error:', error);
    res.status(500).json({ message: '폐기물 요청 조회 중 오류가 발생했습니다.' });
  }
};

// 특정 폐기물 요청 조회
exports.getWasteRequestById = async (req, res) => {
  try {
    const wasteRequest = await WasteRequest.findById(req.params.id)
      .populate('driverId', 'name phone')
      .populate('vehicleId', 'plateNumber type');
    
    if (!wasteRequest) {
      return res.status(404).json({ message: '해당 폐기물 요청을 찾을 수 없습니다.' });
    }
    
    res.json(wasteRequest);
  } catch (error) {
    console.error('Get waste request by ID error:', error);
    res.status(500).json({ message: '폐기물 요청 조회 중 오류가 발생했습니다.' });
  }
};

// 폐기물 요청 생성
exports.createWasteRequest = async (req, res) => {
  try {
    const {
      requesterName,
      requesterType,
      requesterPhone,
      wasteType,
      estimatedWeight,
      address,
      latitude,
      longitude,
      scheduledDate,
      scheduledTime,
      driverId,
      vehicleId,
      notes
    } = req.body;
    
    // 요청 ID 생성 (예: WR-날짜-일련번호)
    const date = new Date();
    const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
    const count = await WasteRequest.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lte: new Date(date.setHours(23, 59, 59, 999))
      }
    });
    const requestId = `WR-${dateString}-${(count + 1).toString().padStart(3, '0')}`;
    
    // 폐기물 요청 생성
    const wasteRequest = new WasteRequest({
      requestId,
      requesterName,
      requesterType,
      requesterPhone,
      wasteType,
      estimatedWeight,
      address,
      latitude,
      longitude,
      scheduledDate,
      scheduledTime,
      status: driverId ? 'assigned' : 'pending',
      driverId,
      vehicleId,
      notes
    });
    
    await wasteRequest.save();
    
    res.status(201).json(wasteRequest);
  } catch (error) {
    console.error('Create waste request error:', error);
    res.status(500).json({ message: '폐기물 요청 생성 중 오류가 발생했습니다.' });
  }
};

// 폐기물 요청 업데이트
exports.updateWasteRequest = async (req, res) => {
  try {
    const {
      requesterName,
      requesterType,
      requesterPhone,
      wasteType,
      estimatedWeight,
      address,
      latitude,
      longitude,
      scheduledDate,
      scheduledTime,
      status,
      driverId,
      vehicleId,
      notes
    } = req.body;
    
    const wasteRequest = await WasteRequest.findById(req.params.id);
    
    if (!wasteRequest) {
      return res.status(404).json({ message: '해당 폐기물 요청을 찾을 수 없습니다.' });
    }
    
    // 필드 업데이트
    wasteRequest.requesterName = requesterName || wasteRequest.requesterName;
    wasteRequest.requesterType = requesterType || wasteRequest.requesterType;
    wasteRequest.requesterPhone = requesterPhone || wasteRequest.requesterPhone;
    wasteRequest.wasteType = wasteType || wasteRequest.wasteType;
    wasteRequest.estimatedWeight = estimatedWeight || wasteRequest.estimatedWeight;
    wasteRequest.address = address || wasteRequest.address;
    wasteRequest.latitude = latitude || wasteRequest.latitude;
    wasteRequest.longitude = longitude || wasteRequest.longitude;
    wasteRequest.scheduledDate = scheduledDate || wasteRequest.scheduledDate;
    wasteRequest.scheduledTime = scheduledTime || wasteRequest.scheduledTime;
    wasteRequest.notes = notes || wasteRequest.notes;
    
    // 상태 변경 처리
    if (status && status !== wasteRequest.status) {
      wasteRequest.status = status;
      
      if (status === 'completed' && !wasteRequest.completedAt) {
        wasteRequest.completedAt = new Date();
      }
    }
    
    // 기사 배정 처리
    if (driverId && driverId !== wasteRequest.driverId) {
      wasteRequest.driverId = driverId;
      
      if (wasteRequest.status === 'pending') {
        wasteRequest.status = 'assigned';
      }
    }
    
    // 차량 배정 처리
    if (vehicleId) {
      wasteRequest.vehicleId = vehicleId;
    }
    
    await wasteRequest.save();
    
    res.json(wasteRequest);
  } catch (error) {
    console.error('Update waste request error:', error);
    res.status(500).json({ message: '폐기물 요청 업데이트 중 오류가 발생했습니다.' });
  }
};

// 폐기물 요청 삭제
exports.deleteWasteRequest = async (req, res) => {
  try {
    const wasteRequest = await WasteRequest.findById(req.params.id);
    
    if (!wasteRequest) {
      return res.status(404).json({ message: '해당 폐기물 요청을 찾을 수 없습니다.' });
    }
    
    // 이미 진행 중이거나 완료된 요청은 삭제할 수 없음
    if (wasteRequest.status === 'in_progress' || wasteRequest.status === 'completed') {
      return res.status(400).json({ message: '진행 중이거나 완료된 요청은 삭제할 수 없습니다.' });
    }
    
    await wasteRequest.remove();
    
    res.json({ message: '폐기물 요청이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete waste request error:', error);
    res.status(500).json({ message: '폐기물 요청 삭제 중 오류가 발생했습니다.' });
  }
};

// 기사별 작업 목록 조회
exports.getDriverTasks = async (req, res) => {
  try {
    const { date, status } = req.query;
    const driverId = req.user.id;
    
    const query = { driverId };
    
    // 날짜 필터 적용
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.scheduledDate = { $gte: startDate, $lte: endDate };
    }
    
    // 상태 필터 적용
    if (status) {
      query.status = status;
    }
    
    const tasks = await WasteRequest.find(query)
      .sort({ scheduledTime: 1 })
      .populate('vehicleId', 'plateNumber type');
    
    // 응답 형식에 맞게 데이터 변환
    const formattedTasks = tasks.map(task => {
      const statusMap = {
        'pending': '대기중',
        'assigned': '대기중',
        'in_progress': '진행중',
        'completed': '완료',
        'cancelled': '취소됨'
      };
      
      return {
        id: task._id,
        requestId: task.requestId,
        time: task.scheduledTime,
        status: statusMap[task.status],
        address: task.address,
        wasteType: task.wasteType,
        weight: task.estimatedWeight,
        requester: task.requesterName,
        date: task.scheduledDate.toISOString().split('T')[0],
        notes: task.notes,
        photos: task.photos || [],
        vehicle: task.vehicleId ? `${task.vehicleId.plateNumber} (${task.vehicleId.type})` : ''
      };
    });
    
    res.json(formattedTasks);
  } catch (error) {
    console.error('Get driver tasks error:', error);
    res.status(500).json({ message: '작업 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 작업 시작 처리
exports.startTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const driverId = req.user.id;
    
    const task = await WasteRequest.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: '해당 작업을 찾을 수 없습니다.' });
    }
    
    // 기사에게 배정된 작업인지 확인
    if (!task.driverId || task.driverId.toString() !== driverId) {
      return res.status(403).json({ message: '해당 작업에 접근할 수 없습니다.' });
    }
    
    // 작업 상태 확인
    if (task.status !== 'pending' && task.status !== 'assigned') {
      return res.status(400).json({ message: '이미 시작되었거나 완료된 작업입니다.' });
    }
    
    // 작업 상태 업데이트
    task.status = 'in_progress';
    await task.save();
    
    res.json({ message: '작업이 시작되었습니다.', task });
  } catch (error) {
    console.error('Start task error:', error);
    res.status(500).json({ message: '작업 시작 중 오류가 발생했습니다.' });
  }
};

// 작업 완료 처리
exports.completeTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const driverId = req.user.id;
    
    const task = await WasteRequest.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: '해당 작업을 찾을 수 없습니다.' });
    }
    
    // 기사에게 배정된 작업인지 확인
    if (!task.driverId || task.driverId.toString() !== driverId) {
      return res.status(403).json({ message: '해당 작업에 접근할 수 없습니다.' });
    }
    
    // 작업 상태 확인
    if (task.status !== 'in_progress') {
      return res.status(400).json({ message: '진행 중인 작업만 완료할 수 있습니다.' });
    }
    
    // 증빙 사진 확인
    if (!task.photos || task.photos.length === 0) {
      return res.status(400).json({ message: '최소 1장 이상의 증빙 사진이 필요합니다.' });
    }
    
    // 작업 상태 업데이트
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();
    
    res.json({ message: '작업이 완료되었습니다.', task });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: '작업 완료 중 오류가 발생했습니다.' });
  }
};

// 작업 사진 업로드
exports.uploadTaskPhotos = async (req, res) => {
  try {
    const taskId = req.params.id;
    const driverId = req.user.id;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '업로드할 파일이 없습니다.' });
    }
    
    const task = await WasteRequest.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: '해당 작업을 찾을 수 없습니다.' });
    }
    
    // 기사에게 배정된 작업인지 확인
    if (!task.driverId || task.driverId.toString() !== driverId) {
      return res.status(403).json({ message: '해당 작업에 접근할 수 없습니다.' });
    }
    
    // 작업 상태 확인
    if (task.status !== 'in_progress') {
      return res.status(400).json({ message: '진행 중인 작업만 사진을 업로드할 수 있습니다.' });
    }
    
    // 사진 업로드 처리
    const photoUrls = [];
    
    for (const file of req.files) {
      const photoUrl = await uploadToStorage(file, 'task-photos');
      photoUrls.push(photoUrl);
    }
    
    // 기존 사진 배열이 없으면 초기화
    if (!task.photos) {
      task.photos = [];
    }
    
    // 사진 URL 추가
    task.photos = [...task.photos, ...photoUrls];
    await task.save();
    
    res.json({ message: '사진이 업로드되었습니다.', photos: task.photos });
  } catch (error) {
    console.error('Upload task photos error:', error);
    res.status(500).json({ message: '사진 업로드 중 오류가 발생했습니다.' });
  }
};
