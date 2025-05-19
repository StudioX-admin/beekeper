// app/src/api/index.js
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3000/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 응답 인터셉터 - 인증 오류 처리
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// 기사 전용 API
export const driver = {
  getRequests: () => api.get('/driver/requests'),
  updateRequestStatus: (id, status) => api.put(`/driver/requests/${id}/status`, { status }),
  getTasks: params => api.get('/driver/tasks', { params }),
  getProfile: () => api.get('/driver/profile'),
  updateProfile: data => api.put('/driver/profile', data),
  startTask: id => api.put(`/driver/tasks/${id}/start`),
  completeTask: id => api.put(`/driver/tasks/${id}/complete`),
  uploadTaskPhotos: (id, formData) => api.post(`/driver/tasks/${id}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// 폐기물 수거 요청 관련 API
export const wasteRequests = {
  getAll: () => api.get('/waste-requests'),
  get: (id) => api.get(`/waste-requests/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/waste-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/waste-requests/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  delete: (id) => api.delete(`/waste-requests/${id}`)
};

export default api;
