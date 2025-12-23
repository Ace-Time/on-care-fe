<!-- src/components/recipient/category/record/SummaryRecord.vue -->
<template>
  <div class="record-summary">
    <!-- 월별 보기 -->
    <div v-if="recordViewMode === 'monthly'" class="record-monthly">
      <div
        v-for="item in monthlySummaries"
        :key="item.month"
        class="summary-card"
        @click="openDailyList(item.month)"
      >
        <div class="summary-icon">📅</div>

        <div class="summary-main">
          <div class="summary-header">
            <span class="summary-month">{{ item.month }}</span>
            <button type="button" class="ai-btn" @click.stop>AI 요약</button>
          </div>

          <p class="summary-text">
            {{ item.text }}
          </p>
        </div>
      </div>
    </div>

    <!-- 일지 리스트 보기 -->
    <div v-else-if="recordViewMode === 'dailyList'">
      <button
        type="button"
        class="link-btn mb-8"
        @click="recordViewMode = 'monthly'"
      >
        ← 월별 보기로 돌아가기
      </button>

      <h4 class="section-title">{{ selectedMonth }} 일지</h4>

      <div v-if="listLoading" class="hint">불러오는 중...</div>
      <div v-else-if="listError" class="hint error">{{ listError }}</div>

      <ul v-else class="daily-list">
        <li
          v-for="log in dailyLogsByMonth"
          :key="log.logId"
          class="daily-row"
          @click="openDetail(log.logId)"
        >
          <div class="daily-left">
            <span class="daily-icon">📄</span>
            <span class="daily-date">{{ log.recordedAt }}</span>
            <span class="daily-worker">{{ log.careWorkerName }}</span>
          </div>

          <!-- ✅ 만족도 자리 → 서비스 타입 -->
          <span class="daily-time-pill">
            {{ log.serviceType || '-' }}
          </span>
        </li>

        <li v-if="dailyLogsByMonth.length === 0" class="empty-row">
          해당 월의 요양일지가 없습니다.
        </li>
      </ul>
    </div>

    <!-- 상세 기록지 -->
    <div v-else-if="recordViewMode === 'detail'" class="record-detail">
      <button
        type="button"
        class="link-btn mb-8"
        @click="recordViewMode = 'dailyList'"
      >
        ← 일지 리스트로 돌아가기
      </button>

      <div v-if="detailLoading" class="hint">불러오는 중...</div>
      <div v-else-if="detailError" class="hint error">{{ detailError }}</div>

      <template v-else>
        <!-- ✅ 헤더 정보 -->
        <div class="detail-header-row">
          <div class="detail-col">
            <div class="detail-line">
              <span class="detail-label">기록일자</span>
              <span class="detail-value">{{ detail?.recordedAt || '-' }}</span>
            </div>
            <div class="detail-line">
              <span class="detail-label">서비스 구분</span>
              <span class="detail-value">{{ detail?.serviceType || '-' }}</span>
            </div>
          </div>

          <div class="detail-col">
            <div class="detail-line">
              <span class="detail-label">방문 시간</span>
              <span class="detail-value">
                {{ detail?.serviceDate || '-' }}
                {{ detail?.startTime || '' }}~{{ detail?.endTime || '' }}
              </span>
            </div>
            <div class="detail-line">
              <span class="detail-label">방문 요양보호사</span>
              <span class="detail-value">{{ detail?.careWorkerName || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 1) 신체활동 지원 -->
        <div class="detail-section blue">
          <h5>1. 신체활동 지원</h5>

          <!-- ✅ 하위 소그룹: 가로 배치 -->
          <div class="subgrid">
            <div class="subgroup-card" v-if="hasAny(detail?.physical?.meal)">
              <div class="sub-title">식사 / 영양</div>
              <div class="chip-row">
                <span v-for="(t, idx) in detail.physical.meal" :key="'meal' + idx" class="chip">
                  {{ t }}
                </span>
              </div>
            </div>

            <div class="subgroup-card" v-if="hasAny(detail?.physical?.excretion)">
              <div class="sub-title">배설 관리</div>
              <div class="chip-row">
                <span v-for="(t, idx) in detail.physical.excretion" :key="'exc' + idx" class="chip">
                  {{ t }}
                </span>
              </div>
            </div>

            <div class="subgroup-card" v-if="hasAny(detail?.physical?.hygiene)">
              <div class="sub-title">위생 / 청결</div>
              <div class="chip-row">
                <span v-for="(t, idx) in detail.physical.hygiene" :key="'hyg' + idx" class="chip">
                  {{ t }}
                </span>
              </div>
            </div>

            <div class="subgroup-card" v-if="hasAny(detail?.physical?.mobility)">
              <div class="sub-title">이동 / 체위</div>
              <div class="chip-row">
                <span v-for="(t, idx) in detail.physical.mobility" :key="'mob' + idx" class="chip">
                  {{ t }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="!hasAnyAllPhysical(detail)" class="empty-sub">
            표시할 신체활동 항목이 없습니다.
          </div>
        </div>

        <!-- 2) 인지 및 정서 지원 -->
        <div class="detail-section purple">
          <h5>2. 인지 및 정서 지원</h5>

          <div class="chip-row" v-if="hasAny(detail?.cognitive)">
            <span v-for="(t, idx) in detail.cognitive" :key="'cog' + idx" class="chip">
              {{ t }}
            </span>
          </div>

          <div v-else class="empty-sub">
            표시할 인지/정서 항목이 없습니다.
          </div>
        </div>

        <!-- 3) 상태 관찰 및 특이사항 -->
        <div class="detail-section green">
          <h5>3. 상태 관찰 및 특이사항</h5>

          <!-- ✅ 상태도 가로 배치 + 특이사항은 넓게 -->
          <div class="subgrid">
            <div class="subgroup-card" v-if="hasAny(detail?.status?.health)">
              <div class="sub-title">신체 상태</div>
              <div class="chip-row">
                <span v-for="(t, idx) in detail.status.health" :key="'st_h' + idx" class="chip">
                  {{ t }}
                </span>
              </div>
            </div>

            <div class="subgroup-card" v-if="hasAny(detail?.status?.mood)">
              <div class="sub-title">기분 상태</div>
              <div class="chip-row">
                <span v-for="(t, idx) in detail.status.mood" :key="'st_m' + idx" class="chip">
                  {{ t }}
                </span>
              </div>
            </div>

            <div class="subgroup-card" v-if="hasAny(detail?.status?.sleep)">
              <div class="sub-title">수면</div>
              <div class="chip-row">
                <span v-for="(t, idx) in detail.status.sleep" :key="'st_s' + idx" class="chip">
                  {{ t }}
                </span>
              </div>
            </div>

            <!-- ✅ 특이사항: 그리드 전체 폭 -->
            <div class="subgroup-card note-wide">
              <div class="sub-title">특이사항</div>
              <div class="note-box" :class="{ empty: !detail?.specialNote }">
                {{ detail?.specialNote || '없음' }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/lib/api'

const props = defineProps({
  beneficiaryId: {
    type: [Number, String],
    required: true
  },
  monthlySummaryList: {
    type: Array,
    default: () => []
  }
})

const recordViewMode = ref('monthly')
const selectedMonth = ref('2025-12')

const dailyLogList = ref([])
const selectedLogId = ref(null)
const detail = ref(null)

const listLoading = ref(false)
const listError = ref('')
const detailLoading = ref(false)
const detailError = ref('')

const monthlySummaries = computed(() => props.monthlySummaryList)

const dailyLogsByMonth = computed(() => {
  if (!selectedMonth.value) return []
  const m = String(selectedMonth.value)
  return dailyLogList.value.filter((log) => String(log.serviceDate).startsWith(m))
})

const openDailyList = async (month) => {
  selectedMonth.value = month
  recordViewMode.value = 'dailyList'
  await fetchDailyList()
}

const fetchDailyList = async () => {
  listLoading.value = true
  listError.value = ''
  try {
    const { data } = await api.get(`/api/beneficiaries/${props.beneficiaryId}/care-logs`, {
      params: { month: selectedMonth.value }
    })
    dailyLogList.value = Array.isArray(data) ? data : []
  } catch (e) {
    listError.value = e?.response?.data?.message || e?.message || '일지 리스트 조회 실패'
    dailyLogList.value = []
  } finally {
    listLoading.value = false
  }
}

const openDetail = async (logId) => {
  selectedLogId.value = logId
  recordViewMode.value = 'detail'
  await fetchDetail()
}

const fetchDetail = async () => {
  detailLoading.value = true
  detailError.value = ''
  detail.value = null
  try {
    const { data } = await api.get(
      `/api/beneficiaries/${props.beneficiaryId}/care-logs/${selectedLogId.value}`
    )
    detail.value = data
  } catch (e) {
    if (e?.response?.status === 404) {
      detailError.value = '해당 요양일지를 찾을 수 없습니다.'
    } else {
      detailError.value = e?.response?.data?.message || e?.message || '일지 상세 조회 실패'
    }
  } finally {
    detailLoading.value = false
  }
}

watch(
  () => props.beneficiaryId,
  () => {
    recordViewMode.value = 'monthly'
    dailyLogList.value = []
    detail.value = null
    selectedLogId.value = null
  }
)

const hasAny = (arr) => Array.isArray(arr) && arr.length > 0

const hasAnyAllPhysical = (d) => {
  const p = d?.physical
  return hasAny(p?.meal) || hasAny(p?.excretion) || hasAny(p?.hygiene) || hasAny(p?.mobility)
}
</script>

<style scoped>
.link-btn {
  border: none;
  background: transparent;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
}
.mb-8 {
  margin-bottom: 8px;
}

/* 월별 카드 */
.record-monthly {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.summary-card {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #f9fafb;
  cursor: pointer;
}
.summary-icon {
  font-size: 18px;
}
.summary-main {
  flex: 1;
}
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.summary-month {
  font-weight: 600;
  font-size: 13px;
}
.ai-btn {
  border-radius: 999px;
  border: none;
  padding: 4px 8px;
  font-size: 11px;
  background-color: #eef2ff;
  color: #4f46e5;
  cursor: pointer;
}
.summary-text {
  margin: 0;
  font-size: 12px;
  color: #4b5563;
}

/* 일지 리스트 */
.section-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
}
.daily-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.daily-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
  background-color: #f9fafb;
  font-size: 12px;
  margin-bottom: 4px;
  cursor: pointer;
}
.daily-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.daily-icon {
  font-size: 14px;
}
.daily-date {
  font-weight: 500;
}
.daily-worker {
  color: #6b7280;
}
.daily-time-pill {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  background-color: #eef2ff;
  color: #4f46e5;
  white-space: nowrap;
}
.empty-row {
  padding: 10px 8px;
  color: #6b7280;
  font-size: 12px;
}

