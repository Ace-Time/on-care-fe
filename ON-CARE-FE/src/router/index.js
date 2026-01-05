import { createRouter, createWebHistory } from 'vue-router'

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

export default router