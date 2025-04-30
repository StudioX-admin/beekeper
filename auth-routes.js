const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middlewares/auth');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role, phone, email } = req.body;
    
    // 사용자 존재 여부 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '이미 존재하는 사용자 아이디입니다.' });
    }
    
    // 새 사용자 생성
    const user = new User({
      username,
      password, // 모델에서 자동으로 해싱됨
      name,
      role,
      phone,
      email
    });
    
    await user.save();
    
    res.status(201).json({ message: '사용자가 성공적으로 등록되었습니다.' });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 사용자 찾기
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // 마지막 로그인 시간 업데이트
    user.lastLogin = Date.now();
    await user.save();
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 현재 사용자 정보 가져오기
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

// 사용자 목록 가져오기 (관리자 전용)
router.get('/users', auth, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const { role } = req.query;
    const filter = role ? { role } : {};
    
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error: error.message });
  }
});

module.exports = router;
