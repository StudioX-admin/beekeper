<!-- app/src/components/layout/NavBar.vue -->
<template>
  <nav class="nav-bar">
    <router-link 
      v-for="item in navItems" 
      :key="item.name" 
      :to="{ name: item.name }" 
      class="nav-item" 
      :class="{ active: $route.name === item.name }"
    >
      <i :class="item.icon"></i>
      <span>{{ item.title }}</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      navItems: [
        { name: 'tasks', title: '작업', icon: 'fas fa-clipboard-list' },
        { name: 'history', title: '이력', icon: 'fas fa-history' },
        { name: 'profile', title: '내 정보', icon: 'fas fa-user' }
      ]
    }
  }
}
</script>

<style scoped>
.nav-bar {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  background-color: var(--bg-primary);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast) var(--easing-default);
}

.nav-item i {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.nav-item span {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-item:active {
  opacity: 0.7;
}
</style>
