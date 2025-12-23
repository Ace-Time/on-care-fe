<script setup>
import { ref } from 'vue';
import ScheduleHeader from '@/components/careworker/schedule/ScheduleHeader.vue';
import CalendarView from '@/components/careworker/schedule/CalendarView.vue';
import WeekView from '@/components/careworker/schedule/WeekView.vue';
import MonthView from '@/components/careworker/schedule/MonthView.vue';
import ScheduleDetail from '@/components/careworker/schedule/ScheduleDetail2.vue';
import { scheduleList } from '@/mock/careworker/scheduleData';

// 선택된 일정 객체 (null이면 placeholder 노출)
const selectedSchedule = ref(null);

// 현재 뷰 타입 ('day', 'week', 'month')
const currentView = ref('day');

// 일정 데이터 (mock 기반)
const schedules = ref([...scheduleList]);

// 일정 등록 모달 상태
const showAddModal = ref(false);
const newSchedule = ref({
  recipient: '',
  serviceLabel: '',
  startTime: '',
  endTime: '',
  date: '',
  address: '',
});

const resetNewSchedule = () => {
  newSchedule.value = {
    recipient: '',
    serviceLabel: '',
    startTime: '',
    endTime: '',
    date: '',
    address: '',
  };
};

const openAddModal = (payload) => {
  resetNewSchedule();
  if (payload?.date) newSchedule.value.date = payload.date;
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
  resetNewSchedule();
};

const saveSchedule = () => {
  if (!newSchedule.value.recipient || !newSchedule.value.date || !newSchedule.value.startTime || !newSchedule.value.endTime) {
    alert('수급자, 날짜, 시작/종료 시간을 입력해주세요.');
    return;
  }

  schedules.value = [
    ...schedules.value,
    {
      id: Date.now(),
      ...newSchedule.value,
      service: 'NEW',
      duration: '',
      status: '신규',
      statusColor: 'green',
      caregiver: '',
      serviceContent: '',
      disease: [],
      riskFactors: [],
      notes: '',
      emergencyContact: '',
      colorClass: 'bg-green',
    },
  ];
  closeAddModal();
};

// 일정 클릭 시 상세 표시
const onSelectSchedule = (schedule) => {
  selectedSchedule.value = schedule;
};

// 상세 패널 닫기
const onCloseDetail = () => {
  selectedSchedule.value = null;
};

// 화면 전환 (day/week/month)
const onViewChange = (viewType) => {
  currentView.value = viewType;
};
</script>

<template>
  <div class="workschedule-page">
    <div class="page-header">
      <div class="title-area">
        <h1 class="page-title">근무 일정</h1>
        <p class="page-desc">나의 근무 일정을 확인할 수 있어요</p>
      </div>

      <button class="add-button" type="button" @click="openAddModal">
        + 일정 등록
      </button>
    </div>

    <div class="schedule-box">
      <ScheduleHeader />

      <div class="content-container">
        <div class="calendar-area" :class="{ 'has-detail': selectedSchedule }">
          <MonthView
            v-if="currentView === 'month'"
            :schedules="schedules"
            @select-schedule="onSelectSchedule"
            @add-schedule="openAddModal"
            @view-change="onViewChange"
          />

          <WeekView
            v-else-if="currentView === 'week'"
            :schedules="schedules"
            @select-schedule="onSelectSchedule"
            @add-schedule="openAddModal"
            @view-change="onViewChange"
          />

          <CalendarView
            v-else
            :schedules="schedules"
            @select-schedule="onSelectSchedule"
            @add-schedule="openAddModal"
            @view-change="onViewChange"
          />
        </div>

        <Transition name="slide">
          <div v-if="selectedSchedule" class="detail-panel">
            <ScheduleDetail
              :schedule="selectedSchedule"
              @close="onCloseDetail"
            />
          </div>
        </Transition>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>일정 등록</h3>
          <button class="close-btn" @click="closeAddModal">×</button>
        </div>
        <div class="modal-body">
          <label class="form-field">
            <span>수급자</span>
            <input v-model="newSchedule.recipient" type="text" placeholder="수급자 이름" />
          </label>
          <label class="form-field">
            <span>서비스</span>
            <input v-model="newSchedule.serviceLabel" type="text" placeholder="예: 방문요양" />
          </label>
          <div class="form-row">
            <label class="form-field">
              <span>날짜</span>
              <input v-model="newSchedule.date" type="date" />
            </label>
            <label class="form-field">
              <span>시작</span>
              <input v-model="newSchedule.startTime" type="time" />
            </label>
            <label class="form-field">
              <span>종료</span>
              <input v-model="newSchedule.endTime" type="time" />
            </label>
          </div>
          <label class="form-field">
            <span>주소</span>
            <input v-model="newSchedule.address" type="text" placeholder="주소" />
          </label>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAddModal">취소</button>
          <button class="btn-primary" @click="saveSchedule">등록</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 페이지 전체 레이아웃 (수급자 페이지와 동일한 패딩) */
.workschedule-page {
  padding: 0 24px 24px;
  background-color: transparent; /* 배경색 제거 (상위 컴포넌트 배경 따름) */
}

/* 상단 헤더 스타일 (수급자 페이지와 동일) */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 0 12px;
}

.title-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 30px;
  font-weight: 600;
  color: #1a5928; /* 요청하신 초록색 타이틀 */
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #4a5565; /* 요청하신 회색 설명 */
  margin: 0;
}

/* 추가 버튼 스타일 (수급자 등록 버튼과 동일) */
.add-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background-color: #00c950;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #00b347;
}

/* 메인 컨텐츠 박스 (수급자 페이지의 .tabs-box 스타일 적용) */
.schedule-box {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  padding: 20px 24px; /* 내부 패딩 */
  margin-top: 16px;
  min-height: 800px; /* 최소 높이 확보 */
}

/* 기존 캘린더 내부 레이아웃 유지 */
.content-container {
  position: relative;
  height: 800px; /* 고정 높이 혹은 min-height */
  margin-top: 1rem;
  display: flex;
  gap: 0;
  overflow: hidden; /* 슬라이드 패널 넘침 방지 */
}

.calendar-area {
  width: 100%;
  height: 100%;
  transition: width 0.3s ease-in-out;
}

.calendar-area.has-detail {
  width: calc(100% - 500px);
}

.detail-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 480px;
  height: 100%;
  background-color: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow-y: auto;
  border-left: 1px solid #e2e8f0; /* 패널 구분선 추가 */
}

/* 슬라이드 애니메이션 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

/* --- 모달 스타일 (기존 유지) --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 2000;
}

.modal-card {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-field span {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
}

.form-field input {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.9375rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-primary,
.btn-secondary {
  padding: 0.65rem 1.25rem;
  border-radius: 0.6rem;
  font-weight: 700;
  font-size: 0.9375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

/* 반응형 처리 */
@media (max-width: 1024px) {
  .workschedule-page {
    padding: 16px;
  }

  .content-container {
    height: auto;
    min-height: 600px;
  }

  .calendar-area {
    width: 100% !important;
  }

  .detail-panel {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    z-index: 3000; /* 모달보다 높게 */
  }

  .slide-enter-from {
    transform: translateY(100%);
  }

  .slide-leave-to {
    transform: translateY(100%);
  }

  .modal-card {
    width: 100%;
  }

  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>