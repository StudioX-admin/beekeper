<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-logo">
        <img src="@/assets/logo.png" alt="스마트폐기물관리 로고" />
      </div>
      <h1 class="login-title">스마트폐기물관리</h1>
      <p class="login-subtitle">수거 기사용 앱</p>
      
      <div class="login-form">
        <div class="form-group">
          <label for="username">아이디</label>
          <input
            type="text"
            id="username"
            v-model="username"
            class="form-control"
            placeholder="아이디를 입력하세요"
            @keypress.enter="doLogin"
          />
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-control"
            placeholder="비밀번호를 입력하세요"
            @keypress.enter="doLogin"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button @click="doLogin" class="login-btn" :disabled="loading || !isFormValid">
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  computed: {
    ...mapGetters(['loading', 'error']),
    isFormValid() {
      return this.username.trim() !== '' && this.password.trim() !== ''
    }
  },
  methods: {
    ...mapActions(['login']),
    async doLogin() {
      if (!this.isFormValid) return
      
      try {
        await this.login({
          username: this.username,
          password: this.password
        })
        
        this.$router.push({ name: 'Dashboard' })
      } catch (error) {
        // 에러는 스토어에서 처리
        console.error('로그인 오류', error)
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-container {
  background-color: white;
  width: 100%;
  max-width: 400px;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.login-logo {
  text-align: center;
  margin-bottom: 24px;
}

.login-logo img {
  height: 80px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  color: #333;
}

.login-subtitle {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
}

.login-form {
  margin-top: 24px;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #555;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #4caf50;
  outline: none;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 16px;
}

.login-btn:hover:not(:disabled) {
  background-color: #43a047;
}

.login-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}
</style>
