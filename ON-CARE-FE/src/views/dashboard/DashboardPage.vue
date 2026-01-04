<script setup>
import { ref, onMounted } from 'vue';
import draggable from 'vuedraggable';

import DashboardHeader from '@/components/dashboard/dashboardHeader/DashboardHeader.vue';
import AlertBanner from '@/components/dashboard/dashboardHeader/AlertBanner.vue';
import WidgetSelectorModal from '@/components/dashboard/dashboardHeader/WidgetSelectorModal.vue';
import BaseChart from '@/components/dashboard/dashboarcommon/BaseChart.vue';
import CommonCardWidget from '@/components/dashboard/dashboarcommon/CommonCardWidget.vue';
import CommonListWidget from '@/components/dashboard/dashboarcommon/CommonListWidget.vue';
import ProductProfitWidget from '@/components/dashboard/widget/ProductProfitWidget.vue';
import CareLevelExpirationWidget from '@/components/dashboard/widget/CareLevelExpirationWidget.vue';
import MonthlyClientWidget from '@/components/dashboard/widget/MonthlyClientWidget.vue';
import MonthlyBeneficiaryWidget from '@/components/dashboard/widget/MonthlyBeneficiaryWidget.vue';
import RiskLevelWidget from '@/components/dashboard/widget/RiskLevelWidget.vue';
import CareGradeWidget from '@/components/dashboard/widget/CareGradeWidget.vue';


import { dashboardApi } from '@/api/dashboard/dashboardApi';
import { useUserStore } from '@/stores/user'; 

const componentsMap = {
  BaseChart,
  CommonCardWidget,
  CommonListWidget,
  ProductProfitWidget,
  CareLevelExpirationWidget,
  MonthlyClientWidget,
  MonthlyBeneficiaryWidget,
  RiskLevelWidget,
  CareGradeWidget,
};

const userStore = useUserStore();

// [삭제] getStorageKey는 더 이상 필요 없습니다. (백엔드에서 토큰/세션으로 유저 식별)

// Master 정의
const masterWidgetList = ref([
  {
    id: 1, 
    type: 'BaseChart', 
    layoutClass: 'span-2', 
    selected: true, // 기본값
    name: '직급별 직원 분포',
    description: '직급별 인원 현황',
    keyName: 'employeeJobCounts', 
    props: { title: '직급별 직원 수', chartType: 'donut', categories: [], series: [] }
  },
  {
    id: 2, 
    type: 'CommonListWidget', 
    layoutClass: 'span-2', 
    selected: true,
    name: '보수교육 알림', 
    description: '교육 미이수자 경고',
    keyName: 'educationAlerts',
    props: { title: '보수교육 알림', items: [] }
  },
  {
    id: 3,
    type: 'ProductProfitWidget',
    layoutClass: 'span-2',
    selected: true,
    name: '제품 수익률 분석',
    description: '수익률 상위/하위 제품 비교',
    keyName: 'productProfitStats',
    props: { title: '제품 수익률 분석', apiData: null }
  },
  {
    id: 4,
    type: 'CareLevelExpirationWidget',
    layoutClass: 'span-2',
    selected: true,
    name: '장기요양등급 만료 임박',
    description: '만료 90/60/45일 전 수급자 수',
    keyName: 'careLevelExpirationStats',
    props: { title: '장기요양등급 만료 임박', apiData: null }
  },
  {
    id: 5,
    type: 'MonthlyClientWidget',
    layoutClass: 'span-4', // 가로로 넓게 보는게 좋음
    selected: true,
    name: '월별 고객 현황',
    description: '잠재고객 및 계약 성사 추이 (막대+선)',
    keyName: 'monthlyClientStats',
    props: { title: '월별 고객 현황 (잠재/계약)', apiData: [] }
  },
  {
    id: 6,
    type: 'CommonCardWidget',
    layoutClass: 'span-1',
    selected: true,
    name: '요양사 미배정 수급자',
    description: '현재 배정되지 않은 수급자 수',
    keyName: 'unassignedBeneficiaries',
    props: { title: '요양사 미배정 수급자', value: '-', subtext: '즉시 배정 필요', icon: '👤', color: 'orange' }
  },
  {
    id: 7,
    type: 'CommonCardWidget',
    layoutClass: 'span-1',
    selected: true,
    name: '전자결재 요청',
    description: '승인 대기 중인 결재 수',
    keyName: 'pendingApprovals',
    props: { title: '요청 결재', value: '-', subtext: '승인 대기 중', icon: '📑', color: 'blue' }
  },
  {
    id: 8,
    type: 'MonthlyBeneficiaryWidget',
    layoutClass: 'span-2',
    selected: true,
    name: '월별 신규/탈퇴 수급자',
    description: '신규 및 탈퇴 수급자 월별 흐름',
    keyName: 'monthlyBeneficiaryStats',
    props: { title: '월별 신규/탈퇴 수급자 추이', apiData: [] }
  },
  {
    id: 9,
    type: 'CommonListWidget',
    layoutClass: 'span-2',
    selected: true,
    name: '미배정 수급자 리스트',
    description: '요양사 매칭이 필요한 수급자 목록',
    keyName: 'unassignedBeneficiariesList',
    props: { title: '미배정 수급자 리스트', items: [] }
  },
  {
    id: 10,
    type: 'CommonListWidget',
    layoutClass: 'span-2',
    selected: true,
    name: '이탈 위험군 분석',
    description: '이탈 징후가 보이는 수급자 목록',
    keyName: 'churnRiskBeneficiaries',
    props: { title: '이탈 위험군 분석', items: [] }
  },
  {
    id: 11,
    type: 'RiskLevelWidget',
    layoutClass: 'span-2',
    selected: true,
    name: '위험등급별 수급자 현황',
    description: '수급자 위험 등급 분포 (가로 막대)',
    keyName: 'riskLevelStats',
    props: { title: '위험등급별 수급자 현황', apiData: [] }
  },
  {
    id: 12,
    type: 'CareGradeWidget',
    layoutClass: 'span-2',
    selected: true,
    name: '장기요양 등급별 현황',
    description: '장기요양 등급 분포 (도넛 차트)',
    keyName: 'careGradeStats',
    props: { title: '장기요양 등급별 현황', apiData: [] }
  },
  {
    id: 13,
    type: 'CommonListWidget',
    layoutClass: 'span-2',
    selected: true,
    name: '본인부담금 연체자 리스트',
    description: '본인부담금 미납 고객 목록',
    keyName: 'overdueBeneficiaries',
    props: { title: '본인부담금 연체자 리스트', items: [] }
  }
]);

