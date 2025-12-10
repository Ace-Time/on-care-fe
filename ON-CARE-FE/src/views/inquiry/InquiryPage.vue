<template>
  <div class="inquiry-container">
    <div class="title-area">
      <h1 class="page-title">고객 관리</h1>
      <p class="page-desc">상담 이력 및 고객 정보를 관리합니다</p>
    </div>

    <nav class="tab-nav">
      <RouterLink :to="{ name: 'inquiry-consult' }">상담 관리</RouterLink>
      <RouterLink :to="{ name: 'inquiry-customer' }">고객 관리</RouterLink>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.tab-nav {
  display: flex;
  gap: 40px;
  padding: 20px 0 12px;
  border-bottom: 1px solid #eaeaea;
}
</style>