import InquiryPage from '@/views/inquiry/InquiryPage.vue'
import ConsultManagePage from '@/views/inquiry/ConsultManagePage.vue'
import CustomerManagePage from '@/views/inquiry/CustomerManagePage.vue'

export default [
  {
    path: '/inquiry',
    name: 'inquiry',
    component: InquiryPage,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'inquiry-consult' } },
      { path: 'consult', name: 'inquiry-consult', component: ConsultManagePage },
      { path: 'customer', name: 'inquiry-customer', component: CustomerManagePage },
    ],
  },
]