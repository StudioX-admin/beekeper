import axios from 'axios';

// 기본 URL 설정
const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 인터셉터: 요청 전 토큰 추가
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 인터셉터: 응답 처리 (토큰 만료 등)
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 401 에러 (인증 오류)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API 서비스 객체
const apiService = {
  // === 인증 관련 API ===
  auth: {
    // 로그인
    login(credentials) {
      return apiClient.post('/auth/login', credentials);
    },
    
    // 회원가입
    register(userData) {
      return apiClient.post('/auth/register', userData);
    },
    
    // 현재 사용자 정보 조회
    getCurrentUser() {
      return apiClient.get('/auth/me');
    },
    
    // 비밀번호 변경
    changePassword(passwordData) {
      return apiClient.put('/auth/password', passwordData);
    },
    
    // 프로필 업데이트
    updateProfile(profileData) {
      return apiClient.put('/auth/me', profileData);
    }
  },
  
  // === 폐기물 요청 관련 API ===
  wasteRequests: {
    // 모든 요청 조회
    getAll(params) {
      return apiClient.get('/waste-requests', { params });
    },
    
    // ID로 요청 조회
    getById(id) {
      return apiClient.get(`/waste-requests/${id}`);
    },
    
    // 새 요청 생성
    create(requestData) {
      return apiClient.post('/waste-requests', requestData);
    },
    
    // 요청 상태 업데이트
    updateStatus(id, status) {
      return apiClient.put(`/waste-requests/${id}/status`, { status });
    },
    
    // 요청 전체 업데이트
    update(id, requestData) {
      return apiClient.put(`/waste-requests/${id}`, requestData);
    },
    
    // 기사 배정
    assignDriver(requestId, driverId, vehicleId) {
      return apiClient.put(`/waste-requests/${requestId}/assign`, {
        driverId,
        vehicleId
      });
    },
    
    // 완료 사진 업로드
    uploadPhotos(requestId, photoUrls) {
      return apiClient.put(`/waste-requests/${requestId}/photos`, {
        photoUrls
      });
    },
    
    // 요청 취소
    cancel(id) {
      return apiClient.put(`/waste-requests/${id}/status`, {
        status: 'cancelled'
      });
    },
    
    // 대시보드용 요약 데이터 조회
    getSummary() {
      return apiClient.get('/dashboard/summary');
    },
    
    // 주간 통계 조회
    getWeeklyStats() {
      return apiClient.get('/dashboard/stats/weekly');
    },
    
    // 지도 데이터 조회
    getMapData() {
      return apiClient.get('/dashboard/map');
    }
  },
  
  // === 차량 관련 API ===
  vehicles: {
    // 모든 차량 조회
    getAll(params) {
      return apiClient.get('/vehicles', { params });
    },
    
    // ID로 차량 조회
    getById(id) {
      return apiClient.get(`/vehicles/${id}`);
    },
    
    // 새 차량 등록
    create(vehicleData) {
      return apiClient.post('/vehicles', vehicleData);
    },
    
    // 차량 정보 업데이트
    update(id, vehicleData) {
      return apiClient.put(`/vehicles/${id}`, vehicleData);
    },
    
    // 차량 삭제
    delete(id) {
      return apiClient.delete(`/vehicles/${id}`);
    },
    
    // 차량 위치 업데이트
    updateLocation(id, coordinates) {
      return apiClient.put(`/vehicles/${id}/location`, {
        coordinates
      });
    }
  },
  
  // === 기사(드라이버) 관련 API ===
  drivers: {
    // 모든 기사 조회
    getAll(params) {
      return apiClient.get('/users', { 
        params: { 
          ...params,
          role: 'driver' 
        } 
      });
    },
    
    // ID로 기사 조회
    getById(id) {
      return apiClient.get(`/users/${id}`);
    },
    
    // 새 기사 등록
    create(driverData) {
      return apiClient.post('/users', {
        ...driverData,
        role: 'driver'
      });
    },
    
    // 기사 정보 업데이트
    update(id, driverData) {
      return apiClient.put(`/users/${id}`, driverData);
    },
    
    // 기사 계정 비활성화/활성화
    toggleActive(id, active) {
      return apiClient.put(`/users/${id}`, { active });
    },
    
    // 비밀번호 재설정
    resetPassword(id, password) {
      return apiClient.put(`/users/${id}/reset-password`, { password });
    },
    
    // 특정 기사의 작업 목록 조회
    getAssignments(driverId, params) {
      return apiClient.get('/waste-requests', {
        params: {
          ...params,
          driverId
        }
      });
    }
  },
  
  // === 파일 업로드 API ===
  upload: {
    // 단일 파일 업로드
    file(file, type = 'general') {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      return apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    
    // 프로필 이미지 업로드
    profileImage(file) {
      const formData = new FormData();
      formData.append('file', file);
      
      return apiClient.post('/upload/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  }
};

export default apiService;
