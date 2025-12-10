<template>
    <section class="schedule-panel">
      <div class="schedule-header">
        <div class="schedule-title-row">
          <h3 class="schedule-title">
            {{ headerTitle }}
          </h3>
          <div class="tag-row" v-if="dailySchedules.length">
            <span v-if="summary.care" class="service-tag type-care">
              요양 보호 {{ summary.care }}
            </span>
            <span v-if="summary.nurse" class="service-tag type-nurse">
              방문 간호 {{ summary.nurse }}
            </span>
            <span v-if="summary.bath" class="service-tag type-bath">
              요양 목욕 {{ summary.bath }}
            </span>
          </div>
        </div>
      </div>
  
      <div class="schedule-table-wrapper">
        <table v-if="dailySchedules.length" class="schedule-table">
          <thead>
            <tr>
              <th>시간</th>
              <th>요양보호사</th>
              <th>수급자</th>
              <th>서비스</th>
              <th>소요시간</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in dailySchedules"
              :key="item.id"
              class="table-row"
              @click="onRowClick(item)"
            >
              <td class="col-time">{{ item.start }} - {{ item.end }}</td>
              <td>{{ item.caregiver }}</td>
              <td>{{ item.recipient }}</td>
              <td>
                <span
                  class="service-badge"
                  :class="{
                    'badge-care': item.service === 'VISIT_CARE',
                    'badge-nurse': item.service === 'VISIT_NURSE',
                    'badge-bath': item.service === 'VISIT_BATH'
                  }"
                >
                  {{ item.serviceLabel }}
                </span>
              </td>
              <td class="col-duration">{{ item.duration }}</td>
            </tr>
          </tbody>
        </table>
  
        <div v-else class="empty-row">
          선택한 날짜에 일정이 없습니다.
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { scheduleList } from '@/mock/scheduleMock'
  
  const props = defineProps({
    selectedDate: {
      type: String,
      default: '',
    },
  })
  
  const emit = defineEmits(['select-schedule'])
  
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  
  const headerTitle = computed(() => {
    if (!props.selectedDate) return '일정을 선택해주세요'
    const d = new Date(props.selectedDate)
    if (Number.isNaN(d.getTime())) return '일정을 선택해주세요'
    const month = d.getMonth() + 1
    const date = d.getDate()
    const weekday = weekdays[d.getDay()]
    return `${month}월 ${date}일 (${weekday}) 일정`
  })
  
  const dailySchedules = computed(() =>
    scheduleList.filter((item) => item.date === props.selectedDate),
  )
  
  const summary = computed(() => {
    const result = { care: 0, nurse: 0, bath: 0 }
    dailySchedules.value.forEach((item) => {
      if (item.service === 'VISIT_CARE') {
        result.care += 1
      } else if (item.service === 'VISIT_NURSE') {
        result.nurse += 1
      } else if (item.service === 'VISIT_BATH') {
        result.bath += 1
      }
    })
    return result
  })
  
  const onRowClick = (item) => {
    emit('select-schedule', item.id)
  }
  </script>
  
  <style scoped>
  .schedule-panel {
    box-sizing: border-box;
    width: 100%;
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 3px 12px rgba(15, 23, 42, 0.04);
    padding: 14px 18px 18px;
  }
  
  .schedule-header {
    margin-bottom: 6px;
  }
  
  .schedule-title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }
  
  .schedule-title {
    font-size: 17px;
    font-weight: 700;
    color: #15803d;
    margin: 0;
  }
  
  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .service-tag {
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
  }
  
  .type-care {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  .type-nurse {
    background: #dcfce7;
    color: #15803d;
  }
  
  .type-bath {
    background: #ffe4ef;
    color: #be185d;
  }
  
  .schedule-table-wrapper {
    margin-top: 10px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    background: #ffffff;
  }
  
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  
  .schedule-table thead {
    background: #f9fafb;
  }
  
  .schedule-table th,
  .schedule-table td {
    padding: 9px 12px;
    text-align: left;
  }
  
  .schedule-table th {
    color: #6b7280;
    font-weight: 500;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .schedule-table tbody tr + tr td {
    border-top: 1px solid #f3f4f6;
  }
  
  .table-row {
    cursor: pointer;
  }
  
  .table-row:hover {
    background: #f9fafb;
  }
  
  .col-time,
  .col-duration {
    white-space: nowrap;
  }
  
  .service-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
  }
  
  .badge-care {
    background: #dbeafe;
    color: #1d4ed8;
  }
  
  .badge-nurse {
    background: #dcfce7;
    color: #15803d;
  }
  
  .badge-bath {
    background: #ffe4ef;
    color: #be185d;
  }
  
  .empty-row {
    padding: 18px 12px;
    text-align: center;
    font-size: 13px;
    color: #9ca3af;
    background: #f9fafb;
  }
  </style>