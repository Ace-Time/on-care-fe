<!-- src/views/Recipient.vue -->
<template>
  <div class="recipient-page">
    <!-- 상단 제목 / 버튼 -->
    <header class="page-header">
      <div class="title-wrap">
        <h2>수급자 관리</h2>
        <p>수급자 정보 및 서비스 이용 내역 관리</p>
      </div>
      <button class="btn-primary" type="button" @click="showRegist = true">
        + 수급자 등록
      </button>
    </header>

    <!-- 상단 탭 -->
    <nav class="sub-tabs">
      <button
        v-for="tab in subTabs"
        :key="tab.key"
        class="sub-tab-btn"
        :class="{ active: activeSubTab === tab.key }"
        type="button"
        @click="activeSubTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- 탭 1: 수급자 목록 -->
    <div v-if="activeSubTab === 'list'" class="page-body">
      <section class="left-panel">
        <RecipientList
          :recipients="recipients"
          v-model:selected-id="selectedId"
        />
      </section>

      <section class="right-panel">
        <RecipientInformation :recipient="selectedRecipient" />

        <RecipientCategory
          v-if="selectedRecipient"
          :service-history="serviceHistory"
          :rental-items="rentalItems"
        />
      </section>
    </div>

    <!-- 탭 2: 장기요양등급만료알림 -->
    <div v-else class="page-body-longcare">
      <LongCare :items="longCareItems" />
    </div>

    <!-- 수급자 등록 모달 -->
    <RecipientRegist
      :visible="showRegist"
      @close="showRegist = false"
      @submit="handleRegist"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import RecipientList from './RecipientList.vue'
import RecipientInformation from './RecipientInformation.vue'
import RecipientCategory from './RecipientCategory.vue'
import LongCare from './LongCare.vue'
import RecipientRegist from './RecipientRegist.vue'

const subTabs = [
  { key: 'list', label: '수급자 목록' },
  { key: 'longCare', label: '장기요양등급만료알림' }
]
const activeSubTab = ref('list')

/** 더미 수급자 데이터 */
const recipients = ref([
  {
    id: 1,
    name: '김영희',
    risk: '고위험',
    tags: ['말벗','음악','게임'],
    riskTags: ['낙상 위험', '치매 위험', '변비 관리 필요'],
    careLevel: 2,
    serviceType: '방문요양',
    careWorker: '김지은',
    registeredAt: '2025-12-10',
    birth: '1945-03-15',
    address: '서울시 강남구 테헤란로 123',
    guardianName: '김민준',
    guardianRelation: '아들',
    guardianPhone: '010-9999-1111',
    phone: '010-1111-2222',
    limitAmount: 1800000,
    usedAmount: 1560000
  },
  {
    id: 2,
    name: '이현수',
    risk: '중위험',
    tags: ['서예','영화'],
    riskTags: ['고혈압', '혈당 관리 필요'],
    careLevel: 3,
    serviceType: '방문요양',
    careWorker: '이영석',
    registeredAt: '2025-11-20',
    birth: '1947-01-03',
    address: '서울시 서초구 반포대로 55',
    guardianName: '이수연',
    guardianRelation: '딸',
    guardianPhone: '010-7777-8888',
    phone: '010-3333-4444',
    limitAmount: 1500000,
    usedAmount: 750000
  },
  {
    id: 3,
    name: '박순자',
    risk: '저위험',
    tags: ['말벗','요리'],
    riskTags: ['만성 관절염'],
    careLevel: 4,
    serviceType: '방문목욕',
    careWorker: '박지훈',
    registeredAt: '2025-10-02',
    birth: '1940-09-22',
    address: '서울시 송파구 올림픽로 88',
    guardianName: '박준호',
    guardianRelation: '아들',
    guardianPhone: '010-2222-9999',
    phone: '010-5555-6666',
    limitAmount: 1200000,
    usedAmount: 430000
  }
])

const selectedId = ref(recipients.value[0]?.id ?? null)
const selectedRecipient = computed(() =>
  recipients.value.find((r) => r.id === selectedId.value) || null
)

/** 서비스/렌탈 더미 */
const serviceHistory = ref([
  {
    code: 'SV001',
    name: '방문요양',
    period: '2024-12',
    amount: 1500000,
    count: 30,
    status: '12월 진행 중'
  },
  {
    code: 'SV002',
    name: '방문요양',
    period: '2024-11',
    amount: 1500000,
    count: 30,
    status: '11월 완료'
  },
  {
    code: 'SV003',
    name: '렌탈료',
    period: '2024-10',
    amount: 60000,
    count: 1,
    status: '전동침대, 휠체어'
  },
  {
    code: 'SV004',
    name: '방문요양',
    period: '2024-10',
    amount: 1430000,
    count: 29,
    status: '10월 완료'
  }
])

const rentalItems = ref([
  {
    code: 'RT001',
    name: '전동 침대',
    period: '2024-12',
    amount: 430000,
    count: 1,
    status: '진행 중'
  }
])

/** 장기요양등급 만료 알림용 더미 */
const longCareItems = ref([
  {
    id: 1,
    name: '김영희',
    expiryDate: '2025-12-10',
    worker: '김지은',
    visitTime: '김상담',
    dday: 0,
    status: '완료',
    statusCount: 2
  },
  {
    id: 2,
    name: '오수연',
    expiryDate: '2025-12-12',
    worker: '정수진',
    visitTime: '-',
    dday: 2,
    status: '미완료'
  },
  {
    id: 3,
    name: '정은지',
    expiryDate: '2025-12-20',
    worker: '김지은',
    visitTime: '-',
    dday: 10,
    status: '미완료'
  }
])

/** 모달 관련 */
const showRegist = ref(false)

const handleRegist = (formData) => {
  // TODO: 실제 API로 등록 처리
  console.log('등록 데이터:', formData)
  showRegist.value = false
}
</script>

<style scoped>
.recipient-page {
  padding: 24px 32px;
  background-color: #f7fafb;
  min-height: calc(100vh - 80px);
  box-sizing: border-box;
}

/* 상단 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.title-wrap h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}
.title-wrap p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9ca3af;
}
.btn-primary {
  border: none;
  border-radius: 999px;
  padding: 8px 18px;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

/* 상단 탭 */
.sub-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}
.sub-tab-btn {
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.sub-tab-btn.active {
  color: #16a34a;
  border-bottom-color: #16a34a;
  font-weight: 600;
}

/* 본문 레이아웃 */
.page-body {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
}
.page-body-longcare {
  margin-top: 12px;
}
.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
@media (max-width: 960px) {
  .page-body {
    grid-template-columns: 1fr;
  }
}
</style>
