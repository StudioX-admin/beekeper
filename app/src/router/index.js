import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// 페이지 컴포넌트 불러오기
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import RequestDetail from '../views/RequestDetail.vue'
import Completed from '../views/Completed.vue'
import Profile from '../views/Profile.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/request/:id',
    name: 'RequestDetail',
    component: RequestDetail,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/completed',
    name: 'Completed',
    component: Completed,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 네비게이션 가드
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated
  const userRole = store.getters.user?.role
  
  // 인증이 필요한 페이지 접근 제한
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } 
  // 인증된 사용자가 로그인 페이지 접근 시 대시보드로 리다이렉트
  else if (!to.meta.requiresAuth && isAuthenticated && to.name === 'Login') {
    next({ name: 'Dashboard' })
  }
  // 기사가 아닌 사용자에게 앱 접근 제한
  else if (isAuthenticated && userRole !== 'driver' && to.name !== 'Login') {
    alert('이 앱은 수거 기사 전용입니다.')
    next({ name: 'Login' })
  }
  else {
    next()
  }
})

export default router
