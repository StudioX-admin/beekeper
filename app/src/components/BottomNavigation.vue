<template>
  <div class="bottom-navigation">
    <router-link to="/dashboard" class="nav-item" :class="{ active: $route.name === 'Dashboard' }">
      <div class="nav-icon">📋</div>
      <div class="nav-label">할 일</div>
    </router-link>
    
    <router-link to="/completed" class="nav-item" :class="{ active: $route.name === 'Completed' }">
      <div class="nav-icon">✓</div>
      <div class="nav-label">완료</div>
    </router-link>
    
    <router-link to="/profile" class="nav-item" :class="{ active: $route.name === 'Profile' }">
      <div class="nav-icon">👤</div>
      <div class="nav-label">내 정보</div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'BottomNavigation'
}
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  height: 64px;
  max-width: 768px;
  margin: 0 auto;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #757575;
  text-decoration: none;
  padding: 8px 0;
  transition: color 0.3s;
}

.nav-item.active {
  color: #4caf50;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
}
</style>
