<template>
    <div class="page-body-longcare">
      <LongCare :items="longCareItems" />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import LongCare from '@/components/recipient/LongCare.vue'
  import { longCareMock } from '@/mock/longCareMock'
  
  const longCareItems = ref(longCareMock)
  </script>
  
  <style scoped>
  .page-body-longcare {
    margin-top: 12px;
  }
  </style>