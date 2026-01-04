<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeByOverlay">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="modal-body">
        <p class="modal-message">{{ message }}</p>
      </div>
      <div class="modal-footer">
        <button class="btn-confirm" @click="$emit('close')">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: '알림'
  },
  message: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const closeByOverlay = () => {
  emit('close');
};

const handleKeydown = (e) => {
  if (!props.isOpen) return;
  if (e.key === 'Escape' || e.key === 'Enter') {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5); z-index: 3000; /* Higher than other modals (often 1000-2000) */
  display: flex; justify-content: center; align-items: center;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: white; width: 90%; max-width: 360px;
  border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  overflow: hidden; animation: fadeIn 0.15s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.modal-header {
  padding: 16px 20px; border-bottom: 1px solid #f0f0f0;
  display: flex; justify-content: space-between; align-items: center;
}
.modal-title { font-size: 16px; font-weight: 700; color: #1f2937; margin: 0; }
.modal-close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; display: flex; }
.modal-close-btn:hover { color: #4b5563; }

.modal-body { padding: 24px 20px; text-align: center; }
.modal-message { font-size: 15px; color: #374151; line-height: 1.5; margin: 0; white-space: pre-wrap; }

.modal-footer {
  padding: 16px 20px; background: #f9fafb; border-top: 1px solid #f0f0f0;
  display: flex; justify-content: center;
}
.btn-confirm {
  background: #10b981; color: white; border: none; padding: 10px 24px;
  border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;
  transition: background 0.2s;
}
.btn-confirm:hover { background: #059669; }
</style>
