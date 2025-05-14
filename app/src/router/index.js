// app/src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'

// 페이지 컴포넌트 (실제 파일 경로에 맞게 수정)
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import RequestDetail from '../views/RequestDetail.vue'
import Profile from '../views/Profile.vue'
import Completed from '../views/Completed.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guest: true }
  },
  {
    path: '/request/:id',
    name: 'request-detail',
    component: RequestDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/completed',
    name: 'completed',
    component: Completed,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 인증 가드 설정
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      next({ name: 'tasks' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
