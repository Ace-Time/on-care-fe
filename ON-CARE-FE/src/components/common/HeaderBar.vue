<template>
  <header class="global-header">
    <!-- 왼쪽 : 로고 -->
    <div class="header-left" @click="goHome">
      <div class="logo-icon">📋</div>
      <div class="logo-text">
        <div class="logo-title">OnCare</div>
        <div class="logo-sub">관리자</div>
      </div>
    </div>

    <!-- 가운데 : 메뉴 -->
    <nav class="header-center">
      <RouterLink
        v-for="item in menuList"
        :key="item.key"
        :to="{ name: item.routeName }"
        class="gnb-item"
        :class="{ active: isActive(item) }"
      >
        <span class="gnb-icon">{{ item.icon }}</span>
        <span class="gnb-label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- 오른쪽 : 알림 + 사용자 + 로그아웃 -->
    <div class="header-right">
      <button class="icon-button" type="button">
        🔔
      </button>

      <div class="user-box">
        <button class="logout-button" type="button" @click="onLogout">
          로그아웃
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 역할별 메뉴 정의
const MENU_CONFIG = {
  MANAGER: [
    { key: 'dashboard', label: '대시보드', routeName: 'dashboard', icon: '📊' },
    { key: 'schedule', label: '일정 관리', routeName: 'schedule', icon: '📅' },
    { key: 'employees', label: '직원 관리', routeName: 'employees', icon: '👥' },
    { key: 'recipient', label: '수급자 관리', routeName: 'recipient', icon: '💚' },
    { key: 'inquiry', label: '고객 관리', routeName: 'inquiry', icon: '💬' },
    { key: 'product', label: '용품 관리', routeName: 'product', icon: '📦' },
    { key: 'tasks', label: '업무 관리', routeName: 'tasks', icon: '📝' },
  ],
  SALES: [
    { key: 'dashboard', label: '대시보드', routeName: 'dashboard', icon: '📊' },
    { key: 'inquiry', label: '고객 관리', routeName: 'inquiry', icon: '💬' },
  ],
  MATERIAL: [
    { key: 'dashboard', label: '대시보드', routeName: 'dashboard', icon: '📊' },
    { key: 'product', label: '용품 관리', routeName: 'product', icon: '📦' },
  ],
  CAREGIVER: [
    { key: 'dashboard', label: '대시보드', routeName: 'dashboard', icon: '📊' },
    { key: 'home', label: '홈', routeName: 'home', icon: '🏠' },
    { key: 'activity', label: '활동일지', routeName: 'activity', icon: '📔' },
    { key: 'workschedule', label: '근무일정', routeName: 'workschedule', icon: '🗓️' },
    { key: 'recipient', label: '수급자 관리', routeName: 'recipient', icon: '💚' },
  ],
}

// 현재 역할
const currentRole = computed(() => {
  const r =
    userStore.mainRole ??
    (Array.isArray(userStore.roles) ? userStore.roles[0] : null)

  if (!r) return 'MANAGER'    //화면변경가능
  if (typeof r === 'string' && r.startsWith('ROLE_')) {
    return r.replace('ROLE_', '')
  }
  return r
})

// 역할별 메뉴
const menuList = computed(() => {
  return MENU_CONFIG[currentRole.value] || MENU_CONFIG.MANAGER    //화면변경가능
})

// 현재 라우트 기준 활성 메뉴
const isActive = (item) => route.name === item.routeName

const goHome = () => {
  router.push({ name: 'dashboard' })
}

const onLogout = () => {
  userStore.logOut?.()
  router.push({ name: 'signin' })
}
</script>

<style scoped>
.global-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 32px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
}

/* 왼쪽 로고 */
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #e8f7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-title {
  font-weight: 700;
  font-size: 18px;
  color: #16a34a;
}

.logo-sub {
  font-size: 12px;
  color: #64748b;
}

/* 가운데 메뉴 */
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.gnb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  color: #64748b;
  text-decoration: none;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s;
}

.gnb-icon {
  font-size: 16px;
}

.gnb-item:hover {
  background: #f1f5f9;
  color: #111827;
  transform: translateY(-1px);
}

.gnb-item.active {
  background: #dcfce7;
  color: #15803d;
  font-weight: 600;
}

/* 오른쪽 */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}

.icon-button:hover {
  transform: translateY(-1px);
}

.user-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  color: #334155;
}

.logout-button {
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  background: #ffffff;
  cursor: pointer;
  color: #64748b;
}

.logout-button:hover {
  background: #f1f5f9;
}
</style>
