// server/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION } = require('../config');

// 로그인 처리
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 사용자 찾기
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '사용자 이름 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // 비밀번호 검증
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '사용자 이름 또는 비밀번호가 올바르지 않습니다.' });
    }
    
    // 사용자 상태 검증
    if (user.status !== 'active') {
      return res.status(403).json({ message: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
    
    // 사용자 정보에서 비밀번호 제외
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage
    };
    
    res.json({
      user: userWithoutPassword,
      token,
      expiresIn: JWT_EXPIRATION
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
  }
};

// 로그아웃 처리
exports.logout = async (req, res) => {
  // 클라이언트에서 토큰을 제거하는 방식이므로 서버에서는 특별한 처리 필요 없음
  res.json({ message: '로그아웃되었습니다.' });
};

// 토큰 갱신
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: '토큰이 제공되지 않았습니다.' });
    }
    
    // 토큰 검증
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }
    
    // 사용자 존재 여부 확인
    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: '유효하지 않은 사용자입니다.' });
    }
    
    // 새 토큰 생성
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
    
    res.json({
      token: newToken,
      expiresIn: JWT_EXPIRATION
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: '토큰 갱신 중 오류가 발생했습니다.' });
  }
};
