// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 토큰 생성 함수
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1d' }
  );
};

// 회원가입
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // username 필드가 없으면 name 필드 사용
    const username = req.body.username || name;
    
    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }
    
    // 사용자 생성
    const user = new User({
      name,
      username,
      email,
      password
    });
    
    await user.save();
    
    res.status(201).json({ message: '회원가입 성공' });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
    
    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }
    
    // 토큰 생성
    const token = generateToken(user);
    
    // 사용자 정보 (비밀번호 제외)
    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email
    };
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
};
