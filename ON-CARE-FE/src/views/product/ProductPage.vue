<template>
  <div class="title-area">
    <h1 class="page-title">용품 관리</h1>
    <p class="page-desc">복지용구 렌탈 및 재고 관리</p>
  </div>
  <div class="product">
    <nav>
      <RouterLink :to="{ name: 'product-master' }">용품 마스터</RouterLink>
      <RouterLink :to="{ name: 'product-manage' }">관리 용품</RouterLink>
      <RouterLink :to="{ name: 'product-rental-contract' }">렌탈 계약</RouterLink>
      <RouterLink :to="{ name: 'product-inout-plan' }">입출고 예정</RouterLink>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.title-area {
  padding: 24px 32px 0;
}

.page-title {
  font-size: 30px;
  font-weight: 600;
  color: #1a5928;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #4a5565;
  margin: 4px 0 0;
}

.product {
  padding: 0 32px 24px;
}

.product nav {
  display: flex;
  gap: 40px;
  padding: 20px 0 12px;
  border-bottom: 1px solid #eaeaea;
}

.product a {
  font-size: 15px;
  color: #505667;
  text-decoration: none;
  padding-bottom: 8px;
}

</style>