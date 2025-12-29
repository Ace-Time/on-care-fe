<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import CareLogForm from '@/components/careworker/activity/CareLogForm.vue';
import { getCareLogList, getCareLogDetail, createCareLog, updateCareLog, deleteCareLog } from '@/api/careworker/careLogApi';
import { useScheduleStore } from '@/stores/schedule';

const route = useRoute();
const scheduleStore = useScheduleStore();

// 서브 탭 상태 (작성 / 내역)
const activeTab = ref('write');

// 서비스 유형 매핑 (백엔드 값 -> 프론트엔드 값)
const mapServiceType = (type) => {
  if (!type) return '방문요양';

  const typeStr = type.toString().toLowerCase();

  // '방문요양' 관련 키워드
  if (typeStr.includes('요양') || typeStr.includes('care') || typeStr.includes('visit')) {
    return '방문요양';
  }
  // '방문목욕' 관련 키워드
  if (typeStr.includes('목욕') || typeStr.includes('bath')) {
    return '방문목욕';
  }
  // '방문간호' 관련 키워드
  if (typeStr.includes('간호') || typeStr.includes('nursing') || typeStr.includes('nurse')) {
    return '방문간호';
  }

  // 매칭되지 않으면 원래 값 반환 (정확히 일치하는 경우를 위해)
  const validTypes = ['방문요양', '방문목욕', '방문간호'];
  return validTypes.includes(type) ? type : '방문요양';
};

// 근무일정에서 전달받은 정보를 초기 데이터로 사용
const scheduleData = computed(() => {
  if (route.query.beneficiaryId) {
    console.log('📋 근무일정에서 전달받은 데이터:', route.query);
    const mappedServiceType = mapServiceType(route.query.serviceType);
    console.log('📋 서비스 유형 매핑:', route.query.serviceType, '->', mappedServiceType);

    return {
      beneficiaryId: parseInt(route.query.beneficiaryId, 10) || route.query.beneficiaryId,
      recipientName: route.query.beneficiaryName || '',
      careDate: route.query.serviceDate || new Date().toISOString().split('T')[0],
      startTime: route.query.startTime || '',
      endTime: route.query.endTime || '',
      serviceType: mappedServiceType,
      scheduleId: route.query.scheduleId
    };
  }
  return null;
});

const subTabs = [
  { key: 'write', label: '작성하기', icon: '📝' },
  { key: 'history', label: '작성 내역', icon: '📋' }
];

// 요양일지 내역 데이터
const careLogHistory = ref([]);
const loading = ref(false);

// 요양일지 목록 불러오기
const loadCareLogHistory = async () => {
  try {
    loading.value = true;
    const response = await getCareLogList();
    const data = response?.data ?? response;

    console.log('📊 요양일지 원본 데이터:', data);

    // 백엔드 응답 데이터를 프론트엔드 형식으로 변환
    careLogHistory.value = (data || []).map(item => {
      // 날짜 포맷 변환 (YYYY-MM-DD)
      const serviceDate = item.serviceDate || item.careDate || item.date || '';
      const dateObj = serviceDate ? new Date(serviceDate) : new Date();
      const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const dayOfWeek = dayNames[dateObj.getDay()];

      // 날짜 포맷: 2024-12-03 (화요일)
      const formattedDate = serviceDate ? `${serviceDate} (${dayOfWeek})` : '-';

      // 시간 포맷 (HH:MM - HH:MM)
      const time = item.startTime && item.endTime
        ? `${item.startTime} - ${item.endTime}`
        : item.time || '-';

      // ID 필드 보존 (logId를 우선으로, 다양한 형식 지원)
      const id = item.logId || item.id || item.careLogId || item.care_log_id;

      // 특이사항 필드 확인 (다양한 필드명 지원)
      const specialNotes = item.specialNote
        || item.specialNotes
        || item.special_note
        || item.special_notes
        || item.note
        || item.notes
        || '';

      // 특이사항은 목록 API에서 제공하지 않음 (백엔드 미구현)
      // 상세 조회 시에만 가져올 수 있음
      if (specialNotes) {
        console.log('📝 특이사항 필드 확인:', {
          specialNote: item.specialNote,
          specialNotes: item.specialNotes,
          special_note: item.special_note,
          최종값: specialNotes
        });
      }

      return {
        ...item,
        id, // ID 명시적으로 설정
        logId: id, // logId도 설정
        date: formattedDate, // "2024-12-03 (화요일)" 형식
        time, // "14:00 - 17:00" 형식
        recipientName: item.beneficiaryName || item.recipientName || '-',
        address: item.beneficiaryAddress || item.address || item.location || '-',
        serviceType: item.serviceType || '방문요양',
        specialNotes: specialNotes,
        status: item.status || '제출됨',
      };
    });

    console.log('📊 변환된 요양일지 목록:', careLogHistory.value);
  } catch (error) {
    console.error('❌ 요양일지 목록 불러오기 실패:', error);
    careLogHistory.value = [];
  } finally {
    loading.value = false;
  }
};
const showDetailModal = ref(false);
const isEditMode = ref(false);
const selectedLog = ref(null);
const editForm = ref(null);