/* 상세 기록지 */
.record-detail {
  font-size: 12px;
}
.detail-header-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 10px;
}
.detail-col {
  flex: 1;
}
.detail-line {
  display: grid;
  grid-template-columns: 110px 1fr;
  column-gap: 14px;
  align-items: center;
  margin-bottom: 4px;
}
.detail-label {
  color: #6b7280;
}
.detail-value {
  justify-self: start;
}

/* 섹션 */
.detail-section {
  border-radius: 10px;
  padding: 10px 12px; /* 살짝 늘려서 꽉 찬 느낌 */
  margin-bottom: 8px;
}
.detail-section.blue {
  background-color: #eef2ff;
}
.detail-section.purple {
  background-color: #f5f3ff;
}
.detail-section.green {
  background-color: #ecfdf3;
}
.detail-section h5 {
  margin: 0 0 8px;
  font-size: 12px;
}

/* ✅ 하위 소그룹을 가로 2열 그리드로 */
.subgrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
}
@media (max-width: 520px) {
  .subgrid {
    grid-template-columns: 1fr;
  }
}

/* 카드처럼 보이게(여백 줄고 꽉 차 보임) */
.subgroup-card {
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.55);
}

/* 특이사항은 넓게 */
.note-wide {
  grid-column: 1 / -1;
}

.sub-title {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

/* 칩 */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.chip {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  background-color: #e5e7eb;
  color: #374151;
}

/* 특이사항 박스 */
.note-box {
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.4;
  background: rgba(255, 255, 255, 0.7);
  color: #374151;
  white-space: pre-wrap;
}
.note-box.empty {
  color: #6b7280;
}

/* hint */
.hint {
  font-size: 12px;
  color: #6b7280;
  padding: 6px 2px;
}
.hint.error {
  color: #dc2626;
}
.empty-sub {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}
</style>
