<template>
    <header class="global-header">
      <!-- 왼쪽 : 로고 -->
      <div class="header-left" @click="goHome">
        <div class="logo-icon">
          <img :src="logoIcon" alt="OnCare" />
        </div>
        <div class="logo-text">
          <div class="logo-sub">
          <div class="role-text">{{ currentRole.roleName }}</div>
          <div class="name-text">{{ currentRole.userName }}님</div>
        </div>
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
          <span class="gnb-icon">
            <img :src="item.icon" :alt="item.label" />
          </span>
          <span class="gnb-label">{{ item.label }}</span>
        </RouterLink>
      </nav>
  
      <!-- 오른쪽 : 알림 + 로그아웃 -->
      <div class="header-right">
      
      <div class="notification-wrapper">
        <NotificationBell 
          :iconSrc="notificationIcon" 
          :count="unreadCount" 
          @toggle="toggleNotification" 
        />
        
        <NotificationList 
          :isOpen="isNotificationOpen" 
          :notifications="notifications" 
          @read="handleRead" 
          @mark-read="handleMarkRead"
          @click-item="handleItemClick"
        />
      </div>
  
        <div class="user-box">
          <button class="logout-button" type="button" @click="onLogout">
            <span class="logout-icon">
              <img :src="logoutIcon" alt="로그아웃" />
            </span>
            <span>로그아웃</span>
          </button>
        </div>

        <!-- 모바일 메뉴 토글 버튼 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- 모바일 메뉴 오버레이 -->
      <transition name="fade">
        <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="toggleMobileMenu">
          <nav class="mobile-menu-content" @click.stop>
            <div class="mobile-menu-header">
              <span class="mobile-menu-title">메뉴</span>
              <button class="close-btn" @click="toggleMobileMenu">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div class="mobile-menu-list">
              <RouterLink
                v-for="item in menuList"
                :key="item.key"
                :to="{ name: item.routeName }"
                class="mobile-menu-item"
                :class="{ active: isActive(item) }"
                @click="handleMobileMenuClick(item)"
              >
                <div class="mobile-item-icon">
                  <img :src="item.icon" :alt="item.label" />
                </div>
                <span class="mobile-item-label">{{ item.label }}</span>
              </RouterLink>
            </div>
          </nav>
        </div>
      </transition>
    </header>
  </template>
  
  <script setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { useRouter, useRoute, RouterLink } from 'vue-router'
  import { useUserStore } from '@/stores/user'
  import { useNotificationStore } from '@/stores/notification'

  // 알림 컴포넌트 임포트
  import NotificationBell from '@/components/common/NotificationBell.vue'
  import NotificationList from '@/components/common/NotificationList.vue'
  import { markAsRead } from '@/api/alarm/alarmApi'
  
  /* 공통 로고 */
  import logoIcon from '@/assets/img/common/oncareIconletter.png'
  
  // 대시보드/메뉴 아이콘
  import businessIcon from '@/assets/img/dashboard/businessManagement.png'
  import scheduleIcon from '@/assets/img/common/scheduleManagement.png'
  import employeeIcon from '@/assets/img/common/employeeManagement.png'
  import recipientIcon from '@/assets/img/dashboard/recipientManagement.png'
  import inquiryIcon from '@/assets/img/dashboard/inquiryManagement.png'
  import suppliesIcon from '@/assets/img/dashboard/suppliesManagement.png'
  import homeIcon from '@/assets/img/dashboard/home.png'
  import api from '@/lib/api'
  
  // 알림 / 로그아웃
  import notificationIcon from '@/assets/img/dashboard/notification.png'
  import logoutIcon from '@/assets/img/dashboard/logout.png'
  
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const notificationStore = useNotificationStore()

  /* --- [추가] 모바일 메뉴 상태 및 토글 --- */
  const isMobileMenuOpen = ref(false)
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  // 메뉴 클릭 시 닫기
  const handleMobileMenuClick = (item) => {
    if (item.routeName && item.routeName.startsWith('http')) {
       // link logic if needed
    }
    isMobileMenuOpen.value = false
  }

  // --- [수정] 알림 관련 로직 (스토어 연동) ---
  const isNotificationOpen = ref(false)
  const notifications = computed(() => notificationStore.notifications)
  const unreadCount = computed(() => notificationStore.unreadCount)

// 토글 함수
const toggleNotification = async () => {
    // 단순히 열고 닫는 상태만 관리
    isNotificationOpen.value = !isNotificationOpen.value;
}

