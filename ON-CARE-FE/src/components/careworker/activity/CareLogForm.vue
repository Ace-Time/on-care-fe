<script setup>
import { ref, onMounted } from 'vue';
import { careLogFormData } from '@/mock/careworker/careLogData';
import { getMyBeneficiaries } from '@/api/careworker';
import { useUserStore } from '@/stores/user';

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  hideActions: {
    type: Boolean,
    default: false
  },
  hideDraftButton: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['submit', 'draft']);

// User store
const userStore = useUserStore();

// 담당 수급자 목록
const beneficiaries = ref([]);
const loadingBeneficiaries = ref(false);

// 담당 수급자 목록 불러오기
const loadBeneficiaries = async () => {
  try {
    loadingBeneficiaries.value = true;
    const response = await getMyBeneficiaries();
    const data = response?.data ?? response;

    console.log('📊 담당 수급자 목록:', data);

    // 배열인지 확인하고, 객체라면 배열로 변환
    if (Array.isArray(data)) {
      beneficiaries.value = data;
    } else if (data && typeof data === 'object') {
      // 만약 { data: [...] } 형태라면
      beneficiaries.value = data.data || [];
    } else {
      beneficiaries.value = [];
    }

    console.log('✅ 수급자 목록 설정 완료:', beneficiaries.value);
  } catch (error) {
    console.error('❌ 담당 수급자 목록 불러오기 실패:', error);
    beneficiaries.value = [];
  } finally {
    loadingBeneficiaries.value = false;
  }
};

// Form data initialization (DB 스키마에 맞게 초기화)
const initializeFormData = () => {
  const baseData = {
    // 기본 정보
    beneficiaryId: '',
    recipientName: '',
    careWorkerName: userStore.name || '',
    careDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    serviceType: '방문요양',

    // 식사 제공
    isBreakfast: false,
    isLunch: false,
    isDinner: false,
    isSnack: false,

    // 배설 도움
    diaperCount: 0,
    toiletCount: 0,
    isPortableToilet: false,
    isUrine: false,
    isStool: false,

    // 대변 상태
    stoolNormal: false,
    stoolDiarrhea: false,
    stoolConstipation: false,

    // 위생 관리
    isFaceWash: false,
    isOralCare: false,
    isHairWash: false,
    isBodyWash: false,
    isChangeClothes: false,

    // 일상 생활 지원
    isMealPrep: false,
    isBedCare: false,
    isPositionChange: false,
    isGetUpHelp: false,
    isIndoorMove: false,
    isWalkHelp: false,

    // 인지활동 지원
    isEmotionalTalk: false,
    isCommunication: false,
    isCounseling: false,
    isCognitiveCare: false,
    isBehaviorCare: false,

    // 건강 상태
    isHealthGood: false,
    isPain: false,
    isEdema: false,
    isSkinIssue: false,
    isBodyEtc: false,

    // 기분/정서 상태
    isMoodCalm: false,
    isMoodAnxious: false,
    isMoodDepressed: false,
    isMoodAngry: false,
    isMoodEtc: false,

    // 기타 관찰 사항
    isExcretionMistake: false,
    isSleepLack: false,
    isNapExcess: false,

    // 특이사항
    specialNotes: ''
  };

  // initialData가 있으면 병합
  if (props.initialData) {
    const merged = {
      ...baseData,
      ...props.initialData
    };

    // careWorkerName이 없으면 userStore.name 사용
    if (!merged.careWorkerName) {
      merged.careWorkerName = userStore.name || '';
    }

    return merged;
  }

  return baseData;
};

// Form data
const formData = ref(initializeFormData());

// 폼 제출
const handleSubmit = () => {
  if (props.readOnly) return;
  console.log('요양일지 제출:', formData.value);
  emit('submit', formData.value);
};

// 임시저장
const handleDraft = () => {
  if (props.readOnly) return;
  console.log('요양일지 임시저장:', formData.value);
  emit('draft', formData.value);
};

