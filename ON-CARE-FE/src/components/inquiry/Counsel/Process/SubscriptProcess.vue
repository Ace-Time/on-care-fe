<template>
  <div class="process-section">
    <div class="stepper-container">
      <div 
        class="step-item active clickable" 
        @click="selectComponent(NewPotentialRegist)"
      >
        <div class="step-circle orange">1</div>
        <div class="step-label active-text">신규접수</div>
      </div>
      <div class="step-line"></div>
      
      <div 
        class="step-item active clickable" 
        @click="selectComponent(CheckCareLevel)"
      >
        <div class="step-circle gray">2</div>
        <div class="step-label">등급확인</div>
      </div>
      <div class="step-line"></div>

      <div 
        class="step-item active clickable" 
        @click="selectComponent(GatherAdvancedInfo)"
      >
        <div class="step-circle gray">3</div>
        <div class="step-label">사전정보</div>
      </div>
      <div class="step-line"></div>

      <div 
        class="step-item active clickable" 
        @click="selectComponent(RegistSubscription)"
      >
        <div class="step-circle gray">4</div>
        <div class="step-label">계약완료</div>
      </div>
    </div>

    <div v-if="currentComponent" class="component-view-area">
      <component :is="currentComponent" :customer="customer" />
    </div>

    <div v-if="currentComponent" class="action-bar-container">
    <div class="left-group">
      <div class="btn btn-white">
        <div class="btn-text">이전 단계로</div>
      </div>
      <div class="btn btn-white">
        <div class="btn-text">취소하기</div>
      </div>
    </div>

    <div class="right-group">
      <div class="btn btn-white">
        <div class="btn-text">저장하기</div>
      </div>
      <div class="btn btn-orange disabled">
        <div class="btn-text-white">다음 단계로</div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { shallowRef } from 'vue';
import NewPotentialRegist from '@/components/inquiry/Counsel/Process/subscript/NewPotentialRegist.vue';
import CheckCareLevel from '@/components/inquiry/Counsel/Process/subscript/CheckCareLevel.vue';
import GatherAdvancedInfo from '@/components/inquiry/Counsel/Process/subscript/GatherAdvancedInfo.vue';
import RegistSubscription from '@/components/inquiry/Counsel/Process/subscript/RegistSubscription.vue';

// 상위에서 받은 customer props 정의
defineProps({
  customer: {
    type: Object,
    default: null
  }
});

// 반응형 변수로 현재 선택된 컴포넌트 관리
const currentComponent = shallowRef(null);

const selectComponent = (component) => {
  // 동일한 컴포넌트 클릭 시 닫기 (토글)
  if (currentComponent.value === component) {
    currentComponent.value = null;
  } else {
    currentComponent.value = component;
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 */
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
}

.step-item.clickable {
  cursor: pointer;
  transition: transform 0.2s;
}

.step-item.clickable:hover {
  transform: translateY(-2px);
}

.step-circle {
  width: 48px; height: 48px;
  border-radius: 50%;
  display: flex; justify-content: center; align-items: center;
  font-size: 16px; font-weight: 500; color: white;
}

.step-circle.orange { background: #FF8A3C; }
.step-circle.gray { background: #E5E7EB; color: #99A1AF; }

.step-label { font-size: 14px; color: #101828; white-space: nowrap; }
.step-label.active-text { color: #101828; font-weight: 600; }

.step-line {
  flex: 1;
  height: 2px;
  background: #E5E7EB;
  margin: 0 10px;
  transform: translateY(-14px);
}

/* [추가] 컴포넌트가 나타날 영역 스타일 */
.component-view-area {
  margin-top: 16px;
  
  /* 내부 패딩을 줘서 자식 컴포넌트와 경계 생성 */
  padding: 24px; 
  
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background-color: #F9FAFB; /* 연한 회색 배경 */
  
  /* 중요: 높이는 내용물에 따름 */
  height: auto; 
  min-height: 200px; /* 최소 높이만 확보 */
  
  /* 중요: 자식 요소가 넘쳐도 숨기지 않음 (CounselHelpDetail 스크롤 사용) */
  overflow: visible; 
  
  /* Flex 아이템 안에서 크기가 줄어들지 않도록 방지 */
  flex-shrink: 0; 

  /* 애니메이션 */
  animation: slideDown 0.3s ease-out;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1200px) {
  .process-section { width: 100%; }
  .stepper-container { overflow-x: auto; padding-bottom: 10px; }
}

/* 전체 컨테이너 */
.action-bar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* 버튼 그룹 (왼쪽/오른쪽) */
.left-group,
.right-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

/* 버튼 공통 스타일 */
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
}

/* 흰색 버튼 스타일 */
.btn-white {
  background: white;
  border: 0.80px solid rgba(0, 0, 0, 0.10);
  min-width: 105.60px; /* 최소 너비 설정 (텍스트 길이에 따라 유동적) */
}

/* 주황색 버튼 스타일 */
.btn-orange {
  width: 122.93px;
  background: #FF8A3C;
  border: none;
}

/* 비활성화 상태 (투명도 조절) */
.btn-orange.disabled {
  opacity: 0.50;
  cursor: not-allowed;
}

/* 텍스트 스타일 */
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
</style>