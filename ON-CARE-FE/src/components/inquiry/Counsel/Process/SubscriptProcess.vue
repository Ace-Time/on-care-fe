<template>
  <div class="process-section">
    <div class="stepper-container">
      <!-- 1단계 -->
      <div 
        class="step-item" 
        :class="{ 
          'completed': completedStages.includes(1),
          'clickable': canNavigateToStage(1),
          'churned': isChurnedAtStage(1)
        }"
        @click="handleStageClick(1)"
      >
        <div class="step-circle" :class="getStepCircleClass(1)">
          <span v-if="isChurnedAtStage(1)">✕</span>
          <span v-else>1</span>
        </div>
        <div class="step-label" :class="{ 'active-text': currentStage === 1 }">신규접수</div>
      </div>
      <div class="step-line" :class="{ 'completed': completedStages.includes(1), 'churned': isChurnedAtStage(1) }"></div>
      
      <!-- 2단계 -->
      <div 
        class="step-item" 
        :class="{ 
          'completed': completedStages.includes(2),
          'clickable': canNavigateToStage(2),
          'churned': isChurnedAtStage(2)
        }"
        @click="handleStageClick(2)"
      >
        <div class="step-circle" :class="getStepCircleClass(2)">
          <span v-if="isChurnedAtStage(2)">✕</span>
          <span v-else>2</span>
        </div>
        <div class="step-label" :class="{ 'active-text': currentStage === 2 }">등급확인</div>
      </div>
      <div class="step-line" :class="{ 'completed': completedStages.includes(2), 'churned': isChurnedAtStage(2) }"></div>

      <!-- 3단계 -->
      <div 
        class="step-item" 
        :class="{ 
          'completed': completedStages.includes(3),
          'clickable': canNavigateToStage(3),
          'churned': isChurnedAtStage(3)
        }"
        @click="handleStageClick(3)"
      >
        <div class="step-circle" :class="getStepCircleClass(3)">
          <span v-if="isChurnedAtStage(3)">✕</span>
          <span v-else>3</span>
        </div>
        <div class="step-label" :class="{ 'active-text': currentStage === 3 }">사전정보</div>
      </div>
      <div class="step-line" :class="{ 'completed': completedStages.includes(3), 'churned': isChurnedAtStage(3) }"></div>

      <!-- 4단계 -->
      <div 
        class="step-item" 
        :class="{ 
          'completed': completedStages.includes(4),
          'clickable': canNavigateToStage(4),
          'churned': isChurnedAtStage(4)
        }"
        @click="handleStageClick(4)"
      >
        <div class="step-circle" :class="getStepCircleClass(4)">
          <span v-if="isChurnedAtStage(4)">✕</span>
          <span v-else>4</span>
        </div>
        <div class="step-label" :class="{ 'active-text': currentStage === 4 }">계약완료</div>
      </div>
    </div>

    <!-- 이탈 고객 안내 배너 -->
    <div v-if="isChurnedCustomer" class="churned-banner">
      <div class="churned-icon">⚠️</div>
      <div class="churned-text">
        <strong>이탈 고객</strong> - {{ churnedStage }}단계에서 이탈하였습니다.
      </div>
    </div>

    <div v-if="currentComponent" class="component-view-area">
      <component 
        :is="currentComponent" 
        :customer="customer"
        :initialData="getInitialDataForStage(currentStage)"
        :key="`stage-${currentStage}-${dataLoadKey}`"
        ref="currentStageRef"
        @has-changes="handleHasChanges"
        @validation-status="handleValidationStatus"
      />
    </div>

    <div v-if="currentComponent && !isChurnedCustomer" class="action-bar-container">
      <div class="left-group">
        <button 
          class="btn btn-white" 
          @click="goToPreviousStage" 
          :disabled="currentStage <= 1"
        >
          <div class="btn-text">이전 단계로</div>
        </button>
        <button class="btn btn-white" @click="cancelProcess">
          <div class="btn-text">취소하기</div>
        </button>
      </div>

      <div class="right-group">
        <button 
          class="btn btn-white" 
          @click="saveCurrentStage" 
          :disabled="isSaving || !hasUnsavedChanges"
        >
          <div class="btn-text">{{ isSaving ? '저장 중...' : '저장하기' }}</div>
        </button>
        <button 
          class="btn btn-orange" 
          :class="{ 'disabled': isSaving || !isCurrentStageValid }"
          @click="goToNextStage"
          v-if="currentStage < 4"
          :disabled="isSaving || !isCurrentStageValid"
        >
          <div class="btn-text-white">다음 단계로</div>
        </button>
        <button 
          class="btn btn-orange" 
          :class="{ 'disabled': isSaving || !isCurrentStageValid }"
          @click="completeSubscription"
          v-else
          :disabled="isSaving || !isCurrentStageValid"
        >
          <div class="btn-text-white">계약 완료</div>
        </button>
      </div>
    </div>

    <!-- 저장 확인 모달 -->
    <div v-if="showSaveConfirmModal" class="modal-overlay" @click="closeSaveConfirmModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">저장 확인</h3>
        </div>
        <div class="modal-body">
          <p>아직 단계 저장이 안됐습니다. 저장할까요?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-white" @click="proceedWithoutSaving">
            <div class="btn-text">아니오</div>
          </button>
          <button class="btn btn-orange" @click="saveAndProceed">
            <div class="btn-text-white">예</div>
          </button>
        </div>
      </div>
    </div>

    <!-- 취소 확인 모달 -->
    <div v-if="showCancelModal" class="modal-overlay" @click="closeCancelModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">취소 확인</h3>
        </div>
        <div class="modal-body">
          <p>지금까지의 변경 사항을 취소하시겠습니까?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-white" @click="closeCancelModal">
            <div class="btn-text">아니오</div>
          </button>
          <button class="btn btn-orange" @click="confirmCancel">
            <div class="btn-text-white">예</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, watch, nextTick } from 'vue';
