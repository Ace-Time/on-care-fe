<!-- src/components/product/ProductSearchBar.vue -->
<template>
    <div class="product-search-bar" :class="{ 'justify-end': !showInput }">
      <div class="search-input-wrap" v-if="showInput">
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
  
    <div class="date-range-wrap" v-if="showDate">
        <input 
          type="date" 
          :value="startDate" 
          @input="$emit('update:startDate', $event.target.value)"
          class="date-input"
        />
        <span class="date-separator">~</span>
        <input 
          type="date" 
          :value="endDate" 
          @input="$emit('update:endDate', $event.target.value)"
          class="date-input"
        />
        <div class="date-btn-group">
          <button type="button" class="date-quick-btn" @click="$emit('setToday')">오늘</button>
          <button type="button" class="date-quick-btn reset" @click="$emit('resetDate')">초기화</button>
        </div>
    </div>

      <select
        class="status-select"
        v-model="proxystatus"
      >
        <option
          v-for="cat in statusList"
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
    selectedStatus: {
      type: [String, Number],
      default: 'C000',
    },
    statusList: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '용품명 또는 코드로 검색...',
    },
    showInput: {
      type: Boolean,
      default: true,
    },
    showDate: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
  })
  const emit = defineEmits([
    'update:searchText',
    'update:selectedStatus',
    'search',
    'update:startDate', 
    'update:endDate',
    'setToday', 'resetDate'
    ])

  // 부모의 props를 받아오되(get), 바꿀 때는 부모에게 알리는(set) 완벽한 중계자 역할
  const proxystatus = computed({
    get() {
      return props.selectedStatus
    },
    set(newValue) {
      emit('update:selectedStatus', newValue)
    }
  })
  </script>
  
  <style scoped>
  .product-search-bar.justify-end {
    justify-content: flex-end;
  }

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
  
  .status-select {
    min-width: 120px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    font-size: 14px;
  }


  /* 날짜 관련 */
  .date-range-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    padding: 5px 12px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .date-input {
    border: none;
    outline: none;
    font-size: 14px;
    color: #374151;
    font-family: inherit;
  }

  .date-separator {
    color: #9ca3af;
    font-weight: bold;
  }

  .date-range-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    /* ... */
  }

  .date-btn-group {
    display: flex;
    gap: 4px;
    margin-left: 8px;
    padding-left: 8px;
    border-left: 1px solid #e5e7eb;
  }

  .date-quick-btn {
    padding: 4px 8px;
    font-size: 12px;
    background-color: #f3f4f6;
    color: #4b5563;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .date-quick-btn:hover {
    background-color: #e5e7eb;
  }

  .date-quick-btn.reset {
    background-color: #fff1f2;
    color: #e11d48;
    border-color: #fecdd3;
  }

  .date-quick-btn.reset:hover {
    background-color: #ffe4e6;
  }
  </style>