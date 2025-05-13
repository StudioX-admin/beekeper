<!-- app/src/App.vue -->
<template>
  <div id="app">
    <div class="app-container">
      <HeaderBar v-if="isAuthenticated" />
      <router-view />
      <NavBar v-if="isAuthenticated" />
    </div>
  </div>
</template>

<script>
import HeaderBar from '@/components/layout/HeaderBar.vue'
import NavBar from '@/components/layout/NavBar.vue'

export default {
  name: 'App',
  components: {
    HeaderBar,
    NavBar
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('token')
    }
  }
}
</script>

<style>
/* 퍼블리싱 소스의 글로벌 스타일 적용 */
@import './assets/css/normalize.css';
@import './assets/css/mobile.css';

#app {
  font-family: 'Noto Sans KR', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  min-height: 100vh;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f5f7f9;
}
</style>
