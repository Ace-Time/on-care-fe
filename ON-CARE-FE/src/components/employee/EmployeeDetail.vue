<script setup>
import { ref } from 'vue';
import EmployeeScheduleCalendar from '@/components/employee/emplschedule/EmployeeScheduleCalendar.vue';
import EmployeeBasicInfo from '@/components/employee/basicinfo/EmployeeBasicInfo.vue'; 

// [수정 1] API 기능이 포함된 '통합 컴포넌트'로 교체 (파일 경로 확인 필수!)
import CertificatesAndEducations from '@/components/employee/qualifications/CertificatesAndEducations.vue';

defineProps({
  employee: { type: Object, default: null }
});

// [수정 2] 'refresh' 이벤트 추가 (데이터 갱신 신호를 상위 페이지로 전달)
const emit = defineEmits(['edit', 'refresh']);
const activeTab = ref('info');

const fetchEmployeeData = () => {
  emit('refresh');
};

const tabs = [
  { key: 'info', label: '기본정보' },
  { key: 'schedule', label: '일정' },
  { key: 'careLogs', label: '요양일지' },
  { key: 'recipients', label: '담당 수급자' },
  { key: 'cert', label: '자격증' }
];
</script>

<template>
  <div class="content-area">
    <div v-if="employee" class="card detail-card">
      
      <div class="detail-header">
        <div class="profile-area">
          <div>
            <h2>{{ employee.name }} <span class="role-badge">{{ employee.role }}</span></h2>
          </div>
        </div>
        <button @click="$emit('edit')" class="btn btn-outline">
          <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          수정
        </button>
      </div>

      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" class="tab-btn" :class="{ 'active': activeTab === tab.key }">
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        
        <div v-if="activeTab === 'info'">
          <EmployeeBasicInfo :employee="employee" />
        </div>

        <div v-else-if="activeTab === 'schedule'" class="schedule-view-full">
          <EmployeeScheduleCalendar :schedules="employee.schedules || []" />
        </div>

        <div v-else-if="activeTab === 'careLogs'" class="empty-view">
          <svg class="icon-lg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
          <p>등록된 일지가 없습니다.</p>
        </div>

        <div v-else-if="activeTab === 'recipients'" class="empty-view">
          <p>담당 수급자 정보가 없습니다.</p>
        </div>

        <div v-else-if="activeTab === 'cert'">
          <CertificatesAndEducations 
            :employeeId="employee.id" 
            :certificates="employee.certificates || []" 
            @refresh="fetchEmployeeData" 
          />
        </div>

      </div>
    </div>

    <div v-else class="card empty-state">
      <p>직원을 선택해주세요</p>
    </div>
  </div>
</template>

<style scoped>
/* 스타일은 기존과 동일 */
.content-area { height: 100%; }
.card { width: 100%; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.detail-card { height: 100%; display: flex; flex-direction: column; min-height: 500px; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 500px; color: #9ca3af; font-size: 16px; font-weight: bold; }

.detail-header { padding: 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.profile-area h2 { margin: 0; font-size: 24px; color: #111; font-weight: bold; display: flex; align-items: center; gap: 8px; }
.role-badge { font-size: 13px; background: #f3f4f6; padding: 3px 10px; border-radius: 16px; font-weight: 500; color: #555; vertical-align: middle; }

.tabs { display: flex; padding: 0 24px; border-bottom: 1px solid #f0f0f0; overflow-x: auto; }
.tab-btn { flex: 1; width: 100%; text-align: center; justify-content: center; display: flex; align-items: center; gap: 6px; padding: 12px 16px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; color: #666; font-weight: 500; font-size: 14px; white-space: nowrap; }
.tab-btn.active { color: #059669; border-bottom-color: #059669; font-weight: bold; }

.tab-content { padding: 24px; flex: 1; overflow-y: auto; background-color: #fff; }

.icon-sm { width: 16px; height: 16px; color: #666; }
.icon-lg { width: 48px; height: 48px; color: #ddd; margin-bottom: 10px; }
.btn-outline { background-color: white; border: 1px solid #ddd; color: #555; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; }
.btn-outline:hover { background-color: #f9fafb; }
.empty-view { text-align: center; padding: 40px; color: #999; }
.schedule-view-full { height: 100%; display: flex; flex-direction: column; }
</style>
