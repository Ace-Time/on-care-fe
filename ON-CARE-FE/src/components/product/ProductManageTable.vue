<template>
    <div class="manage-table-wrap">
      <div class="table-inner">
        <table class="manage-table">
          <thead>
            <tr>
              <th>용품 코드</th>
              <th>용품명</th>
              <th>카테고리</th>
              <th>구매가</th>
              <th>월 임대료</th>
              <th>총 재고</th>
              <th>가용</th>
              <th>렌탈중</th>
              <th>AS중</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!items.length">
              <td colspan="9" class="empty">등록된 용품이 없습니다.</td>
            </tr>
  
            <tr
              v-for="item in items"
              :key="item.id"
              :class="{ 'row-selected': item.id === selectedId }"
              @click="$emit('row-click', item)"
            >
              <td>
                <span class="badge code-badge">{{ item.code }}</span>
              </td>
              <td>{{ item.name }}</td>
              <td>
                <span class="badge badge-blue">{{ item.category }}</span>
              </td>
              <td>{{ formatCurrency(item.purchasePrice) }}</td>
              <td>{{ formatCurrency(item.monthlyRent) }}</td>
  
              <td>
                <span class="pill pill-total">
                  {{ item.totalStock }}
                </span>
              </td>
              <td>
                <span
                  class="pill"
                  :class="item.usable === 0 ? 'pill-red' : 'pill-green'"
                >
                  {{ item.usable }}
                </span>
              </td>
              <td>
                <span class="pill pill-green">
                  {{ item.renting }}
                </span>
              </td>
              <td>
                <span class="pill pill-orange">
                  {{ item.inAs }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    items: {
      type: Array,
      default: () => [],
    },
    // 어떤 행이 선택됐는지
    selectedId: {
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
  .manage-table-wrap {
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    overflow: hidden;
  }
  
  /* 상단 리스트는 바깥은 흰 박스, 안쪽만 스크롤 */
  .table-inner {
    max-height: 420px;
    overflow-y: auto;
  }
  
  .manage-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  .manage-table th,
  .manage-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    text-align: left;
    white-space: nowrap;
  }
  
  .manage-table thead th {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    background: #f9fafb;
  }
  
  .manage-table tbody tr:hover {
    background: #f9fafb;
    cursor: pointer;
  }
  
  /* 선택된 행 하이라이트 */
  .row-selected {
    background: #ecfdf5;
  }
  
  .empty {
    text-align: center;
    color: #9ca3af;
  }
  
  /* 뱃지 공통 */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
  }
  
  .code-badge {
    background: #f5f3ff;
    color: #7c3aed;
  }
  
  .badge-blue {
    background: #eef2ff;
    color: #4f46e5;
  }
  
  /* 숫자 pill */
  .pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
  }
  
  .pill-total {
    background: #f3f4f6;
    color: #4b5563;
  }
  
  .pill-green {
    background: #dcfce7;
    color: #166534;
  }
  
  .pill-red {
    background: #fee2e2;
    color: #b91c1c;
  }
  
  .pill-orange {
    background: #ffedd5;
    color: #c2410c;
  }
  </style>