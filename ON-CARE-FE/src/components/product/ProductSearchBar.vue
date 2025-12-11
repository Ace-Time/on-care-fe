<!-- src/components/product/ProductSearchBar.vue -->
<template>
    <div class="product-search-bar">
      <div class="search-input-wrap">
        <span class="search-icon">
          <img :src="searchIcon" alt="검색" />
        </span>
        <input
          type="text"
          :value="searchText"
          @input="$emit('update:searchText', $event.target.value)"
          :placeholder="placeholder"
        />
      </div>
  
      <select
        class="category-select"
        :value="selectedCategory"
        @change="$emit('update:selectedCategory', $event.target.value)"
      >
        <option value="전체">전체</option>
        <option
          v-for="cat in categories"
          :key="cat"
          :value="cat"
        >
          {{ cat }}
        </option>
      </select>
    </div>
  </template>
  
  <script setup>
  import searchIcon from '@/assets/img/common/search.png'
  
  defineProps({
    searchText: {
      type: String,
      default: '',
    },
    selectedCategory: {
      type: String,
      default: '전체',
    },
    categories: {
      type: Array,
      default: () => [],
    },
    // ★ 페이지마다 placeholder 바꿀 수 있도록
    placeholder: {
      type: String,
      default: '용품명 또는 코드로 검색...',
    },
  })
  
  defineEmits(['update:searchText', 'update:selectedCategory'])
  </script>
  
  <style scoped>
  .product-search-bar {
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
    opacity: 0.75;
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
  
  .category-select {
    min-width: 120px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    font-size: 14px;
  }
  </style>