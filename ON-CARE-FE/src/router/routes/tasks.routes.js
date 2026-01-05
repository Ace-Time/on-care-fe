import TasksPage from '@/views/tasks/TasksPage.vue'
import ApprovalPage from '@/views/tasks/ApprovalPage.vue'

export default [
  {
    path: '/tasks',
    name: 'tasks',
    component: TasksPage,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'tasks-approval' } },
      { path: 'approval', name: 'tasks-approval', component: ApprovalPage },
    ],
  },
]