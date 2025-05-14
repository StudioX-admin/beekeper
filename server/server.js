// dotenv 모듈 없을 때 안전하게 처리
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv 모듈을 불러올 수 없습니다. 기본 환경 설정을 사용합니다.');
}
  // 기본 환경 변수 설정
  process.env.PORT = process.env.PORT || 3000;
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beekeper';
}

const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Beekeper API 서버 실행 중' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
