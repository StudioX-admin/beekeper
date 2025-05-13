// app/src/api/index.js
import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

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
  error => {
    if (error.response && error.response.status === 401) {
      // 토큰이 만료되었거나 유효하지 않은 경우 로그인 페이지로 리다이렉트
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: credentials => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout')
};

export const driver = {
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

export default {
  auth,
  driver
};
