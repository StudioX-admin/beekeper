<template>
  <div class="app-container">
    <router-view />
    <BottomNavigation v-if="isAuthenticated && !isLoginPage" />
  </div>
</template>

<script>
import BottomNavigation from '@/components/BottomNavigation.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    BottomNavigation
  },
  computed: {
    ...mapGetters(['isAuthenticated']),
    isLoginPage() {
      return this.$route.name === 'Login' || this.$route.name === 'Register'
    }
  },
  created() {
    // 페이지 로드 시 로컬 스토리지에서 인증 정보 복원
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (token && user) {
      this.$store.dispatch('setAuth', { token, user })
      
      // 사용자 역할이 기사가 아닌 경우 접근 제한
      if (user.role !== 'driver' && this.$route.name !== 'Login') {
        alert('이 앱은 수거 기사 전용입니다.')
        this.$router.push({ name: 'Login' })
      }
    } else if (this.$route.name !== 'Login' && this.$route.name !== 'Register') {
      // 인증 정보가 없고 로그인/회원가입 페이지가 아닌 경우 로그인 페이지로 리다이렉트
      this.$router.push({ name: 'Login' })
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #f5f5f5;
  color: #333;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none; /* 모바일에서 당겨서 새로고침 방지 */
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 768px; /* 모바일 앱 최대 너비 */
  margin: 0 auto;
  position: relative;
}

/* 공통 스타일 */
.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #4caf50;
  color: white;
}

.btn-secondary {
  background-color: #2196f3;
  color: white;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
}

/* 상태 표시 뱃지 */
.status-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff8e1;
  color: #ff8f00;
}

.status-badge.assigned {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.in-progress {
  background-color: #e8f5e9;
  color: #43a047;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

/* 페이지 공통 스타일 */
.page-container {
  padding: 16px;
  padding-bottom: 80px; /* 하단 네비게이션 높이만큼 여백 */
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #333;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

/* 로딩 인디케이터 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #999;
}
