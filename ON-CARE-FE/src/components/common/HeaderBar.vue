<template>
  <nav class="header-bar">
    <ul>
      <li v-for="item in menuList" :key="item.key">
        {{ item.label }}
      </li>
    </ul>

    <button @click="onLogout">로그아웃</button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'   

const router = useRouter()
const userStore = useUserStore()

// 역할별 메뉴 정의
const MENU_CONFIG = {
  MANAGER: [
    { key: 'dashboard', label: '대쉬보드' },
    { key: 'schedule', label: '일정관리' },
    { key: 'employees', label: '직원관리' },
    { key: 'recipients', label: '수급자관리' },
    { key: 'inquiries', label: '문의관리' },
    { key: 'supplies', label: '용품관리' },
    { key: 'tasks', label: '업무관리' },
  ],
  SALES: [
    { key: 'dashboard', label: '대쉬보드' },
    { key: 'inquiries', label: '문의관리' },
  ],
  MATERIAL: [
    { key: 'dashboard', label: '대쉬보드' },
    { key: 'materials', label: '자재관리' },
  ],
  CAREGIVER: [
    { key: 'dashboard', label: '대쉬보드' },
    { key: 'home', label: '홈' },
    { key: 'activity-log', label: '활동일지' },
    { key: 'work-schedule', label: '근무일정' },
    { key: 'recipients', label: '수급자관리' },
  ],
}

// 현재 스토어에 직급이 없기 때문에 기본값 MANAGER
const currentRole = computed(() => {
  const r =
    userStore.mainRole ??
    (Array.isArray(userStore.roles) ? userStore.roles[0] : null)

  if (!r) return 'MANAGER'

  // 'ROLE_MANAGER' 형식이면 앞의 ROLE_ 제거
  if (typeof r === 'string' && r.startsWith('ROLE_')) {
    return r.replace('ROLE_', '')
  }
  return r
})

// 역할에 맞는 메뉴
const menuList = computed(() => {
  return MENU_CONFIG[currentRole.value] || MENU_CONFIG.MANAGER
})

const onLogout = () => {
  userStore.logOut?.()
  router.push({ name: 'signin' })
}
</script>

<style>
.header-bar {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.header-bar ul {
  display: flex;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>