<!-- src/components/recipient/category/record/SummaryRecord.vue -->
<template>
  <div class="record-summary">
    <!-- 월별 보기 -->
    <div v-if="recordViewMode === 'monthly'" class="record-monthly">
      <!-- ✅ 월 카드가 0개면 안내 -->
      <div v-if="monthlySummariesView.length === 0" class="empty-month-card">
        요양일지가 등록되면 월별 카드가 생성됩니다.
      </div>

      <!-- ✅ 월 카드 목록(스크롤 영역) -->
      <div v-else class="monthly-scroll">
        <div
          v-for="item in monthlySummariesView"
          :key="item.month"
          class="summary-card"
          @click="openDailyList(item.month)"
        >
          <div class="summary-icon">📅</div>

          <div class="summary-main">
            <div class="summary-header">
              <span class="summary-month">{{ item.month }}</span>

              <!-- ✅ AI 요약 버튼 -->
              <button
                type="button"
                class="ai-btn"
                :disabled="!!aiLoadingByMonth[item.month]"
                @click.stop="runAiSummary(item.month)"
              >
                {{ aiLoadingByMonth[item.month] ? '요약 중…' : 'AI 요약' }}
              </button>
            </div>

            <p class="summary-text">
              {{ item.text || '해당 월의 경향을 한눈에 보려면 AI요약 버튼을 클릭하세요!' }}
            </p>

            <!-- ✅ 월 카드별 에러 메시지 -->
            <p v-if="aiErrorByMonth[item.month]" class="ai-error">
              {{ aiErrorByMonth[item.month] }}
            </p>
          </div>
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

      <!-- ✅ 제목 + (오른쪽) 총 건수 : 사진 빨간박스 자리 -->
      <div class="daily-top-row">
        <h4 class="section-title">{{ selectedMonth }} 일지</h4>
        <div class="total">총 {{ dailyTotalCount }}건</div>
      </div>

      <div v-if="listLoading" class="hint">불러오는 중...</div>
      <div v-else-if="listError" class="hint error">{{ listError }}</div>

      <!-- ✅ 목록(현재 페이지 10개만) -->
      <ul v-else class="daily-list">
        <li
          v-for="log in pagedDailyLogList"
          :key="log.logId"
          class="daily-row"
          @click="openDetail(log.logId)"
        >
          <div class="daily-left">
            <span class="daily-icon">📄</span>
            <span class="daily-date">{{ log.serviceDate }}</span>
            <span class="daily-worker">{{ log.careWorkerName }}</span>
          </div>

          <span class="daily-time-pill">
            {{ log.serviceType || '-' }}
          </span>
        </li>

        <li v-if="dailyTotalCount === 0" class="empty-row">
          해당 월의 요양일지가 없습니다.
        </li>
      </ul>

      <!-- ✅ 하단 중앙 페이징 (페이지가 2 이상일 때만 표시) -->
      <div v-if="dailyTotalPages > 1" class="bottom-pager">
        <button
          type="button"
          class="page-btn"
          :disabled="listLoading || dailyPage <= 0"
          @click="dailyPage--"
        >
          이전
        </button>

        <span class="page-info">
          {{ dailyPage + 1 }} / {{ dailyTotalPages }}
        </span>

        <button
          type="button"
          class="page-btn"
          :disabled="listLoading || dailyPage >= dailyTotalPages - 1"
          @click="dailyPage++"
        >
          다음
        </button>
      </div>
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
              <span class="detail-label">서비스 일시</span>
              <span class="detail-value">
                {{ detail?.serviceDate || '-' }}
                {{ detail?.startTime || '' }}~{{ detail?.endTime || '' }}
              </span>
            </div>
            <div class="detail-line">
              <span class="detail-label">서비스 구분</span>
              <span class="detail-value">{{ detail?.serviceType || '-' }}</span>
            </div>
          </div>

          <div class="detail-col">
            <div class="detail-line">
              <span class="detail-label">기록 일시</span>
              <span class="detail-value">{{ detail?.recordedAt || '-' }}</span>
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
  beneficiaryId: { type: [Number, String], required: true },
  monthlySummaryList: { type: Array, default: () => [] }
})

const localMonthlySummaries = ref([])
const monthlySummariesView = computed(() => localMonthlySummaries.value)

const recordViewMode = ref('monthly')
const selectedMonth = ref('')

