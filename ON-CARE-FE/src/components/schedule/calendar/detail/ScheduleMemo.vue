<template>
    <div class="section">
      <div class="section-title">일정 메모</div>
  
      <div class="section-card memo-card">
        <textarea
          class="memo-textarea"
          :placeholder="placeholder"
          :value="modelValue"
          @input="onInput"
        ></textarea>
  
        <div class="memo-hint">메모는 자동으로 저장됩니다</div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '특이사항이나 전달사항을 입력하세요' },
  });
  
  const emit = defineEmits(['update:modelValue', 'auto-save']);
  
  let timer = null;
  
  const onInput = (e) => {
    const v = e.target.value;
    emit('update:modelValue', v);
  
    clearTimeout(timer);
    timer = setTimeout(() => {
      emit('auto-save', v);
    }, 400);
  };
  </script>
  
  <style scoped>
  .section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
  }
  
  .section-card {
    background: #f9fafb;
    border-radius: 16px;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
  }
  
  .memo-card {
    background: #fffbeb;
    border-color: #facc15;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .memo-textarea {
    width: 100%;
    min-height: 80px;
    border-radius: 12px;
    border: 1px solid #fde68a;
    padding: 8px 10px;
    font-size: 14px;
    resize: vertical;
    outline: none;
    background: #ffffff;
  }
  
  .memo-textarea::placeholder {
    color: #9ca3af;
  }
  
  .memo-hint {
    font-size: 12px;
    color: #6b7280;
  }
  </style>