// 백엔드 데이터를 프론트엔드 폼 데이터로 변환 (1:1 필드 매핑)
const mapBackendToFormData = (data) => {
  return {
    // ID 필드 (수정/삭제에 필요)
    logId: data.logId || data.id || data.careLogId || data.care_log_id,
    id: data.logId || data.id || data.careLogId || data.care_log_id,

    // 기본 정보
    beneficiaryId: data.beneficiaryId || '',
    recipientName: data.beneficiaryName || '',
    careWorkerName: data.careWorkerName || '',
    careDate: data.serviceDate || data.careDate || '',
    startTime: data.startTime || '',
    endTime: data.endTime || '',
    serviceType: data.serviceType || '방문요양',

    // 식사 제공
    isBreakfast: data.isBreakfast || false,
    isLunch: data.isLunch || false,
    isDinner: data.isDinner || false,
    isSnack: data.isSnack || false,

    // 배설 도움
    diaperCount: data.diaperCount || 0,
    toiletCount: data.toiletCount || 0,
    isPortableToilet: data.isPortableToilet || false,
    isUrine: data.isUrine || false,
    isStool: data.isStool || false,

    // 대변 상태
    stoolNormal: data.stoolNormal || false,
    stoolDiarrhea: data.stoolDiarrhea || false,
    stoolConstipation: data.stoolConstipation || false,

    // 위생 관리
    isFaceWash: data.isFaceWash || false,
    isOralCare: data.isOralCare || false,
    isHairWash: data.isHairWash || false,
    isBodyWash: data.isBodyWash || false,
    isChangeClothes: data.isChangeClothes || false,

    // 일상 생활 지원
    isMealPrep: data.isMealPrep || false,
    isBedCare: data.isBedCare || false,
    isPositionChange: data.isPositionChange || false,
    isGetUpHelp: data.isGetUpHelp || false,
    isIndoorMove: data.isIndoorMove || false,
    isWalkHelp: data.isWalkHelp || false,

    // 인지활동 지원
    isEmotionalTalk: data.isEmotionalTalk || false,
    isCommunication: data.isCommunication || false,
    isCounseling: data.isCounseling || false,
    isCognitiveCare: data.isCognitiveCare || false,
    isBehaviorCare: data.isBehaviorCare || false,

    // 건강 상태
    isHealthGood: data.isHealthGood || false,
    isPain: data.isPain || false,
    isEdema: data.isEdema || false,
    isSkinIssue: data.isSkinIssue || false,
    isBodyEtc: data.isBodyEtc || false,

    // 기분/정서 상태
    isMoodCalm: data.isMoodCalm || false,
    isMoodAnxious: data.isMoodAnxious || false,
    isMoodDepressed: data.isMoodDepressed || false,
    isMoodAngry: data.isMoodAngry || false,
    isMoodEtc: data.isMoodEtc || false,

    // 기타 관찰 사항
    isExcretionMistake: data.isExcretionMistake || false,
    isSleepLack: data.isSleepLack || false,
    isNapExcess: data.isNapExcess || false,

    // 특이사항
    specialNotes: data.specialNote || data.specialNotes || ''
  };
};

