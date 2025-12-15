<script setup>
import { ref, computed } from 'vue';
import FallRiskAssessmentForm from '@/components/careworker/activity/FallRiskAssessmentForm.vue';
import BedsoreAssessmentForm from '@/components/careworker/activity/BedsoreAssessmentForm.vue';
import CognitiveAssessmentForm from '@/components/careworker/activity/CognitiveAssessmentForm.vue';
import NeedsAssessmentForm from '@/components/careworker/activity/NeedsAssessmentForm.vue';

// 메인 탭 상태 (작성 / 내역)
const mainTab = ref('write');

const mainTabs = [
  { key: 'write', label: '작성하기', icon: '📝' },
  { key: 'history', label: '작성 내역', icon: '📋' }
];

// 서브 탭 상태 - 기초평가 항목들
const activeTab = ref('fallRisk');

const subTabs = [
  { key: 'fallRisk', label: '낙상위험도', subtitle: '(연 1회)', icon: '⚠️' },
  { key: 'bedsore', label: '욕창위험도', subtitle: '(연 1회)', icon: '🛏️' },
  { key: 'cognitive', label: '인지기능', subtitle: '(연 1회)', icon: '🧠' },
  { key: 'needs', label: '욕구사정', subtitle: '(연 1회)', icon: '📋' }
];

// 임시 내역 데이터 (연도별로 구성)
const evalHistory = ref([
  // 2024년 데이터
  { id: 1, year: '2024년', date: '2024-06-15', recipientName: '김영희', type: 'fallRisk', typeLabel: '낙상위험도', status: '완료' },
  { id: 2, year: '2024년', date: '2024-07-20', recipientName: '박철수', type: 'fallRisk', typeLabel: '낙상위험도', status: '완료' },
  { id: 3, year: '2024년', date: '2024-05-10', recipientName: '이철수', type: 'bedsore', typeLabel: '욕창위험도', status: '완료' },
  { id: 4, year: '2024년', date: '2024-08-15', recipientName: '정민희', type: 'bedsore', typeLabel: '욕창위험도', status: '완료' },
  { id: 5, year: '2024년', date: '2024-04-20', recipientName: '박민수', type: 'cognitive', typeLabel: '인지기능', status: '완료' },
  { id: 6, year: '2024년', date: '2024-09-05', recipientName: '최수정', type: 'cognitive', typeLabel: '인지기능', status: '완료' },
  { id: 7, year: '2024년', date: '2024-03-12', recipientName: '강태호', type: 'needs', typeLabel: '욕구사정', status: '완료' },
  { id: 8, year: '2024년', date: '2024-10-08', recipientName: '윤서연', type: 'needs', typeLabel: '욕구사정', status: '완료' },

  // 2023년 데이터
  { id: 9, year: '2023년', date: '2023-06-10', recipientName: '김영희', type: 'fallRisk', typeLabel: '낙상위험도', status: '완료' },
  { id: 10, year: '2023년', date: '2023-07-15', recipientName: '박철수', type: 'fallRisk', typeLabel: '낙상위험도', status: '완료' },
  { id: 11, year: '2023년', date: '2023-05-05', recipientName: '이철수', type: 'bedsore', typeLabel: '욕창위험도', status: '완료' },
  { id: 12, year: '2023년', date: '2023-08-20', recipientName: '정민희', type: 'bedsore', typeLabel: '욕창위험도', status: '완료' },
  { id: 13, year: '2023년', date: '2023-04-18', recipientName: '박민수', type: 'cognitive', typeLabel: '인지기능', status: '완료' },
  { id: 14, year: '2023년', date: '2023-09-12', recipientName: '최수정', type: 'cognitive', typeLabel: '인지기능', status: '완료' },

  // 2025년 데이터 (현재년도)
  { id: 15, year: '2025년', date: '2025-12-10', recipientName: '김영희', type: 'fallRisk', typeLabel: '낙상위험도', status: '완료' },
  { id: 16, year: '2025년', date: '2025-12-12', recipientName: '박철수', type: 'fallRisk', typeLabel: '낙상위험도', status: '임시저장' },
  { id: 17, year: '2025년', date: '2025-12-08', recipientName: '이철수', type: 'bedsore', typeLabel: '욕창위험도', status: '완료' },
  { id: 18, year: '2025년', date: '2025-12-09', recipientName: '정민희', type: 'bedsore', typeLabel: '욕창위험도', status: '완료' },
  { id: 19, year: '2025년', date: '2025-12-05', recipientName: '박민수', type: 'cognitive', typeLabel: '인지기능', status: '임시저장' },
  { id: 20, year: '2025년', date: '2025-12-11', recipientName: '최수정', type: 'cognitive', typeLabel: '인지기능', status: '완료' },
  { id: 21, year: '2025년', date: '2025-12-07', recipientName: '강태호', type: 'needs', typeLabel: '욕구사정', status: '완료' },
  { id: 22, year: '2025년', date: '2025-12-13', recipientName: '윤서연', type: 'needs', typeLabel: '욕구사정', status: '임시저장' }
]);

