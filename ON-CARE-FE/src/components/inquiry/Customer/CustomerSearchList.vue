<template>
  <div class="customer-search-container">
    <!-- 검색 바 -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <input 
          type="text" 
          v-model="searchKeyword" 
          placeholder="이름 또는 전화번호로 검색"
          @keyup.enter="handleSearch"
          class="search-input"
        />
        <button class="search-btn" @click="handleSearch">
          <span>검색</span>
        </button>
      </div>
    </div>

    <!-- 카테고리 필터 -->
    <div class="category-filter-section">
      <div class="category-group">
        <div class="category-title">이탈위험징후포착</div>
        <div class="category-buttons">
          <button 
            :class="['category-btn', { active: activeFilter === 'CHURN_PERIOD' }]"
            @click="setFilter('CHURN_RISK', 'CHURN_PERIOD')"
          >
            이탈위험기간임박 
            <span class="count-badge" v-if="counts.churnRiskCount">({{ counts.churnRiskCount }})</span>
          </button>
          <button 
            :class="['category-btn', { active: activeFilter === 'COMPLAINT' }]"
            @click="setFilter('CHURN_RISK', 'COMPLAINT')"
          >
            불만상담접수
            <span class="count-badge" v-if="counts.complaintCount">({{ counts.complaintCount }})</span>
          </button>
          <button 
            :class="['category-btn', { active: activeFilter === 'TERMINATION' }]"
            @click="setFilter('CHURN_RISK', 'TERMINATION')"
          >
            해지상담등록
            <span class="count-badge" v-if="counts.terminationCount">({{ counts.terminationCount }})</span>
          </button>
        </div>
      </div>

      <div class="category-group">
        <div class="category-title">만료기간위험</div>
        <div class="category-buttons">
          <button 
            :class="['category-btn', { active: activeFilter === 'CARE_LEVEL' }]"
            @click="setFilter('EXPIRATION_RISK', 'CARE_LEVEL')"
          >
            장기요양등급만료임박
            <span class="count-badge" v-if="counts.careLevelExpiringCount">({{ counts.careLevelExpiringCount }})</span>
          </button>
          <button 
            :class="['category-btn', { active: activeFilter === 'CONTRACT' }]"
            @click="setFilter('EXPIRATION_RISK', 'CONTRACT')"
          >
            계약만료임박
            <span class="count-badge" v-if="counts.contractExpiringCount">({{ counts.contractExpiringCount }})</span>
          </button>
        </div>
      </div>

      <div class="category-group">
        <div class="category-title">마케팅기회포착</div>
        <div class="category-buttons">
          <button 
            :class="['category-btn', { active: activeFilter === 'RENTAL' }]"
            @click="setFilter('MARKETING_OPPORTUNITY', 'RENTAL')"
          >
            렌탈상담등록
            <span class="count-badge" v-if="counts.rentalCounselCount">({{ counts.rentalCounselCount }})</span>
          </button>
        </div>
      </div>

      <button class="reset-btn" @click="resetFilter" v-if="activeCategory">
        필터 초기화
      </button>
    </div>

    <!-- 수급자 목록 -->
    <div class="beneficiary-list-section">
      <div class="list-header">
        <span class="result-count">총 {{ totalElements }}명</span>
      </div>

      <div v-if="loading" class="loading-state">
        <span>불러오는 중...</span>
      </div>

      <div v-else-if="beneficiaries.length === 0" class="empty-state">
        <span>검색 결과가 없습니다.</span>
      </div>

      <div v-else class="list-content">
        <div 
          v-for="item in beneficiaries" 
          :key="item.beneficiaryId"
          :class="['beneficiary-item', { selected: selectedId === item.beneficiaryId }]"
          @click="selectBeneficiary(item)"
        >
          <div class="item-main">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-info">
              <span>{{ item.phone }}</span>
            </div>
          </div>
          <div class="item-badges">
            <span v-if="item.isChurnRisk" class="badge badge-churn">이탈위험</span>
            <span v-if="item.hasComplaint" class="badge badge-complaint">불만</span>
            <span v-if="item.hasTermination" class="badge badge-termination">해지</span>
            <span v-if="item.isCareLevelExpiring" class="badge badge-expiring">등급만료</span>
            <span v-if="item.isContractExpiring" class="badge badge-expiring">계약만료</span>
            <span v-if="item.hasRentalCounsel" class="badge badge-rental">렌탈</span>
          </div>
        </div>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="currentPage === 0"
          @click="goToPage(currentPage - 1)"
        >
          이전
        </button>
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button 
          class="page-btn" 
          :disabled="currentPage >= totalPages - 1"
          @click="goToPage(currentPage + 1)"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getBeneficiaryList, getCategoryCounts } from '@/api/customer/customerManageApi';

