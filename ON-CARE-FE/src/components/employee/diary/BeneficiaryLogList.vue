<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAssignedBeneficiaries } from '@/api/employee/employeeApi';
import { getCounselingLogListByBeneficiary } from '@/api/careworker/counselingLogApi';

import SummaryRecord from '@/components/recipient/main/category/record/SummaryRecord.vue';
import BasicTest from '@/components/recipient/main/category/record/BasicTest.vue';

const props = defineProps({
  employeeId: { type: [Number, String], required: true }
});

const list = ref([]);
// 선택된 수급자 객체를 저장
const selectedBeneficiary = ref(null);
// 선택된 탭 (summary | basic | council)
const selectedTab = ref('summary');

// 방문상담 내역
const counselHistory = ref([]);

const fetchData = async () => {
  if (!props.employeeId) return;
  try {
    const data = await getAssignedBeneficiaries(props.employeeId);
    list.value = data || [];
  } catch (error) {
    console.error("담당 수급자 목록 조회 실패", error);
    list.value = [];
  }
};

// 방문상담 내역 조회
const fetchCounselHistory = async () => {
  if (!selectedBeneficiary.value) return;
  
  const beneficiaryId = selectedBeneficiary.value.beneficiaryId || selectedBeneficiary.value.id;
  if (!beneficiaryId) return;

  try {
    // 수급자 ID로 방문상담 목록 조회
    const data = await getCounselingLogListByBeneficiary(beneficiaryId);
    counselHistory.value = data || [];
  } catch (error) {
    console.error("방문상담 내역 조회 실패", error);
    counselHistory.value = [];
  }
};

// 탭 변경 감지 -> 방문상담 탭일 때 데이터 조회
watch(selectedTab, (newTab) => {
  if (newTab === 'council') {
    fetchCounselHistory();
  }
});

// 카드 클릭 시 실행: 상세 화면으로 전환
const goToDetail = (item) => {
  selectedBeneficiary.value = item; 
  selectedTab.value = 'summary'; // 기본 탭: 요양일지
};

// 뒤로가기 버튼: 목록 화면으로 복귀
const goBack = () => {
  selectedBeneficiary.value = null;
};

onMounted(fetchData);
watch(() => props.employeeId, fetchData);
</script>

