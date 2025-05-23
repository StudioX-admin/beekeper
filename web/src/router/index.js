import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { guest: true, title: '로그인' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { guest: true, title: '회원가입' }
    },
    // 수거업체 메뉴
    {
      path: '/transporter',
      component: () => import('@/views/transporter/TransporterLayout.vue'),
      meta: { requiresAuth: true, roles: ['transporter'] },
      children: [
        {
          path: '',
          name: 'transporter-dashboard',
          component: () => import('@/views/transporter/Dashboard.vue'),
          meta: { title: '대시보드' }
        },
        {
          path: 'reservations',
          name: 'transporter-reservations',
          component: () => import('@/views/transporter/ReservationManagement.vue'),
          meta: { title: '예약 관리' }
        },
        {
          path: 'contracts',
          name: 'transporter-contracts',
          component: () => import('@/views/transporter/ContractManagement.vue'),
          meta: { title: '계약 관리' }
        },
        {
          path: 'vehicles',
          name: 'transporter-vehicles',
          component: () => import('@/views/transporter/VehicleManagement.vue'),
          meta: { title: '차량 관리' }
        },
        {
          path: 'users',
          name: 'transporter-users',
          component: () => import('@/views/transporter/UserManagement.vue'),
          meta: { title: '사용자 관리' }
        },
        {
          path: 'profile',
          name: 'transporter-profile',
          component: () => import('@/views/transporter/Profile.vue'),
          meta: { title: '회사 정보' }
        }
      ]
    },
    // 처리업체 메뉴
    {
      path: '/processor',
      component: () => import('@/views/processor/ProcessorLayout.vue'),
      meta: { requiresAuth: true, role: 'processor' },
      children: [
        {
          path: '',
          name: 'ProcessorDashboard',
          component: () => import('@/views/processor/Dashboard.vue')
        },
        {
          path: 'reservations',
          name: 'ReservationManagement',
          component: () => import('@/views/processor/ReservationManagement.vue')
        },
        {
          path: 'contracts',
          name: 'ContractManagement',
          component: () => import('@/views/processor/ContractManagement.vue')
        },
        {
          path: 'facilities',
          name: 'FacilityManagement',
          component: () => import('@/views/processor/FacilityManagement.vue')
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: () => import('@/views/processor/UserManagement.vue')
        },
        {
          path: 'profile',
          name: 'ProcessorProfile',
          component: () => import('@/views/processor/Profile.vue')
        }
      ]
    },
    // 관리자 메뉴
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['platform_admin'] },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '대시보드' }
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UserManagement.vue'),
          meta: { title: '사용자 관리' }
        },
        {
          path: 'contracts',
          name: 'admin-contracts',
          component: () => import('@/views/admin/ContractManagement.vue'),
          meta: { title: '계약 관리' }
        },
        {
          path: 'notices',
          name: 'admin-notices',
          component: () => import('@/views/admin/Notices.vue'),
          meta: { title: '공지사항 관리' }
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/views/admin/Settings.vue'),
          meta: { title: '시스템 설정' }
        }
      ]
    },
    // 공통 메뉴
    {
      path: '/notices',
      name: 'notices',
      component: () => import('@/views/notice/NoticeList.vue'),
      meta: { requiresAuth: true, title: '공지사항' }
    },
    {
      path: '/notices/:id',
      name: 'notice-detail',
      component: () => import('@/views/notice/NoticeDetail.vue'),
      meta: { requiresAuth: true, title: '공지사항 상세' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true, title: '내 정보' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
      meta: { title: '페이지를 찾을 수 없음' }
    }
  ]
})

// 전역 네비게이션 가드
router.beforeEach((to, from, next) => {
  // 페이지 제목 설정
  document.title = to.meta.title ? `${to.meta.title} - Beekeper` : 'Beekeper'
  
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRoles = to.meta.roles
  const isGuest = to.matched.some(record => record.meta.guest)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (isGuest && authStore.isAuthenticated) {
    next('/')
  } else if (requiresAuth && requiredRoles && !requiredRoles.includes(authStore.user?.role)) {
    next('/')
  } else {
    next()
  }
})

export default router
