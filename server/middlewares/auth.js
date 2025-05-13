// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');

// 인증 확인 미들웨어
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '유효한 토큰이 제공되지 않았습니다.' });
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
    
    // 사용자 정보를 요청 객체에 추가
    req.user = {
      id: user._id,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: '인증 처리 중 오류가 발생했습니다.' });
  }
};

// 권한 확인 미들웨어
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: '이 작업을 수행할 권한이 없습니다.' });
    }
    
    next();
  };
};
