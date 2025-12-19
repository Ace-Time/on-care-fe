<template>
    <aside class="history-panel">
      <!-- 헤더 -->
      <div class="history-header">
        <div class="header-left">
          <div class="title">제품 히스토리</div>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')">
          ×
        </button>
      </div>
  
      <div class="history-body">
        <!-- 상단 기본 정보 -->
        <section class="info-section">
          <div class="label">관리코드</div>
          <div class="value">
            <span class="badge code-badge">{{ detailRow.managementCode }}</span>
          </div>
  
          <div class="label">용품명</div>
          <div class="value">
            {{ product?.name || detailRow.productName || '—' }}
          </div>
        </section>
  
        <!-- 히스토리 리스트 -->
        <section class="history-section">
          <div class="section-title">전체 이력</div>
  
          <div v-if="!events.length" class="empty">
            등록된 히스토리가 없습니다.
          </div>
  
          <div
            v-for="event in events"
            :key="event.id"
            class="history-item"
          >
            <div class="history-header-row">
              <span class="type-badge" :class="typeClass(event.type)">
                {{ event.type }}
              </span>
              <span class="history-date">{{ event.date }}</span>
            </div>
            <div class="history-desc">
              {{ event.description }}
            </div>
            <div class="history-staff" v-if="event.staff">
              담당: {{ event.staff }}
            </div>
          </div>
        </section>
      </div>
    </aside>
  </template>
  
  <script setup>
  const props = defineProps({
    product: {
      type: Object,
      default: null,
    },
    detailRow: {
      type: Object,
      required: true,
    },
    events: {
      type: Array,
      default: () => [],
    },
  })
  
  defineEmits(['close'])
  
  const typeClass = (type) => {
    if (type === '구매') return 'badge-purchase'
    if (type === '입고') return 'badge-in'
    if (type === '렌탈') return 'badge-rental'
    return ''
  }
  </script>
  
  <style scoped>
  .history-panel {
    width: 420px;
    min-width: 420px;
    max-height: calc(100vh - 48px);
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  /* 헤더 */
  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #e5f0ff;
    padding: 12px 16px;
  }
  
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #166534;
  }
  
  .close-btn {
    border: none;
    background: transparent;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    color: #4b5563;
  }
  
  /* 본문 스크롤 */
  .history-body {
    padding: 16px;
    overflow-y: auto;
  }
  
  /* 기본 정보 섹션 */
  .info-section {
    display: grid;
    grid-template-columns: 80px 1fr;
    row-gap: 6px;
    column-gap: 8px;
    margin-bottom: 20px;
  }
  
  .label {
    font-size: 13px;
    color: #6b7280;
  }
  
  .value {
    font-size: 14px;
  }
  
  /* 히스토리 섹션 */
  .history-section .section-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .history-item {
    border-radius: 12px;
    background: #f9fafb;
    padding: 10px 12px;
    margin-bottom: 10px;
  }
  
  .history-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  
  .history-date {
    font-size: 12px;
    color: #9ca3af;
  }
  
  .history-desc {
    font-size: 14px;
    margin-bottom: 2px;
  }
  
  .history-staff {
    font-size: 12px;
    color: #6b7280;
  }
  
  /* 뱃지 공통 */
  .badge,
  .type-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 12px;
  }
  
  .code-badge {
    background: #f5f3ff;
    color: #7c3aed;
  }
  
  .type-badge.badge-purchase {
    background: #eef2ff;
    color: #4f46e5;
  }
  
  .type-badge.badge-in {
    background: #dcfce7;
    color: #166534;
  }
  
  .type-badge.badge-rental {
    background: #fee2e2;
    color: #b91c1c;
  }
  
  .empty {
    font-size: 13px;
    color: #9ca3af;
  }
  </style>