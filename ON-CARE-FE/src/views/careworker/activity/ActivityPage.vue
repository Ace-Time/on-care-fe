<template>
  <div class="activity-page">
    <nav class="top-tabs">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.to"
        class="tab-btn"
        :class="{ active: route.name === tab.route }"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <div class="tab-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { key: 'care', label: '요양일지', route: 'activity-care', to: '/activity' },
  { key: 'basic', label: '기초평가', route: 'activity-basic', to: '/activity/basic' },
  { key: 'counsel', label: '방문상담', route: 'activity-counsel', to: '/activity/counsel' },
]
</script>

<style scoped>
.activity-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

.top-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.tab-btn:hover {
  color: #16a34a;
  background: #f0fdf4;
}

.tab-btn.active {
  color: #16a34a;
  background: #f0fdf4;
  border-bottom-color: #16a34a;
}
</style>
