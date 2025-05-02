# 스마트폐기물관리 플랫폼

스마트폐기물관리 플랫폼은 폐기물 수거 과정을 효율적으로 관리하기 위한 종합 솔루션입니다. 본 프로젝트는 관리자용 웹 대시보드와 기사용 모바일 앱으로 구성되어 있습니다.

## 프로젝트 구조

- `/` - 백엔드 (Node.js, Express, MongoDB)
- `/web` - 관리자용 웹 대시보드 (Vue.js)
- `/app` - 기사용 모바일 앱 (Vue.js)

## 기능

- 폐기물 수거 요청 생성 및 관리
- 기사 배정 및 작업 상태 추적
- 차량 관리
- 실시간 대시보드 및 통계
- 사진 증빙 기능

## 설치 및 실행 방법

### 백엔드

```bash
# 의존성 설치
npm install

# 개발 모드로 실행
npm run dev

# 프로덕션 모드로 실행
npm start
```

### 웹 프론트엔드

```bash
# 디렉토리 이동
cd web

# 의존성 설치
npm install

# 개발 서버 실행
npm run serve

# 프로덕션 빌드
npm run build
```

### 모바일 앱

```bash
# 디렉토리 이동
cd app

# 의존성 설치
npm install

# 개발 서버 실행
npm run serve

# 프로덕션 빌드
npm run build
```

## 환경 변수 설정

각 프로젝트 디렉토리에 `.env` 파일을 생성하고, `.env.example` 파일의 내용을 참고하여 필요한 환경 변수를 설정하세요.

## 배포 방법

자세한 배포 방법은 [배포 가이드](./DEPLOYMENT.md)를 참조하세요.

## 기술 스택

- **백엔드**: Node.js, Express, MongoDB, JWT
- **프론트엔드**: Vue.js, Vuex, Vue Router, Chart.js
- **배포**: Render.com (백엔드), Netlify (프론트엔드)
