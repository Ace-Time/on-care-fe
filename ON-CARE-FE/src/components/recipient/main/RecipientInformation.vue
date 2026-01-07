<!-- src/components/recipient/RecipientInformation.vue -->
<template>
  <div v-if="loading" class="card empty">불러오는 중...</div>

  <div v-else-if="errorMsg" class="card empty">
    {{ errorMsg }}
  </div>

  <div v-else-if="vm" class="card">
    <div class="detail-header">
      <div>
        <div class="name-row">
          <h3>{{ vm.name }}</h3>

          <span class="badge risk" :class="riskClass(vm.risk)">
            {{ vm.risk }}
          </span>

          <span class="badge state" :class="stateClass(vm.status)">
            {{ vm.status }}
          </span>
        </div>

        <p class="small">
          {{ vm.careLevel }} | 만료일: {{ vm.careLevelEndDate || '-' }}
        </p>
      </div>
    </div>

    <!-- 우측 상단 버튼 -->
    <div class="info-action-area">
      <button class="edit-button" type="button" @click="showRegist = true">
        수급자 정보 수정
      </button>

      <RecipientRegist
        :visible="showRegist"
        :beneficiary-id="beneficiaryId"
        @close="showRegist = false"
        @updated="handleUpdated"
      />
    </div>

    <!-- 기본 정보 -->
    <div class="detail-body">
      <div class="detail-col">
        <div class="info-row">
          <span class="info-label">
            <!-- 생년월일 아이콘 (캘린더 SVG) -->
            <svg
              class="icon-xs text-green"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            생년월일
          </span>
          <span class="info-value">{{ vm.birth }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">
            <!-- 주소 아이콘 (지도핀 SVG) -->
            <svg
              class="icon-xs text-green"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            주소
          </span>
          <span class="info-value">{{ vm.address }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">
            <!-- 보호자 아이콘 (User SVG) -->
            <svg
              class="icon-xs text-green"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            보호자
          </span>

          <span class="info-value">
            {{ vm.guardianName || '-' }}
            <template v-if="vm.guardianRelation">
              ({{ vm.guardianRelation }})
            </template>
          </span>
        </div>
      </div>

      <div class="detail-col">
        <div class="info-row">
          <span class="info-label">
            <!-- 연락처 아이콘 (전화 SVG) -->
            <svg
              class="icon-xs text-green"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              />
            </svg>
            연락처
          </span>
          <span class="info-value">{{ vm.phone }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">
            <!-- 담당 요양보호사 아이콘 (성별 SVG) -->
            <svg
              class="icon-xs text-green"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            담당 요양보호사
          </span>
          <span class="info-value">{{ vm.careWorker }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">
            <!-- 보호자 연락처 아이콘 (Smartphone SVG) -->
            <svg
              class="icon-xs text-green"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <path d="M12 18h.01" />
            </svg>
            보호자 연락처
          </span>
          <span class="info-value">{{ vm.guardianPhone || '-' }}</span>
        </div>
      </div>
    </div>

    <!-- 급여 -->
    <div class="benefit-wrapper">
      <div class="benefit-bar-top">
        <span>월 지급금</span>
        <span class="amount">{{ formatCurrency(vm.limitAmount) }}</span>
      </div>

      <div class="benefit-bar">
        <div class="benefit-fill used" :style="{ width: usedPercent + '%' }"></div>
        <div class="benefit-fill remain" :style="{ width: remainPercent + '%' }"></div>
      </div>

      <div class="benefit-bar-bottom">
        <span>사용액 {{ formatCurrency(vm.usedAmount) }}</span>
        <span>잔액 {{ formatCurrency(remainingAmount) }}</span>
        <span>{{ usedPercent.toFixed(1) }}%</span>
      </div>
    </div>

    <!-- 태그 / 위험 요소 -->
    <div class="bottom-tags">
      <div class="tag-section">
        <div class="tag-title">태그</div>
        <div class="chip-row" v-if="vm.tags?.length">
          <span v-for="chip in vm.tags" :key="chip" class="chip chip-disease">
            {{ chip }}
          </span>
        </div>
        <div v-else class="small">-</div>
      </div>

      <div class="tag-section">
        <div class="tag-title">위험 요소</div>
        <div class="chip-row" v-if="vm.riskTags?.length">
          <span v-for="chip in vm.riskTags" :key="chip" class="chip chip-risk">
            {{ chip }}
          </span>
        </div>
        <div v-else class="small">-</div>
      </div>
    </div>
  </div>

  <div v-else class="card empty">
    수급자를 선택하면 상세 정보를 확인할 수 있습니다.
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import api from '@/lib/api'
import RecipientRegist from '@/components/recipient/main/RecipientRegist.vue'

const props = defineProps({
  beneficiaryId: { type: Number, default: null }
})

/* 부모로 updated 신호 */
const emit = defineEmits(['updated'])

const showRegist = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const vm = ref(null)

/* 상세 조회 */
const fetchDetail = async () => {
  if (!props.beneficiaryId) {
    vm.value = null
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const { data } = await api.get(`/api/beneficiaries/${props.beneficiaryId}`)
    vm.value = toViewModel(data)
  } catch (e) {
    console.error(e)
    errorMsg.value = '수급자 상세 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

/* 수정 완료 이벤트: 우측 즉시 반영 + 부모에게 신호 */
const handleUpdated = async () => {
  showRegist.value = false
  await fetchDetail()
  emit('updated')
}

watch(() => props.beneficiaryId, fetchDetail, { immediate: true })

/* 백엔드 응답 -> 화면용 VM */
const toViewModel = (d) => ({
  id: d.beneficiaryId,
  name: d.name,
  risk: d.riskLevel,
  status: d.status,

  // 백엔드가 "1등급" 그대로 내려주므로 땜빵 제거
  careLevel: d.careLevel ?? '-',
  careLevelEndDate: d.careLevelEndDate,

  birth: d.birthdate,
  address: d.address,
  phone: d.phone,

  careWorker: d.managerName || '-',

  guardianName: d.guardianName,
  guardianRelation: d.guardianRelation,
  guardianPhone: d.guardianPhone,

  limitAmount: d.monthlyLimit ?? 0,
  usedAmount: d.usedAmount ?? 0,

  // 백엔드 값이 있으면 그걸 우선 사용
  remainingAmount: d.remainingAmount ?? ((d.monthlyLimit ?? 0) - (d.usedAmount ?? 0)),

  tags: d.tags ?? [],
  riskTags: (d.riskFactors ?? []).map((x) => x.name)
})

/* 잔액(백엔드 계산값 우선) */
const remainingAmount = computed(() => vm.value?.remainingAmount ?? 0)

const usedPercent = computed(() => {
  if (!vm.value?.limitAmount) return 0
  return Math.min(100, (vm.value.usedAmount / vm.value.limitAmount) * 100)
})
const remainPercent = computed(() => 100 - usedPercent.value)

const formatCurrency = (n) => (n ?? 0).toLocaleString('ko-KR') + '원'

const riskClass = (risk) => ({
  'risk-high': risk === '고위험',
  'risk-mid': risk === '중위험',
  'risk-low': risk === '저위험'
})

const stateClass = (status) => ({
  'state-on': status === '서비스 중',
  'state-off': status === '서비스 해지'
})
</script>

<style scoped>
/* (기존 스타일 그대로) */
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04);
  position: relative;
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: #9ca3af;
  font-size: 14px;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.name-row h3 {
  margin: 0;
  font-size: 18px;
}
.small {
  margin: 2px 0 0;
  font-size: 12px;
  color: #9ca3af;
}
.detail-body {
  display: flex;
  gap: 32px;
  margin-top: 10px;
}
.detail-col {
  flex: 1;
}
.info-row {
  display: flex;
  margin-bottom: 4px;
  font-size: 12px;
}
.info-label {
  width: 120px;
  color: #6b7280;
  font-size: 13px;
}
.info-value {
  flex: 1;
  font-size: 13px;
}
.info-action-area {
  position: absolute;
  top: 14px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.edit-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background-color: #00c950;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}
.benefit-wrapper {
  margin-top: 14px;
}
.benefit-bar-top {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}
.benefit-bar-top .amount {
  font-weight: 600;
}
.benefit-bar {
  width: 100%;
  height: 18px;
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  background-color: #f3f4f6;
}
.benefit-fill.used {
  background-color: #a7f3d0;
}
.benefit-fill.remain {
  background-color: #dcfce7;
}
.benefit-bar-bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}
.badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
}
.risk-high {
  background-color: #fee2e2;
  color: #b91c1c;
}
.risk-mid {
  background-color: #fef3c7;
  color: #92400e;
}
.risk-low {
  background-color: #e0f2fe;
  color: #1d4ed8;
}
.state {
  background-color: #f3f4f6;
  color: #374151;
}
.state-on {
  background-color: #dcfce7;
  color: #15803d;
}
.state-off {
  background-color: #e5e7eb;
  color: #374151;
}
.bottom-tags {
  margin-top: 14px;
  display: flex;
  gap: 32px;
  font-size: 12px;
}
.tag-section {
  flex: 1;
}
.tag-title {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}
.chip-row {
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.chip {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  border: 1px solid transparent;
}
.chip-disease {
  background-color: #f3e8ff;
  color: #6b21a8;
  border-color: #e9d5ff;
}
.chip-risk {
  background-color: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}
@media (max-width: 960px) {
  .detail-body {
    flex-direction: column;
  }
  .bottom-tags {
    flex-direction: column;
  }
}

/* SVG 아이콘용 */
.icon-xs {
  width: 16px;
  height: 16px;
}
.text-green {
  color: #16a34a;
}
</style>
