// server/server.js
const app = require('./app');
const { PORT } = require('./config');

const server = app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

// 정상적인 종료 처리
process.on('SIGTERM', () => {
  console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다.');
  server.close(() => {
    console.log('프로세스를 종료합니다.');
    process.exit(0);
  });
});

module.exports = server;