const activeWidgets = ref([]);
const isModalOpen = ref(false);
const isLoadingSettings = ref(true); // [추가] 설정 로딩 상태

// [변경] 위젯 삭제 -> DB 저장 호출
const handleRemoveWidget = async (id) => {
  activeWidgets.value = activeWidgets.value.filter(w => w.id !== id);
  const masterItem = masterWidgetList.value.find(w => w.id === id);
  if (masterItem) masterItem.selected = false;
  
  await saveDashboardSettings(); // DB 저장
};

// 위젯 확대/축소 (확대/축소 상태도 저장하려면 여기에 saveDashboardSettings 추가 가능)
const handleToggleSize = (id) => {
  const widget = activeWidgets.value.find(w => w.id === id);
  if (!widget) return;
  if (widget.layoutClass === 'span-4') {
    widget.layoutClass = widget.defaultLayoutClass || 'span-2';
  } else {
    if (!widget.defaultLayoutClass) widget.defaultLayoutClass = widget.layoutClass;
    widget.layoutClass = 'span-4';
  }

  // ApexCharts의 redrawOnParentResize가 자동으로 처리함
};

// 동기화
const updateActiveWidgets = () => {
  // masterWidgetList의 순서가 아니라, 저장된 순서(activeWidgets)를 유지해야 한다면 로직이 복잡해집니다.
  // 여기서는 단순히 선택된 것을 필터링하여 보여줍니다.
  activeWidgets.value = masterWidgetList.value.filter(w => w.selected);
};

// 모달 열기
const openModal = () => {
  isModalOpen.value = true;
};

// [변경] 저장 (모달에서 저장 버튼 클릭 시) -> DB 저장 호출
const handleSaveWidgets = async (updatedMasterList) => {
  masterWidgetList.value = updatedMasterList;
  updateActiveWidgets();
  
  await saveDashboardSettings(); // DB 저장
  isModalOpen.value = false;
  fetchDashboardData();
};

// [변경] DB에 설정 저장 (API 호출)
const saveDashboardSettings = async () => {
  try {
    // 현재 활성화된 위젯의 ID 목록 추출
    const selectedIds = activeWidgets.value.map(w => w.id);
    await dashboardApi.saveDashboardSettings(selectedIds);
    // 필요 시 성공 토스트 메시지
  } catch (error) {
    console.error("대시보드 설정 저장 실패:", error);
  }
};

