<!-- src/components/recipient/category/record/BasicTest.vue -->
<template>
  <div class="baseline-wrap">
    <!--  기초평가 내부 탭(유지) -->
    <div class="baseline-subtabs">
      <button
        v-for="tab in baselineTabs"
        :key="tab.key"
        type="button"
        class="baseline-subtab-btn"
        :class="{ active: activeBaseline === tab.key }"
        @click="activeBaseline = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 공통 패널 -->
    <section class="baseline-panel">
      <!-- 헤더 -->
      <div class="panel-header">
        <div class="header-left">
          <span class="title">{{ activeTabTitle }}</span>
          <span class="sub">최신 평가 1건 요약</span>
        </div>

        <!--  최근평가 칩 삭제 +  년도 필터를 이 위치로 이동 -->
        <div class="header-right">
          <select
            v-if="availableYears.length > 0"
            v-model="selectedYear"
            class="year-select"
          >
            <option v-for="y in availableYears" :key="y" :value="parseInt(y)">
              {{ y }}년
            </option>
          </select>

          <!-- 데이터가 아예 없을 때만 표시(기존 유지 취지) -->
          <span class="chip ghost" v-if="availableYears.length === 0">
            평가 이력 없음
          </span>
        </div>
      </div>

      <!-- 상태 -->
      <div v-if="!props.beneficiaryId" class="state-box">
        수급자를 선택하면 기초평가 결과를 조회할 수 있어요.
      </div>

      <div v-else-if="loading" class="state-box">
        평가 내역을 불러오는 중입니다...
      </div>

      <div v-else-if="loadError" class="state-box error">
        불러오기에 실패했어요. ({{ loadError }})
      </div>

      <div v-else-if="filteredByYear.length === 0" class="state-box">
        {{ emptyMessage }}
      </div>

      <template v-else>
        <!-- 내역 리스트(위로 올림) -->
        <div class="history-list">
          <div
            v-for="item in filteredByYear"
            :key="item.id"
            class="eval-row"
            @click="openDetailModal(item)"
          >
            <div class="row-col basic-info">
              <div class="info-stack">
                <span class="recipient-name">{{ item.beneficiaryName }}</span>

                <div class="badge-row">
                  <span
                    class="status-badge"
                    :class="item.status === '임시저장' ? 'draft' : 'submitted'"
                  >
                    {{ item.status }}
                  </span>

                  <span class="grade-badge" :class="getGradeClass(item.gradeLabel)">
                    {{ item.resultGrade }}
                  </span>
                </div>
              </div>
            </div>

            <div class="row-col date-info">
              <span class="row-date">{{ formatDateOnly(item.evalDate) }}</span>
            </div>

            <div class="row-col score-info">
              <div v-if="activeBaseline !== 'needs'" class="score-wrapper">
                <span class="score-label">총점</span>
                <span class="score-value">{{ safeText(item.totalScore, 0) }}점</span>
              </div>

              <div v-if="item.comment" class="comment-preview">
                <span class="comment-text">{{ item.comment }}</span>
              </div>
            </div>

            <div class="row-col action-col">›</div>
          </div>
        </div>
      </template>
    </section>

    <!--  상세 모달 (폼 컴포넌트 readOnly) -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>평가 상세 정보</h3>
          <button class="modal-close-btn" @click="closeDetailModal">×</button>
        </div>

        <div class="modal-body">
          <component
            v-if="currentTabComponent && detailItem"
            :is="currentTabComponent"
            :initialData="detailItem"
            :readOnly="true"
          />
          <div v-else class="state-box">상세 데이터를 표시할 수 없습니다.</div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailModal">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

//  (요양보호사화면 코드 방식) 폼 컴포넌트
import FallRiskAssessmentForm from "@/components/careworker/activity/FallRiskAssessmentForm.vue";
import BedsoreAssessmentForm from "@/components/careworker/activity/BedsoreAssessmentForm.vue";
import CognitiveAssessmentForm from "@/components/careworker/activity/CognitiveAssessmentForm.vue";
import NeedsAssessmentForm from "@/components/careworker/activity/NeedsAssessmentForm.vue";

//  (요양보호사화면 코드 방식) API 함수들
import {
  getFallEvaluationListByBeneficiary,
  getFallEvaluationDetail,
  getBedsoreEvaluationListByBeneficiary,
  getBedsoreEvaluationDetail,
  getCognitiveEvaluationListByBeneficiary,
  getCognitiveEvaluationDetail,
  getNeedsEvaluationListByBeneficiary,
  getNeedsEvaluationDetail,
} from '@/api/careworker';

