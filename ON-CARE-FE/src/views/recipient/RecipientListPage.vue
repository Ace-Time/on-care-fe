<!-- src/views/RecipientListPage.vue -->
<template>
  <div class="page-body">
    <!-- 왼쪽: 수급자 목록 -->
    <section class="left-panel">
      <!--  ref 반드시 필요 -->
      <RecipientList
        ref="listRef"
        v-model:selected-id="selectedId"
      />
    </section>

    <!-- 오른쪽 -->
    <section class="right-panel">
      <div v-if="!selectedId" class="placeholder-card">
        <div class="placeholder-icon">👤</div>
        <p class="placeholder-text">좌측 목록에서 수급자를 선택해주세요</p>
      </div>

      <template v-else>
        <!--  updated(수급자 정보 수정) 이벤트 받기 -->
        <RecipientInformation
          :beneficiary-id="selectedId"
          @updated="handleUpdated"
        />

        <RecipientCategory
          :beneficiary-id="selectedId"
          :refresh-key="refreshKey"  

          :monthly-summary-list="filteredMonthlySummary"
        />
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

import RecipientList from '@/components/recipient/main/RecipientList.vue'
import RecipientInformation from '@/components/recipient/main/RecipientInformation.vue'
import RecipientCategory from '@/components/recipient/main/RecipientCategory.vue'

// mock
import {
  recordMonthlySummaryMock
} from '@/mock/recipient/recordMock'

const selectedId = ref(null)
const listRef = ref(null) // 핵심 (모든 탭에게 "수급자 변경됨" 신호)
const refreshKey = ref(0)   // 모든 탭들이 수급자 정보가 수정되면 새로고침 없이 자동으로 수정

const handleUpdated = () => {
  listRef.value?.refresh()  //  좌측 목록(수급자 전체조회) 즉시 갱신
  refreshKey.value++        // 모든 탭에게 "수급자 변경됨" 신호
}

const recordMonthlySummary = ref(recordMonthlySummaryMock)

const filteredMonthlySummary = computed(() => {
  if (!selectedId.value) return []
  return recordMonthlySummary.value.filter(
    (s) => s.recipientId === selectedId.value
  )
})

</script>

<style scoped>
.page-body {
  display: grid;
  grid-template-columns: 500px minmax(0, 1fr);
  gap: 16px;
  margin-top: 12px;
}
.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.placeholder-card {
  min-height: 260px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.placeholder-icon {
  font-size: 40px;
  margin-bottom: 10px;
  color: #9ca3af;
}
.placeholder-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}
@media (max-width: 960px) {
  .page-body {
    grid-template-columns: 1fr;
  }
}
</style>
