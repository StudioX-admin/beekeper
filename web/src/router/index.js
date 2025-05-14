// web/src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'

// 페이지 컴포넌트 (실제 파일 경로에 맞게 수정)
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import WasteRequests from '../views/WasteRequests.vue'
import WasteRequestDetail from '../views/WasteRequestDetail.vue'
import DriverManagement from '../views/DriverManagement.vue'
import VehicleManagement from '../views/VehicleManagement.vue'
import Settings from '../views/Settings.vue'
import Register from '../views/Register.vue'
import NotFound from '../views/NotFound.vue'
import CreateWasteRequest from '../views/CreateWasteRequest.vue'

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
    path: '/register',
    name: 'register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/waste-requests',
    name: 'waste-requests',
    component: WasteRequests,
    meta: { requiresAuth: true }
  },
  {
    path: '/waste-requests/:id',
    name: 'waste-request-detail',
    component: WasteRequestDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-waste-request',
    name: 'create-waste-request',
    component: CreateWasteRequest,
    meta: { requiresAuth: true }
  },
  {
    path: '/driver-management',
    name: 'driver-management',
    component: DriverManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/vehicle-management',
    name: 'vehicle-management',
    component: VehicleManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound
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
