// api.js - 웹 및 앱에서 사용할 API 서비스
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:5000/api';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 - 토큰 추가
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 만료 처리
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  // 로그인
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  
  // 회원가입
  register(userData) {
    return apiClient.post('/auth/register', userData);
  }
};

// 폐기물 수거 요청 API
export const wasteRequestAPI = {
  // 요청 목록 조회
  getRequests(params = {}) {
    return apiClient.get('/waste-requests', { params });
  },
  
  // 요청 상세 조회
  getRequestById(id) {
    return apiClient.get(`/waste-requests/${id}`);
  },
  
  // 새 요청 생성
  createRequest(requestData) {
    return apiClient.post('/waste-requests', requestData);
  },
  
  // 요청 상태 업데이트
  updateRequest(id, updateData) {
    return apiClient.put(`/waste-requests/${id}`, updateData);
  },
  
  // 요청에 사진 추가
  addPhotos(id, photos) {
    return apiClient.put(`/waste-requests/${id}`, { photos });
  }
};

// 차량 관리 API
export const vehicleAPI = {
  // 차량 목록 조회
  getVehicles(params = {}) {
    return apiClient.get('/vehicles', { params });
  },
  
  // 차량 등록
  createVehicle(vehicleData) {
    return apiClient.post('/vehicles', vehicleData);
  },
  
  // 차량 상태 업데이트
  updateVehicle(id, updateData) {
    return apiClient.put(`/vehicles/${id}`, updateData);
  }
};

// 대시보드 API
export const dashboardAPI = {
  // 대시보드 데이터 조회
  getDashboardData() {
    return apiClient.get('/dashboard');
  }
};

export default {
  auth: authAPI,
  wasteRequest: wasteRequestAPI,
  vehicle: vehicleAPI,
  dashboard: dashboardAPI
};
