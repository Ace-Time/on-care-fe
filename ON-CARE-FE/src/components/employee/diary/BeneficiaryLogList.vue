<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAssignedBeneficiaries } from '@/api/employee/employeeApi';

import SummaryRecord from '@/components/recipient/main/category/record/SummaryRecord.vue';

const props = defineProps({
  employeeId: { type: [Number, String], required: true }
});

const list = ref([]);
// 선택된 수급자 객체를 저장
const selectedBeneficiary = ref(null);

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

// 카드 클릭 시 실행: 상세 화면으로 전환
const goToDetail = (item) => {
  selectedBeneficiary.value = item; 
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

      <SummaryRecord :beneficiaryId="selectedBeneficiary.beneficiaryId" />
    </div>


    <div v-else class="journal-section">
      <h3 class="section-title">요양일지 (수급자별)</h3>
      
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

/* --- 기존 목록 스타일 유지 --- */
.journal-section {
  width: 100%;
  font-family: 'Pretendard', sans-serif;
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #166534;
  margin-bottom: 12px;
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