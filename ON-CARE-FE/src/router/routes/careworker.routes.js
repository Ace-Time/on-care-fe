import HomePage from '@/views/careworker/home/HomePage.vue'

import ActivityPage from '@/views/careworker/activity/ActivityPage.vue'
import DailyCarePage from '@/views/careworker/activity/DailyCarePage.vue'
import BasicEvalPage from '@/views/careworker/activity/BasicEvalPage.vue'
import VisitCounselPage from '@/views/careworker/activity/VisitCounselPage.vue'

import WorkschedulePage from '@/views/careworker/workschedule/WorkschedulePage.vue'

export default [
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/activity',
    name: 'activity',
    component: ActivityPage,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'activity-care' } },
      { path: 'care', name: 'activity-care', component: DailyCarePage },
      { path: 'basic', name: 'activity-basic', component: BasicEvalPage },
      { path: 'counsel', name: 'activity-counsel', component: VisitCounselPage },
    ],
  },
  {
    path: '/workschedule',
    name: 'workschedule',
    component: WorkschedulePage,
    meta: { requiresAuth: true },
  },
]