const openDetail = async (item) => {
  try {
    // ID 필드 확인 (id, careLogId, care_log_id 등 다양한 형식 지원)
    const logId = item.logId || item.id || item.careLogId || item.care_log_id;

    if (!logId) {
      console.error('❌ 요양일지 ID를 찾을 수 없습니다:', item);
      alert('요양일지 ID를 찾을 수 없습니다.');
      return;
    }

    console.log('📊 요양일지 상세 조회 시작 - ID:', logId);

    // API로부터 상세 데이터 가져오기
    const response = await getCareLogDetail(logId);
    const detailData = response?.data ?? response;

    console.log('📊 요양일지 상세 데이터 (원본):', detailData);

    // 백엔드 응답을 폼 데이터 형식으로 변환
    selectedLog.value = mapBackendToFormData(detailData);

    console.log('📊 변환된 폼 데이터:', selectedLog.value);

    editForm.value = null;
    isEditMode.value = false;
    showDetailModal.value = true;
  } catch (error) {
    console.error('❌ 요양일지 상세 조회 실패:', error);
    alert('요양일지를 불러오는데 실패했습니다.');
  }
};

const openEdit = async (item) => {
  console.log('🔧 수정 버튼 클릭:', item);

  // 상세 조회가 이미 되어 있지 않다면 먼저 상세 조회
  if (!selectedLog.value || !selectedLog.value.careWorkerName) {
    console.log('🔧 상세 조회되지 않은 데이터. 먼저 상세 조회 실행...');
    await openDetail(item);
  }

  console.log('🔧 수정 모드로 전환');
  console.log('🔧 selectedLog:', selectedLog.value);
  // 수정 모드로 전환
  isEditMode.value = true;
  console.log('🔧 isEditMode:', isEditMode.value);
};

const closeModal = () => {
  showDetailModal.value = false;
  isEditMode.value = false;
  editForm.value = null;
};

