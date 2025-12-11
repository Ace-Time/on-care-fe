<template>
    <!-- 선택된 용품이 있을 때만 보이도록 -->
    <div v-if="product" class="detail-card">
      <!-- 연두색 헤더 영역 -->
      <div class="detail-header">
        <h2 class="title">
          {{ product.name }} - 상세 현황
        </h2>
      </div>
  
      <!-- 안쪽 테이블만 스크롤 -->
      <div class="detail-table-inner">
        <table class="detail-table">
          <thead>
            <tr>
              <th>관리코드</th>
              <th>구매일</th>
              <th>상태</th>
              <th>위치</th>
              <th>수입 현황</th>
              <th>AS 현황</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!items.length">
              <td colspan="6" class="empty">
                해당 용품의 상세 데이터가 없습니다.
              </td>
            </tr>
  
            <tr
              v-for="row in items"
              :key="row.id"
              :class="{ 'row-selected': row.id === selectedDetailId }"
              @click="$emit('row-click', row)"
            >
              <td>
                <span class="badge code-badge">{{ row.managementCode }}</span>
              </td>
              <td>{{ row.purchaseDate }}</td>
              <td>
                <span
                  class="badge"
                  :class="row.status === '임대중' ? 'status-rent' : 'status-storage'"
                >
                  {{ row.status }}
                </span>
              </td>
              <td>{{ row.location }}</td>
              <td>
                <span v-if="row.income > 0">{{ formatCurrency(row.income) }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <span
                  class="badge as-badge"
                  :class="row.asCount > 0 ? 'as-exist' : 'as-none'"
                >
                  {{ row.asCount > 0 ? `${row.asCount}회` : '없음' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  
    <!-- 아무 것도 선택 안됐을 때 -->
    <div v-else class="detail-empty-card">
      용품을 선택하면 상세 현황이 표시됩니다.
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    product: {
      type: Object,
      default: null,
    },
    items: {
      type: Array,
      default: () => [],
    },
    // 어떤 상세 행이 선택됐는지 (히스토리 패널에서 사용)
    selectedDetailId: {
      type: [Number, String],
      default: null,
    },
  })
  
  defineEmits(['row-click'])
  
  const formatCurrency = (value) => {
    if (value == null) return '-'
    return `₩${value.toLocaleString()}`
  }
  </script>
  
  <style scoped>
  .detail-card {
    margin-top: 24px;
    border-radius: 16px;
    border: 1px solid #bbf7d0;
    background: #ffffff;
    overflow: hidden;
  }
  
  /* 헤더 */
  .detail-header {
    background: #ecfdf5;
    padding: 14px 20px;
    border-bottom: 1px solid #bbf7d0;
  }
  
  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #16a34a;
  }
  
  /* 안쪽 스크롤 */
  .detail-table-inner {
    max-height: 260px;
    overflow-y: auto;
  }
  
  .detail-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  .detail-table th,
  .detail-table td {
    padding: 10px 16px;
    border-bottom: 1px solid #f3f4f6;
    text-align: left;
    white-space: nowrap;
  }
  
  .detail-table thead th {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    background: #f9fafb;
  }
  
  /* 선택된 상세 행 하이라이트 */
  .row-selected {
    background: #f9fafb;
  }
  
  .empty {
    text-align: center;
    color: #9ca3af;
  }
  
  /* 뱃지 */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
  }
  
  .code-badge {
    background: #f5f3ff;
    color: #7c3aed;
  }
  
  .status-rent {
    background: #dcfce7;
    color: #166534;
  }
  
  .status-storage {
    background: #e5e7eb;
    color: #374151;
  }
  
  .as-badge {
    min-width: 40px;
    justify-content: center;
  }
  
  .as-exist {
    background: #fee2e2;
    color: #b91c1c;
  }
  
  .as-none {
    background: #e5e7eb;
    color: #4b5563;
  }
  
  /* 아무 것도 선택 안 됐을 때 */
  .detail-empty-card {
    margin-top: 24px;
    border-radius: 16px;
    border: 1px dashed #d1d5db;
    background: #f9fafb;
    padding: 20px;
    font-size: 14px;
    color: #6b7280;
  }
  </style>