<template>
  <div class="container">
    
    <div v-if="selectedBeneficiary" class="detail-view">
      <!-- 상단 네비게이션 -->
      <div class="nav-header">
        <button class="back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          전체 수급자 목록
        </button>
        <span class="divider">|</span>
        <span class="current-name">{{ selectedBeneficiary.name }} 님</span>
      </div>

      <!-- 탭 메뉴 -->
      <div class="sub-tabs">
        <button 
          class="sub-tab-btn" 
          :class="{ active: selectedTab === 'summary' }"
          @click="selectedTab = 'summary'"
        >
          요양일지
        </button>
        <button 
          class="sub-tab-btn" 
          :class="{ active: selectedTab === 'basic' }"
          @click="selectedTab = 'basic'"
        >
          기초평가
        </button>
        <button 
          class="sub-tab-btn" 
          :class="{ active: selectedTab === 'council' }"
          @click="selectedTab = 'council'"
        >
          방문상담
        </button>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="tab-content-area">
        <SummaryRecord 
          v-if="selectedTab === 'summary'" 
          :beneficiaryId="selectedBeneficiary.beneficiaryId || selectedBeneficiary.id" 
        />
        
        <BasicTest 
          v-else-if="selectedTab === 'basic'" 
          :beneficiaryId="selectedBeneficiary.beneficiaryId || selectedBeneficiary.id" 
        />

        <!-- 방문상담: 읽기 전용 직접 구현 -->
        <div v-else-if="selectedTab === 'council'" class="council-history-wrap">
          <div class="history-list">
            <div v-for="item in counselHistory" :key="item.id" class="counsel-card">
              <div class="card-header">
                <div class="recipient-info">
                  <div class="avatar-circle">👤</div>
                  <div class="recipient-details">
                    <h3 class="recipient-name">{{ item.beneficiaryName || item.beneficiary_name || item.recipientName || item.recipient_name || selectedBeneficiary?.name }}</h3>
                    <p class="counsel-date">{{ item.visitDate || item.visit_date || item.date }}</p>
                  </div>
                </div>
                <!-- 상태 뱃지 -->
                <span class="status-badge" :class="{ completed: (item.status === '완료'), draft: (item.status === '임시저장') }">
                  {{ item.status || (item.isCompleted ? '완료' : '-') }}
                </span>
              </div>

              <div class="counsel-info-grid">
                <div class="info-field">
                  <span class="field-label">상담 유형</span>
                  <span class="field-value">{{ item.visitType || item.visit_type || item.counselType }}</span>
                </div>
                <div class="info-field">
                  <span class="field-label">만족도</span>
                  <span class="field-value">{{ item.reaction }}</span>
                </div>
              </div>

              <div class="section-box">
                <h4 class="section-title">방문 목적</h4>
                <p class="section-content">{{ item.visitDetail || item.visit_detail || item.visitPurpose }}</p>
              </div>

              <div class="section-box">
                <h4 class="section-title">관찰 내용</h4>
                <p class="section-content">{{ item.observedCondition || item.observed_condition }}</p>
              </div>

              <div class="section-box highlight">
                <h4 class="section-title">주요 요구사항</h4>
                <p class="section-content">{{ item.subjectiveNeeds || item.subjective_needs }}</p>
              </div>

              <div class="section-box success">
                <h4 class="section-title">조치 및 상담 내용</h4>
                <p class="section-content">{{ item.counselorNotes || item.counselor_notes }}</p>
              </div>

              <div class="next-visit">
                <span class="calendar-icon">📅</span>
                <span class="next-visit-label">다음 방문 예정:</span>
                <span class="next-visit-date">{{ item.nextAction || item.next_action || item.nextVisit }}</span>
              </div>
            </div>
            
            <div v-if="counselHistory.length === 0" class="empty-text">
              등록된 상담 내역이 없습니다.
            </div>
          </div>
        </div>
      </div>
    </div>


    <div v-else class="journal-section">
      <h3 class="section-title">요양일지 (수급자별)</h3>
      <p class="section-desc">수급자를 선택하여 요양일지, 기초평가, 방문상담 내역을 확인하세요.</p>
      
      <div class="card-list">
        <div 
          v-for="item in list" 
          :key="item.beneficiaryId" 
          class="log-card"
          @click="goToDetail(item)"
        >
          <div class="card-left">
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="details">
                <span class="grade" v-if="item.grade">{{ item.grade }}</span>
                <span class="separator" v-if="item.grade">·</span>
                <span class="address">{{ item.address || item.birthDate || '정보 없음' }}</span>
              </div>
            </div>
          </div>

          <div class="card-right">
            <div v-if="item.logCount" class="count-badge">{{ item.logCount }}건</div>
            <div class="arrow-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>

        <div v-if="list.length === 0" class="empty-state">
          담당 수급자가 없습니다.
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* --- 상세 화면 네비게이션 스타일 --- */
.container {
  width: 100%;
}
.nav-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 0;
}
.back-btn:hover {
  color: #166534; /* 초록색 포인트 */
}
.divider {
  color: #e5e7eb;
}
.current-name {
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

/* --- 서브 탭 스타일 --- */
.sub-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}
.sub-tab-btn {
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}
.sub-tab-btn:hover {
  color: #16a34a;
  background-color: #f0fdf4;
}
.sub-tab-btn.active {
  color: #16a34a;
  border-bottom-color: #16a34a;
}

.tab-content-area {
  min-height: 300px;
}

/* --- 방문상담 스타일 (인라인) --- */
.council-history-wrap {
  padding-bottom: 40px;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.counsel-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}
.recipient-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}
.recipient-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.recipient-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.counsel-date {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}
.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}
.status-badge.completed {
  background: #dcfce7;
  color: #16a34a;
}
.counsel-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}
.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}
.field-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}
.section-box {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
}
.section-box.highlight {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}
.section-box.success {
  background: #f0fdf4;
  border-left: 4px solid #16a34a;
}
.section-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.5rem 0;
}
.section-content {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.6;
}
.next-visit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  margin-top: 1rem;
}
.calendar-icon {
  font-size: 1.125rem;
}
.next-visit-label {
  font-size: 0.875rem;
  color: #92400e;
  font-weight: 600;
}
.next-visit-date {
  font-size: 0.875rem;
  color: #92400e;
  font-weight: 700;
}
.empty-text {
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* --- 기존 목록 스타일 유지 --- */
.journal-section {
  width: 100%;
  font-family: 'Pretendard', sans-serif;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #166534;
  margin-bottom: 4px;
}
.section-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
}
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.log-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.log-card:hover {
  border-color: #22c55e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.card-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.name {
  font-size: 16px;
  font-weight: 700;
  color: #111;
}
.details {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}
.grade { font-weight: 500; color: #333; }
.separator { color: #ccc; }
.address {
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.card-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.count-badge {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
  background: #f9fafb;
  border-radius: 12px;
}
</style>