// [추가] DB에서 설정 불러오기
const loadDashboardSettings = async () => {
  try {
    const data = await dashboardApi.getDashboardSettings();

    // 1. API 응답에 widgetIds 배열이 존재하면 (빈 배열이라도) 사용자가 저장한 설정으로 간주
    if (data && Array.isArray(data.widgetIds)) {
      const savedIds = data.widgetIds;

      // 1-1. 전체 선택 해제
      masterWidgetList.value.forEach(w => w.selected = false);
      
      // 1-2. 저장된 ID에 해당하는 위젯만 선택 처리
      savedIds.forEach(id => {
        const found = masterWidgetList.value.find(w => w.id === id);
        if (found) found.selected = true;
      });
      
      // 1-3. activeWidgets 업데이트 (저장한 순서대로 정렬)
      const newActiveList = [];
      savedIds.forEach(id => {
        const found = masterWidgetList.value.find(w => w.id === id);
        if (found) newActiveList.push(found);
      });
      activeWidgets.value = newActiveList;

    } else {
      // 2. widgetIds가 null/undefined면 (최초 진입 등) -> 기본값 로드
      updateActiveWidgets();
    }
  } catch (error) {
    console.error("설정 로드 실패 (기본값 사용):", error);
    updateActiveWidgets();
  } finally {
    isLoadingSettings.value = false;
  }
};


// API 데이터 패칭 (차트 데이터 등)
const fetchDashboardData = async () => {
  try {
    // 1. 보수교육
    const educationData = await dashboardApi.getEducationAlerts();
    const formattedEducationList = educationData.map(item => {
      let statusText = '', colorType = 'default';
      if (item.status === 'OVERDUE') {
        statusText = `연체됨 (D+${Math.abs(item.dday)})`;
        colorType = 'error';
      } else if (item.status === 'WARNING') {
        statusText = `만료 임박 (D-${item.dday})`;
        colorType = 'warning';
      }
      return { mainText: item.name, subText: statusText, value: item.nextEduDate, type: colorType };
    });

    // 2. 직급별 분포
    const jobCountData = await dashboardApi.getEmployeeJobCounts();
    const jobCategories = jobCountData.map(item => item.jobName);
    const jobSeries = jobCountData.map(item => item.count);

    // 3. 제품 수익률
    const productStatsData = await dashboardApi.getProductStats();

    // 4. 장기요양등급 만료
    const careLevelData = await dashboardApi.getCareLevelExpirationStats();

    // 5. 월별 고객 현황
    const monthlyClientData = await dashboardApi.getMonthlyClientStats();

    // 6. 미배정 수급자 (숫자)
    const unassignedCount = await dashboardApi.getUnassignedBeneficiariesCount();

    // 7. 결재 대기
    const pendingCount = await dashboardApi.getPendingApprovalsCount();

    // 8. 월별 신규/탈퇴 수급자
    const monthlyBeneficiaryData = await dashboardApi.getMonthlyBeneficiaryStats();

    // 9. 미배정 수급자 리스트
    const unassignedListData = await dashboardApi.getUnassignedBeneficiariesList();
    const formattedUnassignedList = unassignedListData.map(item => ({
      mainText: `${item.name} (${item.gender === 'M' ? '남':'여'}/${item.age}세)`,
      subText: item.address,
      value: item.phone,
      type: 'warning' // 주황색 배경
    }));

    // 10. 이탈 위험군 (churn risk)
    const churnRiskData = await dashboardApi.getChurnRiskBeneficiaries();
    const formattedChurnRiskList = churnRiskData.map(item => ({
      mainText: `${item.name} (${item.age}세)`,
      subText: item.lastCounselDate ? `마지막 상담: ${item.lastCounselDate.split('T')[0]}` : '상담 이력 없음',
      value: item.riskReason,
      type: 'error' // 빨간색 배경
    }));

    // 11. 위험등급별 수급자 현황
    const riskLevelData = await dashboardApi.getRiskLevelBeneficiariesCount();

    // 12. 장기요양 등급별 현황
    const careGradeData = await dashboardApi.getCareGradeBeneficiariesCount();

    // 13. 본인부담금 연체자 리스트
    const overdueData = await dashboardApi.getOverdueBeneficiaries();
    const formattedOverdueList = overdueData.map(item => ({
      mainText: `${item.beneficiaryName} (${item.phone})`,
      subText: `${item.billingMonth} 청구분`,
      value: item.paymentStatus,
      type: 'error' // 빨간색 강조
    }));


    // 데이터 주입
    masterWidgetList.value.forEach(widget => {
      if (widget.keyName === 'educationAlerts') widget.props.items = formattedEducationList;
      if (widget.keyName === 'employeeJobCounts') {
        widget.props.categories = jobCategories;
        widget.props.series = jobSeries;
      }
      if (widget.keyName === 'productProfitStats') widget.props.apiData = productStatsData;
      if (widget.keyName === 'careLevelExpirationStats') widget.props.apiData = careLevelData;
      if (widget.keyName === 'monthlyClientStats') widget.props.apiData = monthlyClientData;
      
      // 카드형 위젯 데이터 주입
      if (widget.keyName === 'unassignedBeneficiaries') {
        widget.props.value = `${unassignedCount}명`;
      }
      if (widget.keyName === 'pendingApprovals') {
        widget.props.value = `${pendingCount}건`;
      }
      if (widget.keyName === 'monthlyBeneficiaryStats') widget.props.apiData = monthlyBeneficiaryData;
      
      // 리스트형 위젯 데이터 주입
      if (widget.keyName === 'unassignedBeneficiariesList') {
        widget.props.items = formattedUnassignedList;
      }
      if (widget.keyName === 'churnRiskBeneficiaries') {
        widget.props.items = formattedChurnRiskList;
      }
      // 막대 차트 데이터 주입
      if (widget.keyName === 'riskLevelStats') widget.props.apiData = riskLevelData;
      
      // 도넛 차트 데이터 주입
      if (widget.keyName === 'careGradeStats') widget.props.apiData = careGradeData;
      
      // 연체자 리스트 데이터 주입
      if (widget.keyName === 'overdueBeneficiaries') {
        widget.props.items = formattedOverdueList;
      }
    });

    // activeWidgets가 masterWidgetList를 참조하므로 자동으로 데이터가 반영되지만,
    // 확실하게 하기 위해 리렌더링 유도가 필요할 수 있음 (보통은 불필요)
  } catch (error) {
    console.error("데이터 로딩 중 오류 발생:", error);
  }
};

