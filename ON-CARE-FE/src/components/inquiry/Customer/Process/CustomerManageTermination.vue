<template>
  <div class="termination-container">
    <div class="termination-header">
      <h3>계약 종료 정보</h3>
    </div>

    <div v-if="loading" class="loading-state">
      <span>불러오는 중...</span>
    </div>

    <div v-else class="termination-content">
      <!-- 계약 정보 카드 -->
      <div class="info-card">
        <div class="card-title">📋 계약 정보</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">계약 시작일</span>
            <span class="info-value">{{ formatDate(contractInfo?.joinDate) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">계약 종료일</span>
            <span class="info-value" :class="{ 'terminated': isTerminated }">
              {{ formatDate(contractInfo?.terminateDate) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">계약 상태</span>
            <span class="status-badge" :class="statusClass">
              {{ statusText }}
            </span>
          </div>
          <div class="info-item" v-if="contractInfo?.terminationReason">
            <span class="info-label">종료 사유</span>
            <span class="info-value">{{ contractInfo.terminationReason }}</span>
          </div>
        </div>
      </div>

      <!-- 종료 예정 안내 (아직 종료되지 않은 경우) -->
      <div v-if="!isTerminated && contractInfo?.terminateDate" class="warning-card">
        <div class="warning-icon">⏰</div>
        <div class="warning-content">
          <div class="warning-title">계약 종료 예정</div>
          <div class="warning-desc">
            {{ daysUntilTermination }}일 후 ({{ formatDate(contractInfo.terminateDate) }}) 계약이 종료됩니다.
          </div>
        </div>
      </div>

      <!-- 이미 종료된 경우 -->
      <div v-if="isTerminated" class="terminated-card">
        <div class="terminated-icon">🚫</div>
        <div class="terminated-content">
          <div class="terminated-title">계약 종료됨</div>
          <div class="terminated-desc">
            {{ formatDate(contractInfo?.terminateDate) }}에 계약이 종료되었습니다.
          </div>
        </div>
      </div>

      계약 연장/종료 버튼 (종료되지 않은 경우만)
      <div v-if="!isTerminated" class="action-section">
        <button class="action-btn extend" @click="openExtendModal">
          📝 계약 연장
        </button>
        <button class="action-btn terminate" @click="openTerminateModal">
          🚫 계약 종료 처리
        </button>
      </div>
    </div>

    <!-- 계약 연장 모달 -->
    <div v-if="showExtendModal" class="modal-overlay" @click="closeExtendModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>계약 연장</h3>
          <button class="btn-close" @click="closeExtendModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>새 계약 종료일</label>
            <input type="date" v-model="newTerminateDate" class="form-input" :min="minExtendDate" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeExtendModal">취소</button>
          <button class="btn btn-primary" @click="extendContract" :disabled="!newTerminateDate || extending">
            {{ extending ? '처리 중...' : '연장하기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 계약 종료 모달 -->
    <div v-if="showTerminateModal" class="modal-overlay" @click="closeTerminateModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>계약 종료 처리</h3>
          <button class="btn-close" @click="closeTerminateModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>종료일</label>
            <input type="date" v-model="terminateDate" class="form-input" />
          </div>
          <div class="form-group">
            <label>종료 사유</label>
            <textarea v-model="terminateReason" class="form-textarea" placeholder="종료 사유를 입력하세요..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeTerminateModal">취소</button>
          <button class="btn btn-danger" @click="terminateContract" :disabled="!terminateDate || terminating">
            {{ terminating ? '처리 중...' : '종료 처리' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { extendBeneficiaryContract, terminateBeneficiaryContract } from '@/api/customer/customerManageApi';
import { useToast } from '@/lib/toast.js';

const props = defineProps({
  beneficiaryId: {
    type: Number,
    required: true
  },
  contractInfo: {
    type: Object,
    default: null
  },
  isTerminated: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['termination-complete']);
const toast = useToast();

const loading = ref(false);

// 모달 상태
const showExtendModal = ref(false);
const showTerminateModal = ref(false);
const extending = ref(false);
const terminating = ref(false);

// 폼 데이터
const newTerminateDate = ref('');
const terminateDate = ref('');
const terminateReason = ref('');

// 계약 상태
const statusText = computed(() => {
  if (props.isTerminated) return '종료됨';
  if (props.contractInfo?.terminateDate) {
    const days = daysUntilTermination.value;
    if (days <= 30) return '종료 임박';
    return '계약 중';
  }
  return '계약 중';
});

const statusClass = computed(() => {
  if (props.isTerminated) return 'terminated';
  if (props.contractInfo?.terminateDate) {
    const days = daysUntilTermination.value;
    if (days <= 30) return 'warning';
  }
  return 'active';
});

// 종료까지 남은 일수
const daysUntilTermination = computed(() => {
  if (!props.contractInfo?.terminateDate) return null;
  
  const today = new Date();
  const termDate = new Date(props.contractInfo.terminateDate);
  const diffTime = termDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// 최소 연장일 (오늘 이후)
const minExtendDate = computed(() => {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  return today.toISOString().split('T')[0];
});

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

// 계약 연장 모달
const openExtendModal = () => {
  newTerminateDate.value = '';
  showExtendModal.value = true;
};

const closeExtendModal = () => {
  showExtendModal.value = false;
};

// 계약 종료 모달
const openTerminateModal = () => {
  terminateDate.value = new Date().toISOString().split('T')[0];
  terminateReason.value = '';
  showTerminateModal.value = true;
};

const closeTerminateModal = () => {
  showTerminateModal.value = false;
};

// 계약 연장
const extendContract = async () => {
  if (!newTerminateDate.value) {
    toast.error('새 종료일을 선택해주세요.');
    return;
  }

  extending.value = true;
  try {
    await extendBeneficiaryContract(props.beneficiaryId, {
      newTerminateDate: newTerminateDate.value
    });
    
    toast.success('계약이 연장되었습니다.');
    closeExtendModal();
    emit('termination-complete');
  } catch (e) {
    console.error('계약 연장 실패:', e);
    toast.error('계약 연장에 실패했습니다.');
  } finally {
    extending.value = false;
  }
};

// 계약 종료
const terminateContract = async () => {
  if (!terminateDate.value) {
    toast.error('종료일을 선택해주세요.');
    return;
  }

  terminating.value = true;
  try {
    await terminateBeneficiaryContract(props.beneficiaryId, {
      terminateDate: terminateDate.value,
      terminationReason: terminateReason.value
    });
    
    toast.success('계약이 종료 처리되었습니다.');
    closeTerminateModal();
    emit('termination-complete');
  } catch (e) {
    console.error('계약 종료 실패:', e);
    toast.error('계약 종료에 실패했습니다.');
  } finally {
    terminating.value = false;
  }
};
</script>

<style scoped>
.termination-container {
  min-height: 200px;
}

.termination-header {
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 20px;
}

.termination-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #9CA3AF;
}

.termination-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #6B7280;
}

.info-value {
  font-size: 14px;
  color: #111827;
  font-weight: 500;
}

.info-value.terminated {
  color: #DC2626;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-badge.active {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.warning {
  background: #FEF3C7;
  color: #92400E;
}

.status-badge.terminated {
  background: #FEE2E2;
  color: #B91C1C;
}

.warning-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 12px;
}

.warning-icon {
  font-size: 24px;
}

.warning-title {
  font-size: 14px;
  font-weight: 600;
  color: #92400E;
}

.warning-desc {
  font-size: 13px;
  color: #78350F;
  margin-top: 4px;
}

.terminated-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #FEE2E2;
  border: 1px solid #FECACA;
  border-radius: 12px;
}

.terminated-icon {
  font-size: 24px;
}

.terminated-title {
  font-size: 14px;
  font-weight: 600;
  color: #B91C1C;
}

.terminated-desc {
  font-size: 13px;
  color: #991B1B;
  margin-top: 4px;
}

.action-section {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #E5E7EB;
}

.action-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.extend {
  background: #DBEAFE;
  color: #1E40AF;
}

.action-btn.extend:hover {
  background: #BFDBFE;
}

.action-btn.terminate {
  background: #FEE2E2;
  color: #B91C1C;
}

.action-btn.terminate:hover {
  background: #FECACA;
}

/* 모달 */
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
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 18px;
  color: #6B7280;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
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
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: #F3F4F6;
  color: #374151;
}

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.btn-danger {
  background: #DC2626;
  color: white;
}

.btn-danger:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}
</style>
