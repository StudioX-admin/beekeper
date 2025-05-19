<!-- app/src/App.vue -->
<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* 퍼블리싱 소스의 글로벌 스타일 적용 */
@import './assets/css/reset.css';
@import './assets/css/layout.css';

#app {
  font-family: 'Pretendard', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #200C05;
  min-height: 100vh;
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
  background-color: #ffffff;
}
</style>
