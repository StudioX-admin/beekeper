const mongoose = require('mongoose');

/**
 * MongoDB 데이터베이스 연결 함수
 * 환경 변수에서 MONGODB_URI를 사용하여 연결
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB 연결 실패: ${error.message}`);
    // 프로세스 종료 (옵션)
    // process.exit(1);
    throw error;
  }
};

module.exports = connectDB;
