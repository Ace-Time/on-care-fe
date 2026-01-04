<template>
  <div class="card consultation-section">
    <div class="card-header">
      {{ selectedCustomer ? `${selectedCustomer.name}님의 상담 리스트` : '상담 리스트' }}
    </div>
    
    <div class="filter-dropdown-area">
      <div class="filter-dropdown" @click="toggleDropdown">
        <span class="selected-text">{{ selectedFilter }}</span>
        <div class="arrow-down"></div>
        
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <div class="dropdown-item" @click.stop="selectFilter('전체유형')">전체유형</div>
          <div class="dropdown-item" @click.stop="selectFilter('가입')">가입상담</div>
          <div class="dropdown-item" @click.stop="selectFilter('렌탈')">렌탈상담</div>
          <div class="dropdown-item" @click.stop="selectFilter('문의')">문의상담</div>
          <div class="dropdown-item" @click.stop="selectFilter('컴플레인')">컴플레인</div>
          <div class="dropdown-item" @click.stop="selectFilter('해지')">해지상담</div>
        </div>
      </div>
    </div>

    <div class="list-body consultation-list" @scroll="onScroll">
      
      <div v-if="!selectedCustomer" class="no-data">
        고객을 선택해주세요.
      </div>

      <div 
        v-else-if="counselList.length > 0"
        v-for="counsel in filteredList" 
        :key="counsel.id" 
        class="list-item"
        :class="{ 'active': selectedCounselId === counsel.id }"
        @click="handleClickCounsel(counsel.id)"
      >
        <div class="item-content">
          <span class="pill" :class="getBadgeColor(counsel.category)">
            {{ counsel.category }}
          </span>
          
          <div class="info-cell">
            <span class="icon-sq-sm"></span>
            <span class="text">{{ counsel.date }}</span>
          </div>
          <div class="info-cell">
            <span class="text">{{ counsel.time }}</span>
          </div>
          <div class="info-cell">
            <span class="text">{{ counsel.counselor }}</span>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading-indicator">로딩 중...</div>

      <div v-if="!isLoading && counselList.length === 0 && selectedCustomer" class="no-data">
        상담 이력이 없습니다.
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { getCounselList, getCounselDetail } from '@/api/inquiry/counselApi.js';

const props = defineProps({
  selectedCustomer: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['select-counsel-detail']);

const isDropdownOpen = ref(false);
const selectedFilter = ref('전체유형');
const counselList = ref([]);
const isLoading = ref(false);
const selectedCounselId = ref(null);

// --- 무한 스크롤 관련 상태 ---
const currentPage = ref(0);      // 현재 페이지 번호
const isLastPage = ref(false);   // 마지막 페이지 여부
const pageSize = 10;              // 한 번에 불러올 개수 (백엔드 요청 사이즈)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectFilter = (filterName) => {
  selectedFilter.value = filterName;
  isDropdownOpen.value = false;
};

const filteredList = computed(() => {
  if (selectedFilter.value === '전체유형') {
    return counselList.value;
  }
  return counselList.value.filter(c => c.category === selectedFilter.value);
});

// --- API 통신 로직 ---

// 고객 변경 감지: 데이터 리셋 후 첫 페이지 로드
watch(() => props.selectedCustomer, async (newCustomer) => {
  if (newCustomer && newCustomer.customerId) {
    resetPagination(); // 상태 초기화
    await fetchCounselList(newCustomer.customerId);
    selectedCounselId.value = null;
  } else {
    counselList.value = [];
  }
}, { immediate: true });

// 상태 초기화 함수
const resetPagination = () => {
  counselList.value = [];
  currentPage.value = 0;
  isLastPage.value = false;
};

// 스크롤 이벤트 핸들러
const onScroll = (e) => {
  // 로딩 중이거나, 마지막 페이지거나, 고객이 선택 안 됐으면 중단
  if (isLoading.value || isLastPage.value || !props.selectedCustomer) return;

  const { scrollTop, clientHeight, scrollHeight } = e.target;
  
  // 스크롤이 바닥에 거의 도달했을 때 (여유값 10px) 다음 페이지 로드
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    currentPage.value++; // 페이지 증가
    fetchCounselList(props.selectedCustomer.id);
  }
};

