const Reservation = require('../models/Reservation');
const User = require('../models/User');

// 모든 예약 조회 (플랫폼 관리자용)
exports.getAllReservations = async (req, res) => {
  try {
    const { status, wasteType, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (wasteType) query.wasteType = wasteType;
    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const reservations = await Reservation.find(query)
      .populate('transporter', 'name email company')
      .populate('processor', 'name email company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      reservations,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '예약 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 단일 예약 조회
exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('transporter', 'name email company')
      .populate('processor', 'name email company');

    if (!reservation) {
      return res.status(404).json({ message: '예약을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user.role !== 'platform_admin' &&
        req.user._id.toString() !== reservation.transporter._id.toString() &&
        req.user._id.toString() !== reservation.processor._id.toString()) {
      return res.status(403).json({ message: '이 예약에 접근할 권한이 없습니다.' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: '예약 조회 중 오류가 발생했습니다.' });
  }
};

// 예약 생성
exports.createReservation = async (req, res) => {
  try {
    const {
      processorId,
      wasteType,
      wasteAmount,
      unit,
      scheduledDate,
      pickupAddress,
      pickupContact,
      processingAddress,
      processingContact,
      notes
    } = req.body;

    // 처리업체 확인
    const processor = await User.findOne({ _id: processorId, role: 'processor', status: 'active' });
    if (!processor) {
      return res.status(404).json({ message: '유효한 처리업체를 찾을 수 없습니다.' });
    }

    const reservation = new Reservation({
      transporter: req.user._id,
      processor: processorId,
      wasteType,
      wasteAmount,
      unit,
      scheduledDate,
      pickupAddress,
      pickupContact,
      processingAddress,
      processingContact,
      notes
    });

    await reservation.save();

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: '예약 생성 중 오류가 발생했습니다.' });
  }
};

// 예약 수정
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: '예약을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user._id.toString() !== reservation.transporter._id.toString()) {
      return res.status(403).json({ message: '이 예약을 수정할 권한이 없습니다.' });
    }

    // 상태가 pending인 경우에만 수정 가능
    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: '이미 처리된 예약은 수정할 수 없습니다.' });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('transporter', 'name email company')
      .populate('processor', 'name email company');

    res.json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: '예약 수정 중 오류가 발생했습니다.' });
  }
};

// 예약 삭제
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: '예약을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user._id.toString() !== reservation.transporter._id.toString()) {
      return res.status(403).json({ message: '이 예약을 삭제할 권한이 없습니다.' });
    }

    // 상태가 pending인 경우에만 삭제 가능
    if (reservation.status !== 'pending') {
      return res.status(400).json({ message: '이미 처리된 예약은 삭제할 수 없습니다.' });
    }

    await reservation.remove();
    res.json({ message: '예약이 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '예약 삭제 중 오류가 발생했습니다.' });
  }
};

// 예약 상태 업데이트
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: '예약을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (req.user._id.toString() !== reservation.processor._id.toString()) {
      return res.status(403).json({ message: '이 예약의 상태를 변경할 권한이 없습니다.' });
    }

    // 상태 변경 가능 여부 확인
    if (reservation.status === 'completed' || reservation.status === 'cancelled') {
      return res.status(400).json({ message: '이미 완료되거나 취소된 예약입니다.' });
    }

    const updateData = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('transporter', 'name email company')
      .populate('processor', 'name email company');

    res.json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: '예약 상태 업데이트 중 오류가 발생했습니다.' });
  }
};

// 운반업체의 예약 목록 조회
exports.getTransporterReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { transporter: req.user._id };

    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('processor', 'name email company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      reservations,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '예약 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 처리업체의 예약 목록 조회
exports.getProcessorReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { processor: req.user._id };

    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('transporter', 'name email company')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.json({
      reservations,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: '예약 목록 조회 중 오류가 발생했습니다.' });
  }
}; 