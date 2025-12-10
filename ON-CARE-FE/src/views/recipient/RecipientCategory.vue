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
      <!-- 서비스 / 렌탈 -->
      <template v-if="activeTab === 'service'">
        <div class="service-layout">
          <div class="service-col">
            <h4>서비스 내역</h4>
            <ul class="service-list">
              <li
                v-for="item in serviceHistory"
                :key="item.code"
                class="service-row"
              >
                <span class="svc-code">{{ item.code }}</span>
                <span class="svc-name">{{ item.name }}</span>
                <span class="svc-period">{{ item.period }}</span>
                <span class="svc-amount">{{ formatCurrency(item.amount) }}</span>
                <span class="svc-count">{{ item.count }}회</span>
                <span class="svc-status">{{ item.status }}</span>
              </li>
            </ul>
          </div>

          <div class="service-col">
            <h4>렌탈 용품</h4>
            <ul class="service-list">
              <li
                v-for="item in rentalItems"
                :key="item.code"
                class="service-row"
              >
                <span class="svc-code">{{ item.code }}</span>
                <span class="svc-name">{{ item.name }}</span>
                <span class="svc-period">{{ item.period }}</span>
                <span class="svc-amount">{{ formatCurrency(item.amount) }}</span>
                <span class="svc-count">{{ item.count }}개</span>
                <span class="svc-status">{{ item.status }}</span>
              </li>
            </ul>
          </div>
        </div>
      </template>

      <!-- 나머지 탭은 자리만 -->
      <template v-else>
        <div class="empty-tab">
          "{{ currentTabLabel }}" 탭은 추후 구현 예정입니다.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

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

const tabs = [
  { key: 'schedule', label: '일정 관리' },
  { key: 'service', label: '서비스/렌탈' },
  { key: 'record', label: '기록 관리' },
  { key: 'counsel', label: '상담' },
  { key: 'inquiry', label: '문의이력' },
  { key: 'files', label: '서류관리' }
]

const activeTab = ref('service')
const currentTabLabel = computed(
  () => tabs.find((t) => t.key === activeTab.value)?.label ?? ''
)

const formatCurrency = (n) => n.toLocaleString('ko-KR') + '원'
</script>

<style scoped>
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04);
}

/* 상단 탭 */
.bottom-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  margin: 0 -16px 8px;
  padding: 0 16px 4px;
}
.bottom-tab-btn {
  border: none;
  background: transparent;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 999px;
  color: #6b7280;
}
.bottom-tab-btn.active {
  background-color: #e9f8f0;
  color: #15803d;
  font-weight: 600;
}

.bottom-content {
  font-size: 13px;
}

/* 서비스/렌탈 */
.service-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
}
.service-col h4 {
  margin: 0 0 8px;
  font-size: 13px;
}
.service-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.service-row {
  display: grid;
  grid-template-columns: 60px minmax(0, 1.2fr) 110px 100px 60px 100px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
}
.service-row:nth-child(odd) {
  background-color: #f9fafb;
}
.service-row:nth-child(even) {
  background-color: #ffffff;
}
.svc-code {
  font-weight: 600;
  font-size: 11px;
  color: #6b7280;
}
.svc-name {
  font-weight: 500;
}
.svc-period,
.svc-amount,
.svc-count,
.svc-status {
  text-align: right;
  font-size: 11px;
}

.empty-tab {
  padding: 16px 4px;
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 1200px) {
  .service-layout {
    grid-template-columns: 1fr;
  }
}
</style>
