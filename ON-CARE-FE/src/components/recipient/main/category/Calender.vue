<!-- src/components/recipient/main/category/Calender.vue -->
<template>
  <div>
    <!-- 헤더: 월 이동 -->
    <div class="schedule-header">
      <!-- type="button" + @click.prevent : form submit / 기본동작 방지 -->
      <button type="button" class="link-btn" @click.prevent="prevMonth">
        ← 이전달
      </button>

      <!--  타이틀 + 달력이모지(클릭해서 년/월 이동) -->
      <div class="schedule-title-wrap">
        <div class="schedule-title">
          {{ currentYear }}년 {{ currentMonth + 1 }}월
        </div>

        <!-- 빨간 박스 위치: 타이틀 오른쪽 -->
        <button
          type="button"
          class="calendar-icon-btn"
          aria-label="년/월 선택"
          @click.prevent="openMonthPicker"
        >
          <!-- 기존 📅 이모지 → 참고코드 느낌의 캘린더 아이콘(SVG)로 교체 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="display: inline-block; vertical-align: middle;"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      <button type="button" class="link-btn" @click.prevent="nextMonth">
        다음달 →
      </button>
    </div>

    <!--  아래 예쁜 스타일: MonthPickerModal -->
    <MonthPickerModal
      v-if="showMonthPicker"
      :year-options="yearOptions"
      :year-value="pickerYear"
      :month-value="pickerMonth"
      @update:yearValue="(v) => (pickerYear = v)"
      @update:monthValue="(v) => (pickerMonth = v)"
      @close="closeMonthPicker"
      @apply="applyMonthPicker"
    />

    <!-- 범례: 고정일정만 -->
    <div class="schedule-legend">
      <span class="legend">
        <span class="dot dot-fixed"></span> 고정일정
      </span>
    </div>

    <!-- 핵심: 캘린더 DOM을 v-if로 없애지 말고 "항상 유지" -->
    <!-- 로딩/에러는 캘린더 위에 오버레이로만 띄워서 깜빡임 제거 -->
    <div class="calendar-wrap">
      <!-- 로딩 오버레이(캘린더는 그대로 있고 위에만 덮음) -->
      <div v-if="loading" class="overlay" aria-live="polite">
        불러오는 중...
      </div>

      <!-- 에러 오버레이 -->
      <div v-else-if="errorMsg" class="overlay error" aria-live="polite">
        {{ errorMsg }}
      </div>

      <!-- 캘린더(항상 렌더링) -->
      <div class="calendar">
        <!-- 요일 헤더 -->
        <div class="calendar-header-cell" v-for="d in weekDays" :key="d">
          {{ d }}
        </div>

        <!-- 날짜 셀(42칸) -->
        <div
          v-for="(cell, index) in calendarCells"
          :key="index"
          class="calendar-cell"
          :class="{ 'is-today': cell.isToday }"
        >
          <div class="cell-date" :class="{ muted: !cell.isCurrentMonth }">
            {{ cell.date.getDate() }}
          </div>

          <!-- 일정 pills -->
          <div class="cell-events">
            <div
              v-for="ev in cell.events"
              :key="ev.id"
              class="event-pill event-fixed"
            >
              <span class="event-time">
                {{ splitTitle(ev.title).time }}
              </span>
              <span class="event-title">
                {{ splitTitle(ev.title).text }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- /calendar -->
    </div>
    <!-- /calendar-wrap -->
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import api from '@/lib/api'

/* 추가: 아래 예쁜 모달 컴포넌트 */
import MonthPickerModal from '@/components/schedule/calendar/MonthPickerModal.vue'

/**
 * 상위에서 수급자 ID만 받으면 됨
 */
const props = defineProps({
  beneficiaryId: {
    type: Number,
    default: null
  },
  refreshKey: Number
})

/** 서버 상태 */
const loading = ref(false)
const errorMsg = ref('')

/**
 * 캘린더가 사용하는 이벤트 배열
 * { id, date:'YYYY-MM-DD', title, type:'fixed' }
 */
const fixedEvents = ref([])

/** 현재 보고있는 달(1일로 고정) */
const today = new Date()
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))

/** 요일 */
const weekDays = ['일', '월', '화', '수', '목', '금', '토']

/** 현재 달/년(뷰 기준) */
const currentYear = computed(() => viewDate.value.getFullYear())
const currentMonth = computed(() => viewDate.value.getMonth()) // 0~11

/* -------------------- Month Picker (예쁜 모달로 교체) -------------------- */
const showMonthPicker = ref(false)
const pickerYear = ref(currentYear.value)
const pickerMonth = ref(currentMonth.value + 1) // 1~12

const yearOptions = computed(() => {
  const base = today.getFullYear()
  const list = []
  for (let y = base - 5; y <= base + 5; y += 1) list.push(y)
  return list
})

const openMonthPicker = () => {
  pickerYear.value = currentYear.value
  pickerMonth.value = currentMonth.value + 1
  showMonthPicker.value = true
}