import { saveStageDataApi, getStageDataApi } from '@/api/inquiry/counselApi';
import { useToast } from '@/lib/toast.js';
import NewPotentialRegist from '@/components/inquiry/Counsel/Process/subscript/NewPotentialRegist.vue';
import CheckCareLevel from '@/components/inquiry/Counsel/Process/subscript/CheckCareLevel.vue';
import GatherAdvancedInfo from '@/components/inquiry/Counsel/Process/subscript/GatherAdvancedInfo.vue';
import RegistSubscription from '@/components/inquiry/Counsel/Process/subscript/RegistSubscription.vue';

const props = defineProps({
  customer: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['complete', 'cancel']);

// Toast 사용
const toast = useToast();

// 현재 단계 및 컴포넌트
const currentStage = ref(1);
const currentComponent = shallowRef(null);
const currentStageRef = ref(null);

// 단계별 완료 상태
const completedStages = ref([]);

// 이탈 고객 정보
const isChurnedCustomer = ref(false);
const churnedStage = ref(null);

// 단계별 데이터 저장
const stageDataMap = ref({
  1: null,
  2: null,
  3: null,
  4: null
});

// 원본 데이터 저장 (취소 시 복원용)
const originalStageDataMap = ref({
  1: null,
  2: null,
  3: null,
  4: null
});

// 데이터 로드 완료 플래그
const dataLoadKey = ref(0);

// 저장 상태
const isSaving = ref(false);

// 변경 감지
const hasUnsavedChanges = ref(false);

// Validation 상태
const isCurrentStageValid = ref(false);

// 저장 확인 모달
const showSaveConfirmModal = ref(false);
const pendingAction = ref(null);
const pendingStage = ref(null);

// 취소 확인 모달
const showCancelModal = ref(false);

// 단계별 컴포넌트 매핑
const stageComponents = {
  1: NewPotentialRegist,
  2: CheckCareLevel,
  3: GatherAdvancedInfo,
  4: RegistSubscription
};

// 단계명 매핑
const stageNames = {
  1: '신규 접수',
  2: '등급 확인',
  3: '사전 정보',
  4: '계약 완료'
};

// 이동 가능한 최대 단계 계산
const maxAccessibleStage = computed(() => {
  if (completedStages.value.length === 0) {
    return 1;
  }
  const lastCompleted = Math.max(...completedStages.value);
  return Math.min(lastCompleted + 1, 4);
});

// 특정 단계로 이동 가능한지 확인
const canNavigateToStage = (stage) => {
  // 이탈 고객인 경우 모든 완료된 단계 + 이탈 단계까지 이동 가능
  if (isChurnedCustomer.value) {
    return stage <= churnedStage.value;
  }
  // 완료된 단계 또는 현재 진행 가능한 단계까지만 이동 가능
  return stage <= maxAccessibleStage.value;
};

// 특정 단계에서 이탈했는지 확인
const isChurnedAtStage = (stage) => {
  return isChurnedCustomer.value && stage === churnedStage.value;
};

// 단계 클릭 핸들러
const handleStageClick = async (stage) => {
  if (!canNavigateToStage(stage)) {
    toast.warning(`${stage}단계는 아직 진행할 수 없습니다.`);
    return;
  }
  
  // 변경사항이 있으면 저장 확인
  if (hasUnsavedChanges.value && stage !== currentStage.value) {
    pendingAction.value = 'navigate';
    pendingStage.value = stage;
    showSaveConfirmModal.value = true;
    return;
  }
  
  await selectStage(stage);
};

// 단계별 initialData 생성 (3단계에 1단계 데이터 바인딩, 4단계에 2,3단계 데이터 바인딩)
const getInitialDataForStage = (stage) => {
  // 3단계인 경우 1단계 데이터와 병합
  if (stage === 3) {
    const stage3Data = stageDataMap.value[3] || {};
    const stage1Data = stageDataMap.value[1] || {};
    
    return {
      ...stage3Data,
      name: stage3Data.name || stage1Data.name || '',
      birthdate: stage3Data.birthdate || stage1Data.birthdate || '',
      phone: stage3Data.phone || stage1Data.phone || '',
      address: stage3Data.address || stage1Data.address || '',
      guardianName: stage3Data.guardianName || stage1Data.guardianName || '',
      guardianPhone: stage3Data.guardianPhone || stage1Data.guardianPhone || ''
    };
  }
  
  // 4단계인 경우 2단계, 3단계 데이터와 병합
  if (stage === 4) {
    const stage4Data = stageDataMap.value[4] || {};
    const stage3Data = stageDataMap.value[3] || {};
    const stage2Data = stageDataMap.value[2] || {};
    const stage1Data = stageDataMap.value[1] || {};
    
    return {
      ...stage4Data,
      name: stage4Data.name || stage3Data.name || stage1Data.name || '',
      birthdate: stage4Data.birthdate || stage3Data.birthdate || stage1Data.birthdate || '',
      phone: stage4Data.phone || stage3Data.phone || stage1Data.phone || '',
      gender: stage4Data.gender || stage3Data.gender || '',
      address: stage4Data.address || stage3Data.address || stage1Data.address || '',
      guardianName: stage4Data.guardianName || stage3Data.guardianName || stage1Data.guardianName || '',
      guardianPhone: stage4Data.guardianPhone || stage3Data.guardianPhone || stage1Data.guardianPhone || '',
      guardianRelation: stage4Data.guardianRelation || stage1Data.guardianRelation || '',
      
      hasGrade: stage4Data.hasGrade || stage2Data.hasGrade || null,
      level: stage4Data.level || stage2Data.level || '',
      careLevelNumber: stage4Data.careLevelNumber || stage2Data.careLevelNumber || '',
      careLevelStartDate: stage4Data.careLevelStartDate || stage2Data.careLevelStartDate || '',
      careLevelEndDate: stage4Data.careLevelEndDate || stage2Data.careLevelEndDate || '',
      
      selectedMatchTags: stage4Data.selectedMatchTags || stage3Data.selectedMatchTags || [],
      selectedRisks: stage4Data.selectedRisks || stage3Data.selectedRisks || [],
      beneficiarySchedules: stage4Data.beneficiarySchedules || stage3Data.beneficiarySchedules || []
    };
  }
  
  return stageDataMap.value[stage];
};

// 변경 사항 감지 핸들러
const handleHasChanges = (hasChanges) => {
  hasUnsavedChanges.value = hasChanges;
};

// Validation 상태 핸들러
const handleValidationStatus = (isValid) => {
  isCurrentStageValid.value = isValid;
};

// 단계 선택
const selectStage = async (stage) => {
  if (stage <= 4) {
    currentStage.value = stage;
    currentComponent.value = stageComponents[stage];
    
    hasUnsavedChanges.value = false;
    
    dataLoadKey.value++;
    
    await nextTick();
    
    if (currentStageRef.value?.validateForm) {
      isCurrentStageValid.value = currentStageRef.value.validateForm();
    }
  }
};

// 단계 원 클래스 결정
const getStepCircleClass = (stage) => {
  // 이탈 단계
  if (isChurnedAtStage(stage)) {
    return 'red';
  }
  // 현재 단계
  if (currentStage.value === stage) {
    return 'orange';
  }
  // 완료된 단계
  if (completedStages.value.includes(stage)) {
    return 'green';
  }
  // 이동 불가능한 단계
  return 'gray';
};

// 현재 단계 데이터 저장 (processStatus: 'P' - 진행중)
const saveCurrentStage = async () => {
  if (!props.customer || !props.customer.customerId) {
    toast.error('고객 정보가 없습니다.');
    return false;
  }

  if (!currentStageRef.value || !currentStageRef.value.getFormData) {
    toast.error('현재 단계의 데이터를 가져올 수 없습니다.');
    return false;
  }

  try {
    isSaving.value = true;

    const formData = currentStageRef.value.getFormData();
    
    await saveStageDataApi(
      props.customer.customerId,
      currentStage.value,
      {
        stage: currentStage.value,
        potentialCustomerId: props.customer.customerId,
        stageData: formData,
        processStatus: 'P'
      }
    );

    stageDataMap.value[currentStage.value] = formData;
    originalStageDataMap.value[currentStage.value] = JSON.parse(JSON.stringify(formData));
    
    if (currentStageRef.value.resetChangeTracking) {
      currentStageRef.value.resetChangeTracking();
    }
    hasUnsavedChanges.value = false;
    
    const stageName = stageNames[currentStage.value];
    toast.success(`${stageName} 정보가 저장되었습니다.`);
    
    return true;
    
  } catch (error) {
    console.error('저장 실패:', error);
    toast.error('저장에 실패했습니다: ' + (error.response?.data?.message || error.message));
    return false;
  } finally {
    isSaving.value = false;
  }
};

// 단계 완료 처리 (processStatus: 'F' - 완료)
const completeCurrentStage = async () => {
  if (!props.customer || !props.customer.customerId) {
    return false;
  }

  if (!currentStageRef.value || !currentStageRef.value.getFormData) {
    return false;
  }

  if (currentStageRef.value.validateForm && !currentStageRef.value.validateForm()) {
    toast.error('필수 항목을 입력해주세요.');
    return false;
  }

  try {
    isSaving.value = true;

    const formData = currentStageRef.value.getFormData();
    
    await saveStageDataApi(
      props.customer.customerId,
      currentStage.value,
      {
        stage: currentStage.value,
        potentialCustomerId: props.customer.customerId,
        stageData: formData,
        processStatus: 'F'
      }
    );

    stageDataMap.value[currentStage.value] = formData;
    originalStageDataMap.value[currentStage.value] = JSON.parse(JSON.stringify(formData));
    
    if (!completedStages.value.includes(currentStage.value)) {
      completedStages.value.push(currentStage.value);
    }
    
    if (currentStageRef.value.resetChangeTracking) {
      currentStageRef.value.resetChangeTracking();
    }
    hasUnsavedChanges.value = false;
    
    return true;
    
  } catch (error) {
    console.error('단계 완료 실패:', error);
    toast.error('단계 완료에 실패했습니다: ' + (error.response?.data?.message || error.message));
    return false;
  } finally {
    isSaving.value = false;
  }
};

// 다음 단계로 이동
const goToNextStage = async () => {
  if (currentStageRef.value?.validateForm && !currentStageRef.value.validateForm()) {
    toast.error('필수 항목을 입력해주세요.');
    return;
  }

  const completed = await completeCurrentStage();
  if (!completed) {
    return;
  }

  if (currentStage.value < 4) {
    await selectStage(currentStage.value + 1);
  }
};

// 이전 단계로 이동
const goToPreviousStage = async () => {
  if (currentStage.value > 1) {
    if (hasUnsavedChanges.value) {
      pendingAction.value = 'previous';
      showSaveConfirmModal.value = true;
      return;
    }
    
    await selectStage(currentStage.value - 1);
  }
};

// 프로세스 취소
const cancelProcess = () => {
  if (hasUnsavedChanges.value) {
    showCancelModal.value = true;
  } else {
    // 원본 데이터로 복원 후 컴포넌트 리로드
    stageDataMap.value[currentStage.value] = originalStageDataMap.value[currentStage.value] 
      ? JSON.parse(JSON.stringify(originalStageDataMap.value[currentStage.value])) 
      : null;
    dataLoadKey.value++;
    toast.info('변경 사항이 취소되었습니다.');
  }
};

// 취소 확인
const confirmCancel = () => {
  stageDataMap.value[currentStage.value] = originalStageDataMap.value[currentStage.value] 
    ? JSON.parse(JSON.stringify(originalStageDataMap.value[currentStage.value])) 
    : null;
  
  dataLoadKey.value++;
  hasUnsavedChanges.value = false;
  
  closeCancelModal();
  toast.info('변경 사항이 취소되었습니다.');
};

// 취소 모달 닫기
const closeCancelModal = () => {
  showCancelModal.value = false;
};

// 계약 완료
const completeSubscription = async () => {
  if (currentStageRef.value?.validateForm && !currentStageRef.value.validateForm()) {
    toast.error('필수 항목을 입력해주세요.');
    return;
  }
  
  try {
    isSaving.value = true;
    
    const saved = await completeCurrentStage();
    if (!saved) {
      isSaving.value = false;
      return;
    }
    
    if (currentStageRef.value?.completeContract) {
      const result = await currentStageRef.value.completeContract();
      
      if (result.success) {
        toast.success(`계약이 완료되었습니다! (수급자 ID: ${result.beneficiaryId})`, { duration: 5000 });
        emit('complete', result);
      } else {
        toast.error(result.message || '계약 완료에 실패했습니다.');
      }
    } else {
      console.warn('completeContract 메서드를 찾을 수 없습니다.');
      toast.error('계약 완료 기능을 사용할 수 없습니다.');
    }
    
  } catch (error) {
    console.error('계약 완료 실패:', error);
    toast.error(error.response?.data?.message || '계약 완료에 실패했습니다.');
  } finally {
    isSaving.value = false;
  }
};

// 모달: 저장하고 진행
const saveAndProceed = async () => {
  const saved = await saveCurrentStage();
  
  if (saved) {
    closeSaveConfirmModal();
    
    if (pendingAction.value === 'next') {
      await goToNextStage();
    } else if (pendingAction.value === 'previous') {
      await selectStage(currentStage.value - 1);
    } else if (pendingAction.value === 'navigate' && pendingStage.value) {
      await selectStage(pendingStage.value);
    }
  }
};

// 모달: 저장하지 않고 진행
const proceedWithoutSaving = async () => {
  closeSaveConfirmModal();
  
  // 원본 데이터로 복원
  stageDataMap.value[currentStage.value] = originalStageDataMap.value[currentStage.value] 
    ? JSON.parse(JSON.stringify(originalStageDataMap.value[currentStage.value])) 
    : null;
  hasUnsavedChanges.value = false;
  
  if (pendingAction.value === 'previous') {
    await selectStage(currentStage.value - 1);
  } else if (pendingAction.value === 'navigate' && pendingStage.value) {
    await selectStage(pendingStage.value);
  }
};

// 모달 닫기
const closeSaveConfirmModal = () => {
  showSaveConfirmModal.value = false;
  pendingAction.value = null;
  pendingStage.value = null;
};

// 기존 단계 데이터 불러오기
const loadStageData = async () => {
  if (!props.customer || !props.customer.customerId) {
    console.warn('⚠️ customer 정보 없음');
    return;
  }

  // 이탈 고객 여부 확인
  if (props.customer.customerCategoryName === '이탈고객' && props.customer.currentStage) {
    isChurnedCustomer.value = true;
    churnedStage.value = props.customer.currentStage;
  } else {
    isChurnedCustomer.value = false;
    churnedStage.value = null;
  }

  try {
    if (props.customer.stages && Array.isArray(props.customer.stages)) {
      await loadFromStagesArray(props.customer.stages);
      return;
    }
    
    const response = await getStageDataApi(props.customer.customerId);

    if (response.data && Array.isArray(response.data.stages)) {
      await loadFromStagesArray(response.data.stages);
    } else if (response.data && response.data.stageData) {
      await loadFromStageDataObject(response.data.stageData);
    } else {
      console.warn('⚠️ 알 수 없는 응답 구조:', response.data);
      await selectStage(1);
    }
    
  } catch (error) {
    await selectStage(1);
  }
};

// stages 배열에서 데이터 로드
const loadFromStagesArray = async (stages) => {
  const loadedData = {};
  const completed = [];
  
  stages.forEach(stageItem => {
    const stageNum = stageItem.stage;
    
    if (stageItem.stageData) {
      loadedData[stageNum] = stageItem.stageData;
    }
    
    if (stageItem.processStatus === 'F') {
      completed.push(stageNum);
    }
  });
  
  stageDataMap.value = loadedData;
  originalStageDataMap.value = JSON.parse(JSON.stringify(loadedData));
  completedStages.value = completed;
  
  await nextTick();
  
  // 이탈 고객인 경우 이탈 단계로 이동
  if (isChurnedCustomer.value && churnedStage.value) {
    await selectStage(churnedStage.value);
  } else if (props.customer.currentStage) {
    await selectStage(props.customer.currentStage);
  } else if (completedStages.value.length > 0) {
    const lastCompleted = Math.max(...completedStages.value);
    const nextStage = Math.min(lastCompleted + 1, 4);
    await selectStage(nextStage);
  } else {
    await selectStage(1);
  }
};

// stageData 객체에서 데이터 로드
const loadFromStageDataObject = async (stageData) => {
  const loadedData = {};
  const completed = [];
  
  Object.keys(stageData).forEach(stage => {
    const stageNum = parseInt(stage);
    const data = stageData[stage];
    
    if (data && data.stageData) {
      loadedData[stageNum] = data.stageData;
    }
    
    if (data && data.processStatus === 'F') {
      completed.push(stageNum);
    }
  });
  
  stageDataMap.value = loadedData;
  originalStageDataMap.value = JSON.parse(JSON.stringify(loadedData));
  completedStages.value = completed;
  
  await nextTick();
  
  if (isChurnedCustomer.value && churnedStage.value) {
    await selectStage(churnedStage.value);
  } else if (completedStages.value.length > 0) {
    const lastCompleted = Math.max(...completedStages.value);
    const nextStage = Math.min(lastCompleted + 1, 4);
    await selectStage(nextStage);
  } else {
    await selectStage(1);
  }
};

// 마운트 시 데이터 로드
onMounted(async () => {
  await loadStageData();
  
  if (!currentComponent.value) {
    await selectStage(1);
  }
});

// customer 변경 시 데이터 다시 로드
watch(() => props.customer, async (newCustomer, oldCustomer) => {
  if (newCustomer && newCustomer.customerId) {
    currentStage.value = 1;
    completedStages.value = [];
    stageDataMap.value = { 1: null, 2: null, 3: null, 4: null };
    originalStageDataMap.value = { 1: null, 2: null, 3: null, 4: null };
    currentComponent.value = null;
    hasUnsavedChanges.value = false;
    isChurnedCustomer.value = false;
    churnedStage.value = null;
    
    await loadStageData();
  }
}, { deep: true });
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

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
  transition: transform 0.2s;
}

