<template>
    <section class="calendar-panel">
      <div class="calendar-header">
        <h2 class="month-title">{{ monthTitle }}</h2>
        <div class="month-controls">
          <button class="arrow-btn" type="button" @click="goPrevMonth">‹</button>
          <button class="arrow-btn" type="button" @click="goNextMonth">›</button>
        </div>
      </div>
  
      <div class="legend-row">
        <span class="legend-item">
          <span class="legend-dot type-visit"></span>
          방문 요양
        </span>
        <span class="legend-item">
          <span class="legend-dot type-nurse"></span>
          방문 간호
        </span>
        <span class="legend-item">
          <span class="legend-dot type-bath"></span>
          방문 목욕
        </span>
      </div>
  
      <div class="calendar-grid">
        <div
          v-for="(label, idx) in weekdayLabels"
          :key="label"
          class="weekday-cell"
          :class="{
            'weekday-sun': idx === 0,
            'weekday-sat': idx === 6
          }"
        >
          {{ label }}
        </div>
  
        <div
          v-for="day in calendarDays"
          :key="day.key"
          class="day-cell"
          :class="{
            'other-month': !day.inCurrentMonth,
            'sunday-cell': day.isSunday,
            'saturday-cell': day.isSaturday,
            'selected-cell': isSelected(day)   // 클릭한 날짜에만 초록 테두리
          }"
          @click="onDayClick(day)"
        >
          <div class="day-header">
            <span
              class="day-number"
              :class="{ 'today-number': day.isToday }"
            >
              {{ day.date.getDate() }}
            </span>
            <!-- 오늘 텍스트를 날짜 옆에 표시 -->
            <span v-if="day.isToday" class="today-label">오늘</span>
          </div>
  
          <div v-if="day.summary" class="badge-row">
            <span
              v-if="day.summary.care"
              class="badge badge-care"
            >
              요양 {{ day.summary.care }}
            </span>
            <span
              v-if="day.summary.nurse"
              class="badge badge-nurse"
            >
              간호 {{ day.summary.nurse }}
            </span>
            <span
              v-if="day.summary.bath"
              class="badge badge-bath"
            >
              목욕 {{ day.summary.bath }}
            </span>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { scheduleList } from '@/mock/schedule/scheduleMock'
  
  const emit = defineEmits(['select-date'])
  
  const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토']
  
  const today = new Date()
  const year = ref(today.getFullYear())
  const month = ref(today.getMonth())
  
  const formatDateKey = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  
  const summaryByDate = (() => {
    const map = new Map()
    scheduleList.forEach((item) => {
      const key = item.date
      if (!map.has(key)) {
        map.set(key, { care: 0, nurse: 0, bath: 0 })
      }
      const entry = map.get(key)
      if (item.service === 'VISIT_CARE') {
        entry.care += 1
      } else if (item.service === 'VISIT_NURSE') {
        entry.nurse += 1
      } else if (item.service === 'VISIT_BATH') {
        entry.bath += 1
      }
    })
    return map
  })()
  
  // 선택된 날짜 (처음엔 오늘 날짜 선택)
  const selectedDateKey = ref(formatDateKey(today))
  
  const monthTitle = computed(() => `${year.value}년 ${month.value + 1}월`)
  
  const calendarDays = computed(() => {
    const first = new Date(year.value, month.value, 1)
    const startDay = first.getDay()
    const daysInThis = new Date(year.value, month.value + 1, 0).getDate()
    const daysInPrev = new Date(year.value, month.value, 0).getDate()
    const days = []
  
    for (let i = 0; i < 42; i += 1) {
      const offset = i - startDay + 1
      let date
      let inCurrent = true
  
      if (offset <= 0) {
        date = new Date(year.value, month.value - 1, daysInPrev + offset)
        inCurrent = false
      } else if (offset > daysInThis) {
        date = new Date(year.value, month.value + 1, offset - daysInThis)
        inCurrent = false
      } else {
        date = new Date(year.value, month.value, offset)
        inCurrent = true
      }
  
      const key = formatDateKey(date)
      const summary = summaryByDate.get(key) || null
  
      days.push({
        key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        date,
        inCurrentMonth: inCurrent,
        isToday: date.toDateString() === today.toDateString(),
        isSunday: date.getDay() === 0,
        isSaturday: date.getDay() === 6,
        summary,
      })
    }
  
    return days
  })
  
  const isSelected = (day) => formatDateKey(day.date) === selectedDateKey.value
  
  const goToday = () => {
    year.value = today.getFullYear()
    month.value = today.getMonth()
    const key = formatDateKey(today)
    selectedDateKey.value = key
    emit('select-date', key)
  }
  
  const goPrevMonth = () => {
    if (month.value === 0) {
      month.value = 11
      year.value -= 1
    } else {
      month.value -= 1
    }
  }
  
  const goNextMonth = () => {
    if (month.value === 11) {
      month.value = 0
      year.value += 1
    } else {
      month.value += 1
    }
  }
  
  const onDayClick = (day) => {
    const key = formatDateKey(day.date)
    selectedDateKey.value = key
    emit('select-date', key)
  }
  </script>
  
  <style scoped>
  .calendar-panel {
    box-sizing: border-box;
    width: 100%;
    background: #ffffff;
    border-radius: 22px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 3px 12px rgba(15, 23, 42, 0.04);
    padding: 14px 18px 18px;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  
  .month-title {
    font-size: 22px;
    font-weight: 700;
    color: #15803d;
    margin: 0;
  }
  
  .month-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .arrow-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    padding: 0 3px;
  }
  
  .legend-row {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #4b5563;
    margin: 8px 0 12px;
  }
  
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  
  .legend-dot {
    width: 11px;
    height: 11px;
    border-radius: 999px;
  }
  
  .legend-dot.type-visit {
    background: #bfdbfe;
  }
  
  .legend-dot.type-nurse {
    background: #dcfce7;
  }
  
  .legend-dot.type-bath {
    background: #fce7f3;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 6px;
    column-gap: 6px;
  }
  
  .weekday-cell {
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    padding-bottom: 4px;
  }
  
  .weekday-sun {
    color: #ef4444;
  }
  
  .weekday-sat {
    color: #3b82f6;
  }
  
  .day-cell {
    min-height: 70px;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    padding: 6px 8px;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
  }
  
  .other-month .day-number {
    color: #cbd5e1;
  }
  
  .sunday-cell .day-number {
    color: #ef4444;
  }
  
  .saturday-cell .day-number {
    color: #3b82f6;
  }
  
  /* 클릭해서 선택한 날짜에 적용되는 초록 테두리 */
  .selected-cell {
    border-color: #4ade80;
    box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.3);
  }
  
  /* 오늘 날짜 숫자 동그라미 */
  .day-header {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .day-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 999px;
  }
  
  .today-number {
    background: #22c55e;
    color: #ffffff;
  }
  
  /* 날짜 옆 "오늘" 텍스트 */
  .today-label {
    font-size: 11px;
    color: #16a34a;
  }
  
  .badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }
  
  .badge {
    padding: 1px 6px;
    border-radius: 999px;
    font-size: 10px;
  }
  
  .badge-care {
    background: #dbeafe;
    color: #2563eb;
  }
  
  .badge-nurse {
    background: #dcfce7;
    color: #15803d;
  }
  
  .badge-bath {
    background: #ffe4ef;
    color: #be185d;
  }
  </style>