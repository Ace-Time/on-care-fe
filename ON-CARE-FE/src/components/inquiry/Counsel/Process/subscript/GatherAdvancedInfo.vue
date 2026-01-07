<template>
  <div class="advanced-info-container" ref="rootRef">
    <div class="step-title">3단계 : 사전 정보 등록</div>

    <div class="info-card">
      <div class="card-title">수급자 정보</div>
      <div class="input-grid">
        <div class="input-group">
          <label class="label">이름 <span class="required">*</span></label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.name }"
            v-model="form.name"
            @blur="validateName"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        <div class="input-group">
          <label class="label">생년월일 <span class="required">*</span></label>
          <input 
            type="date" 
            class="input-field" 
            :class="{ 'error': errors.birthdate }"
            v-model="form.birthdate"
            @blur="validateBirthdate"
          />
          <span v-if="errors.birthdate" class="error-message">{{ errors.birthdate }}</span>
        </div>
        <div class="input-group">
          <label class="label">연락처 <span class="required">*</span></label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.phone }"
            v-model="form.phone"
            @blur="validatePhone"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>
        <div class="input-group">
          <label class="label">성별 <span class="required">*</span></label>
          <div class="gender-group">
            <div 
              class="gender-option"
              :class="{ 'active': form.gender === 'M' }"
              @click="form.gender = 'M'"
            >
              남성
            </div>
            <div 
              class="gender-option"
              :class="{ 'active': form.gender === 'F' }"
              @click="form.gender = 'F'"
            >
              여성
            </div>
          </div>
          <span v-if="errors.gender" class="error-message">{{ errors.gender }}</span>
        </div>
        <div class="input-group full-width">
          <label class="label">주소 <span class="required">*</span></label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.address }"
            v-model="form.address"
            @blur="validateAddress"
          />
          <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
        </div>
        <div class="input-group">
          <label class="label">보호자 이름</label>
          <input type="text" class="input-field" v-model="form.guardianName" />
        </div>
        <div class="input-group">
          <label class="label">보호자 연락처</label>
          <input type="text" class="input-field" v-model="form.guardianPhone" />
        </div>
      </div>
    </div>

    <div class="tab-header">
      <div 
        v-for="tab in tabs" 
        :key="tab.id" 
        class="tab-item" 
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="tab-content">
      
      <!-- 렌탈성사도움 탭 -->
      <div v-show="currentTab === 'rental'" class="help-section">
        <div class="section-header">
          <div class="main-text">렌탈 계약 성사에 도움이 될 수 있습니다</div>
          <div class="sub-text">고객과의 렌탈 계약에 있어 도움이 될 정보입니다.</div>
        </div>
        <div class="questions-list">
          <div class="question-row border-bottom">
            <div class="q-text">렌탈 용품 대여에 있어 금액적 부분이 우선되나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.렌탈금액민감 === 'Y'" @toggle="setYesNo('렌탈금액민감', 'Y')" />
              <CheckOption label="아니요" :checked="form.렌탈금액민감 === 'N'" @toggle="setYesNo('렌탈금액민감', 'N')" />
            </div>
          </div>
          <div class="question-row border-bottom">
            <div class="q-text">용품 대여에 있어 보호자에게 일임하는 편인가요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.보호자결정의존 === 'Y'" @toggle="setYesNo('보호자결정의존', 'Y')" />
              <CheckOption label="아니요" :checked="form.보호자결정의존 === 'N'" @toggle="setYesNo('보호자결정의존', 'N')" />
            </div>
          </div>
          <div class="question-row border-bottom">
            <div class="q-text">렌탈 용품에 있어 보편적인 상품을 선호하나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.보편상품신뢰 === 'Y'" @toggle="setYesNo('보편상품신뢰', 'Y')" />
              <CheckOption label="아니요" :checked="form.보편상품신뢰 === 'N'" @toggle="setYesNo('보편상품신뢰', 'N')" />
            </div>
          </div>
          <div class="question-row border-bottom">
            <div class="q-text">현재 기구의 도움 없이 거동이 힘드신 편인가요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.거동불편 === 'Y'" @toggle="setYesNo('거동불편', 'Y')" />
              <CheckOption label="아니요" :checked="form.거동불편 === 'N'" @toggle="setYesNo('거동불편', 'N')" />
            </div>
          </div>
          <div class="question-row">
            <div class="q-text">현재 기구의 도움 없이 목욕이 힘드신 편인가요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.목욕불편 === 'Y'" @toggle="setYesNo('목욕불편', 'Y')" />
              <CheckOption label="아니요" :checked="form.목욕불편 === 'N'" @toggle="setYesNo('목욕불편', 'N')" />
            </div>
          </div>
        </div>
      </div>

      <!-- 매칭도움 탭 -->
      <div v-show="currentTab === 'matching'" class="help-section">
        <div class="section-header">
          <div class="main-text">수급자 매칭에 도움이 될 수 있습니다.</div>
          <div class="sub-text">고객과 요양보호사의 최적 매칭을 위한 정보입니다</div>
        </div>
        
        <div class="question-row border-bottom">
          <div class="q-text">매치 태그</div>
          <div class="chip-container">
            <div 
              v-for="tag in matchTags" 
              :key="tag" 
              class="chip-btn"
              :class="{ 'active': form.selectedMatchTags.includes(tag) }"
              @click="toggleMultiSelect('selectedMatchTags', tag)"
            >
              {{ tag }}
            </div>
          </div>
        </div>

        <div class="question-row border-bottom">
          <div class="q-text">위험요소 수집</div>
          <div class="chip-container">
            <div 
              v-for="risk in riskFactors" 
              :key="risk" 
              class="chip-btn"
              :class="{ 'active': form.selectedRisks.includes(risk) }"
              @click="toggleMultiSelect('selectedRisks', risk)"
            >
              {{ risk }}
            </div>
          </div>
        </div>

        <div class="question-row">
          <div class="q-text">어떤 서비스를 희망하시나요?</div>
          <div class="schedule-list">
            <div 
              v-for="(schedule, index) in form.beneficiarySchedules" 
              :key="index"
              class="schedule-item"
            >
              <select v-model="schedule.beneficiaryScheduleDay" class="schedule-select day">
                <option value="">요일 선택</option>
                <option value="월">월요일</option>
                <option value="화">화요일</option>
                <option value="수">수요일</option>
                <option value="목">목요일</option>
                <option value="금">금요일</option>
                <option value="토">토요일</option>
                <option value="일">일요일</option>
              </select>
              <select v-model="schedule.serviceType" class="schedule-select service">
                <option value="">서비스 선택</option>
                <option value="1">방문요양 (33,000원)</option>
                <option value="2">방문간호 (50,000원)</option>
                <option value="3">방문목욕 (76,000원)</option>
              </select>
              <input 
                type="time" 
                v-model="schedule.beneficiaryScheduleStartTime" 
                class="schedule-time"
              />
              <span class="time-separator">~</span>
              <input 
                type="time" 
                v-model="schedule.beneficiaryScheduleEndTime" 
                class="schedule-time"
              />
              <button 
                class="btn-delete-schedule" 
                @click="removeSchedule(index)"
              >
                삭제
              </button>
            </div>
          </div>
          <button class="btn-add-schedule" @click="addSchedule">
            + 일정 추가
          </button>
        </div>
      </div>

      <!-- 문의해결도움 탭 -->
      <div v-show="currentTab === 'inquiry'" class="help-section">
        <div class="section-header">
          <div class="main-text">문의 해결에 도움이 될 수 있습니다.</div>
          <div class="sub-text">차후 고객에게 문의가 들어왔을 경우 도움이 될 수 있습니다.</div>
        </div>
        <div class="questions-list">
          <div class="question-row border-bottom">
            <div class="q-text">전화보다 문자를 통한 소통을 선호하시나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.문자소통형 === 'Y'" @toggle="setYesNo('문자소통형', 'Y')" />
              <CheckOption label="아니요" :checked="form.문자소통형 === 'N'" @toggle="setYesNo('문자소통형', 'N')" />
            </div>
          </div>
          <div class="question-row">
            <div class="q-text">정기적인 연락을 중요시하나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.정기연락중시형 === 'Y'" @toggle="setYesNo('정기연락중시형', 'Y')" />
              <CheckOption label="아니요" :checked="form.정기연락중시형 === 'N'" @toggle="setYesNo('정기연락중시형', 'N')" />
            </div>
          </div>
        </div>
      </div>

      <!-- 컴플레인해결도움 탭 -->
      <div v-show="currentTab === 'complain'" class="help-section">
        <div class="section-header">
          <div class="main-text">고객 컴플레인 해결에 도움이 될 수 있습니다.</div>
          <div class="sub-text">컴플레인 대응에 있어 도움이 될 만한 정보입니다</div>
        </div>
        <div class="questions-list">
          <div class="question-row border-bottom">
            <div class="q-text">요양 보호사의 잦은 변동에 우려를 갖고 있나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.요양보호사고정선호 === 'Y'" @toggle="setYesNo('요양보호사고정선호', 'Y')" />
              <CheckOption label="아니요" :checked="form.요양보호사고정선호 === 'N'" @toggle="setYesNo('요양보호사고정선호', 'N')" />
            </div>
          </div>
          <div class="question-row border-bottom">
            <div class="q-text">서비스 제공에 있어 요양사와의 성격이 우선되나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.성격민감도높음 === 'Y'" @toggle="setYesNo('성격민감도높음', 'Y')" />
              <CheckOption label="아니요" :checked="form.성격민감도높음 === 'N'" @toggle="setYesNo('성격민감도높음', 'N')" />
            </div>
          </div>
          <div class="question-row">
            <div class="q-text">서비스 제공에 있어 금액적 요소가 우선되나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.금액민감도높음 === 'Y'" @toggle="setYesNo('금액민감도높음', 'Y')" />
              <CheckOption label="아니요" :checked="form.금액민감도높음 === 'N'" @toggle="setYesNo('금액민감도높음', 'N')" />
            </div>
          </div>
        </div>
      </div>

      <!-- 해지상담도움 탭 -->
      <div v-show="currentTab === 'terminate'" class="help-section">
        <div class="section-header">
          <div class="main-text">고객 해지 상담에 도움이 될 수 있습니다.</div>
          <div class="sub-text">고객의 어려움을 도울 수 있는 정보입니다.</div>
        </div>
        <div class="question-row">
          <div class="q-text">서비스 사용에 있어 금전적 어려움이 있나요?</div>
          <div class="yes-no-group">
            <CheckOption label="예" :checked="form.금액부담 === 'Y'" @toggle="setYesNo('금액부담', 'Y')" />
            <CheckOption label="아니요" :checked="form.금액부담 === 'N'" @toggle="setYesNo('금액부담', 'N')" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { defineComponent, h, reactive, ref, onMounted, watch, nextTick } from 'vue';
