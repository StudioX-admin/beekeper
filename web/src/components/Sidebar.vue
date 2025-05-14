<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="@/assets/images/logo.png" alt="Beekeper 로고" class="logo">
      </div>
      <button class="toggle-btn" @click="toggleSidebar">
        <i :class="isCollapsed ? 'fas fa-bars' : 'fas fa-times'"></i>
      </button>
    </div>
    
    <div class="sidebar-body">
      <div class="user-info" v-if="!isCollapsed">
        <div class="user-avatar">
          <img :src="userAvatar" alt="사용자 프로필">
        </div>
        <div class="user-details">
          <p class="user-name">{{ userName }}</p>
          <p class="user-role">{{ userRoleDisplay }}</p>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-menu">
          <li 
            v-for="item in menuItems" 
            :key="item.name"
            :class="{ 'active': isActive(item.name) }"
          >
            <router-link :to="{ name: item.name }">
              <i :class="item.icon"></i>
              <span v-if="!isCollapsed">{{ item.title }}</span>
              <span v-if="!isCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
    
    <div class="sidebar-footer">
      <button @click="logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        <span v-if="!isCollapsed">로그아웃</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Sidebar',
  data() {
    return {
      isCollapsed: false,
      menuItems: [
        { name: 'dashboard', title: '대시보드', icon: 'fas fa-tachometer-alt' },
        { name: 'waste-requests', title: '폐기물 요청', icon: 'fas fa-trash', badge: '12' },
        { name: 'driver-management', title: '기사 관리', icon: 'fas fa-users' },
        { name: 'vehicle-management', title: '차량 관리', icon: 'fas fa-truck' },
        { name: 'settings', title: '설정', icon: 'fas fa-cog' }
      ]
    }
  },
  computed: {
    ...mapGetters(['currentUser']),
    
    userName() {
      return this.currentUser ? this.currentUser.name : '사용자'
    },
    userRoleDisplay() {
      if (!this.currentUser) return ''
      return this.currentUser.role === 'admin' ? '관리자' : '직원'
    },
    userAvatar() {
      return this.currentUser && this.currentUser.profileImage 
        ? this.currentUser.profileImage 
        : require('@/assets/images/default-avatar.png')
    }
  },
  methods: {
    ...mapActions(['logout']),
    
    isActive(routeName) {
      // 현재 라우트 또는 부모 라우트 일치 여부 확인
      return this.$route.name === routeName || 
             (this.$route.matched.length > 0 && 
              this.$route.matched.some(record => record.name === routeName))
    },
    
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
      // 반응형을 위해 이벤트 발생
      this.$root.$emit('sidebar-toggle', this.isCollapsed)
    }
  },
  // 모바일에서 자동으로 접힘
  mounted() {
    const checkWidth = () => {
      if (window.innerWidth < 768) {
        this.isCollapsed = true
      }
    }
    
    window.addEventListener('resize', checkWidth)
    checkWidth() // 초기 확인
    
    // 컴포넌트 제거 시 이벤트 리스너 제거
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', checkWidth)
    })
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  background-color: var(--bg-sidebar, #1e3a8a);
  color: var(--text-light, #f9fafb);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: width 0.3s ease;
  
  // 사이드바 접혔을 때 스타일
  &.sidebar-collapsed {
    width: 70px;
    
    .logo-container {
      padding: 10px;
      
      .logo {
        transform: scale(0.8);
      }
    }
    
    .nav-menu li a {
      justify-content: center;
      padding: 12px;
    }
    
    .sidebar-footer .logout-btn {
      justify-content: center;
      padding: 10px;
    }
  }
  
  // 나머지 스타일은 기존과 동일...
}

// 반응형 스타일 추가
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    
    &.open {
      transform: translateX(0);
    }
    
    &.sidebar-collapsed {
      transform: translateX(0);
    }
  }
}
</style>