const props = defineProps({
  beneficiaryId: { type: [Number, String], default: null }
})

//  내부 탭(유지)
const baselineTabs = [
  { key: 'fall', label: '낙상위험도' },
  { key: 'bedsore', label: '욕창위험' },
  { key: 'cognitive', label: '인지기능' },
  { key: 'needs', label: '욕구사정' }
]

const activeBaseline = ref('fall')

const loading = ref(false)
const loadError = ref('')

const evalHistory = ref([]) // 현재 탭 전체 목록
const selectedYear = ref(new Date().getFullYear())
const yearStats = ref({})

const showDetailModal = ref(false)
const detailItem = ref(null)

//  탭별 컴포넌트 매핑
const componentMap = {
  fall: FallRiskAssessmentForm,
  bedsore: BedsoreAssessmentForm,
  cognitive: CognitiveAssessmentForm,
  needs: NeedsAssessmentForm || null,
}

//  탭별 API 매핑
const apiMap = {
  fall: getFallEvaluationListByBeneficiary,
  bedsore: getBedsoreEvaluationListByBeneficiary,
  cognitive: getCognitiveEvaluationListByBeneficiary,
  needs: getNeedsEvaluationListByBeneficiary,
}

const detailApiMap = {
  fall: getFallEvaluationDetail,
  bedsore: getBedsoreEvaluationDetail,
  cognitive: getCognitiveEvaluationDetail,
  needs: getNeedsEvaluationDetail,
}

//  현재 탭 타이틀
const activeTabTitle = computed(() => {
  const t = baselineTabs.find((x) => x.key === activeBaseline.value)
  return t ? `${t.label} 평가 (연 1회)` : '기초평가'
})

//  빈 메시지
const emptyMessage = computed(() => {
  switch (activeBaseline.value) {
    case 'fall': return '낙상 평가 결과가 없습니다.'
    case 'bedsore': return '욕창 평가 결과가 없습니다.'
    case 'cognitive': return '인지기능 평가 결과가 없습니다.'
    case 'needs': return '욕구사정 평가 결과가 없습니다.'
    default: return '평가 결과가 없습니다.'
  }
})

//  현재 상세 폼 컴포넌트
const currentTabComponent = computed(() => componentMap[activeBaseline.value] || null)

const safeText = (v, fallback = '-') => {
  if (v === null || v === undefined) return fallback
  const s = String(v).trim()
  return s.length ? s : fallback
}

const formatDateOnly = (v) => {
  if (!v) return '-'
  return String(v).split('T')[0].split(' ')[0]
}

//  등급 라벨(낮음/중간/높음)로 표준화
const getGradeLabel = (resultGrade) => {
  if (!resultGrade) return '-'
  const g = String(resultGrade)

  //  (추가) 인지기능 문구 매핑
  // - '인지기능 정상' => 낮음(녹색)
  // - '인지저하 의심' => 높음(빨강)
  if (g.includes('인지기능 정상')) return '낮음'
  if (g.includes('인지저하') || g.includes('의심')) return '높음'

  // (기존 로직 유지)
  if (g.includes('낮음') || g.includes('정상') || g.includes('없음')) return '낮음'
  if (g.includes('중간') || g.includes('보통')) return '중간'
  if (g.includes('높음')) return '높음'
  return '-'
}

const getGradeClass = (gradeLabel) => {
  switch (gradeLabel) {
    case '낮음': return 'grade-low'
    case '중간': return 'grade-mid'
    case '높음': return 'grade-high'
    default: return ''
  }
}

//  연도별 그룹
const calculateYearStats = (data) => {
  const stats = {}
  data.forEach(item => {
    const d = new Date(item.evalDate)
    const y = d.getFullYear()
    if (!stats[y]) stats[y] = { count: 0, items: [] }
    stats[y].count++
    stats[y].items.push(item)
  })
  return stats
}

