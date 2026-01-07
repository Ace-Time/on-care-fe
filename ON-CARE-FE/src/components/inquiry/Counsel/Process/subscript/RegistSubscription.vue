<template>
  <div class="advanced-info-container">
    <div class="step-title">4단계 : 계약 완료</div>

    <div class="info-card">
      <div class="card-title">계약 정보 입력</div>
      
      <div class="input-grid">
        
        <div class="input-group">
          <label class="label">이름 <span class="required">*</span></label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.name }"
            placeholder="이름 입력" 
            v-model="form.name"
            @blur="validateName"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        <div class="input-group">
          <label class="label">생년월일 <span class="required">*</span></label>
          <div class="input-with-icon">
            <input 
              type="date" 
              class="input-field" 
              :class="{ 'error': errors.birthdate }"
              v-model="form.birthdate"
              @blur="validateBirthdate"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span v-if="errors.birthdate" class="error-message">{{ errors.birthdate }}</span>
        </div>

        <div class="input-group">
          <label class="label">연락처 <span class="required">*</span></label>
          <div class="input-with-icon">
            <input 
              type="text" 
              class="input-field" 
              :class="{ 'error': errors.phone }"
              placeholder="번호 입력" 
              v-model="form.phone"
              @blur="validatePhone"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>
        <div class="input-group">
          <label class="label">성별 <span class="required">*</span></label>
          <select 
            class="input-field" 
            :class="{ 'error': errors.gender }"
            v-model="form.gender"
            @blur="validateGender"
          >
            <option value="" disabled>성별 선택</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
          <span v-if="errors.gender" class="error-message">{{ errors.gender }}</span>
        </div>

        <div class="input-group full-width">
          <label class="label">주소 <span class="required">*</span></label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.address }"
            placeholder="주소 입력" 
            v-model="form.address"
            @blur="validateAddress"
          />
          <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
        </div>

        <div class="input-group">
          <label class="label">보호자명 / 관계</label>
          <div class="split-inputs">
            <input 
              type="text" 
              class="input-field flex-grow" 
              placeholder="보호자 이름" 
              v-model="form.guardianName"
            />
            <input 
              type="text" 
              class="input-field relation-box" 
              placeholder="관계" 
              v-model="form.guardianRelation"
            />
          </div>
        </div>
        <div class="input-group">
          <label class="label">보호자 연락처</label>
          <div class="input-with-icon">
            <input 
              type="text" 
              class="input-field" 
              placeholder="010-0000-0000" 
              v-model="form.guardianPhone"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>

        <div class="input-group">
          <label class="label">장기요양등급 <span class="required">*</span></label>
          <select 
            class="input-field" 
            :class="{ 'error': errors.level }"
            v-model="form.level"
            @blur="validateLevel"
          >
            <option value="" disabled>등급 선택</option>
            <option>1등급</option>
            <option>2등급</option>
            <option>3등급</option>
            <option>4등급</option>
            <option>5등급</option>
            <option>인지지원등급</option>
          </select>
          <span v-if="errors.level" class="error-message">{{ errors.level }}</span>
        </div>
        <div class="input-group">
          <label class="label">장기요양등급 인정번호 <span class="required">*</span></label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.careLevelNumber }"
            placeholder="인정번호 입력" 
            v-model="form.careLevelNumber"
            @blur="validateCareLevelNumber"
          />
          <span v-if="errors.careLevelNumber" class="error-message">{{ errors.careLevelNumber }}</span>
        </div>

        <div class="input-group">
          <label class="label">장기요양등급 시작일 <span class="required">*</span></label>
          <div class="input-with-icon">
            <input 
              type="date" 
              class="input-field" 
              :class="{ 'error': errors.careLevelStartDate }"
              v-model="form.careLevelStartDate"
              @blur="validateDates"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span v-if="errors.careLevelStartDate" class="error-message">{{ errors.careLevelStartDate }}</span>
        </div>
        <div class="input-group">
          <label class="label">장기요양등급 만료일 <span class="required">*</span></label>
          <div class="input-with-icon">
            <input 
              type="date" 
              class="input-field" 
              :class="{ 'error': errors.careLevelEndDate }"
              v-model="form.careLevelEndDate"
              @blur="validateDates"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span v-if="errors.careLevelEndDate" class="error-message">{{ errors.careLevelEndDate }}</span>
        </div>

        <div class="input-group">
          <label class="label">계약 시작일 <span class="required">*</span></label>
          <div class="input-with-icon">
            <input 
              type="date" 
              class="input-field" 
              :class="{ 'error': errors.contractStartDate }"
              v-model="form.contractStartDate"
              @blur="validateContractDates"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span v-if="errors.contractStartDate" class="error-message">{{ errors.contractStartDate }}</span>
        </div>
        <div class="input-group">
          <label class="label">계약 만료일 <span class="required">*</span></label>
          <div class="input-with-icon">
            <input 
              type="date" 
              class="input-field" 
              :class="{ 'error': errors.contractEndDate }"
              v-model="form.contractEndDate"
              @blur="validateContractDates"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span v-if="errors.contractEndDate" class="error-message">{{ errors.contractEndDate }}</span>
        </div>

        <div class="input-group full-width">
          <label class="label">매칭 태그</label>
          <div class="chip-group">
            <button 
              v-for="tag in matchTags" 
              :key="tag" 
              class="chip-btn" 
              :class="{ active: form.selectedMatchTags.includes(tag) }"
              @click="toggleMatchTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <div class="input-group full-width">
          <label class="label">위험 요소</label>
          <div class="chip-group">
            <button 
              v-for="risk in riskFactors" 
              :key="risk" 
              class="chip-btn danger" 
              :class="{ active: form.selectedRisks.includes(risk) }"
              @click="toggleRisk(risk)"
            >
              {{ risk }}
            </button>
          </div>
        </div>

        <div class="input-group full-width">
          <label class="label">사용자 희망 스케줄</label>
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { getMatchTagsApi, getRiskFactorsApi, registNewBeneficiaryApi } from '@/api/inquiry/counselApi.js';

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

