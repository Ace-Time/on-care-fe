<script setup>
import { ref } from 'vue';
import EmployeeList from '../../components/employee/EmployeeList.vue';
import EmployeeDetail from '../../components/employee/EmployeeDetail.vue';
import EmployeeEditModal from '../../components/employee/EmployeeEditModal.vue';
import CertificationApprovalModal from '../../components/employee/CertificationApprovalModal.vue';
import BulkEducationModal from '../../components/employee/BulkEducationModal.vue';
import EmployeeRegisterModal from '../../components/employee/EmployeeRegisterModal.vue';

// --- 1. Mock Data ---
const employees = ref([
  {
    id: 1,
    name: '김미영',
    role: '요양보호사',
    phone: '010-1234-5678',
    email: 'kim@example.com',
    status: '활동중',
    serviceCount: 150,
    rating: 4.8,
    hireDate: '2023-01-15',
    address: '서울시 강남구 테헤란로 2100',
    emergencyContact: '010-1111-2222',
    career: '8년',
    workHistory: [
      { company: '삼성요양원', startDate: '2016-01-01', endDate: '2020-12-31' },
      { company: '서울시니어케어센터', startDate: '2020-02-01', endDate: '2022-12-31' }
    ],
    certifications: ['요양보호사 1급', '치매전문교육 수료'],
    specialties: ['치매 케어', '신체활동 지원'],
    schedules: [
      { type: 'rental', title: '전동침대', startDate: '2024-11-15', endDate: '2025-02-15' },
      { type: 'rental', title: '보행기', startDate: '2024-12-01', endDate: '2025-03-01' },
      { type: 'care', date: '2024-12-04', time: '09:00 - 12:00', recipient: '김영희' },
      { type: 'care', date: '2024-12-07', time: '09:00 - 12:00', recipient: '김영희' },
      { type: 'care', date: '2024-12-14', time: '14:00 - 17:00', recipient: '이철수' }
    ]
  },
  {
    id: 2,
    name: '박서준',
    role: '센터장',
    phone: '010-9876-5432',
    email: 'park@example.com',
    status: '활동중',
    serviceCount: 0,
    rating: 5.0,
    hireDate: '2020-03-01',
    address: '서울시 송파구',
    emergencyContact: '010-3333-4444',
    certifications: ['사회복지사 1급'],
    specialties: ['운영관리'],
    schedules: []
  },
  {
    id: 3,
    name: '최지우',
    role: '요양보호사',
    phone: '010-5555-6666',
    email: 'choi@example.com',
    status: '휴가',
    serviceCount: 80,
    rating: 4.5,
    hireDate: '2023-06-20',
    address: '서울시 강동구',
    emergencyContact: '010-7777-8888',
    certifications: ['요양보호사', '간호조무사'],
    specialties: ['와상환자케어'],
    schedules: []
  }
]);

const pendingCertifications = ref([
  { id: 1, name: '요양보호사', number: 'YB-123', status: '대기중', employeeName: '김미영', requestDate: '2024-12-08', issueDate: '2024-11-01', issuer: '복지부', fileName: '자격증사본.pdf' },
  { id: 2, name: '사회복지사 1급', number: 'SW-456', status: '대기중', employeeName: '박서준', requestDate: '2024-12-09', issueDate: '2024-10-15', issuer: '협회', fileName: '사회복지사자격증.pdf' }
]);

// --- 2. State & Handlers ---
const selectedEmployee = ref(null);

// 모달 상태
const isRegisterModalOpen = ref(false);
const isEditModalOpen = ref(false);
const showCertApprovalModal = ref(false);
const showBulkEduModal = ref(false);

const handleSelect = (emp) => { selectedEmployee.value = emp; };
const handleEditClick = () => { if (selectedEmployee.value) isEditModalOpen.value = true; };

// 직원 수정 완료
const handleUpdateEmployee = (updatedData) => {
  const index = employees.value.findIndex(e => e.id === updatedData.id);
  if (index !== -1) {
    employees.value[index] = updatedData;
    selectedEmployee.value = updatedData;
  }
  isEditModalOpen.value = false;
  alert('정보가 수정되었습니다.');
};

// 직원 등록 완료
const handleRegisterEmployee = (newEmployeeData) => {
  const newId = Math.max(...employees.value.map(e => e.id), 0) + 1;
  const newEmployee = {
    id: newId,
    ...newEmployeeData,
    serviceCount: 0,
    rating: 0,
    schedules: [],
    certifications: [],
  };
  employees.value.push(newEmployee);
  alert(`${newEmployee.name}님이 등록되었습니다.`);
  isRegisterModalOpen.value = false;
};

