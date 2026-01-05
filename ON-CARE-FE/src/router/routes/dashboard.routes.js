import DashboardPage from '@/views/dashboard/DashboardPage.vue'

export default [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
]