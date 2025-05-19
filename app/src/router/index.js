// app/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from "layouts-generated"
import routes from "~pages"
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

// 네비게이션 가드
router.beforeEach((to, from, next) => {
  const { user } = useAuth()
  
  if (to.meta.requiresAuth && !user.value) {
    next('/login')
  } else if (to.meta.requiresAdmin && user.value?.role !== 'ADMIN') {
    next('/home')
  } else {
    next()
  }
})

export default router