// 자격증/교육 핸들러
const handleCertApprove = (id) => {
  const target = pendingCertifications.value.find(c => c.id === id);
  if (target) { target.status = '승인'; alert(`${target.employeeName}님의 자격증이 승인되었습니다.`); }
};
const handleCertReject = (id) => {
  const target = pendingCertifications.value.find(c => c.id === id);
  if (target) { target.status = '반려'; alert(`${target.employeeName}님의 자격증이 반려되었습니다.`); }
};
const handleBulkEduSubmit = ({ ids, data }) => {
  alert(`${ids.length}명의 직원에게 ${data.year}년 보수교육 등록이 완료되었습니다.`);
  showBulkEduModal.value = false;
};
</script>

<template>
  <div class="app-container">
    <header class="header">
      <div>
        <h1>직원 관리</h1>
        <p class="subtitle">요양보호사 및 센터 직원 통합 관리 시스템</p>
      </div>
      
      <div class="flex items-center gap-2">
        <button class="btn btn-purple relative" @click="showCertApprovalModal = true">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
          자격증 승인
          <span v-if="pendingCertifications.filter(c => c.status === '대기중').length > 0" class="badge-notification bg-red">
            {{ pendingCertifications.filter(c => c.status === '대기중').length }}
          </span>
        </button>

        <button class="btn btn-blue" @click="showBulkEduModal = true">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          보수교육 일괄등록
        </button>

        <button class="btn btn-primary" @click="isRegisterModalOpen = true">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          직원 등록
        </button>
      </div>
    </header>

    <div class="stats-grid">
      <div class="card stat-card">
        <div>
          <span class="stat-label">전체 직원</span>
          <p class="stat-value">{{ employees.length }}명</p>
        </div>
        <div class="stat-icon bg-gray">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
      </div>
      <div class="card stat-card">
        <div>
          <span class="stat-label text-green">활동중</span>
          <p class="stat-value text-green">{{ employees.filter(e => e.status === '활동중').length }}명</p>
        </div>
        <div class="stat-icon bg-green">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-12 12-4-4"/></svg>
        </div>
      </div>
    </div>

    <div class="main-grid">
      <EmployeeList 
        :employees="employees" 
        :selectedId="selectedEmployee?.id" 
        @select="handleSelect" 
      />

      <EmployeeDetail 
        :employee="selectedEmployee" 
        @edit="handleEditClick"
      />
    </div>

    <EmployeeRegisterModal
      :isOpen="isRegisterModalOpen"
      @close="isRegisterModalOpen = false"
      @submit="handleRegisterEmployee"
    />

    <EmployeeEditModal
      v-if="selectedEmployee"
      :isOpen="isEditModalOpen"
      :employee="selectedEmployee"
      @close="isEditModalOpen = false"
      @submit="handleUpdateEmployee"
    />
    
    <CertificationApprovalModal 
      :isOpen="showCertApprovalModal"
      :certifications="pendingCertifications"
      @close="showCertApprovalModal = false"
      @approve="handleCertApprove"
      @reject="handleCertReject"
    />

    <BulkEducationModal 
      :isOpen="showBulkEduModal"
      :employees="employees"
      @close="showBulkEduModal = false"
      @submit="handleBulkEduSubmit"
    />
  </div>
</template>

<style scoped>
/* 공통 레이아웃 스타일 */
* { box-sizing: border-box; }
.app-container {
  max-width: 90%; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #f8f9fa; min-height: 100vh; color: #333;
  width: 100%; max-width: 1440px;
}

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
.subtitle { color: #666; font-size: 14px; margin-top: 4px; }


.main-grid { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 24px; height: calc(100vh - 200px); width: 100%; }
@media (max-width: 768px) { .main-grid { grid-template-columns: 1fr; } }

.btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; font-weight: 500; transition: 0.2s; color: white; }
.btn-primary { background-color: #10b981; }
.btn-primary:hover { background-color: #059669; }

/* 통계 카드 스타일 */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.stat-label { font-size: 12px; color: #666; }
.stat-value { font-size: 24px; font-weight: 700; margin: 4px 0 0 0; }
.stat-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.bg-gray { background-color: #f3f4f6; color: #4b5563; }
.bg-green { background-color: #d1fae5; color: #059669; }
.text-green { color: #059669; }
.icon { width: 18px; height: 18px; }

/* 추가된 버튼 색상 */
.btn-purple { background-color: #a855f7; }
.btn-purple:hover { background-color: #9333ea; }
.btn-blue { background-color: #3b82f6; }
.btn-blue:hover { background-color: #2563eb; }

/* Flex 유틸리티 */
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.relative { position: relative; }

/* 알림 뱃지 */
.badge-notification {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.bg-red { background-color: #ef4444; }
.bg-orange { background-color: #f97316; }
</style>