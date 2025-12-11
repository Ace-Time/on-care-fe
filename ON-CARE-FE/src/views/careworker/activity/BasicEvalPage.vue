<script setup>
import { ref } from 'vue';
import SimpleHeader from '@/components/common/SimpleHeader.vue';

// 서브 탭 상태
const activeTab = ref('write');

const subTabs = [
  { key: 'write', label: '작성하기', icon: '📝' },
  { key: 'history', label: '작성 내역', icon: '📋' }
];

// 임시 내역 데이터
const evalHistory = ref([
  { id: 1, date: '2024-01-15', recipientName: '김영희', status: '완료' },
  { id: 2, date: '2024-01-10', recipientName: '박철수', status: '완료' }
]);
</script>

<template>
  <div class="basic-eval-page">
    <SimpleHeader
      title="활동일지"
      subtitle="방문 활동을 기록하고 관리합니다"
    />

    <main class="main-content">

      <!-- 서브 탭 -->
      <div class="sub-tabs">
        <button
          v-for="tab in subTabs"
          :key="tab.key"
          class="sub-tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="tab-content">
        <!-- 작성하기 탭 -->
        <div v-if="activeTab === 'write'" class="write-section">
          <div class="form-placeholder">
            <h2>기초평가 작성 폼</h2>
            <p>기초평가 작성 폼이 여기에 표시됩니다.</p>
          </div>
        </div>

        <!-- 작성 내역 탭 -->
        <div v-else class="history-section">
          <div class="history-header">
            <h2>작성 내역</h2>
            <div class="search-box">
              <input type="text" placeholder="수급자명 검색" />
              <button class="search-btn">��</button>
            </div>
          </div>

          <div class="history-list">
            <div v-for="item in evalHistory" :key="item.id" class="history-card">
              <div class="card-info">
                <div class="info-row">
                  <span class="label">평가일:</span>
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
                <button class="btn-view">상세보기</button>
                <button class="btn-edit">수정</button>
                <button class="btn-delete">삭제</button>
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
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem;
  padding-bottom: 3rem;
}

/* 서브 탭 */
.sub-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.sub-tab-btn {
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

.sub-tab-btn:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.sub-tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #eff6ff;
}

.tab-icon {
  font-size: 1.125rem;
}

/* 탭 컨텐츠 */
.tab-content {
  min-height: 400px;
}

/* 작성 섹션 */
.form-placeholder {
  background: white;
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-placeholder h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.form-placeholder p {
  color: #6b7280;
  margin: 0;
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
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 1rem;
}

.search-btn:hover {
  background: #2563eb;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.history-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
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
  background: #dbeafe;
  color: #2563eb;
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

/* 반응형 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
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
}
</style>
