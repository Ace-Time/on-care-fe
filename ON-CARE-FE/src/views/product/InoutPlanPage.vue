<template>
  <div class="inout-page">


    <!-- 검색 바 -->
    <ProductSearchBar
      v-model:searchText="searchValue"
      v-model:selectedStatus="selectedCategory"
      v-model:startDate="startDate"
      v-model:endDate="endDate"
      :statusList="categoryOptions"
      :showDate="true"
      @search="handleSearch"
      @resetDate="handleResetDate"
      @setToday="handleSetToday"
    />

    <table class="inout-table">
      <thead>
        <tr>
          <th>날짜</th>
          <th>관리코드</th>
          <th>용품명</th>
          <th>구분</th>
          <th>직원이름</th>
          <th>상태</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in visualItems" :key="item.id">
          <td>{{ item.expectedDate }}</td>


          <td>
            <span class="badge code-badge">
              {{ item.productId }}
            </span>
          </td>

          <td>{{ item.productName }}</td>


          <td>
            <span
              class="badge io-type"
              :class="item.statusName === '입고' ? 'badge-in' : 'badge-out'"
            >
              {{ item.statusName }}
            </span>
          </td>

          <td>{{ item.employeeName }}</td>
          <!-- <td>{{ item.reason }}</td>
          <td>{{ item.location }}</td> -->

          <td>
            <span
              class="badge status-badge"
              :class="item.isConfirmed === 'Y' ? 'status-done' : 'status-planned'"
            >
              {{ item.isConfirmed === 'Y' ? '완료' : '미완료' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination-controls" v-if="totalItemCount > 0">
      <button 
        class="page-btn" 
        :disabled="visualPage === 0"
        @click="prevPage"
      >
        &lt; 이전
      </button>
      
      <span class="page-info">{{ visualPage + 1 }} 페이지</span>

      <button 
        class="page-btn" 
        :disabled="!canGoNext"
        @click="nextPage"
      >
        다음 &gt;
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref , onMounted, computed, watch} from 'vue'
import {getExpectedStock } from '@/api/product/productStockAPI.js'
import ProductSearchBar from '@/components/product/ProductSearchBar.vue'

const inoutList = ref([]);
const pageSize = 12;
const totalItemCount = computed(() => inoutList.value.length) // 전체 아이템 개수
const visualPage = ref(0) // 현재 내가 보고 있는 화면 페이지
const isLastBatch = ref('true');

const searchValue = ref('') // 검색어
const selectedCategory = ref(10);
const categoryOptions = ref([
  {
    id: 0,
    name: '입고'
  },{
    id: 1,
    name: '출고'
  },{
    id: 10,
    name: '전체'
  }
]);

const startDate = ref('');
const endDate = ref('');


onMounted(async() => {
  startDate.value = getTodayString();
  fetchApiBatch(0);
})


// 검색 
const fetchApiBatch = async (pageIdx) => {
  
if (startDate.value && endDate.value) {
    if (startDate.value > endDate.value) {
      alert("시작 날짜가 종료 날짜보다 늦을 수 없습니다.");
      return; // 함수 종료 (검색 안 함)
    }
  }

  const data = await getExpectedStock({
    page: pageIdx, 
    size: pageSize,
    ...(selectedCategory.value === 10 ? {} : {status : selectedCategory.value}),
    productNameOrProductCode : searchValue.value,
    startDate : startDate.value,
    endDate : endDate.value, 
  });

  if (data && data.content) {
      inoutList.value.push(...data.content);
      
      isLastBatch.value = data.last
      visualPage.value = data.number
  }
}


const handleSearch = async () => {
  inoutList.value = []
  visualPage.value = 0
  isLastBatch.value = false
  
  await fetchApiBatch(0)
}


// 현재 페이지에 보여줄 pageSize만큼 slice
const visualItems = computed(() => {
  if (!inoutList || !Array.isArray(inoutList.value)) {
      return [];
    }
    const start = visualPage.value * pageSize
    const end = start + pageSize

    return inoutList.value.slice(start, end)
})

const canGoNext = computed(() => {
  const hasMoreInMemory = (visualPage.value + 1) * pageSize < totalItemCount.value
  const hasMoreInServer = !isLastBatch.value
  return hasMoreInMemory || hasMoreInServer
})

const prevPage = () => {
  if (visualPage.value > 0) visualPage.value--
}

const nextPage = async () => {
  const nextIndexStart = (visualPage.value + 1) * pageSize
  
  if (nextIndexStart >= totalItemCount.value) {
    if (isLastBatch.value) return; // 더 이상 없으면 중단
    
    fetchApiBatch(visualPage.value + 1);
  } else {
    // 메모리에 데이터가 있으면 그냥 페이지 넘김
    visualPage.value++
  }
}

// 오늘 날짜 구하기 함수 (YYYY-MM-DD 형식)
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// 오늘 버튼 로직
const handleSetToday = () => {
  const today = getTodayString();
  startDate.value = today;
  endDate.value = today;
};

// 날짜 초기화 로직
const handleResetDate = () => {
  startDate.value = '';
  endDate.value = '';
  // searchValue.value = ''; 
  handleSearch();
};


watch(selectedCategory,handleSearch );

watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd && newStart > newEnd) {
    alert("시작 날짜가 종료 날짜보다 늦을 수 없습니다.");
    endDate.value = ""; 
  } 

  if ((newStart && newEnd) || (!newStart && !newEnd)) {
    handleSearch();
  }
});

</script>

<style scoped>
  .inout-page {
    padding: 24px 32px 32px;
    box-sizing: border-box;
  }
  
  /* 기본 테이블 */
  .inout-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  /* 헤더 – 배경색 없이 흰색 */
  .inout-table thead {
    background: transparent;
  }
  
  .inout-table th,
  .inout-table td {
    padding: 10px 8px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .inout-table thead th {
    font-weight: 600;
    color: #6b7280;
    text-align: left;
  }
  
  .inout-table tbody tr:last-child td {
    border-bottom: none;
  }
  
  .align-center {
    text-align: center;
  }
  
  /* 뱃지 공통 */
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }
  
  /* 입고 / 출고 */
  .io-type.badge-in {
    background: #eef2ff;
    color: #4f46e5;
  }
  
  .io-type.badge-out {
    background: #fff7ed;
    color: #ea580c;
  }
  
  /* 관리코드 */
  .code-badge {
    background: #f5f3ff;
    color: #7c3aed;
  }
  
  /* 상태 */
  .status-badge.status-planned {
    background: #fef9c3;
    color: #92400e;
  }
  
  .status-badge.status-done {
    background: #dcfce7;
    color: #166534;
  }

  
  .pagination-controls { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 10px;  margin-bottom: 10px; padding: 0 16px; }
  .page-btn { padding: 6px 16px; border: 1px solid #e5e7eb; background-color: white; border-radius: 6px; font-size: 13px; cursor: pointer; color: #374151; transition: all 0.2s; }
  .page-btn:hover:not(:disabled) { background-color: #f3f4f6; border-color: #d1d5db; }
  .page-btn:disabled { opacity: 0.5; cursor: not-allowed; background-color: #f9fafb; }
  .page-info { font-size: 13px; color: #6b7280; }

  </style>