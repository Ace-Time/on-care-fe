import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

import authRoutes from './routes/auth.routes'
import dashboardRoutes from './routes/dashboard.routes'
import scheduleRoutes from './routes/schedule.routes'
import employeesRoutes from './routes/employees.routes'
import recipientRoutes from './routes/recipient.routes'
import inquiryRoutes from './routes/inquiry.routes'
import productRoutes from './routes/product.routes'
import tasksRoutes from './routes/tasks.routes'
import careworkerRoutes from './routes/careworker.routes'

const routes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...scheduleRoutes,
  ...employeesRoutes,
  ...recipientRoutes,
  ...inquiryRoutes,
  ...productRoutes,
  ...tasksRoutes,
  ...careworkerRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const user = useUserStore()

  // Pinia 기준으로 로그인 여부 판단
  const isLoggedIn = !!user.token

  // 인증 필요한 페이지인데 로그인 안 했으면 signin으로
  if (to.meta?.requiresAuth && !isLoggedIn) {
    return { name: 'signin', query: { redirect: to.fullPath } }
  }

  // 로그인 했는데 signin으로 가면 대시보드로
  if (to.name === 'signin' && isLoggedIn) {
    if (role === 'CAREWORKER') {
      return { name: 'home' }        // 요양보호사 홈
    } else {
      return { name: 'dashboard' }   // 관리자/사무직 대시보드
    }
  }
})

export default router