.step-item.clickable {
  cursor: pointer;
}

.step-item.clickable:hover {
  transform: translateY(-2px);
}

.step-item:not(.clickable) {
  cursor: not-allowed;
  opacity: 0.6;
}

.step-item.completed .step-circle {
  box-shadow: 0 4px 6px rgba(0, 166, 62, 0.3);
}

.step-item.churned .step-circle {
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
}

.step-circle {
  width: 48px; 
  height: 48px;
  border-radius: 50%;
  display: flex; 
  justify-content: center; 
  align-items: center;
  font-size: 16px; 
  font-weight: 500; 
  color: white;
  transition: all 0.3s ease;
}

.step-circle.orange { background: #FF8A3C; }
.step-circle.gray { background: #E5E7EB; color: #99A1AF; }
.step-circle.green { background: #00C950; color: white; }
.step-circle.red { background: #DC2626; color: white; }

.step-label { font-size: 14px; color: #101828; white-space: nowrap; }
.step-label.active-text { color: #101828; font-weight: 600; }

.step-line {
  flex: 1;
  height: 2px;
  background: #E5E7EB;
  margin: 0 10px;
  transform: translateY(-14px);
  transition: background 0.3s ease;
}

.step-line.completed { background: #00C950; }
.step-line.churned { background: #DC2626; }

/* 이탈 고객 배너 */
.churned-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  margin-top: -8px;
}

.churned-icon {
  font-size: 20px;
}

.churned-text {
  font-size: 14px;
  color: #991B1B;
}

.churned-text strong {
  color: #DC2626;
}

.component-view-area {
  margin-top: 16px;
  padding: 24px; 
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background-color: #F9FAFB;
  height: auto; 
  min-height: 200px;
  overflow: visible; 
  flex-shrink: 0; 
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.action-bar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.left-group, .right-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.btn {
  height: 36px;
  padding: 8px 24px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s ease;
  border: none;
}

.btn:hover:not(:disabled):not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:disabled, .btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-white {
  background: white;
  border: 0.80px solid rgba(0, 0, 0, 0.10);
  min-width: 105.60px;
}

.btn-orange {
  width: 122.93px;
  background: #FF8A3C;
}

.btn-text {
  text-align: center;
  color: #0A0A0A;
  font-size: 14px;
  font-family: 'Arimo', sans-serif;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
}

.btn-text-white {
  text-align: center;
  color: white;
  font-size: 14px;
  font-family: 'Arimo', sans-serif;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0;
  font-size: 14px;
  color: #4B5563;
  line-height: 1.6;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1200px) {
  .process-section { width: 100%; }
  .stepper-container { overflow-x: auto; padding-bottom: 10px; }
}
</style>
