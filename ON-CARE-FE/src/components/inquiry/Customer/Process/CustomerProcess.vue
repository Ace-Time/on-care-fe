<template>
  <div class="process-section">
    <!-- Stepper -->
    <div class="stepper-container">
      <div 
        v-for="(step, index) in steps" 
        :key="step.stage"
        class="step-wrapper"
      >
        <div 
          class="step-item clickable" 
          :class="{ 
            'completed': completedStages.includes(step.stage),
            'terminated': step.stage === 6 && isTerminated
          }"
        >
          <div class="step-circle" :class="getStepCircleClass(step.stage)">
            <span v-if="step.stage === 6 && isTerminated">✕</span>
            <span v-else>{{ step.stage }}</span>
          </div>
          <div class="step-label" :class="{ 'active-text': currentStage === step.stage }">{{ step.label }}</div>
        </div>
        <div v-if="index < steps.length - 1" class="step-line" :class="getStepLineClass(step.stage)"></div>
      </div>
    </div>

    <!-- 계약 종료 안내 배너 -->
    <div v-if="isTerminated" class="terminated-banner">
      <div class="terminated-icon">⚠️</div>
      <div class="terminated-text">
        <strong>계약 종료</strong> - {{ formatDate(terminationDate) }}에 계약이 종료되었습니다.
      </div>
    </div>

    <!-- 단계별 컨텐츠 -->
    <div class="component-view-area" v-if="currentStage">
      <!-- 1~4단계: 기존 가입 프로세스 (조회 전용) -->
      <div v-if="currentStage <= 4" class="readonly-stage">
        <div class="readonly-notice">
          <span class="notice-icon">🔒</span>
          <span>조회 전용입니다. 수정은 '수급자 정보 수정'에서 가능합니다.</span>
        </div>
        
        <component 
          :is="stageComponents[currentStage]" 
          :customer="subscriptionCustomer"
          :initialData="getInitialDataForStage(currentStage)"
          :readonly="true"
          :key="`stage-${currentStage}`"
        />
      </div>

      <!-- 5단계: 고객 관리 (Solution 제시) -->
      <div v-else-if="currentStage === 5" class="manage-stage">
        <CustomerManageSolution 
          :beneficiaryId="beneficiaryId"
          :manageDetail="manageDetail"
          @action-complete="handleActionComplete"
        />
      </div>

      <!-- 6단계: 계약 종료 -->
      <div v-else-if="currentStage === 6" class="termination-stage">
        <CustomerManageTermination 
          :beneficiaryId="beneficiaryId"
          :contractInfo="contractInfo"
          :isTerminated="isTerminated"
          @termination-complete="handleTerminationComplete"
        />
      </div>
    </div>

    <!-- 하단 버튼 -->
    
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, watch } from 'vue';
import { getStageDataApi } from '@/api/inquiry/counselApi';
import { getCustomerManageDetail, getBeneficiaryContractInfo } from '@/api/customer/customerManageApi';
import { useToast } from '@/lib/toast.js';

// 기존 가입 프로세스 컴포넌트들
import NewPotentialRegist from '@/components/inquiry/Counsel/Process/subscript/NewPotentialRegist.vue';
import CheckCareLevel from '@/components/inquiry/Counsel/Process/subscript/CheckCareLevel.vue';
import GatherAdvancedInfo from '@/components/inquiry/Counsel/Process/subscript/GatherAdvancedInfo.vue';
import RegistSubscription from '@/components/inquiry/Counsel/Process/subscript/RegistSubscription.vue';

// 고객 관리 컴포넌트들
import CustomerManageSolution from './CustomerManageSolution.vue';
import CustomerManageTermination from './CustomerManageTermination.vue';

