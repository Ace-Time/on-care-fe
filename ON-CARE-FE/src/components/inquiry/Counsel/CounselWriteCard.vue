<template>
  <div class="card write-section">
    <div class="card-header simple flex-between">
      <div class="header-title">상담 작성</div>
      
      <div class="right-group">
        <button class="btn-new-green" @click="resetForm">신규 상담</button>

        <div class="dropdown-trigger" @click="toggleDropdown">
          <span>{{ form.category }}</span>
          <div class="arrow-down"></div>
          
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <div class="dropdown-item" @click.stop="selectCategory('유형선택')">유형선택</div>
            <div class="dropdown-item" @click.stop="selectCategory('가입상담')">가입상담</div>
            <div class="dropdown-item" @click.stop="selectCategory('렌탈상담')">렌탈상담</div>
            <div class="dropdown-item" @click.stop="selectCategory('문의상담')">문의상담</div>
            <div class="dropdown-item" @click.stop="selectCategory('컴플레인')">컴플레인</div>
            <div class="dropdown-item" @click.stop="selectCategory('해지상담')">해지상담</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-body">
      <div class="form-group">
        <div class="sub-title">고객 정보</div>
        <div v-if="effectiveCustomer" class="info-grid">
          <div class="info-row">
            <span class="label">수급자 이름</span>
            <div class="value">{{ effectiveCustomer.name }}</div>
          </div>
          <div class="info-row">
            <span class="label">전화번호</span>
            <div class="value">{{ effectiveCustomer.phone }}</div>
          </div>
        </div>
        <div v-else class="customer-empty">
          고객을 선택해주세요.
        </div>
      </div>

      <div class="form-group action-panel" :class="{ 'churn-active': isChurned }">
        <div class="action-header" @click="toggleChurn">
          <div class="checkbox-wrapper">
            <div class="checkbox churn-check" :class="{ checked: isChurned }">
              <transition name="check-pop">
                <div v-if="isChurned" class="check-mark"></div>
              </transition>
            </div>
            <span class="check-label add-weight">고객 이탈 여부</span>
          </div>
          <span class="toggle-hint">{{ isChurned ? '접기' : '사유 입력' }}</span>
        </div>
        <transition name="slide-down">
          <div v-if="isChurned" class="action-body">
            <textarea 
              v-model="form.churnReason"
              class="panel-textarea churn-input" 
              placeholder="이탈 사유를 상세히 입력해주세요."
            ></textarea>
          </div>
        </transition>
      </div>

      <div class="form-group action-panel" :class="{ 'followup-active': isNecessary }">
        <div class="action-header" @click="toggleNecessary">
          <div class="checkbox-wrapper">
            <div class="checkbox followup-check" :class="{ checked: isNecessary }">
               <transition name="check-pop">
                <div v-if="isNecessary" class="check-mark"></div>
               </transition>
            </div>
            <span class="check-label add-weight">후속 조치 여부</span>
          </div>
          <span class="toggle-hint">{{ isNecessary ? '접기' : '내용 입력' }}</span>
        </div>
        <transition name="slide-down">
          <div v-if="isNecessary" class="action-body">
            <textarea 
              v-model="form.followUp"
              class="panel-textarea followup-input" 
              placeholder="필요한 후속 조치를 입력해주세요."
            ></textarea>
          </div>
        </transition>
      </div>

      <div class="form-group">
        <div class="sub-title">상담 내용</div>
        <div class="memo-area">
          <textarea 
            v-model="form.content"
            class="memo-input" 
            placeholder="상담 내용을 자유롭게 기록해주세요"
          ></textarea>
          <button 
            class="counsel-save-btn" 
            :class="{ disabled: !canSave }"
            :disabled="!canSave"
            @click="saveCounsel"
          >
            {{ isSaving ? '저장 중...' : '상담 내용 저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 신규 고객 등록 모달 -->
    <NewPotentialCustomerModal
      :isOpen="isModalOpen"
      @close="closeModal"
      @success="handleNewCustomerSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import NewPotentialCustomerModal from '@/components/inquiry/Counsel/Modal/NewPotentialCustomerModal.vue';
import { registNewGeneralCounselApi, registGeneralCounselApi } from '@/api/inquiry/counselApi.js';
import { useToast } from '@/lib/toast';
import { useUserStore } from '@/stores/user' 

const toast = useToast();

const userStore = useUserStore()
const employeeId = computed(() => userStore.userId)

const props = defineProps({
  selectedCustomer: {
    type: Object,
    default: null
  }
});

const localCustomer = ref(null)
const effectiveCustomer = computed(() => props.selectedCustomer || localCustomer.value)

const emit = defineEmits(['update:category', 'reset', 'customer-created', 'counsel-saved']);

// 모달 상태
const isModalOpen = ref(false);
const isSaving = ref(false);

// 폼 데이터
const form = reactive({
  category: '유형선택',
  name: '',
  phone: '',
  content: '',
  churnReason: '',
  followUp: ''
});

// 날짜 포맷터
const formatConsultDate = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const HH = pad(d.getHours())
  const mm = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}` // ✅ yyyy-MM-dd HH:mm:ss
}

// 체크박스
const isChurned = ref(false);
const isNecessary = ref(false);
const isDropdownOpen = ref(false);

// 저장 가능 여부
const canSave = computed(() => {
  // 1. 카테고리 선택 확인
  if (form.category === '유형선택') return false;
  
  
  // 3. 고객 정보 확인
  const hasCustomer = props.selectedCustomer || (form.name && form.phone);
  if (!hasCustomer) return false;
  
  // 4. 상담 내용 확인
  if (!form.content || form.content.trim().length === 0) return false;
  
  return true;
});

// 카테고리 ID 변환
const getCategoryId = (category) => {
  const categoryIdMap = {
    '가입상담': 1,
    '렌탈상담': 2,
    '문의상담': 3,
    '컴플레인': 4,
    '해지상담': 5
  };
  return categoryIdMap[category];
};

const customer = effectiveCustomer.value

// 상담 저장
const saveCounsel = async () => {
  if (!canSave.value) {
    toast.error('필수 항목을 입력해주세요.');
    return;
  }

  // ✅ 최신 고객 정보는 함수 안에서 매번 가져와야 함
  const customer = effectiveCustomer.value;

  // (선택) 직원 ID 방어
  if (!employeeId.value || employeeId.value <= 0) {
    toast.error('로그인 정보(직원 ID)를 확인할 수 없습니다. 다시 로그인 해주세요.');
    return;
  }

  isSaving.value = true;

  try {
    const counselCategoryId = getCategoryId(form.category);
    if (!counselCategoryId) {
      toast.error('유효하지 않은 상담 카테고리입니다.');
      return;
    }

    const requestData = {
      consultDate: formatConsultDate(),
      detail: form.content,
      churn: isChurned.value ? 'Y' : 'N',
      churnReason: isChurned.value ? form.churnReason : null,
      followUpNecessary: isNecessary.value ? 'Y' : 'N',
      followUp: isNecessary.value ? form.followUp : null,
      counselCategoryId,
      guardianSt: 0,
      reservationChannelId: 1,
      employeeId: employeeId.value,

      customerId: customer?.customerId ?? null,
      customerType: customer?.customerType ?? null,
    };

    let response;

    // ✅ 저장 요청은 딱 한 번만!
    if (customer?.customerId) {
      response = await registGeneralCounselApi(
        requestData,
        customer.customerId,
        customer.customerType
      );
    } else {
      requestData.name = form.name;
      requestData.phone = form.phone;
      response = await registNewGeneralCounselApi(requestData);
    }

    if (response?.data?.success || response?.status === 200) {
      toast.success('상담 내용이 저장되었습니다.');

      // 폼 초기화
      form.content = '';
      form.churnReason = '';
      form.followUp = '';
      isChurned.value = false;
      isNecessary.value = false;

      emit('counsel-saved');
    }
  } catch (error) {
    console.error('❌ 상담 저장 실패:', error);
    toast.error(error.response?.data?.message || '상담 저장에 실패했습니다.');
  } finally {
    isSaving.value = false;
  }
};

// 신규 상담
const resetForm = () => {
  if (!props.selectedCustomer) {
    isModalOpen.value = true;
  } else {
    form.category = '가입상담';
    form.content = '';
    form.churnReason = '';
    form.followUp = '';
    isChurned.value = false;
    isNecessary.value = false;
    emit('reset');
  }
};

// 모달 닫기
const closeModal = () => {
  isModalOpen.value = false;
};

// 신규 고객 등록 성공
const handleNewCustomerSuccess = (customerData) => {
  console.log('신규 고객 등록 성공:', customerData);
  toast.success(`${customerData.name}님이 등록되었습니다.`);

  localCustomer.value = {
    ...customerData,
    customerId: customerData.customerId ?? customerData.id,
    customerType: customerData.customerType ?? 'potential',  // 잠재고객으로 고정
  }
  
  emit('customer-created', customerData);
  
  form.category = '가입상담';
  form.content = '';
  isChurned.value = false;
  isNecessary.value = false;
};

// 드롭다운
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectCategory = (label) => {
  form.category = label;
  isDropdownOpen.value = false;
  emit('update:category', label);
};

// 체크박스
const toggleChurn = () => {
  isChurned.value = !isChurned.value;
};

const toggleNecessary = () => {
  isNecessary.value = !isNecessary.value;
};

// Watch
watch(() => props.selectedCustomer, (newCustomer) => {
  if (newCustomer) {
    form.name = newCustomer.name;
    form.phone = newCustomer.phone;
  } else {
    form.name = '';
    form.phone = '';
  }
}, { immediate: true });

watch(() => isChurned.value, (value) => {
  if (!value) {
    form.churnReason = '';
  }
});

watch(() => isNecessary.value, (value) => {
  if (!value) {
    form.followUp = '';
  }
});
</script>

<style scoped>
/* Card & Header Styles from previous context */
.card { background: white; border-radius: 10px; border: 1px solid #E5E7EB; display: flex; flex-direction: column; overflow: visible; min-height: 340px; }
.card-header { padding: 16px; border-bottom: 1px solid #E5E7EB; display: flex; gap: 12px; }
.simple { padding-bottom: 15px; }
.flex-between { flex-direction: row; justify-content: space-between; align-items: center; }
.header-title { font-size: 16px; font-weight: 600; color: #1F2937; }

/* Right Group Styles */
.right-group { display: flex; gap: 8px; align-items: center; }
.btn-new-green { padding: 8px 16px; background: #00A63E; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-new-green:hover { background: #008C35; }

/* Dropdown Trigger */
.dropdown-trigger { position: relative; display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: white; border: 1px solid #D1D5DB; border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151; min-width: 120px; justify-content: space-between; }
.dropdown-trigger:hover { border-color: #9CA3AF; background: #F9FAFB; }
.arrow-down { width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #6B7280; transition: transform 0.2s; }
.dropdown-trigger:hover .arrow-down { border-top-color: #374151; }

/* Dropdown Menu */
.dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 4px; background: white; border: 1px solid #E5E7EB; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); min-width: 140px; z-index: 100; }
.dropdown-item { padding: 10px 14px; cursor: pointer; font-size: 14px; color: #374151; transition: all 0.15s; }
.dropdown-item:hover { background: #F3F4F6; color: #00A63E; }
.dropdown-item:first-child { border-radius: 6px 6px 0 0; }
.dropdown-item:last-child { border-radius: 0 0 6px 6px; }

/* Form Body */
.form-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 10px; }
.sub-title { font-size: 14px; font-weight: 600; color: #374151; }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-row { display: flex; align-items: center; gap: 12px; }
.label { font-size: 13px; color: #6B7280; min-width: 80px; }
.value { font-size: 14px; color: #1F2937; font-weight: 500; }
.compact-input { flex: 1; padding: 6px 10px; border: 1px solid #D1D5DB; border-radius: 4px; font-size: 13px; }
.compact-input:focus { outline: none; border-color: #00A63E; }

/* Checkbox */
.checkbox-row, .checkbox-row2 { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.checkbox { width: 18px; height: 18px; border: 2px solid #D1D5DB; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.checkbox.checked { background: #EF4444; border-color: #EF4444; }
.checkbox.blue.checked { background: #3B82F6; border-color: #3B82F6; }
.check-mark { width: 10px; height: 10px; background: white; mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>') no-repeat center; mask-size: contain; }
.check-label { font-size: 14px; color: #374151; user-select: none; }

/* Textarea Boxes */
.churn-reason-box, .follow-up-box { margin-top: 8px; }
.churn-input, .follow-up-input { width: 100%; min-height: 80px; padding: 10px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; resize: vertical; font-family: inherit; }
.churn-input:focus, .follow-up-input:focus { outline: none; border-color: #00A63E; }

/* Memo Area */
.memo-area { display: flex; flex-direction: column; gap: 12px; }
.memo-input { width: 100%; min-height: 120px; padding: 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; resize: vertical; font-family: inherit; }
.memo-input:focus { outline: none; border-color: #00A63E; box-shadow: 0 0 0 3px rgba(0, 166, 62, 0.1); }

/* Save Button */
.counsel-save-btn { align-self: flex-end; padding: 10px 24px; background: #00A63E; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.counsel-save-btn:hover:not(.disabled) { background: #008C35; }
.counsel-save-btn.disabled { background: #9CA3AF; cursor: not-allowed; }
.counsel-save-btn:disabled { background: #9CA3AF; cursor: not-allowed; }

.customer-empty {
  padding: 10px 12px;
  border: 1px dashed #D1D5DB;
  border-radius: 8px;
  background: #F9FAFB;
  color: #6B7280;
  font-size: 13px;
}

.action-panel {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 헤더 영역 */
.action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-label.add-weight {
  font-weight: 600;
  color: #4B5563;
  transition: color 0.2s;
}

.toggle-hint {
  font-size: 12px;
  color: #9CA3AF;
  font-weight: 500;
  transition: all 0.2s;
}

/* 공통 체크박스 스타일 재정의 */
.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #D1D5DB;
  border-radius: 6px; /* 조금 더 둥글게 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: white;
}
.check-mark {
  width: 12px;
  height: 12px;
  /* 기존 mask 스타일 유지 */
}

/* --- 이탈 여부(Red) 디자인 --- */
.action-panel.churn-active {
  background: #FEF2F2; /* 아주 연한 빨강 배경 */
  border-color: #FCA5A5;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.1);
}
.action-panel.churn-active .check-label.add-weight { color: #B91C1C; }
.action-panel.churn-active .toggle-hint { color: #EF4444; }

.checkbox.churn-check.checked {
  background: #EF4444;
  border-color: #EF4444;
}
.churn-input:focus {
  border-color: #EF4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}


/* --- 후속 조치(Blue) 디자인 --- */
.action-panel.followup-active {
  background: #EFF6FF; /* 아주 연한 파랑 배경 */
  border-color: #93C5FD;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}
.action-panel.followup-active .check-label.add-weight { color: #1D4ED8; }
.action-panel.followup-active .toggle-hint { color: #3B82F6; }

.checkbox.followup-check.checked {
  background: #3B82F6;
  border-color: #3B82F6;
}
.followup-input:focus {
  border-color: #3B82F6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}


/* --- 내용 입력 영역 및 텍스트에어리어 --- */
.action-body {
  padding: 0 16px 16px 16px;
}

.panel-textarea {
  width: 100%;
  /* 테두리와 패딩을 너비(width) 안에 포함시키는 핵심 속성 */
  box-sizing: border-box; 
  
  min-height: 90px;
  padding: 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  background: white;
  transition: all 0.2s;
}
.panel-textarea:focus {
 outline: none;
}


/* --- Vue Transition 애니메이션 --- */
/* 슬라이드 다운 효과 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 200px; /* 텍스트에어리어 최대 높이 근사치 */
  opacity: 1;
  transform: translateY(0);
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  padding-bottom: 0; /* 닫힐 때 패딩 제거 */
  margin: 0;
}

/* 체크 표시 팝 효과 */
.check-pop-enter-active { transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.check-pop-enter-from { transform: scale(0); opacity: 0; }
</style>
