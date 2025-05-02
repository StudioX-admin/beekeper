const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 헤더에서 토큰 가져오기
  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];
  
  // 토큰이 없으면 인증 실패
  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 없습니다. 로그인이 필요합니다.' });
  }
  
  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 검증된 사용자 정보를 요청 객체에 추가
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};
