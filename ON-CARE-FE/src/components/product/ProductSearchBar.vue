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
          @keyup.enter="$emit('search')"
          :placeholder="placeholder"
        />
      </div>
  
      <select
        class="category-select"
        v-model="proxyCategory"
      >
        <option
          v-for="cat in categories"
          :key="cat.id"
          :value="cat.id"
        >
          {{ cat.name }}
        </option>
      </select>
    </div>
  </template>
  
  <script setup>
  import searchIcon from '@/assets/img/common/search.png'
  import { computed } from 'vue'
  
  const props = defineProps({
    searchText: {
      type: String,
      default: '',
    },
    selectedCategory: {
      type: String,
      default: 'C000',
    },
    categories: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '용품명 또는 코드로 검색...',
    },
  })
  const emit = defineEmits(['update:searchText', 'update:selectedCategory','search'])

  // 부모의 props를 받아오되(get), 바꿀 때는 부모에게 알리는(set) 완벽한 중계자 역할
  const proxyCategory = computed({
    get() {
      return props.selectedCategory
    },
    set(newValue) {
      emit('update:selectedCategory', newValue)
    }
  })
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