//  리스트 로딩(핵심)
const loadEvaluationHistory = async () => {
  if (!props.beneficiaryId) return

  loading.value = true
  loadError.value = ''
  evalHistory.value = []
  yearStats.value = {}

  try {
    const apiFn = apiMap[activeBaseline.value]
    if (!apiFn) return

    const response = await apiFn(props.beneficiaryId)
    const data = response?.data ?? response

    const formatted = (data || []).map(item => {
      let totalScore = item.totalScore ?? 0
      let resultGrade = item.resultGrade || item.grade || item.interpretationResult || '-'
      let comment = item.specialNote || item.comment || item.interpretationComment || ''

      let parsedIsDraft = false
      if (item.evalData) {
        try {
          const parsed = typeof item.evalData === 'string' ? JSON.parse(item.evalData) : item.evalData
          if (parsed?.isDraft) parsedIsDraft = true
          if (parsed?.result) {
            totalScore = parsed.result.total_score ?? totalScore
            resultGrade = parsed.result.grade || resultGrade
          }
          if (parsed?.comment && !comment) comment = parsed.comment
        } catch (_) {}
      }

      const isDraft =
        item.isDraft === true || item.isDraft === 'true' || item.isDraft === 1 ||
        item.is_draft === true || item.is_draft === 'true' || item.is_draft === 1 ||
        parsedIsDraft

      const evalDate = item.evalDate || item.assessmentDate || item.evaluationDate || item.createdAt

      return {
        id: item.evalId || item.id,
        evalDate,
        beneficiaryId: item.beneficiaryId ?? props.beneficiaryId,
        beneficiaryName: item.beneficiaryName || item.recipientName || '-',
        resultGrade,
        gradeLabel: getGradeLabel(resultGrade),
        totalScore,
        status: isDraft ? '임시저장' : '제출됨',
        evaluatorName:
          item.employeeName || item.evaluatorName || item.writerName || item.createdByName || item.careWorkerName || '-',
        comment,
        raw: item,
      }
    })

    formatted.sort((a, b) => new Date(b.evalDate) - new Date(a.evalDate))
    evalHistory.value = formatted
    yearStats.value = calculateYearStats(formatted)

    const years = Object.keys(yearStats.value).sort((a, b) => b - a)
    if (years.length > 0 && !yearStats.value[selectedYear.value]) {
      selectedYear.value = parseInt(years[0])
    } else if (years.length === 0) {
      selectedYear.value = new Date().getFullYear()
    }
  } catch (e) {
    loadError.value = e?.response?.data?.message || e?.message || 'unknown error'
  } finally {
    loading.value = false
  }
}

const availableYears = computed(() => Object.keys(yearStats.value).sort((a, b) => b - a))

const filteredByYear = computed(() => {
  const bucket = yearStats.value[selectedYear.value]
  if (!bucket) return []
  return bucket.items || []
})

//  상세 데이터 파싱(폼 컴포넌트가 기대하는 형태로 맞춰줌)
const parseDetailData = (data) => {
  const parsed = { ...data }
  parsed.recipientName = data.beneficiaryName || data.recipientName

  if (data.evalData) {
    try {
      const evalJson = typeof data.evalData === 'string' ? JSON.parse(data.evalData) : data.evalData

      if (activeBaseline.value === 'fall') {
        parsed.fallRisk = evalJson.items || evalJson.answers || {}
      } else if (activeBaseline.value === 'bedsore') {
        parsed.bedsoreRisk = evalJson.items || evalJson.answers || {}
      } else if (activeBaseline.value === 'cognitive') {
        parsed.responses = evalJson.items || evalJson.answers || {}
        parsed.educationLevel = evalJson.educationLevel || 'MIDDLE_HIGH'
      } else if (activeBaseline.value === 'needs') {
        parsed.responses = evalJson.items || evalJson.answers || {}
        parsed.textResponses = evalJson.textResponses || {}
      }

      if (evalJson.comment) parsed.comment = evalJson.comment
    } catch (_) {}
  }

  return parsed
}

