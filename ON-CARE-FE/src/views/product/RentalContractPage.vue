<template>
  <div class="rental-page">
    <ProductSearchBar
      v-model="keyword"
      :placeholder="'수급자명 또는 담당자로 검색...'"
      :show-filter="false"
    />

    <!-- 계약 테이블 -->
    <div class="table-wrapper">
      <table class="rental-table">
        <thead>
          <tr>
            <th>수급자</th>
            <th>계약담당자</th>
            <th>시작일</th>
            <th>종료일</th>
            <th>상태</th>
            <th>용품 수</th>
            <th>월 총액</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <!-- 데이터 없을 때 -->
          <tr v-if="!filteredList.length">
            <td colspan="8" class="empty">
              등록된 렌탈 계약이 없습니다.
            </td>
          </tr>

          <!-- 데이터 있을 때 -->
          <tr
            v-for="item in filteredList"
            :key="item.id"
          >
            <td>{{ item.recipientName }}</td>
            <td>{{ item.managerName }}</td>
            <td>{{ item.startDate }}</td>
            <td>{{ item.endDate || '-' }}</td>

            <!-- 상태 뱃지 -->
            <td>
              <span
                class="status-badge"
                :class="item.status === '유지' ? 'status-active' : 'status-ended'"
              >
                {{ item.status }}
              </span>
            </td>

            <td>{{ item.productCount }}개</td>
            <td>{{ formatCurrency(item.monthlyTotal) }}</td>

            <!-- 히스토리 액션 -->
            <td>
              <button type="button" class="history-btn">
                히스토리
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProductSearchBar from '@/components/product/ProductSearchBar.vue'
import { rentalContractMock } from '@/mock/product/rentalContractMock.js'

const keyword = ref('')
const contracts = ref(rentalContractMock)

const filteredList = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return contracts.value

  return contracts.value.filter((item) => {
    return (
      item.recipientName.toLowerCase().includes(q) ||
      item.managerName.toLowerCase().includes(q)
    )
  })
})

const formatCurrency = (value) => {
  if (value == null) return '-'
  return `₩${value.toLocaleString()}`
}
</script>

<style scoped>
.rental-page {
  padding: 24px 32px 32px;
  box-sizing: border-box;
}

/* 위쪽 검색바와 동일 느낌 유지 */
.table-wrapper {
  margin-top: 12px;
}

/* 기본 테이블 스타일 (회색 박스 없이) */
.rental-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.rental-table th,
.rental-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
  white-space: nowrap;
}

.rental-table thead th {
  font-weight: 500;
  color: #6b7280;
}

.rental-table tbody tr:hover {
  background: #f9fafb;
}

.empty {
  text-align: center;
  color: #9ca3af;
}

/* 상태 뱃지 */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 12px;
}

.status-active {
  background: #dcfce7;
  color: #15803d;
}

.status-ended {
  background: #eef2f7;
  color: #4b5563;
}

/* 히스토리 버튼 */
.history-btn {
  border: none;
  background: transparent;
  color: #16a34a;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
</style>