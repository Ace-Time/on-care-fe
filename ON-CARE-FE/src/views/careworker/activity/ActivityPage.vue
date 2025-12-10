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