const closeMonthPicker = () => {
  showMonthPicker.value = false
}

const applyMonthPicker = () => {
  const y = Number(pickerYear.value)
  const m = Number(pickerMonth.value) // 1~12
  if (!y || !m) return

  viewDate.value = new Date(y, m - 1, 1)
  showMonthPicker.value = false
}

/**
 * 백엔드 응답(ScheduleCalendarResponse) -> 캘린더 이벤트 배열로 변환
 */
const mapResponseToEvents = (res) => {
  const out = []
  const days = res?.days ?? []

  for (const d of days) {
    const date = d?.date
    const items = d?.items ?? []

    for (const it of items) {
      out.push({
        id: it.visitScheduleId,
        date, // yyyy-MM-dd
        title: it.title || '',
        type: 'fixed'
      })
    }
  }
  return out
}

/**
 * 월 캘린더(고정일정) API 호출
 */
const fetchMonthlyFixedSchedules = async () => {
  if (!props.beneficiaryId) {
    fixedEvents.value = []
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const year = currentYear.value
    const month = currentMonth.value + 1

    const { data } = await api.get(
      `/api/beneficiaries/${props.beneficiaryId}/schedules/calendar`,
      { params: { year, month } }
    )

    fixedEvents.value = mapResponseToEvents(data)
  } catch (e) {
    console.error(e)
    fixedEvents.value = []
    errorMsg.value = '일정을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.beneficiaryId, currentYear.value, currentMonth.value, props.refreshKey],
  () => {
    fetchMonthlyFixedSchedules()
  },
  { immediate: true }
)

/**
 * 캘린더 42칸 계산
 */
const calendarCells = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const firstWeekDay = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells = []

  // 이전 달 채우기
  for (let i = firstWeekDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i)
    cells.push(makeCell(date, false))
  }

  // 이번 달
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    cells.push(makeCell(date, true))
  }

  // 다음 달(42칸 맞춤)
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(last.getDate() + 1)
    cells.push(makeCell(next, false))
  }

  return cells
})

function makeCell(date, isCurrentMonth) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const key = `${yyyy}-${mm}-${dd}`

  const events = fixedEvents.value.filter((ev) => ev.date === key)
  const isToday = date.toDateString() === new Date().toDateString()

  return { date, isCurrentMonth, events, isToday }
}

/**
 * 제목 분리 유틸
 */
const splitTitle = (title = '') => {
  const s = String(title).trim()
  const idx = s.indexOf(' ')
  if (idx < 0) return { time: s, text: '' }
  return {
    confirmKey: s.slice(0, idx),
    time: s.slice(0, idx),
    text: s.slice(idx + 1).trim()
  }
}

/** 월 이동 */
const prevMonth = () => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() - 1)
  viewDate.value = d
}
const nextMonth = () => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + 1)
  viewDate.value = d
}
</script>

<style scoped>
/* 버튼 */
.link-btn {
  border: none;
  background: transparent;
  font-size: 12px;
  color: #4b5563;
  cursor: pointer;
}

/* 헤더 */
.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

/*  타이틀 + 아이콘 래핑 */
.schedule-title-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.schedule-title {
  font-weight: 600;
}

/*  달력이모지 버튼(살짝 아래로) */
.calendar-icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 2px;
  margin-top: 4px;
  color: #166534;
}

/* 범례 */
.schedule-legend {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 6px;
}
.legend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 점 */
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}
.dot-fixed {
  background-color: #c4b5fd;
}

/* 핵심: 캘린더 위 오버레이(깜빡임 제거) */
.calendar-wrap {
  position: relative;
}
.overlay {
  position: absolute;
  inset: 0;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  color: #6b7280;

  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(1px);
}
.overlay.error {
  color: #b91c1c;
}

/* 캘린더 */
.calendar {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.calendar-header-cell {
  padding: 6px;
  text-align: center;
  font-size: 11px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.calendar-cell {
  min-height: 70px;
  border-bottom: 1px solid #f3f4f6;
  border-right: 1px solid #f3f4f6;
  padding: 4px;
  font-size: 11px;
  position: relative;
}
.calendar-cell:nth-child(7n) {
  border-right: none;
}
.cell-date {
  font-weight: 500;
  margin-bottom: 2px;
}
.cell-date.muted {
  color: #d1d5db;
}
.cell-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 일정 pill */
.event-pill {
  background-color: #ede9fe;
  color: #6d28d9;
  border-radius: 6px;
  padding: 4px 10px;
  line-height: 1.3;
  white-space: nowrap;
}
.event-fixed {
  background-color: #ede9fe;
  color: #6d28d9;
}

.is-today {
  background-color: #f0fdf4;
}

.event-time {
  display: inline-block;
  font-weight: 600;
  margin-right: 7px;
}
.event-title {
  font-weight: 500;
}

@media (max-width: 1200px) {
  .calendar-cell {
    min-height: 60px;
  }
}
</style>
