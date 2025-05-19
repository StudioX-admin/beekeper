import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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

// 사용자 관련 API
export const users = {
  getAll: () => api.get('/users'),
  get: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
};

// 차량 관련 API
export const vehicles = {
  getAll: () => api.get('/vehicles'),
  get: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`)
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

// 관리자 전용 API
export const admin = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllRequests: () => api.get('/admin/requests'),
  assignRequest: (id, data) => api.put(`/admin/requests/${id}/assign`, data)
};

// 보고서 관련 API
export const reports = {
  getSummary: () => api.get('/reports/summary'),
  getWasteByType: () => api.get('/reports/waste-by-type'),
  getDriverPerformance: () => api.get('/reports/driver-performance'),
  export: () => api.get('/reports/export', { responseType: 'blob' })
};

export default api;
