<template>
  <div class="advanced-info-container" ref="rootRef">
    <div class="step-title">1단계: 신규접수</div>

    <div class="info-card">
      <div class="card-title">필수 등록 정보 <span class="required-mark">*</span></div>
      <div class="input-grid">
        <div class="input-group">
          <label class="label">
            수급자 이름 <span class="required-mark">*</span>
          </label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.name }"
            placeholder="수급자 이름 입력" 
            v-model="form.name"
            @blur="validateName"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        <div class="input-group">
          <label class="label">
            전화번호 <span class="required-mark">*</span>
          </label>
          <div class="input-with-icon">
            <input 
              type="text" 
              class="input-field" 
              :class="{ 'error': errors.phone }"
              placeholder="전화번호 입력" 
              v-model="form.phone"
              @blur="validatePhone"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>
      </div>
    </div>

    <div class="info-card">
      <div class="card-title">보호자 정보</div>
      <div class="input-grid">
        <div class="input-group">
          <label class="label">보호자 이름</label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.guardianName }"
            placeholder="보호자 이름 입력" 
            v-model="form.guardianName"
            @blur="validateGuardianName" 
          />
          <span v-if="errors.guardianName" class="error-message">{{ errors.guardianName }}</span>
        </div>
        <div class="input-group">
          <label class="label">보호자 관계</label>
          <input type="text" class="input-field" placeholder="예: 아들, 딸, 며느리" v-model="form.guardianRelation" />
        </div>
        <div class="input-group">
          <label class="label">보호자 전화번호</label>
          <input 
            type="text" 
            class="input-field" 
            :class="{ 'error': errors.guardianPhone }"
            placeholder="전화번호 입력" 
            v-model="form.guardianPhone"
            @blur="validateGuardianPhone"
          />
          <span v-if="errors.guardianPhone" class="error-message">{{ errors.guardianPhone }}</span>
        </div>
      </div>
    </div>

    <div class="info-card">
      <div class="card-title">추가 정보</div>
      
      <div class="input-grid">
        <div class="input-group">
          <label class="label">생년월일</label>
          <div class="input-with-icon">
            <input 
              type="date" 
              class="input-field" 
              :class="{ 'error': errors.birthdate }"
              v-model="form.birthdate"
              :max="todayDate"
              @blur="validateBirthdate"
            />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span v-if="errors.birthdate" class="error-message">{{ errors.birthdate }}</span>
        </div>
        <div class="input-group full-width">
          <label class="label">주소</label>
          <input type="text" class="input-field" placeholder="주소 입력" v-model="form.address" />
        </div>
      </div>

      <div class="input-group full-width" style="margin-top: 20px;">
        <label class="label">가입 경로</label>
        <div class="checkbox-group">
          <div 
            class="check-item" 
            v-for="path in joinPaths" 
            :key="path.id" 
            @click="togglePath(path.id)"
          >
            <div class="check-box" :class="{ checked: form.selectedPaths.includes(path.id) }">
              <div v-if="form.selectedPaths.includes(path.id)" class="check-mark"></div>
            </div>
            <span class="option-label">{{ path.label }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';

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

// 오늘 날짜 구하기 (YYYY-MM-DD 포맷) - input date의 max 속성용
const todayDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// 가입 경로 데이터
const joinPaths = [
  { id: 1, label: '전화' },
  { id: 2, label: '방문' },
  { id: 3, label: '블로그' },
  { id: 4, label: '지인 추천' },
  { id: 5, label: 'SNS' }
];

// 폼 데이터
const form = reactive({
  name: '',
  phone: '',
  guardianName: '',
  guardianRelation: '',
  guardianPhone: '',
  birthdate: '',
  address: '',
  selectedPaths: []
});

// 초기 데이터 저장 (변경 감지용)
const initialFormData = ref(null);

// Validation 에러 상태 관리
const errors = reactive({
  name: '',
  phone: '',
  guardianName: '',
  guardianPhone: '',
  birthdate: ''
});

// 가입 경로 토글
const togglePath = (id) => {
  if (form.selectedPaths.includes(id)) {
    form.selectedPaths = form.selectedPaths.filter(itemId => itemId !== id);
  } else {
    form.selectedPaths.push(id);
  }
};

// Validation 함수들

// 1. 수급자 이름 검증
const validateName = () => {
  if (!form.name || form.name.trim() === '') {
    errors.name = '수급자 이름은 필수입니다.';
    return false;
  }
  errors.name = '';
  return true;
};

// 2. 전화번호 공통 검증 정규식 (숫자와 하이픈만 허용)
const isValidPhoneFormat = (phone) => {
  const phoneRegex = /^[0-9-]+$/;
  return phoneRegex.test(phone);
};

// 3. 수급자 전화번호 검증
const validatePhone = () => {
  if (!form.phone || form.phone.trim() === '') {
    errors.phone = '전화번호는 필수입니다.';
    return false;
  }
  
  if (!isValidPhoneFormat(form.phone)) {
    errors.phone = '올바른 전화번호 형식이 아닙니다.';
    return false;
  }
  
  errors.phone = '';
  return true;
};

// 4. 보호자 이름 검증 (특수문자/숫자 제외, 한글/영문만 허용)
const validateGuardianName = () => {
  // 필수값이 아니므로 비어있으면 통과
  if (!form.guardianName || form.guardianName.trim() === '') {
    errors.guardianName = '';
    return true;
  }

  // 한글, 영문, 공백만 허용
  const nameRegex = /^[가-힣a-zA-Z\s]+$/;
  if (!nameRegex.test(form.guardianName)) {
    errors.guardianName = '이름에 특수문자나 숫자를 포함할 수 없습니다.';
    return false;
  }

  errors.guardianName = '';
  return true;
};

// 5. 보호자 전화번호 검증
const validateGuardianPhone = () => {
  // 필수값이 아니므로 비어있으면 통과
  if (!form.guardianPhone || form.guardianPhone.trim() === '') {
    errors.guardianPhone = '';
    return true;
  }

  if (!isValidPhoneFormat(form.guardianPhone)) {
    errors.guardianPhone = '올바른 전화번호 형식이 아닙니다.';
    return false;
  }

  errors.guardianPhone = '';
  return true;
};

// 6. 생년월일 검증 (미래 날짜 방지)
const validateBirthdate = () => {
  if (!form.birthdate) {
    errors.birthdate = '';
    return true;
  }

  const selectedDate = new Date(form.birthdate);
  const today = new Date();
  // 시간 비교를 제외하기 위해 오늘 날짜의 시간을 00:00:00으로 설정
  today.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    errors.birthdate = '미래의 날짜는 입력할 수 없습니다.';
    return false;
  }

  errors.birthdate = '';
  return true;
};

