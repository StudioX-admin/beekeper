<!-- app/src/views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="@/assets/images/logo.png" alt="Beekeper 로고" class="login-logo">
        <h1 class="login-title">스마트폐기물 운송</h1>
        <p class="login-subtitle">기사용 앱</p>
      </div>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">아이디</label>
          <div class="input-group">
            <span class="input-group-icon">
              <i class="fas fa-user"></i>
            </span>
            <input
              type="text"
              id="username"
              v-model="username"
              class="form-control"
              placeholder="아이디를 입력하세요"
              required
              autocomplete="username"
              :disabled="loading"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">비밀번호</label>
          <div class="input-group">
            <span class="input-group-icon">
              <i class="fas fa-lock"></i>
            </span>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="form-control"
              placeholder="비밀번호를 입력하세요"
              required
              autocomplete="current-password"
              :disabled="loading"
            >
            <button
              type="button"
              class="btn-toggle-password"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        
        <div class="form-group remember-me">
          <div class="checkbox">
            <input type="checkbox" id="remember" v-model="remember">
            <label for="remember">로그인 상태 유지</label>
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary btn-login" :disabled="loading">
          <span v-if="!loading">로그인</span>
          <span v-else class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </span>
        </button>
      </form>
      
      <div class="company-info">
        <p>문의사항은 관리자에게 연락해주세요</p>
        <p><i class="fas fa-phone-alt"></i> 02-1234-5678</p>
      </div>
    </div>

    <div class="login-footer">
      <p>스마트폐기물관리플랫폼 'Beekeper'</p>
      <p class="copyright">© 2025 All Rights Reserved</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      remember: false,
      showPassword: false,
      loading: false,
      error: null
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;
      
      try {
        await this.$store.dispatch('login', {
          username: this.username,
          password: this.password,
          remember: this.remember
        });
        
        this.$router.push({ name: 'tasks' });
      } catch (error) {
        this.error = error.response && error.response.data.message 
          ? error.response.data.message 
          : '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--primary-color);
  background-image: linear-gradient(to bottom, rgba(30, 58, 138, 0.95), rgba(30, 58, 138, 0.7)), url('@/assets/images/mobile-login-bg.jpg');
  background-size: cover;
  background-position: center;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 3rem;
  margin-top: 2rem;
}

.login-logo {
  height: 70px;
  margin-bottom: 1rem;
}

.login-title {
  margin: 0;
  color: var(--text-light);
  font-size: 1.5rem;
  font-weight: var(--font-bold);
}

.login-subtitle {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--text-sm);
}

.login-form {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-lg);
}

.form-label {
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-group-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-tertiary);
  pointer-events: none;
}

.form-control {
  padding-left: 2.5rem;
  height: 3rem;
}

.btn-toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input[type="checkbox"] {
  margin-right: 0.5rem;
}

.checkbox label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.btn-login {
  width: 100%;
  padding: 0.75rem;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  height: 3rem;
}

.loading-spinner {
  display: inline-block;
}

.company-info {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 2rem;
}

.company-info p {
  margin: 0.5rem 0;
  font-size: var(--text-sm);
}

.company-info i {
  margin-right: 0.5rem;
}

.login-footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.login-footer p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--text-xs);
}

.copyright {
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.5);
}

.alert {
  margin-bottom: 1.5rem;
}
</style>