const emit = defineEmits(['select']);

// 검색 상태
const searchKeyword = ref('');
const activeCategory = ref('');
const activeFilter = ref('');

// 카운트
const counts = ref({
  churnRiskCount: 0,
  complaintCount: 0,
  terminationCount: 0,
  careLevelExpiringCount: 0,
  contractExpiringCount: 0,
  rentalCounselCount: 0
});

// 목록 상태
const beneficiaries = ref([]);
const loading = ref(false);
const selectedId = ref(null);

// 페이징
const currentPage = ref(0);
const pageSize = ref(10);
const totalElements = ref(0);
const totalPages = ref(0);

// 카테고리 카운트 로드
const loadCounts = async () => {
  try {
    const { data } = await getCategoryCounts();
    counts.value = data;
  } catch (e) {
    console.error('카테고리 카운트 로드 실패:', e);
  }
};

// 목록 로드
const loadList = async () => {
  loading.value = true;
  try {
    const params = {
      keyword: searchKeyword.value || undefined,
      category: activeCategory.value || undefined,
      subCategory: activeFilter.value || undefined,
      page: currentPage.value,
      size: pageSize.value
    };

    const { data } = await getBeneficiaryList(params);
    beneficiaries.value = data.content || [];
    totalElements.value = data.totalElements || 0;
    totalPages.value = data.totalPages || 0;
  } catch (e) {
    console.error('목록 로드 실패:', e);
    beneficiaries.value = [];
  } finally {
    loading.value = false;
  }
};

// 검색
const handleSearch = () => {
  currentPage.value = 0;
  loadList();
};

// 필터 설정
const setFilter = (category, subCategory) => {
  if (activeFilter.value === subCategory) {
    // 같은 필터 다시 클릭하면 해제
    activeCategory.value = '';
    activeFilter.value = '';
  } else {
    activeCategory.value = category;
    activeFilter.value = subCategory;
  }
  currentPage.value = 0;
  loadList();
};

// 필터 초기화
const resetFilter = () => {
  activeCategory.value = '';
  activeFilter.value = '';
  searchKeyword.value = '';
  currentPage.value = 0;
  loadList();
};

// 수급자 선택
const selectBeneficiary = (item) => {
  selectedId.value = item.beneficiaryId;
  emit('select', item);
};

// 페이지 이동
const goToPage = (page) => {
  currentPage.value = page;
  loadList();
};

onMounted(() => {
  loadCounts();
  loadList();
});
</script>

<style scoped>
.customer-search-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-section {
  display: flex;
  gap: 12px;
}

.search-input-wrapper {
  display: flex;
  flex: 1;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #00C950;
}

.search-btn {
  padding: 10px 20px;
  background: #00C950;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #00A63E;
}

.category-filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-title {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
}

.category-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 6px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  background: white;
  color: #4B5563;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: #00C950;
  color: #00C950;
}

.category-btn.active {
  background: #00C950;
  border-color: #00C950;
  color: white;
}

.count-badge {
  font-weight: 600;
}

.reset-btn {
  padding: 6px 12px;
  border: 1px solid #EF4444;
  border-radius: 20px;
  background: white;
  color: #EF4444;
  font-size: 12px;
  cursor: pointer;
  margin-left: auto;
}

.reset-btn:hover {
  background: #FEF2F2;
}

.beneficiary-list-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-count {
  font-size: 14px;
  color: #6B7280;
}

.loading-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #9CA3AF;
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.beneficiary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.beneficiary-item:hover {
  border-color: #00C950;
  background: #F0FDF4;
}

.beneficiary-item.selected {
  border-color: #00C950;
  background: #DCFCE7;
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.item-info {
  font-size: 12px;
  color: #6B7280;
}

.item-info .divider {
  margin: 0 6px;
}

.item-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
}

.badge-churn {
  background: #FEF3C7;
  color: #92400E;
}

.badge-complaint {
  background: #FEE2E2;
  color: #B91C1C;
}

.badge-termination {
  background: #F3E8FF;
  color: #6B21A8;
}

.badge-expiring {
  background: #DBEAFE;
  color: #1D4ED8;
}

.badge-rental {
  background: #D1FAE5;
  color: #065F46;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  color: #4B5563;
  cursor: pointer;
  font-size: 13px;
}

.page-btn:hover:not(:disabled) {
  border-color: #00C950;
  color: #00C950;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #6B7280;
}
</style>
