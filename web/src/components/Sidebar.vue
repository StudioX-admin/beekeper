<!-- web/src/components/Sidebar.vue (기존: SideNav.vue로 작성) -->
<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Beekeper 로고" class="logo">
      </div>
    </div>
    
    <div class="sidebar-body">
      <div class="user-info">
        <div class="user-avatar">
          <img :src="userAvatar || require('@/assets/images/default-avatar.png')" alt="사용자 프로필">
        </div>
        <div class="user-details">
          <p class="user-name">{{ userName }}</p>
          <p class="user-role">{{ userRole === 'admin' ? '관리자' : '직원' }}</p>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-menu">
          <li 
            v-for="item in menuItems" 
            :key="item.name"
            :class="{ 'active': $route.name === item.name }"
          >
            <router-link :to="{ name: item.name }">
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
              <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
    
    <div class="sidebar-footer">
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> 로그아웃
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',  // 수정된 컴포넌트 이름
  data() {
    return {
      menuItems: [
        { name: 'dashboard', title: '대시보드', icon: 'fas fa-tachometer-alt' },
        { name: 'waste-requests', title: '폐기물 요청', icon: 'fas fa-trash', badge: '12' },
        { name: 'driver-management', title: '기사 관리', icon: 'fas fa-users' },  // 실제 파일 이름에 맞게 수정
        { name: 'vehicle-management', title: '차량 관리', icon: 'fas fa-truck' },  // 실제 파일 이름에 맞게 수정
        { name: 'settings', title: '설정', icon: 'fas fa-cog' }
      ]
    }
  },
  computed: {
    userName() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.name : '사용자';
    },
    userRole() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.role : 'admin';
    },
    userAvatar() {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.profileImage : null;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout').then(() => {
        this.$router.push({ name: 'login' });
      });
    }
  }
}
</script>

<style lang="scss">
// 스타일 코드는 동일하게 유지하되, SCSS 문법으로 변경
@import '../assets/scss/variables.scss';

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-sidebar);
  color: var(--text-light);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  // 기존 스타일 유지...
}
</style>