const props = defineProps({
  beneficiaryId: {
    type: Number,
    required: true
  },
  potentialCustomerId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['refresh']);
const toast = useToast();

// 단계 정의 (6단계를 '계약종료'로 변경)
const steps = [
  { stage: 1, label: '신규접수' },
  { stage: 2, label: '등급확인' },
  { stage: 3, label: '사전정보' },
  { stage: 4, label: '계약완료' },
  { stage: 5, label: '고객관리' },
  { stage: 6, label: '계약종료' } 
];

// 단계별 컴포넌트 (1~4단계)
const stageComponents = {
  1: NewPotentialRegist,
  2: CheckCareLevel,
  3: GatherAdvancedInfo,
  4: RegistSubscription
};

// 상태
const currentStage = ref(5);
const completedStages = ref([1, 2, 3, 4]);
const stageDataMap = ref({});
const manageDetail = ref(null);
const contractInfo = ref(null);
const loading = ref(false);

// 계약 종료 여부
const isTerminated = computed(() => {
  if (!contractInfo.value) return false;
  
  const terminateDate = contractInfo.value.terminateDate;
  if (!terminateDate) return false;
  
  const today = new Date();
  const termDate = new Date(terminateDate);
  return termDate <= today;
});

// 종료일
const terminationDate = computed(() => {
  return contractInfo.value?.terminateDate || null;
});

// 가입 프로세스용 customer 객체
const subscriptionCustomer = computed(() => ({
  customerId: props.potentialCustomerId,
  customerType: 'potential'
}));

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 단계 선택
const selectStage = (stage) => {
  currentStage.value = stage;
  
  if (stage === 5) {
    loadManageDetail();
  } else if (stage === 6) {
    loadContractInfo();
  }
};

// 단계별 initialData
const getInitialDataForStage = (stage) => {
  return stageDataMap.value[stage] || null;
};

// 단계 원 클래스
const getStepCircleClass = (stage) => {
  if (stage === 6 && isTerminated.value) {
    return 'red';  // 계약 종료 시 빨간색
  }
  if (currentStage.value === stage) {
    return 'orange';
  } else if (completedStages.value.includes(stage)) {
    return 'green';
  } else {
    return 'gray';
  }
};

// 단계 라인 클래스
const getStepLineClass = (stage) => {
  if (stage === 5 && isTerminated.value) {
    return 'terminated';
  }
  if (completedStages.value.includes(stage)) {
    return 'completed';
  }
  return '';
};

// 이전 단계로
const goToPreviousStage = () => {
  if (currentStage.value > 1) {
    selectStage(currentStage.value - 1);
  }
};

// 다음 단계로
const goToNextStage = () => {
  if (currentStage.value < 6) {
    selectStage(currentStage.value + 1);
  }
};

// 가입 프로세스 데이터 로드 (1~4단계용)
const loadStageData = async () => {
  if (!props.potentialCustomerId) return;
  
  try {
    const { data } = await getStageDataApi(props.potentialCustomerId);
    
    if (data && data.stageData) {
      Object.keys(data.stageData).forEach(stage => {
        const stageNum = parseInt(stage);
        const stageInfo = data.stageData[stage];
        if (stageInfo && stageInfo.stageData) {
          stageDataMap.value[stageNum] = stageInfo.stageData;
        }
      });
    }
  } catch (e) {
    console.error('가입 프로세스 데이터 로드 실패:', e);
  }
};

// 고객 관리 상세 로드 (5단계용)
const loadManageDetail = async () => {
  if (!props.beneficiaryId) return;
  
  loading.value = true;
  try {
    const { data } = await getCustomerManageDetail(props.beneficiaryId);
    manageDetail.value = data;
  } catch (e) {
    console.error('고객 관리 상세 로드 실패:', e);
    toast.error('고객 관리 정보를 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
};

// 계약 정보 로드 (6단계용) - beneficiary_history 테이블에서 조회
const loadContractInfo = async () => {
  if (!props.beneficiaryId) return;
  
  loading.value = true;
  try {
    const { data } = await getBeneficiaryContractInfo(props.beneficiaryId);
    contractInfo.value = data;
    
    // 계약 종료된 경우 5단계도 완료로 표시
    if (isTerminated.value && !completedStages.value.includes(5)) {
      completedStages.value.push(5);
    }
  } catch (e) {
    console.error('계약 정보 로드 실패:', e);
    toast.error('계약 정보를 불러오지 못했습니다.');
  } finally {
    loading.value = false;
  }
};

// 액션 완료 핸들러
const handleActionComplete = () => {
  loadManageDetail();
  emit('refresh');
};

// 계약 종료 완료 핸들러
const handleTerminationComplete = () => {
  loadContractInfo();
  emit('refresh');
};

// 마운트 시
onMounted(() => {
  loadStageData();
  loadManageDetail();
  loadContractInfo();
});

// beneficiaryId 변경 감지
watch(() => props.beneficiaryId, () => {
  loadStageData();
  loadManageDetail();
  loadContractInfo();
  currentStage.value = 5;
});
</script>

<style scoped>
.process-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stepper-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.step-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.step-wrapper:last-child {
  flex: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  transition: transform 0.2s;
}

.step-item.terminated .step-circle {
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
}

.step-circle {
  width: 40px; 
  height: 40px;
  border-radius: 50%;
  display: flex; 
  justify-content: center; 
  align-items: center;
  font-size: 14px; 
  font-weight: 500; 
  color: white;
  transition: all 0.3s ease;
}

.step-circle.orange { background: #FF8A3C; }
.step-circle.gray { background: #E5E7EB; color: #99A1AF; }
.step-circle.green { background: #00C950; color: white; }
.step-circle.red { background: #DC2626; color: white; }

.step-label { 
  font-size: 12px; 
  color: #6B7280; 
  white-space: nowrap;
  text-align: center;
}
.step-label.active-text { color: #111827; font-weight: 600; }

.step-line {
  flex: 1;
  height: 2px;
  background: #E5E7EB;
  margin: 0 8px;
  transform: translateY(-14px);
}

.step-line.completed { background: #00C950; }
.step-line.terminated { background: #DC2626; }

/* 계약 종료 배너 */
.terminated-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  margin-top: -8px;
}

.terminated-icon {
  font-size: 20px;
}

.terminated-text {
  font-size: 14px;
  color: #991B1B;
}

.terminated-text strong {
  color: #DC2626;
}

.component-view-area {
  padding: 24px; 
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background-color: #F9FAFB;
  min-height: 300px;
}

.readonly-stage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.readonly-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FEF3C7;
  border-radius: 8px;
  font-size: 13px;
  color: #92400E;
}

.notice-icon {
  font-size: 16px;
}

.manage-stage,
.termination-stage {
  min-height: 200px;
}

.action-bar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.left-group, .right-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  height: 36px;
  padding: 8px 24px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-white {
  background: white;
  border: 1px solid #E5E7EB;
}

.btn-orange {
  background: #FF8A3C;
}

.btn-text {
  color: #4B5563;
  font-size: 14px;
}

.btn-text-white {
  color: white;
  font-size: 14px;
}
</style>