// 2. 알림 삭제 처리 (X 버튼 - 읽음 처리만 하고 데이터는 유지)
const handleRead = async (alarm) => {
    try {
        // 읽지 않은 상태일 때만 API 호출
        if (alarm.status === 'SENT') {
            await markAsRead(alarm.alarmId);
        }

        // [수정] 상태와 상관없이 리스트에서 즉시 제거 (사용자 요청)
        notificationStore.removeNotification(alarm.alarmId);
        
    } catch (e) {
        console.error("알림 삭제 처리 실패:", e);
    }
}

// [추가] 읽음 처리만 하고 리스트 유지 (클릭 시)
const handleMarkRead = async (alarm) => {
    try {
        if (alarm.status === 'SENT') {
            await markAsRead(alarm.alarmId);
            notificationStore.markAsReadInStore(alarm.alarmId);
        }
    } catch (e) {
        console.error("읽음 처리 실패:", e);
    }
}

// 3. 알림 클릭 처리 (읽음 처리 + 이동)
const handleItemClick = async (alarm) => {
    // 1) 읽음 처리 (API 호출 및 상태 업데이트)
    if (alarm.status === 'SENT') {
        try {
            await markAsRead(alarm.alarmId);
            notificationStore.markAsReadInStore(alarm.alarmId);
        } catch (e) {
            console.error("읽음 처리 실패:", e);
        }
    }

    // 2) 링크 이동
    if (alarm.linkUrl) {
        if (alarm.linkUrl.startsWith('http')) {
            window.open(alarm.linkUrl, '_blank');
        } else {
            router.push(alarm.linkUrl);
        }
        // 알림창 닫기
        isNotificationOpen.value = false;
    }
}
  
  // 역할별 메뉴 정의
  const MENU_CONFIG = {
    ROLE_CENTER_MANAGER: [
      { key: 'employees', label: '직원 관리', routeName: 'employees', icon: employeeIcon },
      { key: 'schedule', label: '일정 관리', routeName: 'schedule-calendar', icon: scheduleIcon },
      { key: 'recipient', label: '수급자 관리', routeName: 'recipient-list', icon: recipientIcon },
      { key: 'inquiry', label: '고객 관리', routeName: 'inquiry-consult', icon: inquiryIcon },
      { key: 'product', label: '용품 관리', routeName: 'product-master', icon: suppliesIcon },
      { key: 'tasks', label: '업무 관리', routeName: 'tasks-approval', icon: businessIcon },
    ],
    ROLE_SALES_TEAM: [
      { key: 'inquiry', label: '고객 관리', routeName: 'inquiry', icon: inquiryIcon },
      { key: 'recipient', label: '수급자 관리', routeName: 'recipient-list', icon: recipientIcon },
      { key: 'tasks', label: '업무 관리', routeName: 'tasks-approval', icon: businessIcon },
    ],
    ROLE_MATERIAL_TEAM: [
      { key: 'product', label: '용품 관리', routeName: 'product', icon: suppliesIcon },
      { key: 'tasks', label: '업무 관리', routeName: 'tasks-approval', icon: businessIcon },
    ],
    ROLE_CAREGIVER: [
      { key: 'home', label: '홈', routeName: 'home', icon: homeIcon },
      { key: 'activity', label: '활동일지', routeName: 'activity-care', icon: businessIcon },
      { key: 'workschedule', label: '근무일정', routeName: 'workschedule', icon: scheduleIcon },
      { key: 'recipient', label: '수급자 관리', routeName: 'recipient-list', icon: recipientIcon },
      { key: 'tasks', label: '업무 관리', routeName: 'tasks-approval', icon: businessIcon },
    ],
  }
  
  // 현재 역할
  const currentRole = computed(() => {
  let authority = ""
  const authorityName = userStore.jobName   // 직무명 (센터장, 요양보호사 등)
  const userName = userStore.name           // 사용자 이름

  if (userStore.hasSomeAuthorities(["ROLE_CENTER_MANAGER"])) {
    authority = "ROLE_CENTER_MANAGER"
  } else if (userStore.hasAllAuthorities(["ROLE_SALES_TEAM", "ROLE_TEAM_LEAD"])) {
    authority = "ROLE_SALES_TEAM"
  } else if (userStore.hasAllAuthorities(["ROLE_SALES_TEAM", "ROLE_EMPLOYEE"])) {
    authority = "ROLE_SALES_TEAM"
  } else if (userStore.hasAllAuthorities(["ROLE_CAREGIVER"])) {
    authority = "ROLE_CAREGIVER"
  } else if (userStore.hasAllAuthorities(["ROLE_MATERIAL_TEAM", "ROLE_EMPLOYEE"])) {
    authority = "ROLE_MATERIAL_TEAM"
  }

  return {
    authority,
    roleName: authorityName,
    userName: userName,
  }
})
  
  // 역할별 메뉴
  const menuList = computed(() => {
    return MENU_CONFIG[currentRole.value.authority] || MENU_CONFIG.ROLE_CAREGIVER
  })
  
  // 현재 라우트 기준 활성 메뉴
