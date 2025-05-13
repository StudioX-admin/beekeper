// web/src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'

// 페이지 컴포넌트
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import WasteRequests from '../views/WasteRequests.vue'
import Drivers from '../views/Drivers.vue'
import Vehicles from '../views/Vehicles.vue'
import Reports from '../views/Reports.vue'
import Settings from '../views/Settings.vue'

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
    path: '/waste-requests',
    name: 'waste-requests',
    component: WasteRequests,
    meta: { requiresAuth: true }
  },
  {
    path: '/drivers',
    name: 'drivers',
    component: Drivers,
    meta: { requiresAuth: true }
  },
  {
    path: '/vehicles',
    name: 'vehicles',
    component: Vehicles,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
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
      next({ name: 'dashboard' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
