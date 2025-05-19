const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// 모든 차량 조회
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('driver', 'name email')
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({ message: '차량 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 단일 차량 조회
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('driver', 'name email');

    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: '차량 조회 중 오류가 발생했습니다.' });
  }
};

// 차량 등록
exports.createVehicle = async (req, res) => {
  try {
    const { plateNumber, model, type, capacity } = req.body;

    // 차량 번호 중복 확인
    const existingVehicle = await Vehicle.findOne({ plateNumber });
    if (existingVehicle) {
      return res.status(400).json({ message: '이미 등록된 차량 번호입니다.' });
    }

    const vehicle = new Vehicle({
      plateNumber,
      model,
      type,
      capacity,
      status: 'available'
    });

    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: '차량 등록 중 오류가 발생했습니다.' });
  }
};

// 차량 정보 수정
exports.updateVehicle = async (req, res) => {
  try {
    const { model, type, capacity, status } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }

    const updateData = {
      model,
      type,
      capacity,
      status
    };

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('driver', 'name email');

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: '차량 정보 수정 중 오류가 발생했습니다.' });
  }
};

// 차량 삭제
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }

    // 차량에 할당된 기사가 있는지 확인
    if (vehicle.driver) {
      return res.status(400).json({ message: '할당된 기사가 있는 차량은 삭제할 수 없습니다.' });
    }

    await vehicle.remove();
    res.json({ message: '차량이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: '차량 삭제 중 오류가 발생했습니다.' });
  }
};

// 기사 할당
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }

    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) {
      return res.status(404).json({ message: '기사를 찾을 수 없습니다.' });
    }

    // 기사가 이미 다른 차량에 할당되어 있는지 확인
    if (driver.vehicle) {
      return res.status(400).json({ message: '이미 다른 차량에 할당된 기사입니다.' });
    }

    // 차량에 이미 기사가 할당되어 있는지 확인
    if (vehicle.driver) {
      return res.status(400).json({ message: '이미 기사가 할당된 차량입니다.' });
    }

    vehicle.driver = driverId;
    driver.vehicle = vehicle._id;

    await Promise.all([vehicle.save(), driver.save()]);

    const updatedVehicle = await Vehicle.findById(req.params.id)
      .populate('driver', 'name email');

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ message: '기사 할당 중 오류가 발생했습니다.' });
  }
};

// 기사 할당 해제
exports.unassignDriver = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: '차량을 찾을 수 없습니다.' });
    }

    if (!vehicle.driver) {
      return res.status(400).json({ message: '할당된 기사가 없습니다.' });
    }

    const driver = await User.findById(vehicle.driver);
    if (driver) {
      driver.vehicle = null;
      await driver.save();
    }

    vehicle.driver = null;
    await vehicle.save();

    const updatedVehicle = await Vehicle.findById(req.params.id)
      .populate('driver', 'name email');

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Unassign driver error:', error);
    res.status(500).json({ message: '기사 할당 해제 중 오류가 발생했습니다.' });
  }
}; 