import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref([])
    const unreadCount = ref(0)

    // 초기화
    const setNotifications = (list) => {
        notifications.value = list
    }

    const setUnreadCount = (count) => {
        unreadCount.value = count
    }

    // 새 알림 추가 (앞에 추가)
    const addNotification = (alarm) => {
        notifications.value.unshift(alarm)
        unreadCount.value++
    }

    // 읽음 처리 (상태 변경 및 카운트 감소)
    const markAsReadInStore = (alarmId) => {
        const target = notifications.value.find(n => n.alarmId === alarmId)
        if (target && target.status === 'SENT') {
            target.status = 'READ'
            if (unreadCount.value > 0) unreadCount.value--
        }
    }

    // 삭제 처리
    const removeNotification = (alarmId) => {
        const target = notifications.value.find(n => n.alarmId === alarmId)
        if (target && target.status === 'SENT') {
            if (unreadCount.value > 0) unreadCount.value--
        }
        notifications.value = notifications.value.filter(n => n.alarmId !== alarmId)
    }

    return {
        notifications,
        unreadCount,
        setNotifications,
        setUnreadCount,
        addNotification,
        markAsReadInStore,
        removeNotification
    }
}, {
    persist: true
})
