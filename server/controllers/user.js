const User = require('../models/User');
const bcrypt = require('bcrypt');

// 모든 사용자 조회
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('vehicle', 'plateNumber model')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: '사용자 목록 조회 중 오류가 발생했습니다.' });
  }
};

// 단일 사용자 조회
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('vehicle', 'plateNumber model');

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '사용자 조회 중 오류가 발생했습니다.' });
  }
};

// 사용자 생성
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }

    // 비밀번호 해시화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: '사용자 생성 중 오류가 발생했습니다.' });
  }
};

// 사용자 정보 수정
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 이메일 중복 확인 (다른 사용자의 이메일과 중복되지 않도록)
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
      }
    }

    const updateData = {
      name,
      email,
      phone,
      role
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .select('-password')
      .populate('vehicle', 'plateNumber model');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: '사용자 정보 수정 중 오류가 발생했습니다.' });
  }
};

// 사용자 삭제
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 기사인 경우 차량 할당 해제
    if (user.role === 'driver' && user.vehicle) {
      const vehicle = await Vehicle.findById(user.vehicle);
      if (vehicle) {
        vehicle.driver = null;
        await vehicle.save();
      }
    }

    await user.remove();
    res.json({ message: '사용자가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '사용자 삭제 중 오류가 발생했습니다.' });
  }
};

// 비밀번호 변경
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 현재 비밀번호 확인
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    // 새 비밀번호 해시화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
};

// 기사 목록 조회
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' })
      .select('-password')
      .populate('vehicle', 'plateNumber model')
      .sort({ name: 1 });

    res.json(drivers);
  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({ message: '기사 목록 조회 중 오류가 발생했습니다.' });
  }
}; 