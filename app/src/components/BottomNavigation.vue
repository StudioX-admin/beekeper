<!-- app/src/components/BottomNavigation.vue (기존: NavBar.vue로 작성) -->
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
  name: 'BottomNavigation',  // 수정된 컴포넌트 이름
  data() {
    return {
      navItems: [
        { name: 'dashboard', title: '작업', icon: 'fas fa-clipboard-list' },
        { name: 'completed', title: '완료', icon: 'fas fa-check-circle' },  // 실제 파일 구조에 맞게 수정
        { name: 'profile', title: '내 정보', icon: 'fas fa-user' }
      ]
    }
  }
}
</script>

<style>
/* 스타일 코드는 동일하게 유지 */
</style>
