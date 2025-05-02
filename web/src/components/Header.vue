<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo-area">
        <button @click="toggleSidebar" class="menu-toggle">
          <span class="menu-icon">≡</span>
        </button>
        <div class="logo">스마트폐기물관리</div>
      </div>
      
      <div class="header-actions">
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
        <button @click="logout" class="logout-btn">로그아웃</button>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Header',
  
  computed: {
    ...mapGetters(['user']),
    
    userName() {
      return this.user?.name || '사용자'
    },
    
    userInitial() {
      return (this.user?.name || '?')[0].toUpperCase()
    }
  },
  
  methods: {
    ...mapActions(['logout']),
    
    toggleSidebar() {
      this.$root.$emit('toggle-sidebar')
    },
    
    async handleLogout() {
      await this.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-area {
  display: flex;
  align-items: center;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-right: 15px;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.menu-toggle:hover {
  background-color: #f5f5f5;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #4caf50;
}

.header-actions {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.user-name {
  margin-right: 10px;
  font-size: 14px;
  color: #555;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.logout-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: #f5f5f5;
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
  
  .menu-toggle {
    margin-right: 10px;
  }
}

@media (max-width: 576px) {
  .header-content {
    padding: 0 10px;
  }
  
  .logo {
    font-size: 16px;
  }
}
</style>
