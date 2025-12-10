<template>
    <div class="calendar-layout">
      <div class="search-row">
        <SearchBar />
      </div>
  
      <div class="main-row">
        <div class="left-col">
          <Calendar @select-date="onSelectDate" />
          <ScheduleList
            :selected-date="selectedDate"
            @select-schedule="onSelectSchedule"
          />
        </div>
  
        <div class="right-col">
          <ScheduleDetail :schedule-id="selectedScheduleId" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import SearchBar from '@/components/schedule/SearchBar.vue'
  import Calendar from '@/components/schedule/Calendar.vue'
  import ScheduleList from '@/components/schedule/ScheduleList.vue'
  import ScheduleDetail from '@/components/schedule/ScheduleDetail.vue'
  
  const formatDateKey = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  
  const selectedDate = ref(formatDateKey(new Date()))
  const selectedScheduleId = ref(null)
  
  const onSelectDate = (dateKey) => {
    selectedDate.value = dateKey
    selectedScheduleId.value = null
  }
  
  const onSelectSchedule = (scheduleId) => {
    selectedScheduleId.value = scheduleId
  }
  </script>
  
  <style scoped>
  .calendar-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .search-row {
    display: flex;
    justify-content: flex-start;
  }
  
  .main-row {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  
  .left-col {
    flex: 1;
    max-width: 50%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .right-col {
    flex: 1;
    max-width: 50%;
  }
  </style>