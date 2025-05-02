<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-logo">
        <img src="@/assets/logo.png" alt="스마트폐기물관리 로고" />
      </div>
      <h1 class="login-title">스마트폐기물관리</h1>
      <p class="login-subtitle">관리자 웹 사이트</p>
      
      <div class="login-form">
        <div class="form-group">
          <label for="username">아이디</label>
          <input
            type="text"
            id="username"
            v-model="username"
            class="form-control"
            placeholder="아이디를 입력하세요"
            @keypress.enter="login"
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
            @keypress.enter="login"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button @click="login" class="login-btn" :disabled="loading || !isFormValid">
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
        
        <div class="login-options">
          <router-link to="/register" class="register-link">계정 만들기</router-link>
        </div>
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
        const user = await this.login({
          username: this.username,
          password: this.password
        })
        
        // 사용자 역할에 따라 리다이렉트
        if (user.role === 'admin') {
          this.$router.push({ name: 'AdminDashboard' })
        } else {
          this.$router.push({ name: 'WasteRequests' })
        }
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
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.login-logo {
  text-align: center;
  margin-bottom: 20px;
}

.login-logo img {
  height: 60px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 5px;
  color: #333;
}

.login-subtitle {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #4caf50;
  outline: none;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
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
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 15px;
}

.login-options {
  margin-top: 20px;
  text-align: center;
}

.register-link {
  color: #4caf50;
  text-decoration: none;
  font-size: 14px;
}

.register-link:hover {
  text-decoration: underline;
}

          