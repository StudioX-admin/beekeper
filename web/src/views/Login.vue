<!-- web/src/views/Login.vue -->
<template>
  <div class="login-page">
    <div class="login-container">
      <h1>로그인</h1>
      <div v-if="registered" class="success-message">
        회원가입이 완료되었습니다. 로그인해주세요.
      </div>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">이메일</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p>계정이 없으신가요? <router-link to="/register">회원가입</router-link></p>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth';

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: null,
      registered: false
    };
  },
  created() {
    // 이미 로그인되어 있으면 대시보드로 리디렉션
    if (AuthService.isAuthenticated()) {
      this.$router.push('/');
    }
    
    // 회원가입 후 리디렉션 체크
    this.registered = this.$route.query.registered === 'true';
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;
      
      try {
        await AuthService.login(this.email, this.password);
        this.$router.push('/');
      } catch (err) {
        console.error('로그인 오류:', err);
        this.error = err.response?.data?.message || '로그인에 실패했습니다.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

button:disabled {
  background-color: #cccccc;
}

.error-message {
  color: #f44336;
  margin-top: 1rem;
}

.success-message {
  color: #4CAF50;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #e8f5e9;
  border-radius: 4px;
}

a {
  color: #4CAF50;
  text-decoration: none;
}
</style>
