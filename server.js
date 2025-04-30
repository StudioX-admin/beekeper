const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const wasteRequestRoutes = require('./routes/waste-requests');
const vehicleRoutes = require('./routes/vehicles');
const dashboardRoutes = require('./routes/dashboard');

// 환경변수 로드
dotenv.config();

// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 이미지 업로드를 위해 용량 제한 설정
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 데이터베이스 연결
connectDB()
  .then(() => console.log('데이터베이스 초기화 완료'))
  .catch(err => console.error('데이터베이스 초기화 실패:', err));

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/waste-requests', wasteRequestRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('스마트폐기물관리 API 서버가 실행 중입니다.');
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({ message: '요청한 리소스를 찾을 수 없습니다.' });
});

// 오류 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
});

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
