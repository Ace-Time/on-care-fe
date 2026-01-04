<template>
  <div class="history-container">
    <div class="history-header">
      <h3>관리 이력</h3>
      <span class="history-count" v-if="historyList.length">총 {{ historyList.length }}건</span>
    </div>

    <div v-if="loading" class="loading-state">
      <span>불러오는 중...</span>
    </div>

    <div v-else-if="historyList.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>관리 이력이 없습니다.</p>
    </div>

    <div v-else class="history-list">
      <div 
        v-for="item in historyList" 
        :key="item.id" 
        class="history-item"
        :class="getItemClass(item.type)"
      >
        <div class="item-icon">{{ getItemIcon(item.type) }}</div>
        <div class="item-content">
          <div class="item-header">
            <span class="item-type">{{ getTypeName(item.type) }}</span>
            <span class="item-date">{{ formatDate(item.date) }}</span>
          </div>
          <div class="item-detail">{{ item.detail }}</div>
          <div class="item-actor" v-if="item.actor">
            담당: {{ item.actor }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/lib/api';

const props = defineProps({
  beneficiaryId: {
    type: Number,
    required: true
  }
});

const loading = ref(false);
const historyList = ref([]);

// 이력 로드 (상담 이력 기반)
const loadHistory = async () => {
  if (!props.beneficiaryId) return;
  
  loading.value = true;
  try {
    // 기존 상담 이력 API 활용
    const { data } = await api.get(`/api/counsel/customers/${props.beneficiaryId}/counsels`, {
      params: { customerType: 'beneficiary', page: 0, size: 50 }
    });
    
    // 상담 이력을 관리 이력 형태로 변환
    if (data && data.content) {
      historyList.value = data.content.map(counsel => ({
        id: counsel.id,
        type: mapCategoryToType(counsel.categoryName),
        date: counsel.consultDate,
        detail: counsel.summary || counsel.detail,
        actor: counsel.counselorName
      }));
    }
  } catch (e) {
    console.error('관리 이력 로드 실패:', e);
    historyList.value = [];
  } finally {
    loading.value = false;
  }
};

// 카테고리 -> 타입 매핑
const mapCategoryToType = (categoryName) => {
  const mapping = {
    '가입': 'subscription',
    '렌탈': 'rental',
    '문의': 'inquiry',
    '컴플레인': 'complaint',
    '해지': 'termination'
  };
  return mapping[categoryName] || 'general';
};

// 타입별 아이콘
const getItemIcon = (type) => {
  const icons = {
    subscription: '📝',
    rental: '🛒',
    inquiry: '❓',
    complaint: '⚠️',
    termination: '🚫',
    general: '💬'
  };
  return icons[type] || '📋';
};

// 타입별 이름
const getTypeName = (type) => {
  const names = {
    subscription: '가입 상담',
    rental: '렌탈 상담',
    inquiry: '문의 상담',
    complaint: '불만 상담',
    termination: '해지 상담',
    general: '일반 상담'
  };
  return names[type] || '상담';
};

// 타입별 클래스
const getItemClass = (type) => {
  return `type-${type}`;
};

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadHistory();
});

watch(() => props.beneficiaryId, () => {
  loadHistory();
});
</script>

<style scoped>
.history-container {
  min-height: 200px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 16px;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  color: #111827;
}

.history-count {
  font-size: 13px;
  color: #6B7280;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #9CA3AF;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  transition: all 0.2s;
}

.history-item:hover {
  border-color: #D1D5DB;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.history-item.type-complaint {
  border-left: 3px solid #EF4444;
}

.history-item.type-termination {
  border-left: 3px solid #7C3AED;
}

.history-item.type-rental {
  border-left: 3px solid #10B981;
}

.history-item.type-subscription {
  border-left: 3px solid #3B82F6;
}

.history-item.type-inquiry {
  border-left: 3px solid #F59E0B;
}

.item-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-type {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.item-date {
  font-size: 12px;
  color: #9CA3AF;
}

.item-detail {
  font-size: 13px;
  color: #4B5563;
  line-height: 1.5;
}

.item-actor {
  font-size: 12px;
  color: #6B7280;
}
</style>
