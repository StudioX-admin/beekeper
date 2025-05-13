// server/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const { MONGODB_URI } = require('./config');

// 라우트 가져오기
const apiRoutes = require('./routes/api');

// Express 앱 초기화
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서비스
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 라우트
app.use('/api', apiRoutes);

// 프론트엔드 앱 서비스 (프로덕션 환경)
if (process.env.NODE_ENV === 'production') {
  // 웹 관리자 앱
  app.use('/admin', express.static(path.join(__dirname, '../web/dist')));
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../web/dist/index.html'));
  });
  
  // 모바일 기사 앱
  app.use('/driver', express.static(path.join(__dirname, '../app/dist')));
  app.get('/driver/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../app/dist/index.html'));
  });
  
  // 루트 경로는 관리자 앱으로 리다이렉트
  app.get('/', (req, res) => {
    res.redirect('/admin');
  });
}

// 404 에러 처리
app.use((req, res, next) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || '서버 오류가 발생했습니다.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB 연결
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => {
  console.log('MongoDB 연결 성공');
})
.catch(err => {
  console.error('MongoDB 연결 실패:', err);
  process.exit(1);
});

module.exports = app;
