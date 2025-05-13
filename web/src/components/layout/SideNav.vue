<!-- web/src/components/layout/SideNav.vue -->
<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="@/assets/images/logo.png" alt="Beekeper 로고" class="logo">
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
  name: 'SideNav',
  data() {
    return {
      menuItems: [
        { name: 'dashboard', title: '대시보드', icon: 'fas fa-tachometer-alt' },
        { name: 'waste-requests', title: '폐기물 요청', icon: 'fas fa-trash', badge: '12' },
        { name: 'drivers', title: '기사 관리', icon: 'fas fa-users' },
        { name: 'vehicles', title: '차량 관리', icon: 'fas fa-truck' },
        { name: 'reports', title: '보고서', icon: 'fas fa-chart-bar' },
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

<style scoped>
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
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal) var(--easing-default);
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  text-align: center;
}

.logo {
  height: 40px;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding-top: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.75rem;
  background-color: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  min-width: 0; /* 텍스트 오버플로 처리를 위함 */
}

.user-name {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin: 0;
  font-size: var(--text-xs);
  color: rgba(255, 255, 255, 0.7);
}

.sidebar-nav {
  padding: 0 0.75rem;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  margin-bottom: 0.25rem;
  border-radius: var(--border-radius-sm);
  transition: background-color var(--transition-fast) var(--easing-default);
}

.nav-menu li a {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: color var(--transition-fast) var(--easing-default);
  border-radius: var(--border-radius-sm);
}

.nav-menu li a i {
  width: 1.25rem;
  margin-right: 0.75rem;
  font-size: var(--text-base);
  text-align: center;
}

.nav-menu li a span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-light);
  background-color: var(--accent-color);
  border-radius: 9999px;
  margin-left: 0.5rem;
}

.nav-menu li a:hover {
  color: var(--text-light);
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-menu li.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-menu li.active a {
  color: var(--text-light);
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: 
    background-color var(--transition-fast) var(--easing-default),
    color var(--transition-fast) var(--easing-default);
}

.logout-btn i {
  margin-right: 0.5rem;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 반응형 처리 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
