<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">신규 잠재고객 등록</h3>
        <button class="btn-close" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">
            이름 <span class="required">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ 'error': errors.name }"
            placeholder="이름을 입력하세요"
            @blur="validateName"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">
            전화번호 <span class="required">*</span>
          </label>
          <input
            v-model="form.phone"
            type="tel"
            class="form-input"
            :class="{ 'error': errors.phone }"
            placeholder="010-0000-0000"
            @blur="validatePhone"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" @click="closeModal">취소</button>
        <button 
          class="btn btn-primary" 
          :disabled="isSaving"
          @click="handleSubmit"
        >
          {{ isSaving ? '등록 중...' : '등록하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { registPotentialCustomerApi, checkDuplicateCustomerApi } from '@/api/inquiry/counselApi';
import { useToast } from '@/lib/toast';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'success']);

const toast = useToast();

const form = reactive({
  name: '',
  phone: ''
});

const errors = reactive({
  name: '',
  phone: ''
});

const isSaving = ref(false);

// Validation
const validateName = () => {
  if (!form.name.trim()) {
    errors.name = '이름을 입력해주세요.';
    return false;
  }
  errors.name = '';
  return true;
};

const validatePhone = () => {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  
  if (!form.phone.trim()) {
    errors.phone = '전화번호를 입력해주세요.';
    return false;
  }
  
  const cleanPhone = form.phone.replace(/-/g, '');
  if (!phoneRegex.test(cleanPhone)) {
    errors.phone = '올바른 전화번호 형식이 아닙니다.';
    return false;
  }
  
  errors.phone = '';
  return true;
};

const validateForm = () => {
  const nameValid = validateName();
  const phoneValid = validatePhone();
  return nameValid && phoneValid;
};

// 중복 회원 체크
const checkDuplicateCustomer = async () => {
  try {
    const response = await checkDuplicateCustomerApi({
      name: form.name.trim(),
      phone: form.phone.trim().replace(/-/g, '')
    });
    
    // response.data.exists === true 면 중복
    return response.data.exists;
  } catch (error) {
    console.error('중복 체크 실패:', error);
    // API 오류 시 일단 진행 허용 (백엔드에서 다시 체크)
    return false;
  }
};

// 제출
const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('필수 항목을 확인해주세요.');
    return;
  }

  isSaving.value = true;

  try {
    // 1. 중복 회원 체크
    const isDuplicate = await checkDuplicateCustomer();
    
    if (isDuplicate) {
      toast.error('이미 존재하는 회원입니다.');
      isSaving.value = false;
      return;
    }

    // 2. 중복 아니면 등록 진행
    const response = await registPotentialCustomerApi({
      name: form.name.trim(),
      phone: form.phone.trim()
    });

    toast.success('신규 잠재고객이 등록되었습니다.');
    
    // 부모에게 성공 이벤트 전달 (등록된 고객 정보 포함)
    emit('success', response.data);
    
    // 폼 초기화
    resetForm();
    
    // 모달 닫기
    closeModal();

  } catch (error) {
    console.error('❌ 잠재고객 등록 실패:', error);
    
    // 백엔드에서 중복 체크한 경우 에러 메시지 표시
    const errorMessage = error.response?.data?.message || '등록에 실패했습니다.';
    
    if (errorMessage.includes('존재') || errorMessage.includes('duplicate') || errorMessage.includes('중복')) {
      toast.error('이미 존재하는 회원입니다.');
    } else {
      toast.error(errorMessage);
    }
  } finally {
    isSaving.value = false;
  }
};

const resetForm = () => {
  form.name = '';
  form.phone = '';
  errors.name = '';
  errors.phone = '';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

// 모달이 열릴 때마다 폼 초기화
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-close {
  padding: 4px;
  background: transparent;
  border: none;
  color: #6B7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #F3F4F6;
  color: #111827;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #EF4444;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #00A63E;
  box-shadow: 0 0 0 3px rgba(0, 166, 62, 0.1);
}

.form-input.error {
  border-color: #EF4444;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #EF4444;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #F3F4F6;
  color: #374151;
}

.btn-cancel:hover {
  background: #E5E7EB;
}

.btn-primary {
  background: #00A63E;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #008C35;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}
</style>
