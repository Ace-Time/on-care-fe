import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '@/views/signPage/SignIn.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'signin',
    component: SignIn,
  },

  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }, // 선택
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router