<!-- web/src/views/Register.vue -->
<template>
  <div class="register-page">
    <div class="register-container">
      <h1>회원가입</h1>
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="name">이름</label>
          <input type="text" id="name" v-model="userData.name" required>
        </div>
        <div class="form-group">
          <label for="email">이메일</label>
          <input type="email" id="email" v-model="userData.email" required>
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="userData.password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required>
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '처리 중...' : '회원가입' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p>이미 계정이 있으신가요? <router-link to="/login">로그인</router-link></p>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth';

export default {
  name: 'Register',
  data() {
    return {
      userData: {
        name: '',
        email: '',
        password: ''
      },
      confirmPassword: '',
      loading: false,
      error: null
    };
  },
  methods: {
    async register() {
      if (this.userData.password !== this.confirmPassword) {
        this.error = '비밀번호가 일치하지 않습니다.';
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        await AuthService.register(
          this.userData.name,
          this.userData.email,
          this.userData.password
        );
        
        this.$router.push('/login?registered=true');
      } catch (err) {
        console.error('회원가입 오류:', err);
        this.error = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-container {
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

a {
  color: #4CAF50;
  text-decoration: none;
}
</style>
