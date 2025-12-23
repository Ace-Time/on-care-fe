<!-- views/careworker/workschedule/WorkschedulePage.vue -->

<script setup>
import { ref } from 'vue';
import SimpleHeader from '@/components/common/SimpleHeader.vue';
import ScheduleHeader from '@/components/careworker/schedule/ScheduleHeader.vue';
import CalendarView from '@/components/careworker/schedule/CalendarView.vue'; // 일간
import WeekView from '@/components/careworker/schedule/WeekView.vue';         // 주간
import MonthView from '@/components/careworker/schedule/MonthView.vue';       // 월간
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
  <div class="workschedule">
    <SimpleHeader
      title="근무 일정"
      subtitle="나의 근무 일정을 확인할 수 있어요"
    />

    <div class="main-content">
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

        <!-- 슬라이드 패널 -->
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

    <!-- 일정 등록 모달 -->
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
.workschedule {
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1200px; /* 수급자 관리/업무관리와 동일 폭 */
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem;
  overflow: hidden; /* 슬라이드 패널이 튀어나오지 않도록*/
}

.content-container {
  position: relative;
  height: 800px;
  margin-top: 1rem;
  display: flex;
  gap: 0;
}

.calendar-area {
  width: 100%; /* 기본은 전체 폭 */
  height: 100%;
  transition: width 0.3s ease-in-out;
}

/* 상세 패널이 열려있을 때 캘린더 영역 축소 */
.calendar-area.has-detail {
  width: calc(100% - 500px); /* 패널 너비만큼 축소 */
}

.detail-panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 480px; /* 상세 패널 너비 지정 */
  height: 100%;
  background-color: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow-y: auto;
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

/* 등록 모달 */
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

/* 반응형 처리: 모바일에서는 상세 패널을 전체 화면 커버 */
@media (max-width: 1024px) {
  .content-container {
    height: auto;
    min-height: 600px;
  }

  .calendar-area {
    width: 100% !important; /* 모바일에서는 항상 전체 너비 */
  }

  .detail-panel {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    z-index: 1000;
  }

  /* 모바일 슬라이드 애니메이션 - 아래에서 위로 */
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
