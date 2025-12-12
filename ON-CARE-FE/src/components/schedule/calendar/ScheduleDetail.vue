<template>
    <section class="detail-panel">
      <div v-if="!schedule" class="placeholder">
        <div class="placeholder-icon">
          <div class="calendar-icon-box"></div>
        </div>
        <p class="placeholder-main">일정을 선택하면</p>
        <p class="placeholder-sub">상세 정보가 표시됩니다</p>
      </div>
  
      <div v-else class="detail-content">
        <div class="detail-header">
          <div class="header-left">
            <h3 class="detail-title">일정 상세</h3>
            <span
              class="type-pill"
              :class="{
                'pill-care': schedule.service === 'VISIT_CARE',
                'pill-bath': schedule.service === 'VISIT_BATH'
              }"
            >
              {{ schedule.serviceLabel }}
            </span>
          </div>
          <button class="close-btn" type="button">
            ✕
          </button>
        </div>
  
        <div class="detail-body">
          <div class="section">
            <div class="section-title">일정</div>
            <div class="section-card">
              <div class="info-row">
                <span class="label">날짜</span>
                <span class="value">{{ schedule.date }}</span>
              </div>
              <div class="info-row">
                <span class="label">시작</span>
                <span class="value">{{ schedule.start }}</span>
              </div>
              <div class="info-row">
                <span class="label">종료</span>
                <span class="value">{{ schedule.end }}</span>
              </div>
              <div class="info-row">
                <span class="label">소요시간</span>
                <span class="value">{{ schedule.duration }}</span>
              </div>
            </div>
          </div>
  
          <div class="section">
            <div class="section-title">수급자</div>
            <div class="section-card">
              <div class="info-row">
                <span class="value strong">{{ schedule.recipient }}</span>
              </div>
            </div>
          </div>
  
          <div class="section">
            <div class="section-title">요양보호사</div>
            <div class="section-card">
              <div class="caregiver-main-row">
                <div class="avatar-circle">
                  {{ schedule.caregiver[0] }}
                </div>
                <div class="caregiver-info">
                  <div class="name">{{ schedule.caregiver }}</div>
                  <div class="role">요양보호사</div>
                </div>
              </div>
            </div>
          </div>
  
          <div class="section">
            <div class="section-title section-title-row">
              <span>대체 가능한 요양보호사</span>
              <span class="section-sub">
                {{ alternatives.length }}명 가능
              </span>
            </div>
            <div class="section-card alternate-list">
              <div
                v-for="alt in alternatives"
                :key="alt.id"
                class="alternate-item"
              >
                <div class="alternate-left">
                  <div
                    class="avatar-circle small"
                    :class="{ 'avatar-disabled': !alt.available }"
                  >
                    {{ alt.name[0] }}
                  </div>
                  <div class="alternate-info">
                    <div class="name">{{ alt.name }}</div>
                    <div class="distance">{{ alt.distance }}</div>
                  </div>
                </div>
                <div class="alternate-right">
                  <button
                    v-if="alt.available"
                    class="assign-btn"
                    type="button"
                  >
                    배정가능
                  </button>
                  <button
                    v-else
                    class="assign-btn disabled"
                    type="button"
                  >
                    배정불가
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          <div class="section">
            <div class="section-title">일정 메모</div>
            <div class="section-card memo-card">
              <textarea
                class="memo-textarea"
                placeholder="특이사항이나 전달사항을 입력하세요"
              ></textarea>
              <div class="memo-hint">메모는 자동으로 저장됩니다</div>
            </div>
          </div>
        </div>
  
        <div class="detail-footer">
          <button class="primary-btn" type="button">
            일정 수정
          </button>
          <button class="danger-btn" type="button">
            삭제
          </button>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { scheduleList } from '@/mock/schedule/scheduleMock'
  import { alternateCaregivers } from '@/mock/schedule/alternateCaregiversMock'
  
  const props = defineProps({
    scheduleId: {
      type: Number,
      default: null,
    },
  })
  
  const schedule = computed(() =>
    scheduleList.find((item) => item.id === props.scheduleId) || null,
  )
  
  const alternatives = computed(() =>
    alternateCaregivers.filter((item) => item.scheduleId === props.scheduleId),
  )
  </script>
  
  <style scoped>
  .detail-panel {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background: #ffffff;
    border-radius: 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
    padding: 18px 24px 24px;
  }
  
  .placeholder {
    height: 100%;
    min-height: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
  }
  
  .placeholder-icon {
    margin-bottom: 16px;
  }
  
  .calendar-icon-box {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    border: 3px solid #e5e7eb;
  }
  
  .placeholder-main {
    font-size: 16px;
    margin: 0;
  }
  
  .placeholder-sub {
    font-size: 14px;
    margin: 4px 0 0;
  }
  
  .detail-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #e7fbe5;
    border-radius: 16px;
    padding: 12px 16px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .detail-title {
    font-size: 18px;
    font-weight: 700;
    color: #166534;
    margin: 0;
  }
  
  .type-pill {
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
  }
  
  .pill-care {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  .pill-bath {
    background: #ffe4ef;
    color: #be185d;
  }
  
  .close-btn {
    border: none;
    background: transparent;
    font-size: 16px;
    cursor: pointer;
    color: #6b7280;
  }
  
  .detail-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  
  .section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
  }
  
  .section-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .section-sub {
    font-size: 12px;
    color: #6b7280;
  }
  
  .section-card {
    background: #f9fafb;
    border-radius: 16px;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #4b5563;
  }
  
  .info-row + .info-row {
    margin-top: 6px;
  }
  
  .label {
    color: #6b7280;
  }
  
  .value {
    color: #111827;
  }
  
  .strong {
    font-weight: 600;
  }
  
  .caregiver-main-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .avatar-circle {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    background: #22c55e;
    color: #ffffff;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .avatar-circle.small {
    width: 32px;
    height: 32px;
  }
  
  .avatar-disabled {
    background: #e5e7eb;
    color: #9ca3af;
  }
  
  .caregiver-info .name {
    font-weight: 600;
    color: #111827;
  }
  
  .caregiver-info .role {
    font-size: 12px;
    color: #6b7280;
  }
  
  .alternate-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: #f0f9ff;
    border-color: #bfdbfe;
  }
  
  .alternate-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }
  
  .alternate-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .alternate-info .name {
    font-size: 14px;
    font-weight: 500;
  }
  
  .alternate-info .distance {
    font-size: 12px;
    color: #6b7280;
  }
  
  .assign-btn {
    padding: 4px 10px;
    border-radius: 999px;
    border: none;
    font-size: 12px;
    cursor: pointer;
    background: #22c55e;
    color: #ffffff;
  }
  
  .assign-btn.disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: default;
  }
  
  .memo-card {
    background: #fffbeb;
    border-color: #facc15;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .memo-textarea {
    width: 100%;
    min-height: 80px;
    border-radius: 12px;
    border: 1px solid #fde68a;
    padding: 8px 10px;
    font-size: 14px;
    resize: vertical;
    outline: none;
  }
  
  .memo-textarea::placeholder {
    color: #9ca3af;
  }
  
  .memo-hint {
    font-size: 12px;
    color: #6b7280;
  }
  
  .detail-footer {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
  }
  
  .primary-btn,
  .danger-btn {
    flex: 1;
    height: 40px;
    border-radius: 999px;
    border: none;
    font-size: 14px;
    cursor: pointer;
  }
  
  .primary-btn {
    background: #22c55e;
    color: #ffffff;
  }
  
  .danger-btn {
    max-width: 80px;
    background: #ef4444;
    color: #ffffff;
  }
  </style>