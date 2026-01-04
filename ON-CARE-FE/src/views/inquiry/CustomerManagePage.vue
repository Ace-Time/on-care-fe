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
  max-width: 1800px;
  margin: 0 auto;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.page-layout {
  display: flex;
  gap: 24px;
  min-height: calc(100vh - 180px);
}

.left-panel {
  width: 400px;
  flex-shrink: 0;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-content p {
  margin: 4px 0;
  font-size: 14px;
}

.info-section {
  flex-shrink: 0;
}

.process-section {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1200px) {
  .page-layout {
    flex-direction: column;
  }
  
  .left-panel {
    width: 100%;
  }
}
</style>
