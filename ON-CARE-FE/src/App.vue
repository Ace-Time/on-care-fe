<template>
  <RouterView />
  <LoadingOverlay />
  <ToastContainer /> 
</template>

<script setup>
import { RouterView } from 'vue-router'
import api from '@/lib/api'
import { useUserStore } from '@/stores/user'
import LoadingOverlay from './components/common/LoadingOverlay.vue'
import ToastContainer from './components/common/ToastContainer.vue'

const userStore = useUserStore()

</script>
