<template>
  <div class="manage-page">
    <!-- 왼쪽: 검색 + 테이블들 -->
    <div class="manage-main">
      <!-- 🔍 검색 / 필터 -->
      <div class="top-filter-row">
        <div class="search-input-wrap">
          <span class="search-icon">
            <img :src="searchIcon" alt="검색" />
          </span>
          <input
            type="text"
            v-model="searchTerm"
            placeholder="용품 코드 또는 용품명으로 검색..."
          />
        </div>

        <select v-model="stockFilter" class="stock-select">
          <option value="all">전체 재고</option>
          <option value="hasStock">재고 있음</option>
          <option value="zero">재고 0개</option>
        </select>
      </div>

      <!-- 상단 관리 용품 리스트 -->
      <ProductManageTable
        :items="filteredItems"
        :selected-id="selectedProduct?.id ?? null"
        @row-click="handleRowClick"
      />

      <!-- 하단 상세 현황 -->
      <ProductManageDetailTable
        :product="selectedProduct"
        :items="selectedDetailItems"
        :selected-detail-id="selectedDetailRow?.id ?? null"
        @row-click="handleDetailRowClick"
      />
    </div>

    <!-- 오른쪽 제품 히스토리 패널 (기본은 안 보이고, 클릭했을 때만 생성) -->
    <ProductHistoryPanel
      v-if="isHistoryOpen && selectedDetailRow"
      :product="selectedProduct"
      :detail-row="selectedDetailRow"
      :events="selectedHistoryEvents"
      @close="isHistoryOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import searchIcon from '@/assets/img/common/search.png'

import { productManageMock } from '@/mock/product/productManageMock.js'
import { productManageDetailMock } from '@/mock/product/productManageDetailMock.js'
import { productHistoryMock } from '@/mock/product/productHistoryMock.js'

import ProductManageTable from '@/components/product/ProductManageTable.vue'
import ProductManageDetailTable from '@/components/product/ProductManageDetailTable.vue'
import ProductHistoryPanel from '@/components/product/ProductHistoryPanel.vue'

const searchTerm = ref('')
const stockFilter = ref('all')

// 전체 데이터
const allItems = ref(productManageMock)

// 상단 리스트 필터링
const filteredItems = computed(() => {
  let list = allItems.value

  // 재고 필터
  if (stockFilter.value === 'hasStock') {
    list = list.filter((i) => i.totalStock > 0)
  } else if (stockFilter.value === 'zero') {
    list = list.filter((i) => i.totalStock === 0)
  }

  // 검색
  if (searchTerm.value) {
    const keyword = searchTerm.value.toLowerCase()
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(keyword) ||
        i.code.toLowerCase().includes(keyword)
    )
  }

  return list
})

// 선택된 상단 용품
const selectedProduct = ref(null)

const handleRowClick = (item) => {
  selectedProduct.value = item
  // 상단 용품 바꾸면 상세 선택 및 히스토리도 초기화
  selectedDetailRow.value = null
  isHistoryOpen.value = false
}

// 선택된 용품의 상세 데이터
const selectedDetailItems = computed(() => {
  if (!selectedProduct.value) return []
  return productManageDetailMock.filter(
    (row) => row.productCode === selectedProduct.value.code
  )
})

// 상세 행 선택 + 히스토리 패널
const selectedDetailRow = ref(null)
const isHistoryOpen = ref(false)

const handleDetailRowClick = (row) => {
  selectedDetailRow.value = row
  isHistoryOpen.value = true
}

// 선택된 상세 행의 히스토리
const selectedHistoryEvents = computed(() => {
  if (!selectedDetailRow.value) return []
  return productHistoryMock.filter(
    (e) => e.managementCode === selectedDetailRow.value.managementCode
  )
})
</script>

<style scoped>
.manage-page {
  padding: 24px 32px 32px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

/* 왼쪽 영역은 남는 공간 전부 */
.manage-main {
  flex: 1;
}

/* 검색 / 셀렉트 영역 */
.top-filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.search-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.search-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}

.stock-select {
  min-width: 120px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
}
</style>