# 스마트폐기물관리 플랫폼 배포 가이드

본 문서는 스마트폐기물관리 플랫폼을 실제 서비스로 배포하는 방법을 단계별로 안내합니다.

## 목차
1. [사전 준비](#사전-준비)
2. [MongoDB Atlas 설정](#mongodb-atlas-설정)
3. [백엔드 배포 (Render.com)](#백엔드-배포-rendercom)
4. [웹 프론트엔드 배포 (Netlify)](#웹-프론트엔드-배포-netlify)
5. [모바일 앱 배포 (Netlify)](#모바일-앱-배포-netlify)
6. [초기 계정 설정](#초기-계정-설정)
7. [문제 해결](#문제-해결)

## 사전 준비

### 필요한 계정
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) - 데이터베이스
- [Render.com](https://render.com/) - 백엔드 호스팅
- [Netlify](https://app.netlify.com/signup) - 프론트엔드 호스팅

## MongoDB Atlas 설정

1. **MongoDB Atlas 로그인 및 새 프로젝트 생성**
   - MongoDB Atlas 웹사이트에 로그인
   - 대시보드에서 "New Project" 버튼 클릭
   - 프로젝트 이름 입력 (예: "SmartWaste")
   - "Create Project" 버튼 클릭

2. **클러스터 생성**
   - 프로젝트 페이지에서 "Build a Database" 버튼 클릭
   - "FREE" 옵션 선택 (M0 무료 티어)
   - 클라우드 제공자 선택 (AWS 추천) 및 가까운 지역 선택
   - "Create" 버튼 클릭

3. **데이터베이스 사용자 생성**
   - 보안 설정 화면에서 사용자 이름과 비밀번호 입력
     (비밀번호는 안전하게 저장해두세요!)
   - "Create User" 버튼 클릭

4. **IP 액세스 설정**
   - "Add IP Address" 클릭
   - "Allow Access from Anywhere" 선택 (0.0.0.0/0)
   - "Confirm" 클릭
   - "Finish and Close" 클릭

5. **연결 문자열 가져오기**
   - 클러스터 생성이 완료되면 "Connect" 버튼 클릭
   - "Connect your application" 선택
   - 제공된 연결 문자열 복사 (예: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - 문자열에서 `<username>`과 `<password>` 부분을 실제 생성한 사용자 정보로 변경
   - 문자열 끝에 데이터베이스 이름 추가: `.net/smartwaste?retryWrites=true&w=majority`

## 백엔드 배포 (Render.com)

1. **Render.com에 로그인**
   - Render.com 웹사이트에 로그인

2. **새 웹 서비스 생성**
   - 대시보드에서 "New" → "Web Service" 클릭
   - GitHub 계정 연결 (처음 이용 시)
   - 앞서 생성한 GitHub 저장소 선택

3. **서비스 설정**
   - 이름: "smartwaste-api" (원하는 이름 사용 가능)
   - 환경: "Node"
   - 빌드 명령어: `npm install`
   - 시작 명령어: `node server.js`
   - "Advanced" 섹션 클릭하여 환경 변수 추가:
     - `PORT`: 10000
     - `MONGODB_URI`: 앞서 MongoDB에서 복사한 연결 문자열
     - `JWT_SECRET`: 임의의 복잡한 문자열 (예: "smartwaste-secret-key-123456")
   - "Create Web Service" 버튼 클릭

4. **배포 확인**
   - 서비스 배포가 완료될 때까지 대기 (약 5분 소요)
   - 배포가 완료되면 제공된 URL 확인 (예: https://smartwaste-api.onrender.com)
   - 이 URL을 기록해두세요 (프론트엔드 설정에 필요)

## 웹 프론트엔드 배포 (Netlify)

1. **Netlify에 로그인**
   - Netlify 웹사이트에 로그인

2. **새 사이트 배포**
   - "New site from Git" 버튼 클릭
   - GitHub 선택 후 저장소 접근 권한 부여 (처음 이용 시)
   - 앞서 생성한 GitHub 저장소 선택

3. **배포 설정**
   - 기본 설정:
     - 브랜치: "main"
     - 기본 디렉토리: "web"
     - 빌드 명령어: `npm install && npm run build`
     - 게시 디렉토리: "dist"
   - "Show advanced" 클릭하여 환경 변수 추가:
     - `VUE_APP_API_URL`: Render.com에서 배포한 백엔드 URL + "/api"
       (예: https://smartwaste-api.onrender.com/api)
   - "Deploy site" 버튼 클릭

4. **배포 확인**
   - 배포가 완료될 때까지 대기 (약 2-3분 소요)
   - 배포가 완료되면 제공된 URL 확인 (예: https://smartwaste-platform.netlify.app)
   - 이 URL이 관리자용 웹 대시보드 주소입니다

## 모바일 앱 배포 (Netlify)

1. **Netlify 대시보드로 이동**
   - "New site from Git" 버튼 다시 클릭

2. **저장소 선택**
   - 앞서 사용한 GitHub 저장소 다시 선택

3. **배포 설정**
   - 기본 설정:
     - 브랜치: "main"
     - 기본 디렉토리: "app"
     - 빌드 명령어: `npm install && npm run build`
     - 게시 디렉토리: "dist"
   - "Show advanced" 클릭하여 환경 변수 추가:
     - `VUE_APP_API_URL`: Render.com에서 배포한 백엔드 URL + "/api"
       (웹 대시보드와 동일한 값 사용)
   - "Deploy site" 버튼 클릭

4. **배포 확인**
   - 배포가 완료될 때까지 대기 (약 2-3분 소요)
   - 배포가 완료되면 제공된 URL 확인 (예: https://smartwaste-app.netlify.app)
   - 이 URL이 기사용 모바일 앱 주소입니다

## 초기 계정 설정

1. **관리자 계정 생성**
   - 배포된 웹 대시보드 URL로 접속
   - 첫 화면에서 "계정 만들기" 클릭
   - 다음 정보로 관리자 계정 생성:
     - 아이디: 원하는 아이디 입력
     - 비밀번호: 안전한 비밀번호 입력
     - 이름: 실명 또는 관리자명
     - 역할: "admin" 선택 (중요)
   - "가입하기" 버튼 클릭
   - 생성된 계정으로 로그인

2. **기사 계정 추가**
   - 관리자 대시보드에서 "기사 관리" 메뉴 클릭
   - "새 기사 추가" 버튼 클릭
   - 다음 정보 입력:
     - 아이디: 기사용 아이디
     - 비밀번호: 기사용 비밀번호
     - 이름: 기사 이름
     - 역할: "driver" 선택 (중요)
     - 전화번호: 기사 연락처
   - "저장" 버튼 클릭

3. **차량 등록**
   - 관리자 대시보드에서 "차량 관리" 메뉴 클릭
   - "새 차량 추가" 버튼 클릭
   - 다음 정보 입력:
     - 차량 ID: 차량 번호 또는 식별자
     - 차량 유형: 차량 종류
     - 용량: 적재 용량 (kg)
     - 상태: "available" 선택
   - "저장" 버튼 클릭

## 문제 해결

### 백엔드 연결 오류
- **문제**: 로그인이 안되거나 데이터가 로드되지 않음
- **해결 방법**:
  1. Render.com 대시보드에서 서비스 로그 확인
  2. MongoDB 연결 문자열이 올바른지 확인
  3. 환경 변수가 제대로 설정되었는지 확인

### 프론트엔드 배포 오류
- **문제**: 웹사이트 로드 실패 또는 빈 화면 표시
- **해결 방법**:
  1. Netlify 대시보드에서 배포 로그 확인
  2. 환경 변수 `VUE_APP_API_URL`이 올바르게 설정되었는지 확인
  3. 백엔드 URL이 작동하는지 확인 (웹 브라우저에서 직접 접속)

### CORS 오류
- **문제**: 브라우저 콘솔에 "CORS" 관련 오류 메시지가 표시됨
- **해결 방법**:
  1. Render.com에서 백엔드 서비스의 환경 변수에 `CORS_ORIGIN` 추가
  2. 값으로 프론트엔드 URL 입력 (예: https://smartwaste-platform.netlify.app)
  3. 서비스 재시작