const emit = defineEmits(['has-changes', 'validation-status', 'contract-complete']);

// API에서 불러올 데이터
const matchTags = ref([]);
const riskFactors = ref([]);

// 폼 데이터
const form = reactive({
  // 기본 정보
  name: '',
  birthdate: '',
  phone: '',
  gender: '',
  address: '',
  guardianName: '',
  guardianRelation: '',
  guardianPhone: '',
  
  // 등급 정보
  level: '',
  careLevelNumber: '',
  careLevelStartDate: '',
  careLevelEndDate: '',

  // 계약 정보
  contractStartDate: '',
  contractEndDate: '',
  
  // 3단계에서 바인딩
  selectedMatchTags: [],
  selectedRisks: [],
  beneficiarySchedules: []
});

// 초기 데이터 저장 (변경 감지용)
const initialFormData = ref(null);

// Validation 에러
const errors = reactive({
  name: '',
  birthdate: '',
  phone: '',
  gender: '',
  address: '',
  level: '',
  careLevelNumber: '',
  careLevelStartDate: '',
  careLevelEndDate: '',
  contractStartDate: '',
  contractEndDate: '' 
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

const validateLevel = () => {
  if (!form.level) {
    errors.level = '장기요양등급을 선택해주세요.';
    return false;
  }
  errors.level = '';
  return true;
};

const validateCareLevelNumber = () => {
  if (!form.careLevelNumber || form.careLevelNumber.trim() === '') {
    errors.careLevelNumber = '인정번호를 입력해주세요.';
    return false;
  }
  errors.careLevelNumber = '';
  return true;
};

const validateDates = () => {
  if (!form.careLevelStartDate) {
    errors.careLevelStartDate = '시작일을 선택해주세요.';
    return false;
  }
  
  if (!form.careLevelEndDate) {
    errors.careLevelEndDate = '종료일을 선택해주세요.';
    return false;
  }
  
  errors.careLevelStartDate = '';
  errors.careLevelEndDate = '';
  
  const start = new Date(form.careLevelStartDate);
  const end = new Date(form.careLevelEndDate);
  
  if (start > end) {
    errors.careLevelEndDate = '종료일은 시작일보다 이후여야 합니다.';
    return false;
  }
  
  return true;
};

const validateContractDates = () => {
  if (!form.contractStartDate) {
    errors.contractStartDate = '계약 시작일을 선택해주세요.';
    return false;
  }
  
  if (!form.contractEndDate) {
    errors.contractEndDate = '계약 만료일을 선택해주세요.';
    return false;
  }
  
  errors.contractStartDate = '';
  errors.contractEndDate = '';
  
  const start = new Date(form.contractStartDate);
  const end = new Date(form.contractEndDate);
  
  if (start > end) {
    errors.contractEndDate = '계약 만료일은 시작일보다 이후여야 합니다.';
    return false;
  }
  
  return true;
};

// 전체 Validation
const validateForm = () => {
  const nameValid = validateName();
  const birthdateValid = validateBirthdate();
  const phoneValid = validatePhone();
  const genderValid = validateGender();
  const addressValid = validateAddress();
  const levelValid = validateLevel();
  const numberValid = validateCareLevelNumber();
  const datesValid = validateDates();
  const contractDatesValid = validateContractDates();
  
  const isValid = nameValid && birthdateValid && phoneValid && genderValid && 
                  addressValid && levelValid && numberValid && datesValid && contractDatesValid;
  
  emit('validation-status', isValid);
  
  return isValid;
};

// 매칭 태그 토글
const toggleMatchTag = (tag) => {
  const index = form.selectedMatchTags.indexOf(tag);
  if (index > -1) {
    form.selectedMatchTags.splice(index, 1);
  } else {
    form.selectedMatchTags.push(tag);
  }
};

// 위험 요소 토글
const toggleRisk = (risk) => {
  const index = form.selectedRisks.indexOf(risk);
  if (index > -1) {
    form.selectedRisks.splice(index, 1);
  } else {
    form.selectedRisks.push(risk);
  }
};

// 일정 추가
const addSchedule = () => {
  form.beneficiarySchedules.push({
    beneficiaryScheduleDay: '',
    beneficiaryScheduleStartTime: '',
    beneficiaryScheduleEndTime: '',
    serviceType: ''  // 서비스 타입 추가
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
    if (Array.isArray(response.data)) {
      matchTags.value = response.data.map(item => 
        typeof item === 'object' ? item.label : item
      );
    } else {
      matchTags.value = response.data;
    }
  } catch (error) {
    console.error('❌ 매칭 태그 로드 실패:', error);
    matchTags.value = ['말벗', '산책', '음악', '영화', '게임', '서예', '요리'];
  }
};

const loadRiskFactors = async () => {
  try {
    const response = await getRiskFactorsApi();
    if (Array.isArray(response.data)) {
      riskFactors.value = response.data.map(item => 
        typeof item === 'object' ? item.label : item
      );
    } else {
      riskFactors.value = response.data;
    }
  } catch (error) {
    console.error('위험요소 로드 실패:', error);
    riskFactors.value = ['뇌졸증', '치매', '거동불편', '당뇨', '고혈압', '공격성', '몽유병', '낙상위험', '욕창위험'];
  }
};

// 초기 데이터 로드
onMounted(async () => {
  
  // API 데이터 로드
  await loadMatchTags();
  await loadRiskFactors();
  
  // initialData가 있으면 폼에 채우기
  if (props.initialData) {
    Object.assign(form, props.initialData);
    
    // ✅ 기존 스케줄에 serviceType 필드가 없으면 추가
    if (form.beneficiarySchedules && form.beneficiarySchedules.length > 0) {
      form.beneficiarySchedules = form.beneficiarySchedules.map(schedule => ({
        beneficiaryScheduleDay: schedule.beneficiaryScheduleDay || '',
        beneficiaryScheduleStartTime: schedule.beneficiaryScheduleStartTime || '',
        beneficiaryScheduleEndTime: schedule.beneficiaryScheduleEndTime || '',
        serviceType: schedule.serviceType || ''  // 없으면 빈 문자열
      }));
    }
  }
  // 계약 기본값
  if (!form.contractStartDate) {
    form.contractStartDate = new Date().toISOString().split('T')[0];
  }
  if (!form.contractEndDate) {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    form.contractEndDate = oneYearLater.toISOString().split('T')[0];
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

// 계약 완료 처리
const completeContract = async () => {
  
  // Validation 체크
  if (!validateForm()) {
    return {
      success: false,
      message: '필수 입력 항목을 확인해주세요.'
    };
  }
  
  try {
    // RegistNewBeneficiary DTO 형식으로 데이터 변환
    const requestData = {
      // 기본 정보
      name: form.name,
      gender: form.gender,
      birthdate: form.birthdate,
      address: form.address,
      phone: form.phone,
      potentialCustomerId: props.customer?.customerId || null,
      
      // 보호자 정보
      guardianName: form.guardianName || null,
      guardianRelation: form.guardianRelation || null,
      guardianPhone: form.guardianPhone || null,
      
      // 요양등급 정보
      level: form.level,
      careLevelNumber: form.careLevelNumber,
      careLevelStartDate: form.careLevelStartDate,
      careLevelEndDate: form.careLevelEndDate,
      
      // 계약 정보
      contractStartDate: form.contractStartDate,
      contractEndDate: form.contractEndDate,
      
      // 태그/위험요소
      selectedMatchTags: form.selectedMatchTags || [],
      selectedRisks: form.selectedRisks || [],
      
      // 스케줄
      beneficiarySchedules: form.beneficiarySchedules || [],
      
      // 특이사항 (initialData에 3단계 데이터가 포함되어 있음)
      렌탈금액민감: props.initialData?.렌탈금액민감 || form.렌탈금액민감 || 'N',
      보호자결정의존: props.initialData?.보호자결정의존 || form.보호자결정의존 || 'N',
      보편상품신뢰: props.initialData?.보편상품신뢰 || form.보편상품신뢰 || 'N',
      거동불편: props.initialData?.거동불편 || form.거동불편 || 'N',
      목욕불편: props.initialData?.목욕불편 || form.목욕불편 || 'N',
      문자소통형: props.initialData?.문자소통형 || form.문자소통형 || 'N',
      정기연락중시형: props.initialData?.정기연락중시형 || form.정기연락중시형 || 'N',
      요양보호사고정선호: props.initialData?.요양보호사고정선호 || form.요양보호사고정선호 || 'N',
      성격민감도높음: props.initialData?.성격민감도높음 || form.성격민감도높음 || 'N',
      금액민감도높음: props.initialData?.금액민감도높음 || form.금액민감도높음 || 'N',
      금액부담: props.initialData?.금액부담 || form.금액부담 || 'N'
    };
    
    
    // API 호출
    const response = await registNewBeneficiaryApi(requestData);
    
    
    // 부모 컴포넌트로 성공 이벤트 전달
    emit('contract-complete', {
      success: true,
      message: response.data.message,
      beneficiaryId: response.data.beneficiaryId
    });
    
    return {
      success: true,
      message: response.data.message,
      beneficiaryId: response.data.beneficiaryId
    };
    
  } catch (error) {
    console.error('계약 완료 실패:', error);
    
    const errorMessage = error.response?.data?.message || '계약 완료 처리 중 오류가 발생했습니다.';
    
    // 부모 컴포넌트로 실패 이벤트 전달
    emit('contract-complete', {
      success: false,
      message: errorMessage
    });
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

defineExpose({
  getFormData,
  validateForm,
  resetChangeTracking,
  completeContract  //  추가
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

/* 2. 카드 스타일 */
.info-card {
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

/* 3. 그리드 시스템 */
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

/* 4. 입력 필드 스타일 */
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
  box-sizing: border-box;
  width: 100%;
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

/* 아이콘이 있는 인풋 컨테이너 */
.input-with-icon {
  position: relative;
  width: 100%;
}

.input-with-icon .input-field {
  padding-right: 40px;
}

.icon-svg {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9CA3AF;
  pointer-events: none;
}

/* 보호자 정보 (이름/관계) 분할 레이아웃 */
.split-inputs {
  display: flex;
  gap: 10px;
}

.flex-grow {
  flex: 1;
}

.relation-box {
  width: 100px;
  flex: none;
}

/* 5. 칩 버튼 스타일 (태그/위험요소) */
.chip-group {
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

/* 활성화 상태 (초록색) */
.chip-btn.active {
  background: #00A63E;
  border-color: #00A63E;
  color: white;
  font-weight: 500;
}

/* 위험요소 활성화 상태 (빨간색) */
.chip-btn.danger.active {
  background: #DC2626;
  border-color: #DC2626;
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

/* 반응형 */
@media (max-width: 640px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
  .schedule-item {
    flex-wrap: wrap;
  }
  .schedule-select, .schedule-time {
    width: 100%;
  }
}
</style>
