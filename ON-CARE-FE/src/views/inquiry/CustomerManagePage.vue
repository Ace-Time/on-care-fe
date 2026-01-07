<template>
  <div class="customer-manage-page">
    <h2 class="page-title">고객 관리</h2>

    <div class="page-layout">
      <!-- 좌측: 수급자 검색 리스트 -->
      <div class="left-panel">
        <CustomerSearchList @select="handleSelectBeneficiary" />
      </div>

      <!-- 우측: 선택된 수급자 정보 + 프로세스 -->
      <div class="right-panel" v-if="selectedBeneficiary">
        <!-- 수급자 정보 -->
        <div class="info-section">
          <RecipientInformation 
            :beneficiaryId="selectedBeneficiary.beneficiaryId"
            @updated="handleBeneficiaryUpdated"
          />
        </div>

        <!-- 고객 관리 프로세스 -->
        <div class="process-section">
          <CustomerManageProcess 
            :beneficiaryId="selectedBeneficiary.beneficiaryId"
            :potentialCustomerId="selectedBeneficiary.potentialCustomerId"
            @refresh="refreshData"
          />
        </div>
      </div>

      <!-- 우측: 수급자 미선택 시 -->
      <div class="right-panel empty" v-else>
        <div class="empty-content">
          <div class="empty-icon">👤</div>
          <p>좌측에서 수급자를 선택하면</p>
          <p>상세 정보와 고객 관리를 진행할 수 있습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref } from 'vue';
import CustomerSearchList from '@/components/inquiry/Customer/CustomerSearchList.vue';
import RecipientInformation from '@/components/recipient/main/RecipientInformation.vue';
import CustomerManageProcess from '@/components/inquiry/Customer/Process/CustomerManageProcess.vue';

// 선택된 수급자
const selectedBeneficiary = ref(null);

// 수급자 선택 핸들러
const handleSelectBeneficiary = (beneficiary) => {
  selectedBeneficiary.value = beneficiary;
};

// 수급자 정보 업데이트 핸들러
const handleBeneficiaryUpdated = () => {
  // 필요시 추가 작업
};

// 데이터 새로고침
const refreshData = () => {
  // 필요시 목록 새로고침
};
</script>

<style scoped>
.customer-manage-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 24px 24px;
  /* ✅ 고정 max-width 대신 유동적으로 */
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-title {
  margin: 0;
  font-size: clamp(20px, 2vw, 24px); /* ✅ 유동적 폰트 크기 */
  font-weight: 600;
  color: #111827;
}

.page-layout {
  display: flex;
  gap: clamp(16px, 2vw, 24px); /* ✅ 유동적 간격 */
  /* ✅ 고정 높이 대신 뷰포트 기반 */
  min-height: calc(100vh - 180px);
  height: auto;
}

.left-panel {
  /* ✅ 고정 width 대신 비율 기반 + 최소/최대 */
  width: clamp(280px, 25vw, 450px);
  min-width: 280px;
  flex-shrink: 0;
  
  /* ✅ 내부 스크롤 허용 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-panel {
  /* ✅ 남은 공간 모두 차지 */
  flex: 1;
  min-width: 0; /* flex item 축소 허용 */
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 24px);
  overflow: hidden;
}

.right-panel.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.empty-content {
  text-align: center;
  color: #9CA3AF;
}

.empty-icon {
  font-size: clamp(48px, 5vw, 64px); /* ✅ 유동적 아이콘 크기 */
  margin-bottom: 16px;
}

.empty-content p {
  margin: 4px 0;
  font-size: clamp(12px, 1.2vw, 14px); /* ✅ 유동적 폰트 크기 */
}

.info-section {
  flex-shrink: 0;
}

.process-section {
  flex: 1;
  min-height: 0; /* ✅ flex 자식 overflow 안정화 */
  background: white;
  border-radius: 12px;
  padding: clamp(16px, 2vw, 24px); /* ✅ 유동적 패딩 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: auto; /* ✅ 내용이 넘치면 스크롤 */
}

/* ✅ 반응형 - 태블릿 */
@media (max-width: 1400px) {
  .left-panel {
    width: clamp(260px, 30vw, 350px);
  }
}

/* ✅ 반응형 - 작은 화면 */
@media (max-width: 1200px) {
  .page-layout {
    flex-direction: column;
    min-height: auto;
  }
  
  .left-panel {
    width: 100%;
    max-height: 40vh;
    min-height: 300px;
  }
  
  .right-panel {
    min-height: 50vh;
  }
}

/* ✅ 반응형 - 모바일 */
@media (max-width: 768px) {
  .customer-manage-page {
    padding: 0 16px 16px;
    gap: 16px;
  }
  
  .left-panel {
    max-height: 35vh;
    min-height: 250px;
  }
  
  .process-section {
    padding: 16px;
  }
}
</style>
