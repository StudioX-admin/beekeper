// web/src/api/index.js
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
  logout: () => api.post('/auth/logout'),
  refreshToken: token => api.post('/auth/refresh-token', { token })
};

export const wasteRequests = {
  getAll: params => api.get('/waste-requests', { params }),
  getById: id => api.get(`/waste-requests/${id}`),
  create: data => api.post('/waste-requests', data),
  update: (id, data) => api.put(`/waste-requests/${id}`, data),
  delete: id => api.delete(`/waste-requests/${id}`)
};

export const users = {
  getAll: params => api.get('/users', { params }),
  getById: id => api.get(`/users/${id}`),
  create: data => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: id => api.delete(`/users/${id}`)
};

export const vehicles = {
  getAll: params => api.get('/vehicles', { params }),
  getById: id => api.get(`/vehicles/${id}`),
  create: data => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: id => api.delete(`/vehicles/${id}`),
  assign: (id, driverId) => api.put(`/vehicles/${id}/assign`, { driverId }),
  setMaintenance: (id, status) => api.put(`/vehicles/${id}/maintenance`, { status })
};

export const reports = {
  getSummary: params => api.get('/reports/summary', { params }),
  getWasteByType: params => api.get('/reports/waste-by-type', { params }),
  getDriverPerformance: params => api.get('/reports/driver-performance', { params }),
  exportReport: params => api.get('/reports/export', { 
    params,
    responseType: 'blob'
  })
};

export default {
  auth,
  wasteRequests,
  users,
  vehicles,
  reports
};