// [변경] 초기화 로직
onMounted(async () => {
  // 1. DB에서 사용자 설정(위젯 배치) 먼저 로드
  await loadDashboardSettings();
  
  // 2. 설정 로드 후 데이터 패칭
  await fetchDashboardData();
});
</script>

<template>
  <div class="dashboard-container">
    <DashboardHeader @openModal="openModal" />

    <div class="dashboard-content">
      <AlertBanner />
      
      <div v-if="isLoadingSettings" class="loading-area">
        설정을 불러오는 중...
      </div>

      <draggable 
        v-else
        v-model="activeWidgets" 
        item-key="id"
        class="dashboard-grid"
        handle=".widget-wrapper"
        :animation="200"
        @end="saveDashboardSettings" 
      >
        <template #item="{ element }">
          <div :class="['widget-wrapper', element.layoutClass, 'transition-all']">
            <component 
              :is="componentsMap[element.type]" 
              v-bind="element.props" 
              @remove="() => handleRemoveWidget(element.id)"
              @toggleSize="() => handleToggleSize(element.id)"
            />
          </div>
        </template>
      </draggable>
    </div>

    <WidgetSelectorModal 
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :all-widgets="masterWidgetList"
      @close="isModalOpen = false"
      @save="handleSaveWidgets"
    />
  </div>
</template>

<style scoped>
/* 스타일은 기존과 동일 */
.dashboard-container { background-color: #f8f9fa; min-height: 100vh; padding-bottom: 50px; }
.dashboard-content { padding: 24px; max-width: 100%; margin: 0 auto; }
/* [수정] row-gap 조정 및 grid-auto-rows 추가로 높이 고정 (차트 무한 늘어짐 방지) */
.dashboard-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  grid-auto-rows: 420px; /* 위젯 높이 고정 */
  row-gap: 24px; 
  column-gap: 24px; 
}

.span-1 { grid-column: span 1; }
.span-2 { grid-column: span 2; }
.span-4 { grid-column: span 4; }

/* [수정] width/height 애니메이션 제거. transform(드래그)만 애니메이션 */
.transition-all { transition: transform 0.2s ease, box-shadow 0.2s ease; }

.widget-wrapper { height: 100%; cursor: grab; min-width: 0; overflow: hidden; }
.widget-wrapper:active { cursor: grabbing; }
.loading-area { text-align: center; padding: 50px; color: #666; }

/* 태블릿 (1200px 이하) - 2열 구조 */
@media (max-width: 1200px) {
  .dashboard-grid { 
    grid-template-columns: repeat(2, 1fr); 
    row-gap: 24px;
    /* 높이는 유지하거나 필요 시 조정 */
  } 
  .span-4 { grid-column: span 2; } 
}

/* 모바일 (768px 이하) - 1열 구조 */
@media (max-width: 768px) {
  .dashboard-content { padding: 16px; }
  .dashboard-grid { 
    grid-template-columns: 1fr; 
    row-gap: 24px;
    grid-auto-rows: auto; /* 모바일에서는 내용에 맞게 (차트가 작아질 수 있음) */
  } 
  .span-1, .span-2, .span-4 { grid-column: span 1; } 
}
</style>