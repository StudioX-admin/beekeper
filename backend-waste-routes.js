const express = require('express');
const WasteRequest = require('../models/WasteRequest');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const auth = require('../middlewares/auth');

const router = express.Router();

// 새 폐기물 수거 요청 생성
router.post('/', auth, async (req, res) => {
  try {
    const { address, wasteType, quantity, photos, note, location } = req.body;
    
    const newRequest = new WasteRequest({
      address,
      wasteType,
      quantity,
      photos,
      note,
      createdBy: req.user.id,
      location
    });
    
    await newRequest.save();
    
    res.status(201).json({
      message: '폐기물 수거 요청이 성공적으로 생성되었습니다.',
      request: newRequest
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 폐기물 수거 요청 목록 조회
router.get('/', auth, async (req, res) => {
  try {
    const { status, assignedTo, createdBy, limit = 10, page = 1 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (createdBy) filter.createdBy = createdBy;
    
    // 권한에 따른 필터링
    if (req.user.role === 'driver') {
      // 기사는 자신에게 배정된 요청만 볼 수 있음
      filter.assignedTo = req.user.id;
    } else if (req.user.role === 'staff') {
      // 일반 직원은 자신이 생성한 요청만 볼 수 있음
      filter.createdBy = req.user.id;
    }
    // 관리자는 모든 요청을 볼 수 있음
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const requests = await WasteRequest.find(filter)
      .populate('assignedTo', 'name username')
      .populate('createdBy', 'name username')
      .sort({ requestDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await WasteRequest.countDocuments(filter);
    
    res.json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 특정 폐기물 수거 요청 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id)
      .populate('assignedTo', 'name username phone')
      .populate('createdBy', 'name username');
    
    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    }
    
    // 권한 확인
    if (req.user.role === 'driver' && request.assignedTo?._id.toString() !== req.user.id) {
      return res.status(403).json({ message: '이 요청에 접근할 권한이 없습니다.' });
    }
    
    if (req.user.role === 'staff' && request.createdBy?._id.toString() !== req.user.id) {
      return res.status(403).json({ message: '이 요청에 접근할 권한이 없습니다.' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 폐기물 수거 요청 업데이트
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, assignedTo, photos, note, completedAt } = req.body;
    
    const request = await WasteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    }
    
    // 권한 확인
    if (req.user.role === 'driver') {
      // 기사는 자신에게 배정된 요청만 업데이트할 수 있음
      if (request.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ message: '이 요청을 업데이트할 권한이 없습니다.' });
      }
      
      // 기사는 상태, 사진, 메모만 업데이트할 수 있음
      if (status) request.status = status;
      if (photos) request.photos = photos;
      if (note) request.note = note;
      
      if (status === 'completed') {
        request.completedAt = new Date();
        
        // 차량 상태 업데이트
        if (request.assignedTo) {
          const assignedVehicle = await Vehicle.findOne({ assignedTo: request.assignedTo });
          if (assignedVehicle) {
            assignedVehicle.status = 'available';
            await assignedVehicle.save();
          }
        }
      }
    } else if (req.user.role === 'admin') {
      // 관리자는 모든 필드를 업데이트할 수 있음
      if (status) request.status = status;
      if (assignedTo) {
        // 기사 배정 시 상태 업데이트
        if (request.status === 'pending') {
          request.status = 'assigned';
        }
        request.assignedTo = assignedTo;
        request.assignedAt = new Date();
        
        // 차량 상태 업데이트
        const assignedVehicle = await Vehicle.findOne({ assignedTo });
        if (assignedVehicle) {
          assignedVehicle.status = 'in-use';
          await assignedVehicle.save();
        }
      }
      if (photos) request.photos = photos;
      if (note) request.note = note;
      if (completedAt) request.completedAt = completedAt;
    } else {
      return res.status(403).json({ message: '이 요청을 업데이트할 권한이 없습니다.' });
    }
    
    await request.save();
    
    // 업데이트된 요청 반환
    const updatedRequest = await WasteRequest.findById(req.params.id)
      .populate('assignedTo', 'name username phone')
      .populate('createdBy', 'name username');
    
    res.json({
      message: '폐기물 수거 요청이 성공적으로 업데이트되었습니다.',
      request: updatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 폐기물 수거 요청 취소
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    }
    
    // 권한 확인
    if (req.user.role !== 'admin' && 
       (req.user.role === 'staff' && request.createdBy?.toString() !== req.user.id)) {
      return res.status(403).json({ message: '이 요청을 취소할 권한이 없습니다.' });
    }
    
    // 요청 상태가 이미 진행 중이거나 완료된 경우 취소 불가
    if (request.status === 'in-progress' || request.status === 'completed') {
      return res.status(400).json({ message: '이미 진행 중이거나 완료된 요청은 취소할 수 없습니다.' });
    }
    
    // 요청 상태를 취소로 변경
    request.status = 'cancelled';
    await request.save();
    
    res.json({
      message: '폐기물 수거 요청이 성공적으로 취소되었습니다.',
      request
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

module.exports = router;