import { getMatchTagsApi, getRiskFactorsApi } from '@/api/inquiry/counselApi.js';

const props = defineProps({
  customer: {
    type: Object,
    default: null
  },
  initialData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['has-changes', 'validation-status']);

const rootRef = ref(null);

// 탭 설정
const currentTab = ref('rental');
const tabs = [
  { id: 'rental', label: '렌탈성사도움' },
  { id: 'matching', label: '매칭도움' },
  { id: 'inquiry', label: '문의해결도움' },
  { id: 'complain', label: '컴플레인해결도움' },
  { id: 'terminate', label: '해지상담도움' }
];

// API에서 불러올 데이터
const matchTags = ref([]);
const riskFactors = ref([]);

// 통합 폼 데이터
const form = reactive({
  // 기본 정보 (1단계에서 바인딩)
  name: '',
  birthdate: '',
  phone: '',
  gender: '',
  address: '',
  guardianName: '',
  guardianPhone: '',

  // 렌탈성사도움
  렌탈금액민감: null,
  보호자결정의존: null,
  보편상품신뢰: null,
  거동불편: null,
  목욕불편: null,
  
  // 매칭도움
  selectedMatchTags: [],
  selectedRisks: [],
  beneficiarySchedules: [],
  
  // 문의해결도움
  문자소통형: null,
  정기연락중시형: null,
  
  // 컴플레인해결도움
  요양보호사고정선호: null,
  성격민감도높음: null,
  금액민감도높음: null,
  
  // 해지상담도움
  금액부담: null
});

// 초기 데이터 저장 (변경 감지용)
const initialFormData = ref(null);

// Validation 에러
const errors = reactive({
  name: '',
  birthdate: '',
  phone: '',
  gender: '',
  address: ''
});

// Validation 함수들
const validateName = () => {
  if (!form.name || form.name.trim() === '') {
    errors.name = '이름은 필수입니다.';
    return false;
  }
  errors.name = '';
  return true;
};

const validateBirthdate = () => {
  if (!form.birthdate) {
    errors.birthdate = '생년월일은 필수입니다.';
    return false;
  }
  errors.birthdate = '';
  return true;
};

const validatePhone = () => {
  if (!form.phone || form.phone.trim() === '') {
    errors.phone = '연락처는 필수입니다.';
    return false;
  }
  
  const phoneRegex = /^[0-9-]+$/;
  if (!phoneRegex.test(form.phone)) {
    errors.phone = '올바른 전화번호 형식이 아닙니다.';
    return false;
  }
  
  errors.phone = '';
  return true;
};

const validateGender = () => {
  if (!form.gender) {
    errors.gender = '성별을 선택해주세요.';
    return false;
  }
  errors.gender = '';
  return true;
};

const validateAddress = () => {
  if (!form.address || form.address.trim() === '') {
    errors.address = '주소는 필수입니다.';
    return false;
  }
  errors.address = '';
  return true;
};

// 전체 Validation
const validateForm = () => {
  const nameValid = validateName();
  const birthdateValid = validateBirthdate();
  const phoneValid = validatePhone();
  const genderValid = validateGender();
  const addressValid = validateAddress();
  
  const isValid = nameValid && birthdateValid && phoneValid && genderValid && addressValid;
  
  emit('validation-status', isValid);
  
  return isValid;
};

// Yes/No 토글
const setYesNo = (field, value) => {
  if (form[field] === value) {
    form[field] = null;
  } else {
    form[field] = value;
  }
};

// 다중 선택 토글
const toggleMultiSelect = (fieldArrayName, item) => {
  const arr = form[fieldArrayName];
  const idx = arr.indexOf(item);
  if (idx > -1) {
    arr.splice(idx, 1);
  } else {
    arr.push(item);
  }
};

// 일정 추가
const addSchedule = () => {
  form.beneficiarySchedules.push({
    beneficiaryScheduleDay: '',
    beneficiaryScheduleStartTime: '',
    beneficiaryScheduleEndTime: '',
    serviceType: ''
  });
};

// 일정 삭제
const removeSchedule = (index) => {
  form.beneficiarySchedules.splice(index, 1);
};

// 폼 데이터가 변경되었는지 확인
const hasFormChanged = () => {
  if (!initialFormData.value) return false;
  
  return JSON.stringify(form) !== JSON.stringify(initialFormData.value);
};

// 폼 데이터 변경 감지
watch(() => ({ ...form }), () => {
  const hasChanges = hasFormChanged();
  emit('has-changes', hasChanges);
  
  if (hasChanges) {
    validateForm();
  }
}, { deep: true });

// API 데이터 로드
const loadMatchTags = async () => {
  try {
    const response = await getMatchTagsApi();
    // {id:"1", label:"말벗"} 형식에서 label만 추출
    if (Array.isArray(response.data)) {
      matchTags.value = response.data.map(item => 
        typeof item === 'object' ? item.label : item
      );
    } else {
      matchTags.value = response.data;
    }
  } catch (error) {
    // 에러 시 기본값 사용
    matchTags.value = ['말벗', '산책', '음악', '영화', '게임', '서예', '요리'];
  }
};

const loadRiskFactors = async () => {
  try {
    const response = await getRiskFactorsApi();
    // {id:"1", label:"뇌졸증"} 형식에서 label만 추출
    if (Array.isArray(response.data)) {
      riskFactors.value = response.data.map(item => 
        typeof item === 'object' ? item.label : item
      );
    } else {
      riskFactors.value = response.data;
    }
  } catch (error) {
    console.error('❌ 위험요소 로드 실패:', error);
    // 에러 시 기본값 사용
    riskFactors.value = ['뇌졸증', '치매', '거동불편', '당뇨', '고혈압', '공격성', '몽유병', '낙상위험', '욕창위험'];
  }
};

// 초기 데이터 로드
onMounted(async () => {
  
  // API 데이터 로드
  await loadMatchTags();
  await loadRiskFactors();
  
  // initialData가 있으면 폼에 채우기 (3단계 저장 데이터)
  if (props.initialData) {
    Object.assign(form, props.initialData);
  }
  
  // 1단계 데이터 바인딩 (initialData가 없거나 일부 필드가 비어있을 때)
  if (props.customer) {
    // customer 기본 정보
    if (!form.name) form.name = props.customer.name || '';
    if (!form.phone) form.phone = props.customer.phone || '';
  }
  
  // 일정이 없으면 기본 1개 추가
  if (!form.beneficiarySchedules || form.beneficiarySchedules.length === 0) {
    form.beneficiarySchedules = [{
      beneficiaryScheduleDay: '',
      beneficiaryScheduleStartTime: '',
      beneficiaryScheduleEndTime: '',
      serviceType: ''
    }];
  }
  
  // 초기 데이터 저장 (변경 감지 기준)
  initialFormData.value = JSON.parse(JSON.stringify(form));
  
  // 초기 validation 상태 전달
  validateForm();
});

// 폼 데이터 반환 (부모에서 접근)
const getFormData = () => {
  return { ...form };
};

// 저장 후 초기 데이터 업데이트 (변경 감지 리셋용)
const resetChangeTracking = () => {
  initialFormData.value = JSON.parse(JSON.stringify(form));
  emit('has-changes', false);
};

// CheckOption 컴포넌트
const CheckOption = defineComponent({
  props: ['label', 'checked'],
  emits: ['toggle'],
  setup(props, { emit }) {
    return () => h('div', 
      { 
        class: 'check-item', 
        onClick: () => emit('toggle') 
      }, 
      [
        h('div', { class: ['check-box', props.checked ? 'checked' : ''] }, [
          props.checked ? h('div', { class: 'check-mark' }) : null
        ]),
        h('span', { class: 'option-label' }, props.label)
      ]
    );
  }
});

defineExpose({
  getFormData,
  validateForm,
  resetChangeTracking
});
</script>

<style scoped>
/* 1. 전체 컨테이너 */
.advanced-info-container {
  width: 100%;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

.step-title {
  color: #111828;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  margin-left: 0;
}

/* 2. 카드 공통 스타일 */
.info-card, .help-section {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.card-title {
  color: #374151;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

/* 탭 스타일 */
.tab-header {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0;
  overflow-x: auto;
}

.tab-header::-webkit-scrollbar {
  display: none; 
}

.tab-item {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-item:hover {
  color: #374151;
}

.tab-item.active {
  color: #00A63E;
  border-bottom-color: #00A63E;
  font-weight: 600;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 3. 그리드 시스템 및 입력 필드 */
.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group.full-width {
  grid-column: 1 / -1;
}

.label {
  color: #4B5563;
  font-size: 13px;
  font-weight: 500;
}

.required {
  color: #DC2626;
  margin-left: 2px;
}

.input-field {
  height: 42px;
  padding: 0 14px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  border-color: #00A63E;
  box-shadow: 0 0 0 3px rgba(0, 166, 62, 0.1);
}

.input-field.error {
  border-color: #DC2626;
}

.input-field.error:focus {
  border-color: #DC2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-field::placeholder {
  color: #9CA3AF;
}

.error-message {
  color: #DC2626;
  font-size: 12px;
  margin-top: 4px;
}

/* 성별 선택 */
.gender-group {
  display: flex;
  gap: 12px;
}

.gender-option {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.gender-option:hover {
  border-color: #00A63E;
}

.gender-option.active {
  background: #00A63E;
  border-color: #00A63E;
  color: white;
  font-weight: 600;
}

/* 4. 내부 섹션 스타일 */
.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 8px;
}

.main-text { color: #111828; font-size: 16px; font-weight: 600; }
.sub-text { color: #6B7280; font-size: 14px; }

.question-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
}

.question-row.border-bottom {
  border-bottom: 1px solid #F3F4F6;
  margin-bottom: 20px;
  padding-bottom: 20px;
}

.q-text { color: #374151; font-size: 15px; font-weight: 500; }

.yes-no-group { display: flex; gap: 24px; }

/* Chip 스타일 */
.chip-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-btn {
  padding: 8px 16px;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 20px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.chip-btn:hover {
  background: #E5E7EB;
  border-color: #9CA3AF;
}

.chip-btn.active {
  background: #00A63E;
  border-color: #00A63E;
  color: white;
  font-weight: 500;
}

/* 일정 관리 그리드 레이아웃 */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: grid;
  /* 컬럼 정의: [시간입력] [물결] [시간입력] [삭제버튼] */
  /* minmax(0, 1fr)은 내용물이 커져도 옆 칸을 침범하지 않게 강제합니다 */
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto;
  grid-template-rows: auto auto; /* 2줄 */
  gap: 10px; /* 상하좌우 간격을 8px -> 10px로 늘림 */
  align-items: center;
  
  background-color: #F9FAFB;
  padding: 14px; /* 패딩을 조금 늘려 답답함 해소 */
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

/* 공통: 모든 입력 필드가 박스 크기를 넘지 않도록 설정 */
.schedule-item input,
.schedule-item select {
  box-sizing: border-box; /* 테두리와 패딩을 너비에 포함 */
  width: 100%;
}

/* --- 1번째 줄 배치 --- */

/* 요일 선택 */
.schedule-select.day {
  grid-row: 1;
  grid-column: 1 / 2; /* 첫 번째 칸 */
  
  height: 40px;
  padding: 0 8px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  background-color: white;
}

/* 서비스 선택 */
.schedule-select.service {
  grid-row: 1;
  grid-column: 2 / 5; /* 두 번째 칸부터 끝까지(물결,시간2,버튼 칸 합침) */
  
  height: 40px;
  padding: 0 8px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  background-color: white;
}

/* --- 2번째 줄 배치 --- */

/* 시작 시간 (HTML 순서상 3번째) */
.schedule-item > :nth-child(3) {
  grid-row: 2;
  grid-column: 1 / 2;
  
  height: 40px;
  padding: 0 8px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  background-color: white;
  text-align: center; /* 시간 가운데 정렬 */
}

/* 물결 (~) */
.time-separator {
  grid-row: 2;
  grid-column: 2 / 3;
  
  padding: 0 4px; /* 좌우 여백 확보 */
  color: #6B7280;
  font-weight: 500;
  text-align: center;
}

/* 종료 시간 (HTML 순서상 5번째) */
.schedule-item > :nth-child(5) {
  grid-row: 2;
  grid-column: 3 / 4;
  
  height: 40px;
  padding: 0 8px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  background-color: white;
  text-align: center;
}

/* 삭제 버튼 */
.btn-delete-schedule {
  grid-row: 2;
  grid-column: 4 / 5;
  
  height: 40px;
  padding: 0 14px;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 6px;
  color: #DC2626;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap; /* 글자 줄바꿈 방지 */
}

.btn-delete-schedule:hover {
  background: #FCA5A5;
  color: #991B1B;
}

/* 화면이 매우 좁을 때 (모바일 등) */
@media (max-width: 400px) {
  .schedule-item {
    gap: 8px;
    padding: 10px;
  }
  .btn-delete-schedule {
    padding: 0 10px;
    font-size: 12px;
  }
}

.btn-add-schedule {
  padding: 10px 16px;
  background: #E0F2FE;
  border: 1px solid #7DD3FC;
  border-radius: 6px;
  font-size: 14px;
  color: #0369A1;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-add-schedule:hover {
  background: #7DD3FC;
  color: #014361;
}

/* Deep Selector for checkboxes */
:deep(.check-item) {
  display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none;
}

:deep(.check-box) {
  width: 18px; height: 18px; background: #FFFFFF;
  border: 1px solid #D1D5DB; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}

:deep(.check-box.checked) {
  background: #00A63E; border-color: #00A63E;
}

:deep(.check-mark) {
  width: 5px; height: 9px; border: solid white;
  border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px;
}

:deep(.option-label) { color: #374151; font-size: 14px; }

@media (max-width: 640px) {
  .input-grid { grid-template-columns: 1fr; }
  .yes-no-group { flex-direction: column; gap: 12px; }
  .schedule-item { flex-wrap: wrap; }
  .schedule-select, .schedule-time { width: 100%; }
}
</style>
