// web/src/services/auth.js
import api from './api';

const AuthService = {
  login(email, password) {
    return api.post('/auth/login', { email, password })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
      });
  },

  register(name, email, password) {
    // username 필드를 name과 동일하게 자동 추가
    return api.post('/auth/register', {
      name,
      username: name, // 중요: username 필드 추가
      email,
      password
    });
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default AuthService;
