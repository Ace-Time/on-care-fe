<template>
  <div class="app-root">
    <!--  공통 헤더 -->
    <HeaderBar v-if="showHeader" />

    <!-- 각 페이지 -->
    <RouterView />

    <!-- 공통 오버레이/토스트 -->
    <LoadingOverlay />
    <ToastContainer /> 
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import api from '@/lib/api'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import HeaderBar from '@/components/common/HeaderBar.vue'
import LoadingOverlay from './components/common/LoadingOverlay.vue'
import ToastContainer from './components/common/ToastContainer.vue'
import { getSubscriptionUrl, getNotifications, getUnreadCount } from '@/api/alarm/alarmApi'

const userStore = useUserStore()
const notificationStore = useNotificationStore()
const route = useRoute()

// SSE 연결 관리
let eventSource = null

const connectSSE = async () => {
    if (eventSource) return
    if (!userStore.isLoggedIn) return

    // 1. 초기 데이터 로드 (스토어에 저장)
    try {
        const [notiData, countData] = await Promise.all([
            getNotifications(userStore.userId),
            getUnreadCount(userStore.userId)
        ])
        notificationStore.setNotifications(notiData || [])
        notificationStore.setUnreadCount(countData || 0)
    } catch (e) {
        console.error('알림 초기 데이터 로드 실패:', e)
    }

    // 2. SSE 연결
    const url = getSubscriptionUrl(userStore.userId)
    eventSource = new EventSource(url)

    eventSource.onopen = () => {
        // 연결 성공
    }

    eventSource.addEventListener('notification', (event) => {
        try {
            const newAlarm = JSON.parse(event.data)
            console.log("새 알림 도착:", newAlarm)
            // 스토어에 추가
            notificationStore.addNotification(newAlarm)
        } catch (e) {
            console.error('SSE parsing error:', e)
        }
    })

    eventSource.onerror = (err) => {
        if (eventSource.readyState === EventSource.CLOSED) {
            eventSource = null
        }
    }
}

const disconnectSSE = () => {
    if (eventSource) {
        eventSource.close()
        eventSource = null
    }
}

// 로그인 상태 감지해서 연결/해제
watch(() => userStore.isLoggedIn, (newVal) => {
    if (newVal) {
        connectSSE()
    } else {
        disconnectSSE()
    }
})

onMounted(() => {
    // 앱 시작 시 이미 로그인되어 있다면 연결
    if (userStore.isLoggedIn) {
        connectSSE()
    }
})

onUnmounted(() => {
    disconnectSSE()
})

// 로그인, 회원가입 같은 페이지는 공통 헤더 제외 조건
const showHeader = computed(() => {
  const noHeaderPages = ['signin', 'signup'] // 필요하면 라우트 이름 더 추가
  return !noHeaderPages.includes(route.name)
})

</script>

<style>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