const fetchCounselList = async (customerId) => {
  try {
    isLoading.value = true;
    const typeParam = props.selectedCustomer?.customerType === 'beneficiary' 
      ? 'beneficiary' 
      : 'potential';
    
    const params = {
      customerType: typeParam, // 변환된 값 사용
      page: currentPage.value, 
      size: pageSize
    };

    // API 호출 (customerId, params 분리)
    const response = await getCounselList(customerId, params);
    
    const dataList = response.data.content || [];

    // 받아온 데이터가 요청한 사이즈보다 작으면 마지막 페이지임
    if (dataList.length < pageSize) {
      isLastPage.value = true;
    }

    const newItems = dataList.map(item => ({
      id: item.counselHistoryId,
      category: item.counselCategoryName,
      date: item.consultDate || '-',      
      time: item.consultTime || '-',      
      counselor: item.counselorName
    }));

    // [중요] 첫 페이지면 교체, 아니면 기존 리스트 뒤에 추가(Append)
    if (currentPage.value === 0) {
      counselList.value = newItems;
    } else {
      counselList.value = [...counselList.value, ...newItems];
    }

  } catch (error) {
    console.error('상담 리스트 조회 실패:', error);
    // 에러 발생 시 리스트를 비우지 않고, 추가 로딩만 실패 처리
    if (currentPage.value === 0) counselList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleClickCounsel = async (counselId) => {
  selectedCounselId.value = counselId;
  
  try {
    const response = await getCounselDetail(counselId);
    const data = response.data; 

    const detailData = {
      title: `${data.counselCategoryName} 상세 내역`,
      category: data.counselCategoryName,
      date: data.consultDate,
      manager: data.counselorName,
      content: data.detail,
      summary: data.summary || null,
      followUp: data.followUp || null,
      churnReason: data.churnReason || null
    };

    emit('select-counsel-detail', detailData);
    
  } catch (error) {
    console.error('상담 상세 조회 실패:', error);
  }
};

const getBadgeColor = (category) => {
  switch (category) {
    case '가입': return 'blue';
    case '렌탈': return 'purple';
    case '컴플레인': return 'red';
    case '문의': return 'orange';
    case '해지': return 'gray';
    default: return 'gray';
  }
};
</script>

<style scoped>
.card { background: white; border-radius: 12px; border: 1px solid #E5E7EB; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.card-header { padding: 16px; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; min-height: 52px; box-sizing: border-box; }
.header-title { color: #111827; font-size: 16px; font-weight: 600; }
.filter-dropdown-area { padding: 12px 16px; border-bottom: 1px solid #F3F4F6; }
.filter-dropdown { position: relative; width: 120px; height: 32px; background: white; border: 1px solid #E5E7EB; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; cursor: pointer; }
.selected-text { font-size: 13px; color: #374151; }
.arrow-down { width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #6B7280; }
.dropdown-menu { position: absolute; top: 100%; left: 0; width: 100%; background: white; border: 1px solid #E5E7EB; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); z-index: 10; margin-top: 4px; }
.dropdown-item { padding: 8px 12px; font-size: 13px; color: #374151; cursor: pointer; }
.dropdown-item:hover { background-color: #F3F4F6; }
.list-body { flex: 1; overflow-y: auto; padding: 0; }
.list-item { padding: 16px; border-bottom: 1px solid #F3F4F6; cursor: pointer; transition: background-color 0.2s; }
.list-item:hover { background-color: #F9FAFB; }
.list-item.active { background-color: #EFF6FF; border-left: 3px solid #3B82F6; }
.item-content { display: flex; align-items: center; gap: 12px; }
.pill { padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; white-space: nowrap; }
.pill.purple { background-color: #F3E8FF; color: #7E22CE; }
.pill.blue { background-color: #DBEAFE; color: #1E40AF; }
.pill.orange { background-color: #FFEDD5; color: #C2410C; }
.pill.red { background-color: #FEE2E2; color: #DC2626; }
.pill.gray { background-color: #F3F4F6; color: #4B5563; }
.info-cell { display: flex; align-items: center; gap: 4px; color: #6B7280; }
.icon-sq-sm { width: 8px; height: 8px; background-color: #D1D5DB; border-radius: 2px; }
.text { font-size: 13px; }
.no-data { padding: 30px; text-align: center; color: #9CA3AF; font-size: 14px; }
.loading-indicator {
  text-align: center;
  padding: 10px;
  color: #6B7280;
  font-size: 12px;
}
</style>