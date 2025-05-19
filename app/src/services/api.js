import axios from 'axios';
import { useAuth } from '@/composables/useAuth';

// 기본 URL 설정
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10초 타임아웃 (모바일 환경은 연결이 불안정할 수 있어 더 길게 설정)
  headers: {
    'Content-Type': 'application/json'
  }
});

// 인터셉터: 요청 전 토큰 추가
apiClient.interceptors.request.use(
  config => {
    const { token } = useAuth();
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }
    
    // 오프라인 상태 확인
    if (!navigator.onLine) {
      // 오프라인 처리 로직
      // store에 오프라인 요청 저장하고 나중에 동기화
      return Promise.reject(new Error('오프라인 상태입니다. 요청이 대기열에 추가됩니다.'));
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 인터셉터: 응답 처리 (토큰 만료 등)
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // 네트워크 오류 (오프라인)
    if (!error.response) {
      // 오프라인 요청 대기열에 추가
      // store.dispatch('sync/queueRequest', error.config);
      return Promise.reject(error);
    }
    
    // 401 에러 (인증 오류)
    if (error.response && error.response.status === 401) {
      const { logout } = useAuth();
      await logout();
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
  requests: {
    // 기사에게 배정된 요청 조회
    getDriverRequests(params) {
      return apiClient.get('/waste-requests', { params });
    },
    
    // ID로 요청 조회
    getById(id) {
      return apiClient.get(`/waste-requests/${id}`);
    },
    
    // 요청 상태 업데이트
    updateStatus(id, status) {
      return apiClient.put(`/waste-requests/${id}/status`, { status });
    },
    
    // 완료 사진 업로드
    uploadPhotos(requestId, photoUrls) {
      return apiClient.put(`/waste-requests/${requestId}/photos`, {
        photoUrls
      });
    },
    
    // 문제 보고
    reportIssue(requestId, issueText) {
      return apiClient.post(`/waste-requests/${requestId}/issues`, {
        description: issueText
      });
    },
    
    // 기사 통계 조회
    getDriverStats() {
      return apiClient.get('/waste-requests/stats/driver');
    }
  },
  
  // === 차량 관련 API ===
  vehicles: {
    // 배정된 차량 조회
    getAssigned() {
      return apiClient.get('/vehicles/assigned');
    },
    
    // 차량 위치 업데이트
    updateLocation(id, coordinates) {
      return apiClient.put(`/vehicles/${id}/location`, {
        coordinates
      });
    },
    
    // 차량 상태 업데이트 (연료량 등)
    updateStatus(id, statusData) {
      return apiClient.put(`/vehicles/${id}/status`, statusData);
    }
  },
  
  // === 파일 업로드 API ===
  upload: {
    // 사진 업로드
    photo(file) {
      const formData = new FormData();
      formData.append('photo', file);
      
      return apiClient.post('/upload/photo', formData, {
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
  },
  
  // === 위치 추적 API ===
  location: {
    // 현재 위치 업데이트
    updateDriverLocation(coordinates) {
      return apiClient.post('/location/update', {
        coordinates
      });
    }
  },
  
  // === 오프라인 동기화 API ===
  sync: {
    // 오프라인 데이터 동기화
    syncOfflineData(offlineData) {
      return apiClient.post('/sync', {
        offlineData
      });
    }
  },
  
  // === 푸시 알림 관련 API ===
  notifications: {
    // FCM 토큰 등록
    registerPushToken(token) {
      return apiClient.post('/notifications/register', {
        token
      });
    },
    
    // 알림 설정 업데이트
    updateSettings(settings) {
      return apiClient.put('/notifications/settings', settings);
    },
    
    // 알림 목록 조회
    getAll() {
      return apiClient.get('/notifications');
    },
    
    // 알림 읽음 처리
    markAsRead(id) {
      return apiClient.put(`/notifications/${id}/read`);
    }
  }
};

// 오프라인 지원 헬퍼 함수
const offlineHelper = {
  // 오프라인 요청 큐에 추가
  queueRequest(request) {
    const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    offlineQueue.push(request);
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
  },
  
  // 오프라인 데이터 가져오기
  getOfflineQueue() {
    return JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  },
  
  // 오프라인 큐 초기화
  clearOfflineQueue() {
    localStorage.removeItem('offlineQueue');
  },
  
  // 오프라인 요청 동기화
  async syncOfflineQueue() {
    const offlineQueue = this.getOfflineQueue();
    
    if (!offlineQueue.length) return;
    
    try {
      await apiService.sync.syncOfflineData(offlineQueue);
      this.clearOfflineQueue();
    } catch (error) {
      console.error('오프라인 데이터 동기화 실패:', error);
    }
  }
};

// 네트워크 상태 변경 이벤트 리스너
window.addEventListener('online', () => {
  // 온라인 상태로 변경되면 오프라인 큐 동기화
  offlineHelper.syncOfflineQueue();
});

// API 서비스와 오프라인 헬퍼 내보내기
export { apiService as default, offlineHelper };
