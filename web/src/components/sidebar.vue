<template>
  <div class="sidebar" :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <div class="sidebar-logo">스마트폐기물관리</div>
      <button @click="closeSidebar" class="close-sidebar">×</button>
    </div>
    
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" active-class="active">
          <span class="nav-icon">📊</span>
          <span class="nav-text">대시보드</span>
        </router-link>
        
        <router-link to="/waste-requests" class="nav-item" active-class="active">
          <span class="nav-icon">📋</span>
          <span class="nav-text">폐기물 요청</span>
        </router-link>
        
        <router-link to="/vehicles" class="nav-item" active-class="active">
          <span class="nav-icon">🚚</span>
          <span class="nav-text">차량 관리</span>
        </router-link>
        
        <router-link to="/drivers" class="nav-item" active-class="active">
          <span class="nav-icon">👨‍💼</span>
          <span class="nav-text">기사 관리</span>
        </router-link>
        
        <router-link to="/settings" class="nav-item" active-class="active">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">설정</span>
        </router-link>
      </nav>
    </div>
    
    <div class="sidebar-footer">
      <div class="app-version">Version 1.0.0</div>
    </div>
  </div>
  
  <div v-if="isOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
</template>

<script>
export default {
  name: 'Sidebar',
  
  data() {
    return {
      isOpen: false
    }
  },
  
  mounted() {
    this.$root.$on('toggle-sidebar', this.toggleSidebar)
    
    // 화면 크기 변경 감지
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  
  beforeUnmount() {
    this.$root.$off('toggle-sidebar', this.toggleSidebar)
    window.removeEventListener('resize', this.handleResize)
  },
  
  methods: {
    toggleSidebar() {
      this.isOpen = !this.isOpen
    },
    
    closeSidebar() {
      this.isOpen = false
    },
    
    handleResize() {
      // 화면이 큰 경우 사이드바 자동으로 표시
      if (window.innerWidth >= 992) {
        this.isOpen = false
      }
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background-color: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: transform 0.3s ease;
  transform: translateX(-100%);
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-logo {
  font-size: 18px;
  font-weight: 700;
  color: #4caf50;
}

.close-sidebar {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #555;
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-item.active {
  background-color: #e8f5e9;
  color: #4caf50;
  border-left: 3px solid #4caf50;
}

.nav-icon {
  margin-right: 12px;
  font-size: 18px;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 190;
}

/* 대형 화면에서는 항상 표시 */
@media (min-width: 992px) {
  .sidebar {
    transform: translateX(0);
    z-index: 100;
  }
  
  .close-sidebar {
    display: none;
  }
  
  .sidebar-backdrop {
    display: none;
  }
}
</style>
