<!-- web/src/components/layout/SideNav.vue -->
<template>
  <div class="sidebar">
    <div class="logo-container">
      <img src="@/assets/images/logo.png" alt="Beekeper 로고" class="logo">
    </div>
    <div class="nav-container">
      <ul class="nav-menu">
        <li 
          v-for="item in menuItems" 
          :key="item.name"
          :class="{ 'active': $route.name === item.name }"
        >
          <router-link :to="{ name: item.name }">
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
          </router-link>
        </li>
      </ul>
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
        { name: 'waste-requests', title: '폐기물 요청', icon: 'fas fa-trash' },
        { name: 'drivers', title: '기사 관리', icon: 'fas fa-users' },
        { name: 'vehicles', title: '차량 관리', icon: 'fas fa-truck' },
        { name: 'reports', title: '보고서', icon: 'fas fa-chart-bar' },
        { name: 'settings', title: '설정', icon: 'fas fa-cog' }
      ]
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style scoped>
/* 퍼블리싱 소스의 사이드바 스타일 적용 */
.sidebar {
  width: 240px;
  background-color: #2c3e50;
  color: #ecf0f1;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.logo-container {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  height: 50px;
}

.nav-container {
  flex: 1;
  overflow-y: auto;
  padding-top: 10px;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  position: relative;
}

.nav-menu li a {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  color: #b8c7ce;
  text-decoration: none;
  transition: all 0.3s;
}

.nav-menu li a:hover,
.nav-menu li.active a {
  color: #fff;
  background-color: #1a2530;
}

.nav-menu li a i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 15px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background-color: transparent;
  color: #b8c7ce;
  border: 1px solid #b8c7ce;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255,255,255,0.1);
  color: #fff;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