// 아코디언 상태 관리 (연도별 열림/닫힘)
const openYears = ref(['2025년']); // 기본적으로 2025년만 열림

// 연도별 아코디언 토글
const toggleYear = (year) => {
  const index = openYears.value.indexOf(year);
  if (index > -1) {
    openYears.value.splice(index, 1);
  } else {
    openYears.value.push(year);
  }
};

// 현재 선택된 평가 유형에 따라 필터링된 내역
const filteredHistory = computed(() => {
  return evalHistory.value.filter(item => item.type === activeTab.value);
});

// 연도별로 그룹화된 내역
const groupedByYear = computed(() => {
  const filtered = filteredHistory.value;
  const grouped = {};

  filtered.forEach(item => {
    if (!grouped[item.year]) {
      grouped[item.year] = [];
    }
    grouped[item.year].push(item);
  });

  // 연도를 내림차순으로 정렬 (최신년도가 위로)
  return Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map(year => ({
      year,
      items: grouped[year].sort((a, b) => b.date.localeCompare(a.date))
    }));
});

// 낙상위험도 제출 처리
const handleFallRiskSubmit = (data) => {
  console.log('낙상위험도 평가 제출:', data);
  alert('낙상위험도 평가가 저장되었습니다.');
};

// 낙상위험도 임시저장
const handleFallRiskSaveDraft = (data) => {
  console.log('낙상위험도 임시저장:', data);
  alert('임시저장되었습니다.');
};

// 욕창위험도 제출 처리
const handleBedsoreSubmit = (data) => {
  console.log('욕창위험도 평가 제출:', data);
  alert('욕창위험도 평가가 저장되었습니다.');
};

// 욕창위험도 임시저장
const handleBedsoreSaveDraft = (data) => {
  console.log('욕창위험도 임시저장:', data);
  alert('임시저장되었습니다.');
};

// 인지기능 제출 처리
const handleCognitiveSubmit = (data) => {
  console.log('인지기능 평가 제출:', data);
  alert('인지기능 평가가 저장되었습니다.');
};

// 인지기능 임시저장
const handleCognitiveSaveDraft = (data) => {
  console.log('인지기능 임시저장:', data);
  alert('임시저장되었습니다.');
};

// 욕구사정 제출 처리
const handleNeedsSubmit = (data) => {
  console.log('욕구사정 평가 제출:', data);
  alert('욕구사정 평가가 저장되었습니다.');
};

// 욕구사정 임시저장
const handleNeedsSaveDraft = (data) => {
  console.log('욕구사정 임시저장:', data);
  alert('임시저장되었습니다.');
};
</script>

<template>
  <div class="basic-eval-page">
    <main class="main-content">
      <!-- 서브 탭 - 기초평가 항목들 -->
      <div class="sub-tabs">
        <button
          v-for="tab in subTabs"
          :key="tab.key"
          class="sub-tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <div class="tab-text">
            <span class="tab-label">{{ tab.label }}</span>
            <span class="tab-subtitle">{{ tab.subtitle }}</span>
          </div>
        </button>
      </div>

      <!-- 메인 탭 (작성 / 내역) -->
      <div class="main-tabs">
        <button
          v-for="tab in mainTabs"
          :key="tab.key"
          class="main-tab-btn"
          :class="{ active: mainTab === tab.key }"
          @click="mainTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- 작성 탭 -->
      <div v-if="mainTab === 'write'" class="write-section">
        <div class="tab-content">
          <div v-if="activeTab === 'fallRisk'" class="assessment-section">
            <FallRiskAssessmentForm
              @submit="handleFallRiskSubmit"
              @save-draft="handleFallRiskSaveDraft"
            />
          </div>

          <div v-else-if="activeTab === 'bedsore'" class="assessment-section">
            <BedsoreAssessmentForm
              @submit="handleBedsoreSubmit"
              @save-draft="handleBedsoreSaveDraft"
            />
          </div>

          <div v-else-if="activeTab === 'cognitive'" class="assessment-section">
            <CognitiveAssessmentForm
              @submit="handleCognitiveSubmit"
              @save-draft="handleCognitiveSaveDraft"
            />
          </div>

          <div v-else-if="activeTab === 'needs'" class="assessment-section">
            <NeedsAssessmentForm
              @submit="handleNeedsSubmit"
              @save-draft="handleNeedsSaveDraft"
            />
          </div>
        </div>
      </div>

      <!-- 작성 내역 탭 -->
      <div v-else class="history-section">
        <div class="history-header">
          <h2>작성 내역</h2>
          <div class="search-box">
            <input type="text" placeholder="수급자명 검색" />
            <button class="search-btn">🔍</button>
          </div>
        </div>

        <div v-if="groupedByYear.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p class="empty-text">작성된 {{ subTabs.find(t => t.key === activeTab)?.label }} 평가 내역이 없습니다.</p>
        </div>

        <div v-else class="year-accordion-list">
          <!-- 연도별 아코디언 -->
          <div v-for="yearGroup in groupedByYear" :key="yearGroup.year" class="year-accordion">
            <!-- 연도 헤더 -->
            <div
              class="year-header"
              :class="{ open: openYears.includes(yearGroup.year) }"
              @click="toggleYear(yearGroup.year)"
            >
              <div class="year-info">
                <span class="year-icon">📅</span>
                <h3 class="year-title">{{ yearGroup.year }}</h3>
                <span class="year-count">{{ yearGroup.items.length }}건</span>
              </div>
              <span class="toggle-icon">
                {{ openYears.includes(yearGroup.year) ? '▼' : '▶' }}
              </span>
            </div>

            <!-- 연도별 내역 리스트 -->
            <div v-show="openYears.includes(yearGroup.year)" class="year-content">
              <div class="history-list">
                <div v-for="item in yearGroup.items" :key="item.id" class="history-card">
                  <div class="card-info">
                    <div class="info-row">
                      <span class="label">작성일:</span>
                      <span class="value">{{ item.date }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">수급자:</span>
                      <span class="value">{{ item.recipientName }}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">상태:</span>
                      <span class="status-badge" :class="item.status === '완료' ? 'completed' : 'draft'">
                        {{ item.status }}
                      </span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <button class="btn-view">상세</button>
                    <button class="btn-edit">수정</button>
                    <button class="btn-delete">삭제</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.basic-eval-page {
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem;
  padding-bottom: 3rem;
}

/* 메인 탭 (작성/내역) */
.main-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.main-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.main-tab-btn:hover {
  color: #16a34a;
  background: #f0fdf4;
}

.main-tab-btn.active {
  color: #16a34a;
  border-bottom-color: #16a34a;
  background: #f0fdf4;
}

.tab-icon {
  font-size: 1.125rem;
}

/* 서브 탭 */
.sub-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  flex-wrap: wrap;
}

