<!-- src/components/recipient/RecipientInformation.vue -->
<template>
  <div v-if="loading" class="card empty">
    불러오는 중...
  </div>

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

    <!-- ✅ 우측 상단 버튼 -->
    <div class="info-action-area">
      <button class="edit-button" type="button" @click="showRegist = true">
        수급자 정보 수정
      </button>

      <!-- ✅ updated 이벤트만 받는다 -->
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
          <span class="info-label">📅 생년월일</span>
          <span class="info-value">{{ vm.birth }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📍 주소</span>
          <span class="info-value">{{ vm.address }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">👨‍👩‍👧 보호자</span>
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
          <span class="info-label">📞 연락처</span>
          <span class="info-value">{{ vm.phone }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🧑‍⚕️ 담당 요양보호사</span>
          <span class="info-value">{{ vm.careWorker }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📱 보호자 연락처</span>
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
import RecipientRegist from '@/components/recipient/main/RecipientRegist.vue' // 수급자 정보 수정 모달

const props = defineProps({
  beneficiaryId: {
    type: Number,
    default: null
  }
})

/* 추가: 부모로 updated 신호 보내려면 emit 필요 */
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

/*  수정 완료 이벤트 */
const handleUpdated = async () => {
  showRegist.value = false
  await fetchDetail()     //  우측 즉시 반영
  emit('updated')         //  부모(RecipientListPage)로 신호 -> 좌측 리스트 refresh 트리거
}

watch(() => props.beneficiaryId, fetchDetail, { immediate: true })

const toViewModel = (d) => ({
  id: d.beneficiaryId,
  name: d.name,
  risk: d.riskLevel,
  status: d.status,
  careLevel: d.careLevel ? `${d.careLevel}등급`.replace('등급등급', '등급') : '-',
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
  remainingAmount: d.remainingAmount,
  tags: d.tags ?? [],
  riskTags: (d.riskFactors ?? []).map((x) => x.name)
})

const remainingAmount = computed(() =>
  (vm.value?.limitAmount ?? 0) - (vm.value?.usedAmount ?? 0)
)

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
.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04);
  position: relative; /* ✅ 우측 상단 absolute 기준 */
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
}
.info-value {
  flex: 1;
}

/* ✅ 우측 상단 */
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

/* 급여 바 */
.benefit-wrapper {
  margin-top: 14px;
}
.benefit-bar-top {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
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
  font-size: 11px;
  color: #6b7280;
}

/* 배지 */
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

/* 서비스 상태 */
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

/* 하단 태그 / 위험요인 */
.bottom-tags {
  margin-top: 14px;
  display: flex;
  gap: 32px;
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
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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
</style>
