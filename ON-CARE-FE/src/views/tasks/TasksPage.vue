<template>
  <div class="tasks-page">

    <!-- 상단 헤더 -->
    <div class="page-header">
      <div class="title-area">
        <h1 class="page-title">업무 관리</h1>
        <p class="page-desc">전자 결재 및 시설관리 업무</p>
      </div>
    </div>

    <!-- 탭 박스 -->
    <div class="tabs-box">
      <div class="inner-tabs">

        <RouterLink
          :to="{ name: 'tasks-approval' }"
          class="tab-item"
          :class="{ active: isActive('tasks-approval') }"
        >
          전자 결재
        </RouterLink>

        <RouterLink
          :to="{ name: 'tasks-facility' }"
          class="tab-item"
          :class="{ active: isActive('tasks-facility') }"
        >
          시설 관리
        </RouterLink>

      </div>

      <div class="tab-content">
        <RouterView />
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (name) => route.name === name
</script>

<style scoped>
.tasks-page {
  padding: 0 24px 24px;
}

/* 상단 헤더 */
.page-header {
  padding: 28px 0 12px;
}

/* 제목 + 설명 */
.title-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  margin: 0;
}

/* 카드형 탭 박스 */
.tabs-box {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  padding: 20px 24px;
  margin-top: 16px;
}

/* 탭 라인 */
.inner-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #e2e8f0;
  margin-top: 8px;
}

/* 탭 아이템 */
.tab-item {
  padding: 12px 0;
  font-size: 16px;
  color: #4a5565;
  text-decoration: none;
  position: relative;
}

/* 활성 탭 */
.tab-item.active {
  color: #00a63e;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 3px;
  background-color: #00a63e;
  border-radius: 999px;
}

/* 아래 컨텐츠 */
.tab-content {
  padding-top: 16px;
}
</style>