.sub-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  background: white;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  border-radius: 0.5rem 0.5rem 0 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sub-tab-btn:hover {
  color: #16a34a;
  background: #f0fdf4;
  transform: translateY(-2px);
}

.sub-tab-btn.active {
  color: #16a34a;
  border-bottom-color: #16a34a;
  background: #dcfce7;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
}

.sub-tab-btn .tab-icon {
  font-size: 1.5rem;
}

.tab-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
}

.tab-label {
  font-size: 0.9375rem;
  font-weight: 700;
}

.tab-subtitle {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.7;
}

/* 탭 컨텐츠 */
.tab-content {
  min-height: 400px;
}

.assessment-section {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 작성 내역 섹션 */
.history-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.history-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.search-box {
  display: flex;
  gap: 0.5rem;
}

.search-box input {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 200px;
}

.search-btn {
  padding: 0.5rem 1rem;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 1rem;
}

.search-btn:hover {
  background: #15803d;
}

/* 연도별 아코디언 */
.year-accordion-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.year-accordion {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s;
}

.year-accordion:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid transparent;
}

.year-header:hover {
  background: #f0fdf4;
}

.year-header.open {
  background: #f0fdf4;
  border-bottom-color: #e5e7eb;
}

.year-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.year-icon {
  font-size: 1.25rem;
}

.year-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.year-count {
  padding: 0.25rem 0.75rem;
  background: #16a34a;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.toggle-icon {
  font-size: 0.875rem;
  color: #6b7280;
  transition: transform 0.2s;
}

.year-content {
  padding: 1rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  transition: all 0.2s;
}

.history-card:hover {
  border-color: #16a34a;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.1);
  transform: translateX(4px);
}

.card-info {
  display: flex;
  gap: 2rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge.completed {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.draft {
  background: #fef3c7;
  color: #d97706;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-actions button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-view {
  background: #3b82f6;
  color: white;
}

.btn-view:hover {
  background: #2563eb;
}

.btn-edit {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-edit:hover {
  background: #f9fafb;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}

/* 반응형 */
@media (max-width: 1024px) {
  .main-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .main-tabs {
    flex-direction: column;
    border-bottom: none;
  }

  .main-tab-btn {
    border-bottom: none;
    border-left: 3px solid transparent;
  }

  .main-tab-btn.active {
    border-left-color: #16a34a;
    border-bottom-color: transparent;
  }

  .sub-tabs {
    gap: 0.5rem;
  }

  .sub-tab-btn {
    padding: 0.75rem 1rem;
    flex: 1;
    min-width: calc(50% - 0.25rem);
  }

  .sub-tab-btn .tab-icon {
    font-size: 1.25rem;
  }

  .tab-label {
    font-size: 0.8125rem;
  }

  .tab-subtitle {
    font-size: 0.6875rem;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .search-box input {
    width: 100%;
  }

  .history-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .card-info {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .card-actions {
    width: 100%;
  }

  .card-actions button {
    flex: 1;
  }

  .year-header {
    padding: 0.875rem 1rem;
  }

  .year-title {
    font-size: 1rem;
  }

  .year-count {
    font-size: 0.6875rem;
    padding: 0.2rem 0.6rem;
  }

  .year-content {
    padding: 0.75rem;
  }
}
</style>
