import EmployeesPage from '@/views/employees/EmployeesPage.vue'

export default [
  {
    path: '/employees',
    name: 'employees',
    component: EmployeesPage,
    meta: { requiresAuth: true },
  },
]