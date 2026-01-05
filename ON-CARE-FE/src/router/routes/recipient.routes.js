import RecipientLayoutPage from '@/views/recipient/RecipientLayoutPage.vue'
import RecipientListPage from '@/views/recipient/RecipientListPage.vue'
import LongCarePage from '@/views/recipient/LongCarePage.vue'

export default [
  {
    path: '/recipient',
    name: 'recipient',
    component: RecipientLayoutPage,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'recipient-list' } },
      { path: 'list', name: 'recipient-list', component: RecipientListPage },
      { path: 'longcare', name: 'recipient-longcare', component: LongCarePage },
    ],
  },
]