<!-- web/src/App.vue -->
<template>
  <div id="app">
    <SideNav v-if="isAuthenticated" />
    <div class="main-content" :class="{ 'with-sidebar': isAuthenticated }">
      <TopNav v-if="isAuthenticated" />
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import SideNav from '@/components/layout/SideNav.vue'
import TopNav from '@/components/layout/TopNav.vue'

export default {
  name: 'App',
  components: {
    SideNav,
    TopNav
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
@import './assets/css/reset.css';
@import './assets/css/global.css';

#app {
  font-family: 'Noto Sans KR', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content.with-sidebar {
  margin-left: 240px;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  background-color: #f5f7f9;
}

@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 0;
  }
}
</style>
