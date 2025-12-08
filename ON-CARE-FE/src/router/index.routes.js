import { createRouter, createWebHistory } from 'vue-router'
import SignIn from '@/views/signPage/SignIn.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'

const routes = [
  // 로그인
  {
    path: '/',
    name: 'signin',
    component: SignIn,
    // component: () => import('@/pages/SingIn.vue'),  // 로그인 페이지에서 공통 헤더 빼고 싶을때
  },
  // 대시보드
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },

  // ✅ 일정 관리
  {
    path: '/schedule',
    name: 'schedule',
    component: () => import('@/views/schedule/Schedule.vue'),
    meta: { requiresAuth: true },
  },

  // ✅ 직원 관리
  {
    path: '/employees',
    name: 'employees',
    component: () => import('@/views/employees/Employees.vue'),
    meta: { requiresAuth: true },
  },

  // ✅ 수급자 관리
  {
    path: '/recipient',
    name: 'recipient',
    component: () => import('@/views/recipient/Recipient.vue'),
    meta: { requiresAuth: true },
  },

  // ✅ 고객 관리 (문의/CRM 등)
  {
    path: '/inquiry',
    name: 'inquiry',
    component: () => import('@/views/inquiry/Inquiry.vue'),
    meta: { requiresAuth: true },
  },

  // ✅ 용품 관리
  {
    path: '/product',
    name: 'product',
    component: () => import('@/views/product/Product.vue'),
    meta: { requiresAuth: true },
  },

  // ✅ 업무 관리
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/tasks/Tasks.vue'),
    meta: { requiresAuth: true },
  },
  // 요양보호사 홈 관리
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/careworker/home/Home.vue'),
    meta: { requiresAuth: true },
  },
  // 요양보호사 활동일지 관리
  {
    path: '/activity',
    name: 'activity',
    component: () => import('@/views/careworker/activity/Activity.vue'),
    meta: { requiresAuth: true },
  },
  // 요양보호사 근무일정 관리
  {
    path: '/workschedule',
    name: 'workschedule',
    component: () => import('@/views/careworker/workschedule/Workschedule.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router