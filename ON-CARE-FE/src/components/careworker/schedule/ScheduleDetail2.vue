<!-- components/careworker/schedule/ScheduleDetail.vue -->

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import { alternateCaregivers } from '@/mock/careworker/scheduleData';

// 부모(Schedule.vue)로부터 선택된 일정 객체를 받습니다.
// scheduleId 대신 객체 자체를 받도록 수정하여 불필요한 검색 로직을 줄였습니다.
const props = defineProps({
  schedule: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close']);

// 선택된 일정 ID에 해당하는 대체 요양보호사 필터링
const alternatives = computed(() => {
  if (!props.schedule) return [];
  return alternateCaregivers.filter((item) => item.scheduleId === props.schedule.id);
});

const onClose = () => {
  emit('close');
};
</script>

<template>
  <section class="detail-panel">
    <div v-if="!schedule" class="placeholder">
      <div class="placeholder-icon">
        <div class="calendar-icon-box">📅</div>
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
        <button class="close-btn" type="button" @click="onClose">
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
              <span class="value">{{ schedule.startTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">종료</span>
              <span class="value">{{ schedule.endTime }}</span>
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
             <div class="info-row">
              <span class="label">주소</span>
              <span class="value">{{ schedule.address }}</span>
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
                <div class="role">담당 요양보호사</div>
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
            <div v-if="alternatives.length === 0" class="empty-alt">
              대체 가능한 인원이 없습니다.
            </div>
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
              :value="schedule.notes"
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
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 내부 스크롤을 위해 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.placeholder-main { font-size: 16px; margin: 0; font-weight: 600; }
.placeholder-sub { font-size: 14px; margin: 4px 0 0; }

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fdf4; /* 연한 초록 */
  border-radius: 16px;
  padding: 12px 16px;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 10px; }
.detail-title { font-size: 18px; font-weight: 700; color: #166534; margin: 0; }

.type-pill { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.pill-care { background: #dbeafe; color: #1d4ed8; }
.pill-bath { background: #ffe4ef; color: #be185d; }

.close-btn { border: none; background: transparent; font-size: 18px; cursor: pointer; color: #6b7280; }

/* 본문 스크롤 영역 */
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  overflow-y: auto;
  padding-right: 4px; /* 스크롤바 공간 */
}

.section { display: flex; flex-direction: column; gap: 6px; }
.section-title { font-size: 14px; font-weight: 600; color: #4b5563; }
.section-title-row { display: flex; justify-content: space-between; align-items: center; }
.section-sub { font-size: 12px; color: #6b7280; }

.section-card {
  background: #f9fafb;
  border-radius: 16px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
}

.info-row { display: flex; justify-content: space-between; font-size: 14px; color: #4b5563; }
.info-row + .info-row { margin-top: 6px; }
.label { color: #6b7280; }
.value { color: #111827; text-align: right; }
.strong { font-weight: 600; font-size: 16px; }

.caregiver-main-row { display: flex; align-items: center; gap: 10px; }
.avatar-circle {
  width: 40px; height: 40px; border-radius: 999px; background: #22c55e; color: #ffffff;
  font-weight: 700; display: flex; align-items: center; justify-content: center;
}
.avatar-circle.small { width: 32px; height: 32px; font-size: 12px; }
.avatar-disabled { background: #e5e7eb; color: #9ca3af; }

.caregiver-info .name { font-weight: 600; color: #111827; }
.caregiver-info .role { font-size: 12px; color: #6b7280; }

.alternate-list { display: flex; flex-direction: column; gap: 8px; background: #f0f9ff; border-color: #bfdbfe; }
.empty-alt { font-size: 13px; color: #9ca3af; text-align: center; padding: 4px; }
.alternate-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
.alternate-left { display: flex; align-items: center; gap: 8px; }
.alternate-info .name { font-size: 14px; font-weight: 500; }
.alternate-info .distance { font-size: 12px; color: #6b7280; }

.assign-btn { padding: 4px 10px; border-radius: 999px; border: none; font-size: 12px; cursor: pointer; background: #22c55e; color: #ffffff; }
.assign-btn.disabled { background: #e5e7eb; color: #9ca3af; cursor: default; }

.memo-card { background: #fffbeb; border-color: #facc15; display: flex; flex-direction: column; gap: 6px; }
.memo-textarea {
  width: 100%; min-height: 80px; border-radius: 12px; border: 1px solid #fde68a;
  padding: 8px 10px; font-size: 14px; resize: vertical; outline: none; background: white;
}
.memo-textarea::placeholder { color: #9ca3af; }
.memo-hint { font-size: 12px; color: #6b7280; }

.detail-footer { display: flex; justify-content: space-between; gap: 8px; margin-top: 8px; flex-shrink: 0; }
.primary-btn { flex: 1; height: 40px; border-radius: 999px; border: none; font-size: 14px; cursor: pointer; background: #22c55e; color: #ffffff; font-weight: 600; }
.danger-btn { max-width: 80px; width: 100%; height: 40px; border-radius: 999px; border: none; font-size: 14px; cursor: pointer; background: #ef4444; color: #ffffff; font-weight: 600; }
</style>
