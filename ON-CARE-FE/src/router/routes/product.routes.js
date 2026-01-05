import ProductPage from '@/views/product/ProductPage.vue'
import ProductMasterPage from '@/views/product/ProductMasterPage.vue'
import ProductManagePage from '@/views/product/ProductManagePage.vue'
import RentalContractPage from '@/views/product/RentalContractPage.vue'
import InoutPlanPage from '@/views/product/InoutPlanPage.vue'

export default [
  {
    path: '/product',
    name: 'product',
    component: ProductPage,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'product-master' } },
      { path: 'master', name: 'product-master', component: ProductMasterPage },
      { path: 'manage', name: 'product-manage', component: ProductManagePage },
      { path: 'rental-contract', name: 'product-rental-contract', component: RentalContractPage },
      { path: 'inout-plan', name: 'product-inout-plan', component: InoutPlanPage },
    ],
  },
]