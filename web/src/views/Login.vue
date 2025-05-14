<!-- web/src/views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/images/logo.png" alt="Beekeper 로고" class="login-logo">
        <h1 class="login-title">스마트폐기물관리플랫폼</h1>
        <p class="login-subtitle">관리자 로그인</p>
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
      
      <div class="login-footer">
        <p>스마트폐기물관리플랫폼 'Beekeper'</p>
        <p class="copyright">© 2025 All Rights Reserved</p>
      </div>
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
        
        this.$router.push({ name: 'dashboard' });
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
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--bg-secondary);
  background-image: url(~@/assets/images/login-bg.jpg);
  background-size: cover;
  background-position: center;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(30, 58, 138, 0.7); /* primary color with opacity */
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.login-header {
  padding: 2rem 2rem 1.5rem;
  text-align: center;
  background-color: var(--bg-tertiary);
}

.login-logo {
  height: 60px;
  margin-bottom: 1rem;
}

.login-title {
  margin: 0;
  color: var(--primary-color);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}

.login-subtitle {
  margin: 0.5rem 0 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.login-form {
  padding: 1.5rem 2rem;
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
}

.loading-spinner {
  display: inline-block;
}

.login-footer {
  padding: 1.5rem 2rem;
  text-align: center;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
}

.login-footer p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-xs);
}

.copyright {
  margin-top: 0.25rem;
  color: var(--text-tertiary);
}

@media (max-width: 480px) {
  .login-card {
    box-shadow: none;
  }
  
  .login-header {
    padding: 1.5rem 1.5rem 1rem;
  }
  
  .login-form,
  .login-footer {
    padding: 1rem 1.5rem;
  }
}
</style>