const openDetailModal = async (item) => {
  try {
    const detailApi = detailApiMap[activeBaseline.value]
    let data = item?.raw ? { ...item.raw } : { ...item }

    if (detailApi) {
      if (!item?.id) throw new Error('evalId is required')
      const res = await detailApi(item.id)
      data = res?.data ?? res
    }

    data.id = data.id || data.evalId || item.id
    data.beneficiaryName = data.beneficiaryName || item.beneficiaryName
    data.evalDate = data.evalDate || data.assessmentDate || data.evaluationDate || item.evalDate

    detailItem.value = parseDetailData(data)
    showDetailModal.value = true
  } catch (e) {
    console.error('평가 상세 조회 실패:', e)
    alert('평가 정보를 불러오는데 실패했습니다.')
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  detailItem.value = null
}

//  beneficiaryId 변경 / 탭 변경 시 로드
watch(() => props.beneficiaryId, loadEvaluationHistory, { immediate: true })
watch(activeBaseline, loadEvaluationHistory)
</script>

<style scoped>
.baseline-wrap { margin-top: 4px; }

/* 내부 탭(기존 유지) */
.baseline-subtabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #e5e7eb;
  margin: 0 -16px 8px;
  padding: 0 16px;
}
.baseline-subtab-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 13px;
  cursor: pointer;
  color: #6b7280;
}
.baseline-subtab-btn.active { color: #16a34a; font-weight: 600; }
.baseline-subtab-btn.active::after {
  content: '';
  position: absolute;
  left: 0; right: 0; bottom: -1px;
  height: 2px;
  background-color: #16a34a;
  border-radius: 999px;
}

.baseline-panel {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  background-color: #faf5ff;
  border: 1px solid #ede9fe;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.header-left { display: flex; flex-direction: column; gap: 2px; }
.title { font-size: 13px; font-weight: 700; }
.sub { font-size: 11px; color: #6b7280; }
.header-right { display: flex; gap: 8px; align-items: center; }

/* (기존 유지) */
.chip {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  background-color: #ede9fe;
  color: #6d28d9;
  white-space: nowrap;
}
.chip.ghost { background-color: #f3f4f6; color: #6b7280; }

.state-box {
  padding: 12px 10px;
  border-radius: 10px;
  background: #fdfcff;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  color: #4b5563;
}
.state-box.error {
  border-color: #fecaca;
  background: #fff1f2;
  color: #b91c1c;
}

/*  년도 필터(위치만 이동) - 기존 스타일 유지 */
.year-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 12px;
  background-color: white;
  cursor: pointer;
  color: #374151;
  outline: none;
}

/*  내역 리스트(기존 유지) */
.history-list { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }

.eval-row {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  display: grid;
  grid-template-columns: 1.2fr 1.2fr 2fr 24px;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  cursor: pointer;
}
.eval-row:hover {
  border-color: #16a34a;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.08);
  transform: translateX(2px);
}

.info-stack { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.recipient-name { font-size: 13px; font-weight: 800; color: #1f2937; }

.badge-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

.grade-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  width: fit-content;
}
.grade-badge.grade-low { background: #dcfce7; color: #16a34a; }
.grade-badge.grade-mid { background: #fef3c7; color: #d97706; }
.grade-badge.grade-high { background: #fee2e2; color: #dc2626; }

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  background: #dcfce7;
  color: #16a34a;
  font-size: 10px;
  font-weight: 800;
  border-radius: 10px;
}
.status-badge.draft { background: #fef3c7; color: #d97706; }

.date-info { display: flex; flex-direction: column; gap: 4px; }
.row-date { font-weight: 700; color: #374151; font-size: 12px; }

.score-info { display: flex; flex-direction: column; gap: 6px; }
.score-wrapper { display: flex; align-items: center; gap: 6px; }
.score-label { font-size: 11px; color: #6b7280; }
.score-value { font-weight: 800; color: #16a34a; font-size: 12px; }

.comment-preview {
  background: #f9fafb;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}
.comment-text {
  font-size: 11px;
  color: #4b5563;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-col { text-align: right; color: #9ca3af; font-size: 18px; font-weight: 900; }

/*  모달(기존 유지) */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}
.modal-content {
  background: white; width: 92%; max-width: 900px;
  height: 90vh; max-height: 920px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  padding: 16px 18px; border-bottom: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
  background: #fff;
}
.modal-header h3 { font-size: 16px; font-weight: 800; color: #111; margin: 0; }
.modal-close-btn {
  background: transparent; border: none; font-size: 24px; color: #9ca3af;
  cursor: pointer; padding: 2px 6px;
}
.modal-body { flex: 1; overflow-y: auto; padding: 18px; background: #f9fafb; }
.modal-footer {
  padding: 12px 18px; border-top: 1px solid #e5e7eb; background: white;
  display: flex; justify-content: flex-end; gap: 8px;
}
.btn-secondary {
  padding: 8px 14px; border: 1px solid #d1d5db; background: white;
  color: #374151; border-radius: 10px; font-weight: 700; cursor: pointer;
}
.btn-secondary:hover { background: #f9fafb; }
</style>
