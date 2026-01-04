<script setup>
import { ref, onMounted } from 'vue';
import { getDashboardSummary } from '@/api/careworker';

// 초기 표시 값
const summaryStats = ref([
  { label: '오늘 일정', value: '0건', colorClass: 'green-border' },
  { label: '담당 수급자', value: '0명', colorClass: 'blue-border' },
  { label: '월간 근무시간', value: '0h', colorClass: 'purple-border' },
]);

onMounted(async () => {
  try {
    const response = await getDashboardSummary();
    // 백엔드 ApiResponse<{data}> 형태와 순수 데이터 반환을 모두 대응
    const data = response?.data?.data ?? response?.data ?? response;

    summaryStats.value = [
      {
        label: '오늘 일정',
        value: `${data?.todayScheduleCount ?? 0}건`,
        colorClass: 'green-border',
      },
      {
        label: '담당 수급자',
        value: `${data?.beneficiaryCount ?? 0}명`,
        colorClass: 'blue-border',
      },
      {
        label: '월간 근무시간',
        value: `${data?.weeklyWorkHours ?? data?.monthlyWorkHours ?? data?.workHours ?? 0}h`,
        colorClass: 'purple-border',
      },
    ];
  } catch (error) {
    // 에러 처리
  }
});
</script>

<template>
  <section class="stats-container">
    <div
      v-for="(stat, index) in summaryStats"
      :key="index"
      :class="['stat-card', stat.colorClass]"
    >
      <p class="label">{{ stat.label }}</p>
      <p class="value">{{ stat.value }}</p>
    </div>
  </section>
</template>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.stat-card {
  background-color: #ffffff;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  position: relative;
  overflow: hidden;
  border-left: 3px solid;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.green-border {
  border-left-color: #22c55e;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}
.blue-border {
  border-left-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}
.purple-border {
  border-left-color: #a855f7;
  background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%);
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #64748b;
  margin: 0;
  line-height: 1.2;
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .stats-container {
    gap: 0.625rem;
  }

  .stat-card {
    padding: 0.75rem 0.875rem;
  }

  .label {
    font-size: 0.75rem;
  }

  .value {
    font-size: 1.25rem;
  }
}

/* 작은 화면에서는 세로로 나열 */
@media (max-width: 480px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .stat-card {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
