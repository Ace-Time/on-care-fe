<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/lib/api';

const emit = defineEmits(['select-employee']);

const alerts = ref([]);
const isExpanded = ref(false); // 접기/펼치기 상태

const fetchAlerts = async () => {
  try {
    const res = await api.get('/api/employees/education/alerts');
    alerts.value = res.data;
  } catch (error) {
    console.warn("보수교육 알림 조회 실패/데이터 없음", error);
  }
};

onMounted(fetchAlerts);

// D-Day 텍스트 변환기
const getDDayText = (item) => {
  const dayVal = item.dday; 
  if (item.status === 'OVERDUE') {
    return `${Math.abs(dayVal)}일 초과`;
  }
  return `${dayVal}일 전`;
};

// 뱃지 스타일 결정
const getBadgeClass = (status) => {
  return status === 'OVERDUE' ? 'badge-red' : 'badge-yellow';
};

// [추가] 화면에 표시할 알림 목록 (접혀있으면 10개만, 펼치면 전체)
const displayedAlerts = computed(() => {
  if (isExpanded.value) return alerts.value;
  return alerts.value.slice(0, 15); // 기본노출 15개
});

// [추가] 더보기 버튼이 필요한지 여부
const needsExpand = computed(() => alerts.value.length > 15);
</script>

<template>
  <div v-if="alerts.length > 0" class="alert-banner">
    <div class="banner-header">
      <div class="header-left">
        <div class="icon-circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div class="title-area">
          <span class="title">보수교육 기한 알림</span>
          <span class="count-badge">{{ alerts.length }}명</span>
        </div>
      </div>
      
      <!-- [추가] 접기/펼치기 버튼 -->
      <button v-if="needsExpand" @click="isExpanded = !isExpanded" class="toggle-btn">
        {{ isExpanded ? '접기' : '더보기' }}
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          :class="{ 'rotate-180': isExpanded }"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
    </div>

    <div class="banner-desc">
      보수교육 기한이 임박하거나 초과된 직원이 있습니다. 해당 직원을 선택하여 자격증 탭에서 확인해주세요.
    </div>

    <div class="chip-container">
      <button 
        v-for="item in displayedAlerts" 
        :key="item.employeeId" 
        class="name-chip"
        :class="getBadgeClass(item.status)"
        @click="$emit('select-employee', item.employeeId)"
      >
        <span class="name">{{ item.name }}</span>
        <span class="d-day">({{ getDDayText(item) }})</span>
      </button>
      
      <!-- [추가] 접혀있을 때 몇 명 더 있는지 표시 -->
      <button 
        v-if="!isExpanded && alerts.length > 15" 
        class="name-chip more-chip"
        @click="isExpanded = true"
      >
        + {{ alerts.length - 15 }}명 더보기
      </button>
    </div>
  </div>
</template>
<style scoped>
.alert-banner {
  background-color: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
}

.banner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-circle {
  width: 32px;
  height: 32px;
  background-color: #f97316;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-weight: 700;
  color: #166534;
  font-size: 16px;
}

.count-badge {
  background-color: #ffedd5;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 13px;
  color: #c2410c;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.toggle-btn:hover { text-decoration: underline; }
.rotate-180 { transform: rotate(180deg); }


.banner-desc {
  font-size: 13px;
  color: #9a3412;
  margin-bottom: 4px;
}

.chip-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.name-chip {
  border: none;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  gap: 4px;
  transition: transform 0.1s;
}

.name-chip:hover {
  transform: scale(1.05);
}

.more-chip {
  background-color: #fff;
  border: 1px dashed #fdba74;
  color: #c2410c;
}

/* 초과 (빨강) */
.badge-red {
  background-color: #fee2e2;
  color: #991b1b;
}

/* 임박 (노랑) */
.badge-yellow {
  background-color: #fef9c3;
  color: #854d0e;
}
</style>
