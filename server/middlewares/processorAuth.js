const processorAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  if (req.user.role !== 'processor') {
    return res.status(403).json({ message: '처리업체만 접근할 수 있습니다.' });
  }

  if (req.user.status !== 'active') {
    return res.status(403).json({ message: '비활성화된 계정입니다.' });
  }

  next();
};

module.exports = processorAuth; 