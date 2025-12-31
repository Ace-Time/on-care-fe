<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
});

// 상세 정보 토글 함수 - 컴포넌트 내부에서 처리
const toggleDetails = async (item) => {
  if (item.detailsLoaded) {
    item.showDetails = !item.showDetails;
    return;
  }

  try {
    const { getCounselingLogDetail } = await import('@/api/careworker/counselingLogApi');
    const detailResponse = await getCounselingLogDetail(item.counselingId);
    const detailData = detailResponse?.data ?? detailResponse;

    item.visitPurpose = detailData.visitPurpose || '정보 없음';
    item.observedCondition = detailData.attendees || '정보 없음';
    item.subjectiveNeeds = detailData.discussionContent || '정보 없음';
    item.counselorNotes = detailData.agreementContent || '정보 없음';
    item.nextVisit = detailData.nextVisitDate ? detailData.nextVisitDate.split('T')[0] : '-';
    
    // 서명 URL도 상세 정보에서 업데이트
    if (detailData.guardianSignUrl) {
      item.guardianSignUrl = detailData.guardianSignUrl;
      item.recipientSigned = true;
    }
    if (detailData.counselorSignUrl) {
      item.counselorSignUrl = detailData.counselorSignUrl;
      item.caregiverSigned = true;
    }
    
    item.detailsLoaded = true;
    item.showDetails = true;
  } catch (error) {
    console.error('상세 정보 조회 실패:', error);
    alert('상세 정보를 불러올 수 없습니다.');
  }
};
</script>

<template>
  <div class="counsel-history-list">
    <div v-for="item in items" :key="item.id" class="counsel-card">
      <div class="card-header">
        <div class="recipient-info">
          <div class="avatar-circle">👤</div>
          <div class="recipient-details">
            <h3 class="recipient-name">{{ item.recipientName }}</h3>
            <p class="counsel-date">{{ item.date }}</p>
          </div>
        </div>
        <!-- 상태 뱃지 -->
        <span class="status-badge" :class="{ completed: (item.status === '완료'), draft: (item.status === '임시저장') }">
          {{ item.status }}
        </span>
      </div>

      <div class="counsel-info-grid">
        <div class="info-field">
          <span class="field-label">상담 유형</span>
          <span class="field-value">{{ item.counselType }}</span>
        </div>
        <div class="info-field">
          <span class="field-label">만족도</span>
          <span class="field-value">{{ item.reaction }}</span>
        </div>
      </div>

      <!-- 상세보기 버튼 -->
      <div v-if="!item.detailsLoaded" class="details-toggle">
        <button @click="toggleDetails(item)" class="btn-show-details">
          📋 상세 정보 보기
        </button>
      </div>

      <!-- 상세 정보 (로드 후 표시) -->
      <template v-if="item.detailsLoaded">
        <div class="section-box">
          <h4 class="section-title">방문 목적</h4>
          <p class="section-content">{{ item.visitPurpose }}</p>
        </div>

        <div class="section-box">
          <h4 class="section-title">관찰 내용</h4>
          <p class="section-content">{{ item.observedCondition }}</p>
        </div>

        <div class="section-box highlight">
          <h4 class="section-title">주요 요구사항</h4>
          <p class="section-content">{{ item.subjectiveNeeds }}</p>
        </div>

        <div class="section-box success">
          <h4 class="section-title">조치 및 상담 내용</h4>
          <p class="section-content">{{ item.counselorNotes }}</p>
        </div>

        <div class="next-visit">
          <span class="calendar-icon">📅</span>
          <span class="next-visit-label">다음 방문 예정:</span>
          <span class="next-visit-date">{{ item.nextVisit }}</span>
        </div>
      </template>

      <!-- 서명 이미지 섹션 -->
      <div class="signature-section-view">
        <div class="signature-item">
          <span class="sig-label">수급자(보호자) 서명</span>
          <div class="sig-image-box">
            <img v-if="item.guardianSignUrl" :src="item.guardianSignUrl" alt="수급자 서명" class="sig-img" />
            <span v-else class="no-sig">미서명</span>
          </div>
        </div>
        <div class="signature-item">
          <span class="sig-label">요양보호사 서명</span>
          <div class="sig-image-box">
            <img v-if="item.counselorSignUrl" :src="item.counselorSignUrl" alt="요양보호사 서명" class="sig-img" />
            <span v-else class="no-sig">미서명</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="items.length === 0" class="empty-text">
      등록된 상담 내역이 없습니다.
    </div>
  </div>
</template>

<style scoped>
.counsel-history-list {
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

/* --- 상세 정보 토글 버튼 --- */
.details-toggle {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}
.btn-show-details {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #4b5563;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-show-details:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

/* --- 서명 이미지 표시 섹션 --- */
.signature-section-view {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.signature-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sig-label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 600;
}
.sig-image-box {
  width: 100%;
  height: 80px;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.sig-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.no-sig {
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