// 요양일지 수정 처리
const handleCareLogUpdate = async (formData) => {
  try {
    console.log('📝 요양일지 수정 데이터:', formData);

    // 필수 필드 검증
    if (!formData.beneficiaryId) {
      alert('수급자를 선택해주세요.');
      return;
    }

    if (!formData.careDate || !formData.startTime || !formData.endTime) {
      alert('제공일과 서비스 시간을 입력해주세요.');
      return;
    }

    // logId 찾기
    const logId = selectedLog.value.logId || selectedLog.value.id;
    if (!logId) {
      alert('요양일지 ID를 찾을 수 없습니다.');
      return;
    }

    // 프론트엔드 formData를 백엔드 API 형식으로 변환
    const submitData = {
      beneficiaryId: parseInt(formData.beneficiaryId, 10),
      serviceDate: formData.careDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      serviceType: formData.serviceType,

      // 식사 제공
      isBreakfast: formData.isBreakfast,
      isLunch: formData.isLunch,
      isDinner: formData.isDinner,
      isSnack: formData.isSnack,

      // 배설 도움
      diaperCount: formData.diaperCount,
      toiletCount: formData.toiletCount,
      isPortableToilet: formData.isPortableToilet,
      isUrine: formData.isUrine,
      isStool: formData.isStool,

      // 대변 상태
      stoolNormal: formData.stoolNormal,
      stoolDiarrhea: formData.stoolDiarrhea,
      stoolConstipation: formData.stoolConstipation,

      // 위생 관리
      isFaceWash: formData.isFaceWash,
      isOralCare: formData.isOralCare,
      isHairWash: formData.isHairWash,
      isBodyWash: formData.isBodyWash,
      isChangeClothes: formData.isChangeClothes,

      // 일상 생활 지원
      isMealPrep: formData.isMealPrep,
      isBedCare: formData.isBedCare,
      isPositionChange: formData.isPositionChange,
      isGetUpHelp: formData.isGetUpHelp,
      isIndoorMove: formData.isIndoorMove,
      isWalkHelp: formData.isWalkHelp,

      // 인지활동 지원
      isEmotionalTalk: formData.isEmotionalTalk,
      isCommunication: formData.isCommunication,
      isCounseling: formData.isCounseling,
      isCognitiveCare: formData.isCognitiveCare,
      isBehaviorCare: formData.isBehaviorCare,

      // 건강 상태
      isHealthGood: formData.isHealthGood,
      isPain: formData.isPain,
      isEdema: formData.isEdema,
      isSkinIssue: formData.isSkinIssue,
      isBodyEtc: formData.isBodyEtc,

      // 기분/정서 상태
      isMoodCalm: formData.isMoodCalm,
      isMoodAnxious: formData.isMoodAnxious,
      isMoodDepressed: formData.isMoodDepressed,
      isMoodAngry: formData.isMoodAngry,
      isMoodEtc: formData.isMoodEtc,

      // 기타 관찰 사항
      isExcretionMistake: formData.isExcretionMistake,
      isSleepLack: formData.isSleepLack,
      isNapExcess: formData.isNapExcess,

      // 특이사항
      specialNote: formData.specialNotes
    };

    console.log('📤 API 전송 데이터:', submitData);

    await updateCareLog(logId, submitData);

    alert('요양일지가 성공적으로 수정되었습니다.');

    // 모달 닫기 및 목록 새로고침
    closeModal();
    await loadCareLogHistory();
  } catch (error) {
    console.error('❌ 요양일지 수정 실패:', error);
    alert('요양일지 수정에 실패했습니다.');
  }
};

const deleteLog = async (id) => {
  const targetId = id ?? selectedLog.value?.id;
  if (!targetId) return;

  const confirmed = confirm('이 요양일지를 삭제하시겠습니까?');
  if (!confirmed) return;

  try {
    await deleteCareLog(targetId);

    // 일정 새로고침 (버튼 상태 업데이트 - 요양일지 작성 버튼으로 변경)
    scheduleStore.notifyScheduleUpdate();

    // 목록 새로고침
    await loadCareLogHistory();

    if (selectedLog.value?.id === targetId) {
      closeModal();
      selectedLog.value = null;
    }
    alert('삭제되었습니다.');
  } catch (error) {
    console.error('❌ 요양일지 삭제 실패:', error);
    alert('요양일지 삭제에 실패했습니다.');
  }
};

const statusClass = (status) => {
  const normalized = (status || '').toString().toLowerCase();
  const approvedKeywords = ['approved', 'done', 'complete', 'success'];
  return approvedKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
    ? 'approved'
    : 'resubmit';
};

