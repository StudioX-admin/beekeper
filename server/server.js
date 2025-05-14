// dotenv 설정 안전하게 로드
try {
  // 누락된 dotenv 로드 코드 추가
  require('dotenv').config();
} catch (error) {
  console.log('dotenv 모듈을 불러올 수 없습니다. 기본 환경 설정을 사용합니다.');
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');

// 환경 변수
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beekeper';

const app = express();

// 미들웨어
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 데이터베이스 연결
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

// 라우트
app.get('/api', (req, res) => {
  res.json({ message: 'Beekeper API 서버가 정상적으로 실행 중입니다.' });
});

// 상태 확인 라우트
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
