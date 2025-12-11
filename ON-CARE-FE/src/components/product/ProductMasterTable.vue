<template>
    <div class="product-table-wrap">
      <table class="product-table">
        <thead>
          <tr>
            <th>용품 코드</th>
            <th>용품명</th>
            <th>카테고리</th>
            <th>단가</th>
            <th>월 임대료</th>
            <th>재고</th>
            <th>설명</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!items.length">
            <td colspan="8" class="empty">
              등록된 용품이 없습니다.
            </td>
          </tr>
          <tr
            v-for="item in items"
            :key="item.id"
          >
            <td>{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td>
              <span class="badge badge-blue">{{ item.category }}</span>
            </td>
            <td>{{ formatCurrency(item.unitPrice) }}</td>
            <td>{{ formatCurrency(item.monthlyRent) }}</td>
            <td>
              <span class="badge" :class="item.stock === 0 ? 'badge-red' : 'badge-green'">
                {{ item.stock }}개
              </span>
            </td>
            <td class="desc">
              {{ item.description }}
            </td>
            <td class="actions">
              <button type="button" class="icon-btn edit">
                <img :src="editButton" alt="수정" />
              </button>
              <button type="button" class="icon-btn delete">
                <img :src="deleteButton" alt="삭제" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import editButton from '@/assets/img/common/editButton.png'
  import deleteButton from '@/assets/img/common/deleteButton.png'
  
  defineProps({
    items: {
      type: Array,
      default: () => [],
    },
  })
  
  const formatCurrency = (value) => {
    if (value == null) return '-'
    return `₩${value.toLocaleString()}`
  }
  </script>
  
  <style scoped>
  /* 바깥 박스는 여백만, 배경/테두리 없음 */
  .product-table-wrap {
    margin-top: 16px;
  }
  
  /* 기본 테이블 */
  .product-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  /* 헤더 – 배경색 제거, 기본 흰색 */
  .product-table thead {
    background: transparent;
  }
  
  .product-table th,
  .product-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    text-align: left;
    white-space: nowrap;
  }
  
  .product-table th {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }
  
  /* hover 는 그대로 부드럽게 */
  .product-table tbody tr:hover {
    background: #f9fafb;
  }
  
  .empty {
    text-align: center;
    color: #9ca3af;
  }
  
  .desc {
    max-width: 320px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  
  /* 뱃지 */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
  }
  
  .badge-blue {
    background: #eef2ff;
    color: #4f46e5;
  }
  
  .badge-red {
    background: #fee2e2;
    color: #b91c1c;
  }
  
  .badge-green {
    background: #dcfce7;
    color: #166534;
  }
  
  /* 액션 버튼 */
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .icon-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .icon-btn img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
  </style>