// 메뉴 key -> 어떤 라우트 그룹에 속하면 active로 볼지 매핑
const ACTIVE_GROUP = {
  schedule: ['schedule'],   // /schedule 아래 전부 (calendar, matching 포함)
  inquiry: ['inquiry'],     // /inquiry 아래 전부 (consult, customer 포함)
  product: ['product'],     // /product 아래 전부 (master, manage, ...)
  recipient: ['recipient'],
  tasks: ['tasks'],
  activity: ['activity'],
  home: ['home'],
  workschedule: ['workschedule'],
  employees: ['employees'],
}

const isActive = (item) => {
  const group = ACTIVE_GROUP[item.key]

  // 1) group이 정의된 메뉴는 "부모 라우트" 기준으로 active 처리
  if (Array.isArray(group)) {
    return route.matched.some((m) => group.includes(m.name))
  }

  // 2) 그 외는 기존처럼 name 기준
  if (route.name === item.routeName) return true
  return route.matched.some((m) => m.name === item.routeName)
}
  
  // const isActive = (item) => {
  //   // 수급자 관리 메뉴: 부모 recipient 가 매칭되면 활성
  //   if (item.routeName === 'recipient') {
  //     return route.matched.some((m) => m.name === 'recipient')
  //   }
  
  //   // 다른 메뉴는 기존처럼
  //   return route.matched.some((m) => m.name === item.routeName)
  // }
  
  
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
    left: 0;
    right: 0;
    z-index: 50;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 10px;
    background: #ffffff;
    border-radius: 0;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  
  .logo-icon {
    width: auto;
    height: 30px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .logo-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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

  .role-text {
    font-size: 15px;
    color: #64748b;
  }

  .name-text {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
  }
  
  .logo-sub {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }
  
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
  }
  
  .gnb-icon {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .gnb-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .gnb-item:hover {
    background: #f1f5f9;
    color: #111827;
  }
  
  .gnb-item.active {
    background: #dcfce7;
    color: #15803d;
    font-weight: 600;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .icon-button {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0;
    padding: 0;
  }
  
  .icon-button img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
  
  .user-box {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .logout-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;             
    background: transparent;  
    padding: 0;
    font-size: 13px;
    cursor: pointer;
    color: #64748b;
  }
  
  .logout-button:hover {
    color: #111827;
  }
  
  .logout-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .logout-icon img {
    width: 100%;
    height: 100%;
  }

.notification-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* --- 모바일 메뉴 버튼 (기본 숨김) --- */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  margin-left: 8px;
}

/* --- 모바일 메뉴 오버레이 --- */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.mobile-menu-content {
  width: 280px;
  height: 100%;
  background: white;
  padding: 24px;
  box-shadow: -4px 0 16px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.mobile-menu-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.mobile-menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s;
}

.mobile-menu-item:hover {
  background-color: #f8fafc;
  color: #1e293b;
}

.mobile-menu-item.active {
  background-color: #dcfce7; /* green-100 */
  color: #166534; /* green-800 */
  font-weight: 600;
}

.mobile-item-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-item-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- 반응형 미디어 쿼리 --- */
@media (max-width: 1024px) {
  /* 가운데 메뉴 숨김 */
  .header-center {
    display: none;
  }

  /* 햄버거 버튼 표시 */
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .global-header {
    padding: 0 12px; 
  }
  
  /* 모바일에서 로그아웃 텍스트 숨김 (아이콘만 표시) */
  .logout-button span:not(.logout-icon) {
    display: none;
  }
  
  /* 이름/직책 폰트 사이즈 조정 */
  .role-text { font-size: 13px; }
  .name-text { font-size: 14px; }
}

/* 텍스트 줄바꿈 방지 */
.logo-text, .role-text, .name-text, .logout-button {
  white-space: nowrap;
}
</style>