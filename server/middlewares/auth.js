// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '인증이 필요합니다.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: '인증이 필요합니다.' });
  }
};

const driverAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'driver') {
        return res.status(403).json({ message: '기사 권한이 필요합니다.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: '인증이 필요합니다.' });
  }
};

module.exports = {
  auth,
  adminAuth,
  driverAuth
};
