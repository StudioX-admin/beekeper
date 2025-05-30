// server/routes/vehicles.js
const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { authenticate, authorize } = require('../middlewares/auth');

// 모든 차량 조회
router.get('/', authenticate, async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('currentDriverId', 'name');
    
    res.json(vehicles);
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({ message: '차량 조회 중 오류가 발생했습니다.' });
  }
});

// 차량 상세 조회
router.get('/:id', authenticate, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('currentDriverId', 'name');
    
    if (!vehicle) {
      return res.status(404).json({ message: '해당 차량을 찾을 수 없습니다.' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({ message: '차량 조회 중 오류가 발생했습니다.' });
  }
});

// 차량 생성 (관리자 전용)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { plateNumber, type, capacity, status } = req.body;
    
    // 중복 차량 번호 확인
    const existingVehicle = await Vehicle.findOne({ plateNumber });
    if (existingVehicle) {
      return res.status(400).json({ message: '이미 존재하는 차량 번호입니다.' });
    }
    
    const vehicle = new Vehicle({
      plateNumber,
      type,
      capacity,
      status: status || 'available'
    });
    
    await vehicle.save();
    
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: '차량 생성 중 오류가 발생했습니다.' });
  }
});

// 차량 정보 업데이트
router.put('/:id', auth, async (req, res) => {
  try {
    // 관리자 또는 차량이 할당된 기사만 업데이트 가능
    if (req.user.role !== 'admin' && req.user.role !== 'driver') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }
    
    // 기사는 상태만 변경 가능하고 자신에게 할당된 차량만 수정 가능
    if (req.user.role === 'driver') {
      if (vehicle.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ message: '이 차량을 수정할 권한이 없습니다.' });
      }
      
      // 기사는 상태와 마지막 점검일만 업데이트 가능
      if ('status' in req.body) vehicle.status = req.body.status;
      if ('lastMaintenance' in req.body) vehicle.lastMaintenance = req.body.lastMaintenance;
    } else {
      // 관리자는 모든 필드 업데이트 가능
      const { type, capacity, status, registrationNumber, manufacturer, model, year, fuelType, nextInspectionDate, notes } = req.body;
      
      if (type) vehicle.type = type;
      if (capacity) vehicle.capacity = capacity;
      if (status) vehicle.status = status;
      if (registrationNumber) vehicle.registrationNumber = registrationNumber;
      if (manufacturer) vehicle.manufacturer = manufacturer;
      if (model) vehicle.model = model;
      if (year) vehicle.year = year;
      if (fuelType) vehicle.fuelType = fuelType;
      if (nextInspectionDate) vehicle.nextInspectionDate = nextInspectionDate;
      if (notes) vehicle.notes = notes;
      
      // 기사 할당 처리 (개선됨)
      if ('assignedTo' in req.body) {
        if (req.body.assignedTo) {
          // 기사 할당
          const driver = await User.findById(req.body.assignedTo);
          if (!driver || driver.role !== 'driver') {
            return res.status(400).json({ message: '유효한 기사가 아닙니다.' });
          }
          
          // 이미 다른 차량에 할당된 기사인지 확인
          const assignedVehicle = await Vehicle.findOne({ 
            assignedTo: req.body.assignedTo,
            _id: { $ne: req.params.id }
          });
          
          if (assignedVehicle) {
            return res.status(400).json({ 
              message: '이 기사는 이미 다른 차량에 할당되어 있습니다.',
              vehicleId: assignedVehicle.vehicleId
            });
          }
          
          vehicle.assignedTo = req.body.assignedTo;
          vehicle.assignedAt = new Date();
          vehicle.status = 'in-use';
        } else {
          // 기사 할당 해제
          // 현재 진행 중인 수거 요청이 있는지 확인
          const activeRequests = await WasteRequest.find({
            assignedTo: vehicle.assignedTo,
            status: { $in: ['assigned', 'in-progress'] }
          });
          
          if (activeRequests.length > 0) {
            return res.status(400).json({ 
              message: '이 기사에게 할당된 진행 중인 수거 요청이 있어 차량 할당을 해제할 수 없습니다.',
              activeRequests: activeRequests.length
            });
          }
          
          vehicle.assignedTo = null;
          vehicle.assignedAt = null;
          vehicle.status = 'available';
        }
      }
    }
    
    await vehicle.save();
    
    // 업데이트된 차량 정보 반환
    const updatedVehicle = await Vehicle.findById(req.params.id)
      .populate('assignedTo', 'name username phone');
    
    res.json({ message: '차량 정보가 성공적으로 업데이트되었습니다.', vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 차량 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }
    
    // 현재 사용 중인 차량인지 확인
    if (vehicle.status === 'in-use') {
      return res.status(400).json({ message: '현재 사용 중인 차량은 삭제할 수 없습니다.' });
    }
    
    // 진행 중인 수거 요청과 연관된 차량인지 확인
    if (vehicle.assignedTo) {
      const activeRequests = await WasteRequest.find({
        assignedTo: vehicle.assignedTo,
        status: { $in: ['assigned', 'in-progress'] }
      });
      
      if (activeRequests.length > 0) {
        return res.status(400).json({ message: '이 차량에 할당된 기사에게 진행 중인 수거 요청이 있어 삭제할 수 없습니다.' });
      }
    }
    
    await Vehicle.findByIdAndDelete(req.params.id);
    
    res.json({ message: '차량이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 차량 정비 기록 추가
router.post('/:id/maintenance', auth, async (req, res) => {
  try {
    // 관리자 또는 차량이 할당된 기사만 정비 기록 추가 가능
    if (req.user.role !== 'admin' && req.user.role !== 'driver') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }
    
    // 기사는 자신에게 할당된 차량만 정비 기록 추가 가능
    if (req.user.role === 'driver' && vehicle.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: '이 차량에 대한 정비 기록을 추가할 권한이 없습니다.' });
    }
    
    const { date, description, cost } = req.body;
    
    // 정비 기록 추가
    vehicle.maintenanceHistory.push({
      date: date || new Date(),
      description,
      cost
    });
    
    // 마지막 정비일 업데이트
    vehicle.lastMaintenance = date || new Date();
    
    await vehicle.save();
    
    res.json({ 
      message: '정비 기록이 성공적으로 추가되었습니다.',
      vehicle: vehicle
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

module.exports = router;
