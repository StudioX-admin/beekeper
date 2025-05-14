<!-- app/src/components/App.vue -->
<template>
  <div id="app">
    <div class="app-container">
      <router-view />
      <BottomNavigation v-if="isAuthenticated" />
    </div>
  </div>
</template>

<script>
import BottomNavigation from './BottomNavigation.vue'  // 수정된 컴포넌트 이름

export default {
  name: 'App',
  components: {
    BottomNavigation
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('token')
    }
  }
}
</script>

<style>
/* 스타일 코드는 동일하게 유지 */
</style>