// 요양일지 제출 처리
const handleCareLogSubmit = async (formData) => {
  try {
    console.log('📝 요양일지 제출 데이터:', formData);

    // 필수 필드 검증
    if (!formData.beneficiaryId) {
      alert('수급자를 선택해주세요.');
      return;
    }

    if (!formData.careDate || !formData.startTime || !formData.endTime) {
      alert('제공일과 서비스 시간을 입력해주세요.');
      return;
    }

    // 프론트엔드 formData를 백엔드 API 형식으로 변환
    const submitData = {
      beneficiaryId: parseInt(formData.beneficiaryId, 10),
      serviceDate: formData.careDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      serviceType: formData.serviceType,
      vsId: formData.scheduleId ? parseInt(formData.scheduleId, 10) : null, // 일정 ID 추가

      // 식사 제공
      isBreakfast: formData.isBreakfast,
      isLunch: formData.isLunch,
      isDinner: formData.isDinner,
      isSnack: formData.isSnack,

      // 배설 도움
      diaperCount: formData.diaperCount,
      toiletCount: formData.toiletCount,
      isPortableToilet: formData.isPortableToilet,
      isUrine: formData.isUrine,
      isStool: formData.isStool,

      // 대변 상태
      stoolNormal: formData.stoolNormal,
      stoolDiarrhea: formData.stoolDiarrhea,
      stoolConstipation: formData.stoolConstipation,

      // 위생 관리
      isFaceWash: formData.isFaceWash,
      isOralCare: formData.isOralCare,
      isHairWash: formData.isHairWash,
      isBodyWash: formData.isBodyWash,
      isChangeClothes: formData.isChangeClothes,

      // 일상 생활 지원
      isMealPrep: formData.isMealPrep,
      isBedCare: formData.isBedCare,
      isPositionChange: formData.isPositionChange,
      isGetUpHelp: formData.isGetUpHelp,
      isIndoorMove: formData.isIndoorMove,
      isWalkHelp: formData.isWalkHelp,

      // 인지활동 지원
      isEmotionalTalk: formData.isEmotionalTalk,
      isCommunication: formData.isCommunication,
      isCounseling: formData.isCounseling,
      isCognitiveCare: formData.isCognitiveCare,
      isBehaviorCare: formData.isBehaviorCare,

      // 건강 상태
      isHealthGood: formData.isHealthGood,
      isPain: formData.isPain,
      isEdema: formData.isEdema,
      isSkinIssue: formData.isSkinIssue,
      isBodyEtc: formData.isBodyEtc,

      // 기분/정서 상태
      isMoodCalm: formData.isMoodCalm,
      isMoodAnxious: formData.isMoodAnxious,
      isMoodDepressed: formData.isMoodDepressed,
      isMoodAngry: formData.isMoodAngry,
      isMoodEtc: formData.isMoodEtc,

      // 기타 관찰 사항
      isExcretionMistake: formData.isExcretionMistake,
      isSleepLack: formData.isSleepLack,
      isNapExcess: formData.isNapExcess,

      // 특이사항
      specialNote: formData.specialNotes
    };

    console.log('📤 API 전송 데이터:', submitData);

    const result = await createCareLog(submitData);
    console.log('✅ 요양일지 작성 완료. API 응답:', result);

    alert('요양일지가 성공적으로 제출되었습니다.');

    // 일정 새로고침 (버튼 상태 업데이트)
    console.log('🔄 일정 업데이트 알림 전송...');
    scheduleStore.notifyScheduleUpdate();

    // 작성 내역 탭으로 전환하고 목록 새로고침
    activeTab.value = 'history';
    await loadCareLogHistory();
  } catch (error) {
    console.error('❌ 요양일지 제출 실패:', error);
    alert('요양일지 제출에 실패했습니다.');
  }
};

// 컴포넌트 마운트 시 요양일지 목록 로드
onMounted(async () => {
  await loadCareLogHistory();

  // viewLogId가 있으면 해당 일지 자동 열기
  if (route.query.viewLogId) {
    console.log('📋 요양일지 자동 조회:', route.query.viewLogId);
    const logId = parseInt(route.query.viewLogId, 10);

    // 목록에서 해당 일지 찾기
    const logItem = careLogHistory.value.find(
      item => (item.logId || item.id) === logId
    );

    if (logItem) {
      // 내역 탭으로 전환
      if (route.query.tab === 'history') {
        activeTab.value = 'history';
      }

      // 상세 모달 열기
      await openDetail(logItem);
    } else {
      console.warn('⚠️ 요양일지를 찾을 수 없습니다:', logId);
    }
  }
});
</script>

