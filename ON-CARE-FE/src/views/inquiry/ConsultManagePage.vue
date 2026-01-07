<template>
  <div class="page-container">
    <div class="page-header">
      <h2>상담 관리</h2>
    </div>

    <div class="upper-column">
      
      <div class="grid-item">
        <div class="card search-card">
          <CustomerSearchCard @select-customer="handleSelectCustomer" />
        </div>
      </div>

      <div class="grid-item list-wrapper">
        <CounselList 
          :selected-customer="currentCustomer" 
          @select-counsel-detail="handleSelectCounselDetail"
        />
      </div>
      
    </div>

    <div class="bottom-column">
      
      <div class="grid-item">
        <CounselWriteCard
        :selected-customer="currentCustomer"
        @update:category="handleCategoryChange" 
        @reset="handleResetCustomer" />
      </div>

      <div class="grid-item detail-container">
        <div class="help-wrapper">
          <CounselHelpDetail
          :category="currentCategory"
          :counsel-detail="currentCounselDetail"
          :customer="currentCustomer"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CustomerSearchCard from '@/components/inquiry/Counsel/CustomerSearchCard.vue';
import CounselList from '@/components/inquiry/Counsel/CounselList.vue';
import CounselWriteCard from '@/components/inquiry/Counsel/CounselWriteCard.vue';
import CounselHelpDetail from '@/components/inquiry/Counsel/CounselHelpDetail.vue';
import CounselDetailCard from '@/components/inquiry/Counsel/CounselDetailCard.vue';
import SubscriptProcess from '@/components/inquiry/Counsel/Process/SubscriptProcess.vue';

// 상태 관리
const currentCustomer = ref(null);
const currentCounselDetail = ref(null);
const currentCategory = ref('');

// 이벤트 핸들러
const handleSelectCustomer = (customer) => {
  console.log('선택된 고객:', customer);
  currentCustomer.value = customer;
  currentCounselDetail.value = null; 
};

const handleSelectCounselDetail = (detailData) => {
  console.log('선택된 상담 상세:', detailData);
  currentCounselDetail.value = detailData;
};

const handleCategoryChange = (newCategory) => {
  console.log('작성 카테고리 변경됨:', newCategory);
  currentCategory.value = newCategory;
};

const handleResetCustomer = () => {
  console.log('고객 선택 초기화');
  currentCustomer.value = null;
  currentCounselDetail.value = null;
};
</script>

<style scoped>
/* ✅ 페이지 컨테이너 - 유동적 크기 */
.page-container {
  width: 100%;
  max-width: 100%; /* ✅ 고정 max-width 제거 */
  margin: 0 auto;
  padding: 0 clamp(16px, 2vw, 24px) 40px; /* ✅ 유동적 패딩 */
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 24px); /* ✅ 유동적 간격 */
  box-sizing: border-box;
  min-height: 100vh;
}

.page-header {
  flex: 0 0 auto;
}

.page-header h2 {
  font-size: clamp(20px, 2vw, 24px); /* ✅ 유동적 폰트 크기 */
  margin: 0;
  color: #111827;
}

/* ✅ [1] upper-column: 뷰포트 기반 유동적 높이 */
.upper-column {
  /* ✅ 고정 높이 대신 뷰포트 비율 사용 */
  height: clamp(350px, 40vh, 600px);
  min-height: 350px;

  display: grid;
  /* ✅ 고정 비율 대신 유동적 컬럼 */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 2vw, 24px);

  overflow: hidden;
  align-items: stretch;
}

/* ✅ grid-item 공통 */
.grid-item {
  min-width: 0;
  min-height: 0;
}

/* ✅ 카드 공통 - 유동적 */
.card {
  background: white;
  border-radius: clamp(8px, 1vw, 12px); /* ✅ 유동적 border-radius */
  border: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  min-height: 0;
}

.search-card {
  height: 100%;
  min-height: 0;
}

/* ✅ 리스트 래퍼 */
.list-wrapper {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ✅ [2] bottom-column: 유동적 그리드 */
.bottom-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(16px, 2vw, 24px);
  align-items: start;
  align-content: start;
}

/* ✅ 우측 하단: 상세 + 도움말 */
.detail-container {
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 1.5vw, 20px);
  min-height: 0;
}

.detail-card-wrapper {
  /* 내용만큼 */
}

.help-wrapper {
  /* 내용만큼 */
}

/* ✅ 반응형 - 대형 모니터 */
@media (min-width: 1920px) {
  .page-container {
    max-width: 1800px;
    padding: 0 32px 40px;
  }
  
  .upper-column {
    height: clamp(400px, 35vh, 550px);
  }
}

/* ✅ 반응형 - 중간 화면 */
@media (max-width: 1400px) {
  .upper-column {
    height: clamp(320px, 42vh, 500px);
  }
}

/* ✅ 반응형 - 태블릿 */
@media (max-width: 1200px) {
  .upper-column {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
    gap: 16px;
  }
  
  .upper-column .grid-item {
    height: clamp(280px, 35vh, 400px);
  }

  .bottom-column {
    grid-template-columns: 1fr;
  }
}

/* ✅ 반응형 - 작은 태블릿 */
@media (max-width: 900px) {
  .page-container {
    padding: 0 16px 32px;
    gap: 16px;
  }
  
  .upper-column .grid-item {
    height: clamp(250px, 40vh, 350px);
  }
}

/* ✅ 반응형 - 모바일 */
@media (max-width: 600px) {
  .page-container {
    padding: 0 12px 24px;
    gap: 12px;
  }
  
  .page-header h2 {
    font-size: 18px;
  }
  
  .upper-column .grid-item {
    height: clamp(220px, 45vh, 320px);
  }
  
  .card {
    border-radius: 8px;
  }
}
</style>
