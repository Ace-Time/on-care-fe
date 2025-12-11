<!-- src/components/recipient/RecipientCategory.vue -->
<template>
  <div class="card">
    <!-- 상단 탭 -->
    <nav class="bottom-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="bottom-tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- 탭 컨텐츠 -->
    <div class="bottom-content">
      <!-- 일정 관리 -->
      <Calender v-if="activeTab === 'schedule'" />

      <!-- 서비스 / 렌탈 -->
      <ServiceRental
        v-else-if="activeTab === 'service'"
        :service-history="serviceHistory"
        :rental-items="rentalItems"
      />

      <!-- 기록 관리 -->
      <Record v-else-if="activeTab === 'record'" />

      <!-- 상담 -->
      <Counsel v-else-if="activeTab === 'counsel'" />

      <!-- 문의 이력 -->
      <Inquiry v-else-if="activeTab === 'inquiry'" />

      <!-- 서류 관리 -->
      <Document v-else-if="activeTab === 'files'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import Calender from '@/components/recipient/main/category/Calender.vue'
import ServiceRental from '@/components/recipient/main/category/ServiceRental.vue'
import Record from '@/components/recipient/main/category/Record.vue'
import Counsel from '@/components/recipient/main/category/Counsel.vue'
import Inquiry from '@/components/recipient/main/category/Inquiry.vue'
import Document from '@/components/recipient/main/category/Document.vue'

const props = defineProps({
  serviceHistory: {
    type: Array,
    default: () => []
  },
  rentalItems: {
    type: Array,
    default: () => []
  }
})

// 상단 탭 정의 (로컬 상태로 관리)
const tabs = [
  { key: 'schedule', label: '일정 관리' },
  { key: 'service',  label: '서비스/렌탈' },
  { key: 'record',   label: '기록 관리' },
  { key: 'counsel',  label: '상담' },
  { key: 'inquiry',  label: '문의이력' },
  { key: 'files',    label: '서류관리' }
]

const activeTab = ref('schedule')
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04);
}

/* 상단 탭 영역 */
.bottom-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #e5e7eb;
  margin: 0 -16px 8px;
  padding: 0 16px;
}

/* 탭 버튼 기본 스타일 */
.bottom-tab-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 10px 0 8px;
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 0;
}

/* 활성 탭 */
.bottom-tab-btn.active {
  background: transparent;
  color: #16a34a;
  font-weight: 600;
}

/* 활성 탭 밑줄 */
.bottom-tab-btn.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background-color: #16a34a;
  border-radius: 999px;
}

/* 컨텐츠 영역 */
.bottom-content {
  font-size: 13px;
  padding-top: 8px;
}
</style>