<template>
  <div class="daily-care-page">
    <main class="main-content">

      <div class="sub-tabs">
        <button
          v-for="tab in subTabs"
          :key="tab.key"
          class="sub-tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'write'" class="write-section">
          <CareLogForm :initialData="scheduleData" @submit="handleCareLogSubmit" />
        </div>

        <div v-else class="history-section">
          <div class="history-header">
            <h2 class="history-title">요양일지 작성내역</h2>
            <p class="history-count">총 {{ careLogHistory.length }}건의 일지가 등록되어 있습니다</p>
          </div>

          <div class="history-list">
            <div v-for="item in careLogHistory" :key="item.id" class="care-log-card" @click="openDetail(item)">
              <div class="card-left">
                <div class="card-header-section">
                  <h3 class="recipient-name">{{ item.recipientName }}</h3>
                  <span class="status-badge">{{ item.status }}</span>
                </div>
                <p class="service-date">{{ item.date }}</p>
              </div>

              <div class="card-divider"></div>

              <div class="card-right">
                <div class="info-row">
                  <span class="info-label">⏰</span>
                  <span class="info-value">{{ item.time }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📍</span>
                  <span class="info-value">{{ item.address }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🏥</span>
                  <span class="info-value">{{ item.serviceType }}</span>
                </div>
                <div v-if="item.specialNotes" class="special-notes-section">
                  <span class="notes-label">특이사항</span>
                  <p class="notes-content">{{ item.specialNotes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="showDetailModal && selectedLog"
      class="log-modal-overlay"
      @click.self="closeModal"
    >
      <div class="log-modal-card">
        <div class="log-modal-header">
          <div>
            <p class="log-modal-subtitle">활동일지</p>
            <h3 class="log-modal-title">
              {{ isEditMode ? '활동일지 수정' : '활동일지 상세보기' }}
            </h3>
          </div>
          <button class="log-close-btn" @click="closeModal">×</button>
        </div>

        <div class="log-modal-body">
          <CareLogForm
            :initialData="selectedLog"
            :readOnly="!isEditMode"
            :hideActions="!isEditMode"
            @submit="handleCareLogUpdate"
          />
        </div>

        <div class="log-modal-footer">
          <button class="btn-secondary" @click="closeModal">닫기</button>
          <template v-if="!isEditMode">
            <button class="btn-secondary" @click="openEdit(selectedLog)">수정</button>
            <button class="btn-danger" @click="deleteLog(selectedLog.id)">삭제</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 페이지 전체 컨테이너: 부모 크기에 맞춤 */
.daily-care-page {
  background-color: transparent; /* 변경: 투명 */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 메인 컨텐츠 영역: 제한 해제 및 여백 제거 */
.main-content {
  flex: 1;
  width: 100%;
  max-width: none; /* 변경: 제한 해제 */
  margin: 0;      /* 변경: 마진 제거 */
  padding: 0;     /* 변경: 패딩 제거 (부모 패딩 사용) */
  padding-bottom: 3rem;
}

/* 서브 탭 */
.sub-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.sub-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.sub-tab-btn:hover {
  color: #16a34a;
  background: #f0fdf4;
}

.sub-tab-btn.active {
  color: #16a34a;
  border-bottom-color: #16a34a;
  background: #f0fdf4;
}

.tab-icon {
  font-size: 1.125rem;
}

/* 탭 컨텐츠 */
.tab-content {
  min-height: 400px;
}

/* 작성 내역 섹션 */
.history-section {
  padding: 0;
}

.history-header {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.history-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.history-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 요양일지 카드 - 가로로 길게 */
.care-log-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  display: flex;
  gap: 2rem;
  align-items: stretch;
}

.care-log-card:hover {
  border-color: #16a34a;
  box-shadow: 0 8px 24px rgba(22, 163, 74, 0.12);
  transform: translateY(-3px);
}

/* 카드 왼쪽 영역 */
.card-left {
  flex-shrink: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-header-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipient-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  width: fit-content;
}

.service-date {
  font-size: 0.9375rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
}

/* 카드 구분선 */
.card-divider {
  width: 2px;
  background: linear-gradient(to bottom, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
  flex-shrink: 0;
}

/* 카드 오른쪽 영역 */
.card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info-label {
  font-size: 1.125rem;
  flex-shrink: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-value {
  font-size: 0.9375rem;
  color: #374151;
  font-weight: 500;
  line-height: 1.5;
}

/* 특이사항 섹션 */
.special-notes-section {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px dashed #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notes-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #16a34a;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.notes-content {
  font-size: 0.9375rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  background: #f9fafb;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid #16a34a;
}

/* 카드 헤더 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.recipient-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.recipient-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recipient-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.service-date {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.approved {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.resubmit {
  background: #fef3c7;
  color: #d97706;
}

/* 시간 및 위치 */
.card-time-location {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-icon {
  font-size: 1rem;
}

.info-text {
  font-size: 0.875rem;
  color: #4b5563;
}

.card-services {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* 서비스 태그 */
.service-tag {
  padding: 0.375rem 0.75rem;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #bbf7d0;
}

/* 특이사항 */
.card-notes {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.notes-icon {
  font-size: 1rem;
}

.notes-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #92400e;
}

.notes-content {
  font-size: 0.875rem;
  color: #78350f;
  margin: 0;
  line-height: 1.5;
}

/* 액션 버튼 */
.card-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.card-actions button {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-detail {
  background: #3b82f6;
  color: white;
}

.btn-detail:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-edit {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-edit:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.log-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 2000;
}

.log-modal-card {
  width: min(1200px, 95%);
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.log-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.log-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #166534;
}

.log-modal-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: #16a34a;
  font-weight: 700;
}

.log-close-btn {
  border: none;
  background: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.log-close-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.log-modal-body {
  padding: 0;
  max-height: 75vh;
  overflow-y: auto;
}

/* CareLogForm 내부에서 자체 padding을 관리하므로 추가 padding 제거 */
.log-modal-body .care-log-form {
  padding: 1.5rem;
}

/* Edit form 영역은 padding 필요 */
.log-modal-body .edit-form-grid {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-row {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.detail-label {
  font-size: 0.8125rem;
  color: #6b7280;
  font-weight: 700;
}

.detail-value {
  font-size: 0.95rem;
  color: #111827;
  font-weight: 600;
  line-height: 1.5;
}

.detail-value.multiline {
  white-space: pre-wrap;
}

.service-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.service-chip {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 700;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 999px;
  font-weight: 700;
  width: fit-content;
}

.edit-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.9rem;
}

.edit-field.full {
  grid-column: 1 / -1;
}

.edit-label {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #374151;
}

.edit-field input,
.edit-field textarea {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.9375rem;
}

.edit-field textarea {
  resize: vertical;
}

.input-hint {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.log-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.25rem;
  border-radius: 0.65rem;
  font-weight: 700;
  font-size: 0.9375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .sub-tabs {
    flex-direction: column;
    border-bottom: none;
  }

  .sub-tab-btn {
    border-bottom: none;
    border-left: 3px solid transparent;
  }

  .sub-tab-btn.active {
    border-left-color: #16a34a;
    border-bottom-color: transparent;
  }

  .history-header {
    padding: 1rem;
  }

  .history-title {
    font-size: 1.125rem;
  }

  .history-count {
    font-size: 0.8125rem;
  }

  .care-log-card {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .status-badge {
    align-self: flex-start;
  }

  .avatar-circle {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .recipient-name {
    font-size: 1rem;
  }

  .card-notes {
    padding: 0.75rem;
  }

  .notes-label {
    font-size: 0.75rem;
  }

  .notes-content {
    font-size: 0.8125rem;
  }

  .card-actions {
    flex-direction: column;
    width: 100%;
  }

  .card-actions button {
    width: 100%;
    justify-content: center;
  }

  .detail-grid,
  .edit-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>