// 전체 Validation
const validateForm = () => {
  const nameValid = validateName();
  const phoneValid = validatePhone();
  const guardianNameValid = validateGuardianName();
  const guardianPhoneValid = validateGuardianPhone();
  const birthdateValid = validateBirthdate();
  
  // 모든 필드가 유효해야 함
  const isValid = nameValid && phoneValid && guardianNameValid && guardianPhoneValid && birthdateValid;
  
  // 부모에게 validation 상태 전달
  emit('validation-status', isValid);
  
  return isValid;
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
  
  // 변경이 있으면 validation 상태도 업데이트
  if (hasChanges) {
    validateForm();
  }
}, { deep: true });

// 초기 데이터 로드
onMounted(() => {
  if (props.initialData) {
    const data = { ...props.initialData };
    if (data.birthdate && typeof data.birthdate === 'string') {
      data.birthdate = data.birthdate.split(' ')[0];
    }
    Object.assign(form, data);
  } else if (props.customer) {
    form.name = props.customer.name || '';
    form.phone = props.customer.phone || '';
  }
  
  // 초기 데이터 저장
  initialFormData.value = JSON.parse(JSON.stringify(form));
  
  // 초기 validation 수행
  validateForm();
});

// 폼 데이터 반환
const getFormData = () => {
  return { ...form };
};

// 저장 후 초기 데이터 업데이트
const resetChangeTracking = () => {
  initialFormData.value = JSON.parse(JSON.stringify(form));
  emit('has-changes', false);
};

defineExpose({
  getFormData,
  validateForm,
  resetChangeTracking
});
</script>

<style scoped>
/* 기존 스타일 그대로 유지 */
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

.required-mark {
  color: #DC2626;
  font-weight: 700;
  margin-left: 2px;
}

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
  width: 100%;
}

.label {
  color: #4B5563;
  font-size: 13px;
  font-weight: 500;
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

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.check-box {
  width: 18px;
  height: 18px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.check-box.checked {
  background: #00A63E;
  border-color: #00A63E;
}

.check-mark {
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.option-label {
  color: #374151;
  font-size: 14px;
}

@media (max-width: 640px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
}
</style>