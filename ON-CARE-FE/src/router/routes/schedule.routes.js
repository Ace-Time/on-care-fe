import SchedulePage from '@/views/schedule/SchedulePage.vue'
import CalendarPage from '@/views/schedule/CalendarPage.vue'
import MatchingPage from '@/views/schedule/MatchingPage.vue'

export default [
  {
    path: '/schedule',
    name: 'schedule',
    component: SchedulePage,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'schedule-calendar' } },
      { path: 'calendar', name: 'schedule-calendar', component: CalendarPage },
      { path: 'matching', name: 'schedule-matching', component: MatchingPage },
    ],
  },
]