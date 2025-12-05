<template>
    <div>
      <h1>로그인 페이지</h1>
  
      <h3>직원 구분</h3>
      <div>
        <button
          v-for="type in employeeTypes"
          :key="type.value"
          @click="selectEmployee(type.value)"
        >
          {{ type.label }}
        </button>
      </div>
  
      <p>선택된 직원: {{ selectedEmployeeType }}</p>
  
      <button @click="handleLogin">로그인</button>
    </div>
  </template>
  
  <script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const employeeTypes = [
  { label: '관리자', value: 'MANAGER' },
  { label: '상담영업', value: 'SALES' },
  { label: '자재팀', value: 'MATERIAL' },
  { label: '요양보호사', value: 'CAREGIVER' },
]

const selectedEmployeeType = ref('MANAGER')

const selectEmployee = (value) => {
  selectedEmployeeType.value = value
}

// 👇 지금은 그냥 구조만, 대시보드로만 이동
const handleLogin = () => {
  router.push({ name: 'dashboard' })
}
</script>