import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// 페이지 컴포넌트 불러오기
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import WasteRequests from '../views/WasteRequests.vue'
import WasteRequestDetail from '../views/WasteRequestDetail.vue'
import CreateWasteRequest from '../views/CreateWasteRequest.vue'
import VehicleManagement from '../views/VehicleManagement.vue'
import DriverManagement from '../views/DriverManagement.vue'
import Settings from '../views/Settings.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/waste-requests',
    name: 'WasteRequests',
    component: WasteRequests,
    meta: { requiresAuth: true }
  },
  {
    path: '/waste-requests/create',
    name: 'CreateWasteRequest',
    component: CreateWasteRequest,
    meta: { requiresAuth: true }
  },
  {
    path: '/waste-requests/:id',
    name: 'WasteRequestDetail',
    component: WasteRequestDetail,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/vehicles',
    name: 'VehicleManagement',
    component: VehicleManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/drivers',
    name: 'DriverManagement',
    component: DriverManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
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
  // 관리자 권한이 필요한 페이지 접근 제한
  else if (to.meta.requiresAdmin && userRole !== 'admin') {
    next({ name: 'WasteRequests' })
  }
  // 이미 로그인한 상태에서 로그인/회원가입 페이지 접근 시 리다이렉트
  else if (!to.meta.requiresAuth && isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    if (userRole === 'admin') {
      next({ name: 'AdminDashboard' })
    } else {
      next({ name: 'WasteRequests' })
    }
  }
  else {
    next()
  }
})

export default router
