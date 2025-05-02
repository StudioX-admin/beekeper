<template>
  <div class="app-container">
    <Header v-if="isAuthenticated && !isLoginPage" />
    <div class="main-container" :class="{ 'with-sidebar': isAuthenticated && !isLoginPage }">
      <Sidebar v-if="isAuthenticated && !isLoginPage" />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  components: {
    Header,
    Sidebar
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
      
      // 사용자 역할에 따라 적절한 페이지로 리다이렉트
      if (this.$route.name === 'Login' || this.$route.name === 'Register') {
        if (user.role === 'admin') {
          this.$router.push({ name: 'AdminDashboard' })
        } else {
          this.$router.push({ name: 'Dashboard' })
        }
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
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
}

.main-container.with-sidebar {
  padding-top: 60px; /* 헤더 높이 */
}

.content {
  flex: 1;
  padding: 20px;
  max-width: 100%;
}

@media (min-width: 992px) {
  .main-container.with-sidebar .content {
    margin-left: 240px; /* 사이드바 너비 */
  }
}

/* 공통 스타일 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
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
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
}
</style>
