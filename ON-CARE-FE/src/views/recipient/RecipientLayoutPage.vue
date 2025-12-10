<template>
  <div class="recipient-page">
    <!-- 상단 제목 / 버튼 -->
    <header class="page-header">
      <div class="title-wrap">
        <h2>수급자 관리</h2>
        <p>수급자 정보 및 서비스 이용 내역 관리</p>
      </div>
      <button class="btn-primary" type="button" @click="showRegist = true">
        + 수급자 등록
      </button>
    </header>

    <!-- 상단 탭 (라우터 기반) -->
    <nav class="sub-tabs">
      <RouterLink :to="{ name: 'recipient-list' }">
        수급자 목록
      </RouterLink>
      <RouterLink :to="{ name: 'recipient-longcare' }">
        장기요양등급만료알림
      </RouterLink>
    </nav>

    <!-- 탭별 화면 -->
    <router-view />

    <!-- 수급자 등록 모달 -->
    <RecipientRegist
      :visible="showRegist"
      @close="showRegist = false"
      @submit="handleRegist"
    />
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import RecipientRegist from '@/components/recipient/RecipientRegist.vue'
  
  const showRegist = ref(false)
  
  const handleRegist = (formData) => {
    console.log('등록 데이터:', formData)
    showRegist.value = false
  }
</script>

<style scoped>
.recipient-page {
  padding: 24px 32px;
  background-color: #f7fafb;
  min-height: calc(100vh - 80px);
  box-sizing: border-box;
}

/* 상단 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.title-wrap h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.title-wrap p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9ca3af;
}
.btn-primary {
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

/* 상단 탭 (다른 탭들이랑 통일) */
.sub-tabs {
  display: flex;
  gap: 40px;
  padding: 20px 0 12px;
  border-bottom: 1px solid #e5e7eb;
}

.sub-tabs a {
  font-size: 15px;
  color: #505667;
  text-decoration: none;
  padding-bottom: 8px;
}

.sub-tabs a.router-link-active {
  color: #16a34a;
  font-weight: 600;
  position: relative;
}

.sub-tabs a.router-link-active::after {
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