const dailyLogList = ref([])
const selectedLogId = ref(null)
const detail = ref(null)

const listLoading = ref(false)
const listError = ref('')
const detailLoading = ref(false)
const detailError = ref('')

const aiLoadingByMonth = ref({})
const aiErrorByMonth = ref({})

const BLOCK_EMPTY_SUMMARY_OVERWRITE = true

/** ✅ dailyList 페이징 상태(문의이력과 동일) */
const dailyPage = ref(0)
const dailyPageSize = ref(10)

/** ✅ 총 건수/총 페이지 */
const dailyTotalCount = computed(() => dailyLogList.value.length)
const dailyTotalPages = computed(() =>
  dailyTotalCount.value === 0 ? 0 : Math.ceil(dailyTotalCount.value / dailyPageSize.value)
)

/** ✅ 현재 페이지에 보여줄 10개 */
const pagedDailyLogList = computed(() => {
  const start = dailyPage.value * dailyPageSize.value
  return dailyLogList.value.slice(start, start + dailyPageSize.value)
})

const fetchMonthlyCardsFromLogs = async () => {
  if (!props.beneficiaryId) return

  try {
    const { data } = await api.get(`/api/beneficiaries/${props.beneficiaryId}/care-logs`)
    const logs = Array.isArray(data) ? data : []

    const monthSet = new Set()
    for (const log of logs) {
      const sd = String(log?.serviceDate || '')
      if (sd.length >= 7) monthSet.add(sd.slice(0, 7))
    }

    const months = Array.from(monthSet).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))

    localMonthlySummaries.value = months.map((m) => ({
      month: m,
      text: ''
    }))

    await fetchSavedSummariesForMonths(months)
  } catch (e) {
    localMonthlySummaries.value = []
  }
}

const fetchSavedSummariesForMonths = async (months) => {
  if (!Array.isArray(months) || months.length === 0) return

  const tasks = months.map(async (m) => {
    try {
      const { data } = await api.get(
        `/ai/beneficiaries/${props.beneficiaryId}/care-logs/monthly-summary`,
        { params: { month: m } }
      )

      const summaryText = (data?.summaryText || '').trim()
      if (!summaryText) return { month: m, text: '' }
      return { month: m, text: summaryText }
    } catch (e) {
      return { month: m, text: '' }
    }
  })

  const results = await Promise.all(tasks)

  const map = new Map(results.map((r) => [String(r.month), r.text]))
  localMonthlySummaries.value = localMonthlySummaries.value.map((it) => {
    const t = map.get(String(it.month)) ?? it.text
    return { ...it, text: t }
  })
}

const openDailyList = async (month) => {
  selectedMonth.value = String(month || '')
  recordViewMode.value = 'dailyList'
  dailyPage.value = 0 // ✅ 월 변경 시 페이지 초기화
  await fetchDailyList()
}

