<template>
  <div class="tasks-container">
    <div class="title-area">
      <h1 class="page-title">업무 관리</h1>
      <p class="page-desc">전자 결재 및 시설관리 업무</p>
    </div>

    <nav class="tab-nav">
      <RouterLink :to="{ name: 'tasks-approval' }">전자 결재</RouterLink>
      <RouterLink :to="{ name: 'tasks-facility' }">시설 관리</RouterLink>
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

.tab-nav a {
  font-size: 15px;
  color: #505667;
  text-decoration: none;
  padding-bottom: 8px;
}

.tab-nav a.router-link-active {
  color: #16a34a;
  font-weight: 600;
  position: relative;
}

.tab-nav a.router-link-active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 3px;
  background-color: #16a34a;
  border-radius: 4px;
}
</style>