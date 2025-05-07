import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import CreateWasteRequest from '../views/CreateWasteRequest.vue';
import WasteRequestDetail from '../views/WasteRequestDetail.vue';
import Settings from '../views/Settings.vue';
import NotFound from '../views/NotFound.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/create-waste-request',
    name: 'CreateWasteRequest',
    component: CreateWasteRequest,
    meta: { requiresAuth: true }
  },
  {
    path: '/waste-requests/:id',
    name: 'WasteRequestDetail',
    component: WasteRequestDetail,
    meta: { requiresAuth: true }
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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  
  // Route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } 
  // Route is for guests only (like login)
  else if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
    next('/');
  } 
  // Otherwise proceed normally
  else {
    next();
  }
});

export default router;