const fetchDailyList = async () => {
  if (!selectedMonth.value) return

  listLoading.value = true
  listError.value = ''
  try {
    const { data } = await api.get(`/api/beneficiaries/${props.beneficiaryId}/care-logs`, {
      params: { month: selectedMonth.value }
    })
    dailyLogList.value = Array.isArray(data) ? data : []

    // ✅ 목록 로드 후 현재 page가 범위를 벗어나면 보정
    if (dailyPage.value > 0 && dailyPage.value >= dailyTotalPages.value) {
      dailyPage.value = Math.max(dailyTotalPages.value - 1, 0)
    }
  } catch (e) {
    listError.value = e?.response?.data?.message || e?.message || '일지 리스트 조회 실패'
    dailyLogList.value = []
    dailyPage.value = 0
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

const runAiSummary = async (month) => {
  if (!month) return
  const key = String(month)

  if (aiLoadingByMonth.value[key]) return

  aiLoadingByMonth.value = { ...aiLoadingByMonth.value, [key]: true }
  aiErrorByMonth.value = { ...aiErrorByMonth.value, [key]: '' }

  try {
    const { data } = await api.post(
      `/ai/beneficiaries/${props.beneficiaryId}/care-logs/monthly-summary`,
      null,
      { params: { month: key } }
    )

    const summaryText = (data?.summaryText || '').trim()

    if (BLOCK_EMPTY_SUMMARY_OVERWRITE && summaryText.includes('요양일지가 없어')) {
      aiErrorByMonth.value = { ...aiErrorByMonth.value, [key]: summaryText }
      return
    }

    localMonthlySummaries.value = localMonthlySummaries.value.map((it) => {
      if (String(it.month) !== key) return it
      return { ...it, text: summaryText }
    })
  } catch (e) {
    aiErrorByMonth.value = {
      ...aiErrorByMonth.value,
      [key]: e?.response?.data?.message || e?.response?.data?.detail || e?.message || 'AI 요약 실패'
    }
  } finally {
    aiLoadingByMonth.value = { ...aiLoadingByMonth.value, [key]: false }
  }
}

watch(
  () => props.beneficiaryId,
  async () => {
    recordViewMode.value = 'monthly'
    selectedMonth.value = ''
    dailyLogList.value = []
    detail.value = null
    selectedLogId.value = null
    aiLoadingByMonth.value = {}
    aiErrorByMonth.value = {}

    dailyPage.value = 0

    await fetchMonthlyCardsFromLogs()
  },
  { immediate: true }
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
.mb-8 { margin-bottom: 8px; }

.record-monthly { display: flex; flex-direction: column; gap: 8px; }

.empty-month-card{
  padding: 14px 12px;
  border-radius: 10px;
  border: 1px dashed #e5e7eb;
  background: #fafafa;
  color: #6b7280;
  font-size: 12px;
}

.summary-card {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background-color: #f9fafb;
  cursor: pointer;
}
.summary-icon { font-size: 18px; }
.summary-main { flex: 1; }
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.summary-month { font-weight: 600; font-size: 13px; }
.ai-btn {
  border-radius: 999px;
  border: none;
  padding: 4px 8px;
  font-size: 11px;
  background-color: #eef2ff;
  color: #4f46e5;
  cursor: pointer;
}
.ai-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.summary-text { margin: 0; font-size: 12px; color: #4b5563; }
.ai-error { margin: 6px 0 0; font-size: 11px; color: #dc2626; }

/* ✅ dailyList: 제목줄 + 총건수(오른쪽) */
.daily-top-row{
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
}
.section-title { margin: 0; font-size: 14px; font-weight: 600; }
.total {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.daily-list { list-style: none; margin: 0; padding: 0; }
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
.daily-left { display: flex; align-items: center; gap: 8px; }
.daily-icon { font-size: 14px; }
.daily-date { font-weight: 500; }
.daily-worker { color: #6b7280; }
.daily-time-pill {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  background-color: #eef2ff;
  color: #4f46e5;
  white-space: nowrap;
}
.empty-row { padding: 10px 8px; color: #6b7280; font-size: 12px; }

/* ✅ 하단 중앙 페이징 (Inquiry.vue와 동일) */
.bottom-pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 6px 0;
}
.page-info {
  font-size: 12px;
  color: #6b7280;
}
.page-btn {
  border: none;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.page-btn:hover { background: #e5e7eb; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.record-detail { font-size: 12px; }
.detail-header-row { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 10px; }
.detail-col { flex: 1; }
.detail-line {
  display: grid;
  grid-template-columns: 110px 1fr;
  column-gap: 14px;
  align-items: center;
  margin-bottom: 4px;
}
.detail-label { color: #6b7280; }
.detail-value { justify-self: start; }

.detail-section { border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; }
.detail-section.blue { background-color: #eef2ff; }
.detail-section.purple { background-color: #f5f3ff; }
.detail-section.green { background-color: #ecfdf3; }
.detail-section h5 { margin: 0 0 8px; font-size: 12px; }

.subgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 10px; }
@media (max-width: 520px) { .subgrid { grid-template-columns: 1fr; } }
.subgroup-card { border-radius: 10px; padding: 8px 10px; background: rgba(255, 255, 255, 0.55); }
.note-wide { grid-column: 1 / -1; }

.sub-title { font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 6px; }
.chip-row { display: flex; flex-wrap: wrap; gap: 4px; }
.chip { border-radius: 999px; padding: 2px 8px; font-size: 11px; background-color: #e5e7eb; color: #374151; }

.note-box {
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.4;
  background: rgba(255, 255, 255, 0.7);
  color: #374151;
  white-space: pre-wrap;
}
.note-box.empty { color: #6b7280; }

.hint { font-size: 12px; color: #6b7280; padding: 6px 2px; }
.hint.error { color: #dc2626; }
.empty-sub { margin-top: 6px; font-size: 12px; color: #6b7280; }
</style>
