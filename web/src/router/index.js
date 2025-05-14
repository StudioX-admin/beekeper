import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

// 페이지 컴포넌트 
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import WasteRequests from '../views/WasteRequests.vue'
import WasteRequestDetail from '../views/WasteRequestDetail.vue'
import VehicleManagement from '../views/VehicleManagement.vue'
import DriverManagement from '../views/DriverManagement.vue'
import Settings from '../views/Settings.vue'
import NotFound from '../views/NotFound.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, title: '대시보드' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guest: true, title: '로그인' }
  },
  {
    path: '/waste-requests',
    name: 'waste-requests',
    component: WasteRequests,
    meta: { requiresAuth: true, title: '폐기물 요청 목록' }
  },
  {
    path: '/waste-requests/:id',
    name: 'waste-request-detail',
    component: WasteRequestDetail,
    meta: { requiresAuth: true, title: '폐기물 요청 상세' },
    props: true
  },
  {
    path: '/vehicles',
    name: 'vehicle-management',
    component: VehicleManagement,
    meta: { requiresAuth: true, title: '차량 관리' }
  },
  {
    path: '/drivers',
    name: 'driver-management',
    component: DriverManagement,
    meta: { requiresAuth: true, title: '기사 관리' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
    meta: { requiresAuth: true, title: '설정' }
  },
  {
    path: '*',
    component: NotFound,
    meta: { title: '페이지를 찾을 수 없음' }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

// 전역 네비게이션 가드
router.beforeEach((to, from, next) => {
  // 페이지 제목 설정
  document.title = to.meta.title ? `${to.meta.title} - Beekeper` : 'Beekeper'
  
  const isAuthenticated = store.getters.isAuthenticated
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 인증이 필요한 라우트
    if (!isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    // 게스트 전용 라우트 (로그인 등)
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
