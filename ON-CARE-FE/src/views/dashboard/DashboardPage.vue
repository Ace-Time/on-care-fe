<script setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';

import DashboardHeader from '@/components/dashboard/dashboardHeader/DashboardHeader.vue';
import AlertBanner from '@/components/dashboard/dashboardHeader/AlertBanner.vue';
import StatCard from '@/components/dashboard/widget/StatCard.vue';
import LineChart from '@/components/dashboard/widget/LineChart.vue';
import BarChart from '@/components/dashboard/widget/BarChart.vue';
import PieChart from '@/components/dashboard/widget/PieChart.vue';
import StaffStatus from '@/components/dashboard/widget/StaffStatus.vue';

// 2. 컴포넌트 매핑 (수정됨: shallowRef 제거)

const componentsMap = {
  StatCard,
  LineChart,
  BarChart,
  PieChart,
  StaffStatus,
};

// 3. 위젯 배치 데이터 (기존과 동일)
const dashboardWidgets = ref([
  { id: 1, type: 'StatCard', layoutClass: 'span-1', props: { data: { title: '총 수급자', value: '156명', change: '↑ 12%', icon: '♥', color: 'green' } } },
  { id: 2, type: 'StatCard', layoutClass: 'span-1', props: { data: { title: '요양보호사', value: '28명', subtext: '근무 중 24명', icon: '☺', color: 'blue' } } },
  { id: 3, type: 'StatCard', layoutClass: 'span-1', props: { data: { title: '렌탈 장비', value: '135대', subtext: '가동률 94%', icon: '📦', color: 'purple' } } },
  { id: 4, type: 'StatCard', layoutClass: 'span-1', props: { data: { title: '이번 달 서비스', value: '221건', subtext: '884 시간', icon: '📈', color: 'orange' } } },
  
  // 신규 위젯
  { id: 5, type: 'StaffStatus', layoutClass: 'span-4', props: {} }, 

  { id: 6, type: 'LineChart', layoutClass: 'span-4', props: {} },
  { id: 7, type: 'BarChart', layoutClass: 'span-2', props: {} },
  { id: 8, type: 'PieChart', layoutClass: 'span-2', props: {} },
]);

const drag = ref(false);
</script>

<template>
  <div class="dashboard-container">
    <DashboardHeader />
    
    <div class="dashboard-content">
      <AlertBanner />

      <draggable 
        v-model="dashboardWidgets" 
        item-key="id"
        class="dashboard-grid"
        ghost-class="ghost-card"
        handle=".widget-wrapper" 
        :animation="200"
      >
        <template #item="{ element }">
          <div :class="['widget-wrapper', element.layoutClass]">
            <component 
              :is="componentsMap[element.type]" 
              v-bind="element.props" 
            />
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 50px;
}

.dashboard-content {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 그리드 칸 수 조절 클래스 */
.span-1 { grid-column: span 1; }
.span-2 { grid-column: span 2; }
.span-3 { grid-column: span 3; }
.span-4 { grid-column: span 4; }

.widget-wrapper {
  height: 100%;
  cursor: grab; /* 드래그 가능함을 표시 */
}

.widget-wrapper:active {
  cursor: grabbing;
}

.ghost-card {
  opacity: 0.4;
  background: #e3f2fd;
  border: 2px dashed #2196f3;
  border-radius: 12px;
}

/* 반응형 */
@media (max-width: 1200px) {
  .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
  .span-1, .span-2, .span-3, .span-4 { grid-column: span auto; }
  .span-3, .span-4 { grid-column: span 2; }
}

@media (max-width: 768px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .span-1, .span-2, .span-3, .span-4 { grid-column: span 1; }
}
</style>