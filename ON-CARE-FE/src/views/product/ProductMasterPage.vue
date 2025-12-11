<template>
  <div class="product-page">
    <!-- 검색 바 -->
    <ProductSearchBar
      v-model:searchText="searchTerm"
      v-model:selectedCategory="selectedCategory"
      :categories="categoryOptions"
    />

    <!-- 테이블 -->
    <ProductTable
      :items="filteredProducts"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { productMasterMock } from '@/mock/product/productMasterMock.js'

import ProductSearchBar from '@/components/product/ProductSearchBar.vue'
import ProductTable from '@/components/product/ProductMasterTable.vue'

// 검색어
const searchTerm = ref('')

// 선택된 카테고리(드롭다운)
const selectedCategory = ref('전체')

// 전체 상품 데이터
const products = ref(productMasterMock)

// 카테고리 목록 (중복 제거)
const categoryOptions = computed(() => {
  const set = new Set()
  products.value.forEach((p) => {
    if (p.category) set.add(p.category)
  })
  return Array.from(set)
})

// 검색 + 카테고리 필터 적용
const filteredProducts = computed(() => {
  const keyword = searchTerm.value.trim().toLowerCase()

  return products.value.filter((item) => {
    // 키워드 매칭 (이름 or 코드)
    const matchesKeyword =
      !keyword ||
      item.name.toLowerCase().includes(keyword) ||
      item.code.toLowerCase().includes(keyword)

    // 카테고리 매칭
    const matchesCategory =
      selectedCategory.value === '전체' ||
      item.category === selectedCategory.value

    return matchesKeyword && matchesCategory
  })
})
</script>

<style scoped>
.product-page {
  padding: 24px 32px 32px;
  box-sizing: border-box;
}
</style>