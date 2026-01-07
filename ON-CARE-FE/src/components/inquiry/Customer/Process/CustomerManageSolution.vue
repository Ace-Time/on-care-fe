<template>
  <div class="solution-container">
    <div v-if="loading" class="loading-state">
      <span>불러오는 중...</span>
    </div>

    <div v-else-if="!manageDetail" class="empty-state">
      <span>고객 관리 정보를 불러올 수 없습니다.</span>
    </div>

    <div v-else class="solution-content">
      <!-- 고객 기본 정보 -->
      <div class="customer-info-header">
        <h3>{{ manageDetail.name }} 님의 고객 관리</h3>
        <div class="info-badges">
          <span v-if="manageDetail.careWorkerName" class="info-badge">
            담당: {{ manageDetail.careWorkerName }}
          </span>
        </div>
      </div>

      <!-- 이탈위험징후포착 섹션 -->
      <div class="section" v-if="hasChurnRiskSection">
        <div class="section-header churn-risk">
          <span class="section-icon">⚠️</span>
          <span class="section-title">이탈위험징후포착</span>
        </div>

        <!-- 이탈위험기간임박 -->
        <div class="solution-card" v-if="manageDetail.isChurnRisk">
          <div class="card-header">
            <span class="card-title">이탈위험기간임박</span>
            <span class="card-badge warning">{{ manageDetail.daysSinceLastCounsel || 30 }}일 경과</span>
          </div>
          <div class="card-body">
            <p class="card-desc">
              최근 상담일: {{ formatDate(manageDetail.lastCounselDate) || '기록 없음' }}
            </p>
            <p class="card-solution">
              <strong>💡 Solution:</strong> 장기간 미상담 고객입니다. 상담을 진행해 주세요.
            </p>
          </div>
          <div class="card-actions">
            <!-- <button class="action-btn primary" @click="sendChurnRiskNotification" :disabled="actionLoading">
              {{ actionLoading ? '발송 중...' : '상담 요청 알림 발송' }}
            </button> -->
          </div>
        </div>

        <!-- 불만상담접수 -->
        <div class="solution-card" v-if="manageDetail.hasComplaint">
          <div class="card-header">
            <span class="card-title">불만상담접수</span>
            <span class="card-badge danger">불만 접수</span>
          </div>
          <div class="card-body">
            <div class="counsel-summary" v-if="manageDetail.latestComplaint">
              <div class="summary-row">
                <span class="label">상담일:</span>
                <span>{{ formatDate(manageDetail.latestComplaint.consultDate) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">상담사:</span>
                <span>{{ manageDetail.latestComplaint.counselorName }}</span>
              </div>
              <div class="summary-row">
                <span class="label">내용:</span>
                <span>{{ manageDetail.latestComplaint.detail }}</span>
              </div>
              <div class="summary-row" v-if="manageDetail.latestComplaint.followUp">
                <span class="label">기존 후속조치:</span>
                <span>{{ manageDetail.latestComplaint.followUp }}</span>
              </div>
            </div>
            <p class="card-solution">
              <strong>💡 Solution:</strong> 불만 사항에 대한 후속 조치를 진행해 주세요.
            </p>
          </div>
          <div class="card-actions">
            <!-- <div class="input-group">
              <textarea 
                v-model="complaintFollowUp" 
                placeholder="후속조치 내용을 입력하세요..."
                class="followup-input"
              ></textarea>
            </div> -->
            <!-- <button 
              class="action-btn primary" 
              @click="submitComplaintFollowUp"
              :disabled="actionLoading || !complaintFollowUp.trim()"
            >
              {{ actionLoading ? '등록 중...' : '후속조치 등록 및 알림 발송' }}
            </button> -->
          </div>
        </div>

        <!-- 해지상담등록 -->
        <div class="solution-card" v-if="manageDetail.hasTermination">
          <div class="card-header">
            <span class="card-title">해지상담등록</span>
            <span class="card-badge danger">해지 예정</span>
          </div>
          <div class="card-body">
            <div class="counsel-summary" v-if="manageDetail.latestTermination">
              <div class="summary-row">
                <span class="label">상담일:</span>
                <span>{{ formatDate(manageDetail.latestTermination.consultDate) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">사유:</span>
                <span>{{ manageDetail.latestTermination.detail }}</span>
              </div>
            </div>
            <div class="summary-row" v-if="manageDetail.plannedTerminationDate">
              <span class="label">해지 예정일:</span>
              <span class="highlight-date">{{ formatDate(manageDetail.plannedTerminationDate) }}</span>
            </div>
            <p class="card-solution">
              <strong>💡 Solution:</strong> 해지 예정 고객입니다. 해지 전 고객과 지속적인 상담이 필요합니다.
            </p>
          </div>
          
          <!-- 해지일 미등록 시 등록 폼 -->
          <!-- <div class="card-actions" v-if="!manageDetail.plannedTerminationDate">
            <div class="input-group">
              <label>해지 예정일</label>
              <input 
                type="date" 
                v-model="terminationDate" 
                class="date-input"
                :min="minTerminationDate"
              />
            </div>
            <div class="input-group">
              <textarea 
                v-model="terminationReason" 
                placeholder="해지 사유를 입력하세요..."
                class="followup-input"
              ></textarea>
            </div>
            <button 
              class="action-btn warning" 
              @click="submitTermination"
              :disabled="actionLoading || !terminationDate"
            >
              {{ actionLoading ? '등록 중...' : '해지 예정일 등록' }}
            </button>
          </div> -->
        </div>
      </div>

      <!-- 만료기간위험 섹션 -->
      <div class="section" v-if="hasExpirationRiskSection">
        <div class="section-header expiration-risk">
          <span class="section-icon">📅</span>
          <span class="section-title">만료기간위험</span>
        </div>

        <!-- 장기요양등급만료임박 -->
        <div class="solution-card" v-if="manageDetail.isCareLevelExpiring">
          <div class="card-header">
            <span class="card-title">장기요양등급만료임박</span>
            <span class="card-badge warning">{{ manageDetail.daysUntilCareLevelExpiry }}일 남음</span>
          </div>
          <div class="card-body">
            <p class="card-desc">
              등급 만료일: {{ formatDate(manageDetail.careLevelEndDate) }}
            </p>
            <p class="card-solution">
              <strong>💡 Solution:</strong> 등급 갱신이 필요합니다. 수급자에게 등급 갱신 안내를 진행해 주세요.
            </p>
          </div>
        </div>

        <!-- 계약만료임박 -->
        <div class="solution-card" v-if="manageDetail.isContractExpiring">
          <div class="card-header">
            <span class="card-title">계약만료임박</span>
            <span class="card-badge warning">{{ manageDetail.daysUntilContractExpiry }}일 남음</span>
          </div>
          <div class="card-body">
            <p class="card-desc">
              계약 만료일: {{ formatDate(manageDetail.contractEndDate) }}
            </p>
            <p class="card-solution">
              <strong>💡 Solution:</strong> 계약 갱신이 필요합니다. 계약 연장 상담을 진행해 주세요.
            </p>
          </div>
        </div>
      </div>

      <!-- 마케팅기회포착 섹션 -->
      <div class="section" v-if="hasMarketingSection">
        <div class="section-header marketing">
          <span class="section-icon">🎯</span>
          <span class="section-title">마케팅기회포착</span>
        </div>

        <!-- 렌탈상담등록 -->
        <div class="solution-card" v-if="manageDetail.hasRentalCounsel">
          <div class="card-header">
            <span class="card-title">렌탈상담등록</span>
            <span class="card-badge success">렌탈 관심</span>
          </div>
          <div class="card-body">
            <div class="counsel-summary" v-if="manageDetail.latestRentalCounsel">
              <div class="summary-row">
                <span class="label">상담일:</span>
                <span>{{ formatDate(manageDetail.latestRentalCounsel.consultDate) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">내용:</span>
                <span>{{ manageDetail.latestRentalCounsel.detail }}</span>
              </div>
            </div>
            <p class="card-solution">
              <strong>💡 Solution:</strong> 렌탈 상담이 등록되었습니다. 담당 요양보호사는 확인 후 렌탈 안내를 시작하세요.
            </p>
          </div>
          <div class="card-actions">
            <!-- <button class="action-btn success" @click="sendRentalNotification" :disabled="actionLoading">
              {{ actionLoading ? '발송 중...' : '요양보호사에게 렌탈 안내 알림 발송' }}
            </button> -->
          </div>
        </div>
      </div>

      <!-- 특이사항 없음 -->
      <div class="no-issues" v-if="!hasAnyIssue">
        <div class="no-issues-icon">✅</div>
        <p>현재 특별한 관리 사항이 없습니다.</p>
        <p class="sub-text">정기적인 상담을 통해 고객 만족도를 유지해 주세요.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  sendChurnRiskNotification as sendChurnRiskApi,
  registerComplaintFollowUp,
  registerTermination,
  sendRentalNotification as sendRentalApi
} from '@/api/customer/customerManageApi';
import { useToast } from '@/lib/toast.js';

const props = defineProps({
  beneficiaryId: {
    type: Number,
    required: true
  },
  manageDetail: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['action-complete']);
const toast = useToast();

const loading = ref(false);
const actionLoading = ref(false);

// 폼 데이터
const complaintFollowUp = ref('');
const terminationDate = ref('');
const terminationReason = ref('');

// 최소 해지일 (오늘 이후)
const minTerminationDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// 섹션 표시 여부
const hasChurnRiskSection = computed(() => {
  return props.manageDetail?.isChurnRisk || 
         props.manageDetail?.hasComplaint || 
         props.manageDetail?.hasTermination;
});

const hasExpirationRiskSection = computed(() => {
  return props.manageDetail?.isCareLevelExpiring || 
         props.manageDetail?.isContractExpiring;
});

const hasMarketingSection = computed(() => {
  return props.manageDetail?.hasRentalCounsel;
});

const hasAnyIssue = computed(() => {
  return hasChurnRiskSection.value || hasExpirationRiskSection.value || hasMarketingSection.value;
});

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 이탈위험 알림 발송
const sendChurnRiskNotification = async () => {
  actionLoading.value = true;
  try {
    const { data } = await sendChurnRiskApi(props.beneficiaryId);
    if (data.success) {
      toast.success(data.message || '상담 요청 알림이 발송되었습니다.');
      emit('action-complete');
    } else {
      toast.error(data.message || '알림 발송에 실패했습니다.');
    }
  } catch (e) {
    console.error('알림 발송 실패:', e);
    toast.error('알림 발송에 실패했습니다.');
  } finally {
    actionLoading.value = false;
  }
};

// 불만상담 후속조치 등록
const submitComplaintFollowUp = async () => {
  if (!complaintFollowUp.value.trim()) {
    toast.error('후속조치 내용을 입력해 주세요.');
    return;
  }

  actionLoading.value = true;
  try {
    const { data } = await registerComplaintFollowUp({
      beneficiaryId: props.beneficiaryId,
      counselId: props.manageDetail?.latestComplaint?.counselId,
      followUpContent: complaintFollowUp.value,
      actionType: 'COMPLAINT_RESOLVE'
    });
    
    if (data.success) {
      toast.success(data.message || '후속조치가 등록되었습니다.');
      complaintFollowUp.value = '';
      emit('action-complete');
    } else {
      toast.error(data.message || '등록에 실패했습니다.');
    }
  } catch (e) {
    console.error('후속조치 등록 실패:', e);
    toast.error('후속조치 등록에 실패했습니다.');
  } finally {
    actionLoading.value = false;
  }
};

// 해지 등록
const submitTermination = async () => {
  if (!terminationDate.value) {
    toast.error('해지 예정일을 선택해 주세요.');
    return;
  }

  actionLoading.value = true;
  try {
    const { data } = await registerTermination({
      beneficiaryId: props.beneficiaryId,
      plannedTerminationDate: terminationDate.value,
      terminationReason: terminationReason.value
    });
    
    if (data.success) {
      toast.success(data.message || '해지가 등록되었습니다.');
      terminationDate.value = '';
      terminationReason.value = '';
      emit('action-complete');
    } else {
      toast.error(data.message || '등록에 실패했습니다.');
    }
  } catch (e) {
    console.error('해지 등록 실패:', e);
    toast.error('해지 등록에 실패했습니다.');
  } finally {
    actionLoading.value = false;
  }
};

// 렌탈 알림 발송
const sendRentalNotification = async () => {
  actionLoading.value = true;
  try {
    const { data } = await sendRentalApi(props.beneficiaryId);
    if (data.success) {
      toast.success(data.message || '렌탈 안내 알림이 발송되었습니다.');
      emit('action-complete');
    } else {
      toast.error(data.message || '알림 발송에 실패했습니다.');
    }
  } catch (e) {
    console.error('알림 발송 실패:', e);
    toast.error('알림 발송에 실패했습니다.');
  } finally {
    actionLoading.value = false;
  }
};
</script>

<style scoped>
.solution-container {
  min-height: 200px;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #9CA3AF;
}

.solution-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customer-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.customer-info-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.info-badges {
  display: flex;
  gap: 8px;
}

.info-badge {
  padding: 4px 12px;
  background: #F3F4F6;
  border-radius: 16px;
  font-size: 12px;
  color: #4B5563;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
}

.section-header.churn-risk {
  background: #FEF3C7;
  color: #92400E;
}

.section-header.expiration-risk {
  background: #DBEAFE;
  color: #1E40AF;
}

.section-header.marketing {
  background: #D1FAE5;
  color: #065F46;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  font-size: 14px;
}

.solution-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

.card-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.card-badge.warning {
  background: #FEF3C7;
  color: #92400E;
}

.card-badge.danger {
  background: #FEE2E2;
  color: #B91C1C;
}

.card-badge.success {
  background: #D1FAE5;
  color: #065F46;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  color: #6B7280;
}

.card-solution {
  margin: 0;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
}

.counsel-summary {
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-row {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.summary-row .label {
  color: #6B7280;
  min-width: 80px;
}

.highlight-date {
  font-weight: 600;
  color: #DC2626;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 12px;
  color: #6B7280;
}

.followup-input {
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 13px;
  resize: vertical;
  min-height: 80px;
}

.followup-input:focus {
  outline: none;
  border-color: #00C950;
}

.date-input {
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 13px;
}

.date-input:focus {
  outline: none;
  border-color: #00C950;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: #00C950;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #00A63E;
}

.action-btn.warning {
  background: #F59E0B;
  color: white;
}

.action-btn.warning:hover:not(:disabled) {
  background: #D97706;
}

.action-btn.success {
  background: #10B981;
  color: white;
}

.action-btn.success:hover:not(:disabled) {
  background: #059669;
}

.no-issues {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
}

.no-issues-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-issues p {
  margin: 0;
  font-size: 16px;
  color: #111827;
}

.no-issues .sub-text {
  margin-top: 8px;
  font-size: 13px;
  color: #6B7280;
}
</style>