// 컴포넌트 마운트 시 수급자 목록 로드
onMounted(async () => {
  console.log('🔧 CareLogForm 마운트됨, readOnly:', props.readOnly);
  if (!props.readOnly) {
    console.log('🔧 수급자 목록 로드 시작...');
    await loadBeneficiaries();
  }
});
</script>

<template>
  <div class="care-log-form">
    <section class="form-section basic-info">
      <div class="section-header">
        <h2>장기요양보호 제공기록지</h2>
      </div>

      <div class="info-grid">
        <div class="info-row">
          <label>수급자명</label>
          <input
            v-if="readOnly || (props.initialData && props.initialData.recipientName)"
            :value="formData.recipientName || '정보 없음'"
            type="text"
            disabled
          />
          <template v-else>
            <select
              v-if="beneficiaries.length > 0"
              v-model="formData.beneficiaryId"
              :disabled="loadingBeneficiaries"
              @change="console.log('수급자 선택됨:', formData.beneficiaryId, typeof formData.beneficiaryId)"
            >
              <option value="">{{ loadingBeneficiaries ? '불러오는 중...' : '수급자를 선택하세요' }}</option>
              <option v-for="beneficiary in beneficiaries" :key="beneficiary.beneficiaryId" :value="beneficiary.beneficiaryId">
                {{ beneficiary.name }}
              </option>
            </select>
            <input
              v-else
              v-model.number="formData.beneficiaryId"
              type="number"
              placeholder="수급자 ID를 입력하세요 (임시)"
              @input="console.log('수급자 ID 입력:', formData.beneficiaryId)"
            />
          </template>
        </div>
        <div class="info-row">
          <label>작성자 성명</label>
          <input v-model="formData.careWorkerName" type="text" placeholder="요양보호사" :disabled="readOnly" />
        </div>
      </div>

      <div class="info-grid">
        <div class="info-row">
          <label>제공일</label>
          <input v-model="formData.careDate" type="date" :disabled="readOnly" />
        </div>
        <div class="info-row time-row">
          <label>서비스 시간</label>
          <div class="time-inputs">
            <input v-model="formData.startTime" type="time" :disabled="readOnly" />
            <span>-</span>
            <input v-model="formData.endTime" type="time" :disabled="readOnly" />
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-row full-width">
          <label>서비스 유형</label>
          <div class="radio-group">
            <label v-for="type in careLogFormData.serviceTypes" :key="type.value" class="radio-label">
              <input v-model="formData.serviceType" type="radio" :value="type.value" :disabled="readOnly" />
              <span>{{ type.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 1. 신체활동 지원 -->
    <section class="form-section">
      <h3 class="section-title">{{ careLogFormData.physicalSupport.title }}</h3>

      <div class="checklist">
        <div v-for="section in careLogFormData.physicalSupport.sections" :key="section.code" class="checklist-item">
          <div class="item-label">{{ section.label }}</div>
          <div class="item-options">
            <!-- 체크박스 타입 -->
            <template v-if="section.type === 'checkbox'">
              <label v-for="option in section.options" :key="option.value" class="checkbox-label">
                <input
                  v-model="formData[option.field]"
                  type="checkbox"
                  :disabled="readOnly"
                />
                <span>{{ option.label }}</span>
              </label>
            </template>

            <!-- 혼합 타입 (배설 도움 - 숫자 + 체크박스) -->
            <template v-else-if="section.type === 'mixed'">
              <div v-for="option in section.options" :key="option.value" class="mixed-input">
                <label v-if="option.type === 'number'" class="number-label">
                  <span>{{ option.label }}</span>
                  <input
                    v-model.number="formData[option.field]"
                    type="number"
                    min="0"
                    :disabled="readOnly"
                    class="number-input"
                  />
                  <span class="unit">{{ option.unit }}</span>
                </label>
                <label v-else class="checkbox-label">
                  <input
                    v-model="formData[option.field]"
                    type="checkbox"
                    :disabled="readOnly"
                  />
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. 인지 및 정서 지원 -->
    <section class="form-section">
      <h3 class="section-title">{{ careLogFormData.cognitiveSupport.title }}</h3>

      <div class="checklist">
        <div v-for="section in careLogFormData.cognitiveSupport.sections" :key="section.code" class="checklist-item">
          <div class="item-label">{{ section.label }}</div>
          <div class="item-options">
            <label v-for="option in section.options" :key="option.value" class="checkbox-label">
              <input
                v-model="formData[option.field]"
                type="checkbox"
                :disabled="readOnly"
                @change="console.log('체크박스 변경:', option.field, formData[option.field])"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. 상태 관찰 및 특이사항 -->
    <section class="form-section">
      <h3 class="section-title">{{ careLogFormData.observationStatus.title }}</h3>

      <div class="checklist">
        <div v-for="section in careLogFormData.observationStatus.sections" :key="section.code" class="checklist-item">
          <div class="item-label">{{ section.label }}</div>
          <div class="item-options">
            <label v-for="option in section.options" :key="option.value" class="checkbox-label">
              <input
                v-model="formData[option.field]"
                type="checkbox"
                :disabled="readOnly"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 특이사항 -->
    <section class="form-section">
      <h3 class="section-title">특이사항</h3>
      <div class="special-notes">
        <textarea
          v-model="formData.specialNotes"
          :placeholder="careLogFormData.specialNotes.placeholder"
          rows="4"
          :disabled="readOnly"
        ></textarea>
      </div>
    </section>

    <div v-if="!hideActions" class="form-actions">
      <button v-if="!hideDraftButton" type="button" class="btn-secondary" @click="handleDraft">임시저장</button>
      <button type="button" class="btn-primary" @click="handleSubmit">
        {{ props.initialData && !readOnly ? '수정 저장' : '제출하기' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.care-log-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* 섹션 공통 */
.form-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  text-align: center;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #16a34a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #dcfce7;
}

/* 기본 정보 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-row.full-width {
  grid-column: 1 / -1;
}

.info-row label {
  min-width: 100px;
  font-weight: 600;
  color: #4b5563;
  font-size: 0.875rem;
}

.info-row input[type="text"],
.info-row input[type="date"],
.info-row input[type="time"],
.info-row select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.info-row input:disabled,
.info-row select:disabled,
textarea:disabled,
.field-group input:disabled,
.field-group select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.choice-cell.active {
  border-color: #16a34a;
  background: #dcfce7;
  pointer-events: none;
}

input[type="radio"]:disabled,
input[type="checkbox"]:disabled {
  cursor: not-allowed;
}

.choice-cell:has(input:disabled) {
  cursor: not-allowed;
}

.choice-cell:has(input:disabled):hover {
  border-color: #e5e7eb;
  background: transparent;
}

.choice-cell.active:has(input:disabled):hover {
  border-color: #16a34a;
  background: #dcfce7;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.time-inputs input {
  flex: 1;
}

.radio-group {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4b5563;
}

/* 체크리스트 */
.checklist {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checklist-item {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: start;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.item-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.item-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4b5563;
}

/* 혼합 입력 (숫자 + 체크박스) */
.mixed-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.number-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.number-input {
  width: 80px;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
}

.number-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.unit {
  font-size: 0.875rem;
  color: #6b7280;
  margin-left: 0.25rem;
}

/* 관찰 그리드 */
.observation-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.observation-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
}

.obs-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.obs-fields {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-group label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}

.field-group select,
.field-group input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.text-with-unit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.text-with-unit input {
  flex: 1;
}

.unit {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

/* 특이사항 */
.special-notes textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

.special-notes textarea:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

/* 버튼 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #16a34a;
  color: white;
}

.btn-primary:hover {
  background: #15803d;
}

.btn-secondary {
  background: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f9fafb;
}

/* 반응형 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .checklist-item {
    grid-template-columns: 1fr;
  }

  .obs-fields {
    grid-template-columns: 1fr;
  }

  .risk-table-header,
  .risk-row {
    grid-template-columns: 1fr;
  }

  .header-label,
  .row-label {
    border-right: none;
    border-bottom: 1px solid #d1d5db;
  }

  .row-choices {
    grid-template-columns: 1fr;
  }
}
</style>
