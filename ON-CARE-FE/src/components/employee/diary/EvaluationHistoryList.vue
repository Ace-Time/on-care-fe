<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from '@/stores/user';
import { Icon } from '@iconify/vue';

// 1. 각 평가 폼 컴포넌트 임포트
import FallRiskAssessmentForm from "@/components/careworker/activity/FallRiskAssessmentForm.vue";
import BedsoreAssessmentForm from "@/components/careworker/activity/BedsoreAssessmentForm.vue";
import CognitiveAssessmentForm from "@/components/careworker/activity/CognitiveAssessmentForm.vue";
import NeedsAssessmentForm from "@/components/careworker/activity/NeedsAssessmentForm.vue";

// 2. API 임포트
import {
  getFallEvaluationListByBeneficiary,
  getFallEvaluationDetail,
  getBedsoreEvaluationListByBeneficiary,
  getBedsoreEvaluationDetail,
  getCognitiveEvaluationListByBeneficiary,
  getCognitiveEvaluationDetail,
  getNeedsEvaluationListByBeneficiary,
  getNeedsEvaluationDetail,
  createFallEvaluation,
  updateFallEvaluation,
  createBedsoreEvaluation,
  updateBedsoreEvaluation,
  createCognitiveEvaluation,
  updateCognitiveEvaluation,
  createNeedsEvaluation,
  updateNeedsEvaluation,
  deleteFallEvaluation,
  deleteBedsoreEvaluation,
  deleteCognitiveEvaluation,
  deleteNeedsEvaluation,
} from '@/api/careworker';

const props = defineProps({
  beneficiaryId: {
    type: [Number, String],
    required: true
  },
  careWorkerId: {
    type: [Number, String],
    default: null
  },
  employeeName: {
    type: String,
    default: ''
  }
});

const userStore = useUserStore();

// 메인 탭 (평가 종류)
const activeCategory = ref("fallRisk");
// 서브 탭 (작성하기 / 내역)
const activeView = ref("history"); // 기본값: 내역

const evalHistory = ref([]);
const loading = ref(false);
const selectedYear = ref(new Date().getFullYear());
const yearStats = ref({});

// 평가 카테고리 정의
const categories = [
  { key: "fallRisk", label: "낙상위험도", icon: "line-md:alert", component: FallRiskAssessmentForm },
  { key: "bedsore", label: "욕창위험도", icon: "line-md:plus-square", component: BedsoreAssessmentForm },
  { key: "cognitive", label: "인지기능", icon: "line-md:lightbulb", component: CognitiveAssessmentForm },
  { key: "needs", label: "욕구사정", icon: "line-md:clipboard-list", component: NeedsAssessmentForm || null },
];

// 보기 모드 탭 정의
const viewTabs = [
  { key: "write", label: "작성하기", icon: "line-md:edit" },
  { key: "history", label: "작성 내역", icon: "line-md:document-list" },
];

const apiMap = {
  fallRisk: getFallEvaluationListByBeneficiary,
  bedsore: getBedsoreEvaluationListByBeneficiary,
  cognitive: getCognitiveEvaluationListByBeneficiary,
  needs: getNeedsEvaluationListByBeneficiary,
};

const detailApiMap = {
  fallRisk: getFallEvaluationDetail,
  bedsore: getBedsoreEvaluationDetail,
  cognitive: getCognitiveEvaluationDetail,
  needs: getNeedsEvaluationDetail,
};

const createApiMap = {
  fallRisk: createFallEvaluation,
  bedsore: createBedsoreEvaluation,
  cognitive: createCognitiveEvaluation,
  needs: createNeedsEvaluation,
};

const updateApiMap = {
  fallRisk: updateFallEvaluation,
  bedsore: updateBedsoreEvaluation,
  cognitive: updateCognitiveEvaluation,
  needs: updateNeedsEvaluation,
};

// 현재 탭 컴포넌트
const currentTabComponent = computed(() => {
  const tab = categories.find(t => t.key === activeCategory.value);
  return tab ? tab.component : null;
});

// 평가 등급 판정
const getGradeLabel = (resultGrade) => {
  if (!resultGrade) return '-';
  if (resultGrade.includes('낮음') || resultGrade.includes('정상') || resultGrade.includes('없음') || resultGrade.includes('양호')) return '낮음';
  if (resultGrade.includes('중간') || resultGrade.includes('보통') || resultGrade.includes('경계')) return '중간';
  if (resultGrade.includes('높음') || resultGrade.includes('나쁨') || resultGrade.includes('주의') || resultGrade.includes('인지저하') || resultGrade.includes('치매') || resultGrade.includes('의심')) return '높음';
  return '-';
};

// 등급별 CSS 클래스 매핑
const getGradeClass = (gradeLabel) => {
  switch (gradeLabel) {
    case '낮음': return 'grade-low';
    case '중간': return 'grade-mid';
    case '높음': return 'grade-high';
    default: return '';
  }
};

// 연도별 통계 계산
const calculateYearStats = (data) => {
  const stats = {};
  data.forEach(item => {
    const itemDate = new Date(item.evalDate || item.assessmentDate || item.evaluationDate);
    const year = itemDate.getFullYear();

    if (!stats[year]) {
      stats[year] = { count: 0, items: [] };
    }
    stats[year].count++;
    stats[year].items.push(item);
  });
  return stats;
};

const loadEvaluationHistory = async () => {
  if (!props.beneficiaryId) return;

  loading.value = true;
  evalHistory.value = [];
  yearStats.value = {};

  try {
    const currentApi = apiMap[activeCategory.value];
    if (!currentApi) return;

    // ByBeneficiary API expects beneficiaryId
    const response = await currentApi(props.beneficiaryId);
    const data = response?.data ?? response;

    const formattedData = (data || []).map(item => {
      let totalScore = item.totalScore ?? 0;
      let resultGrade = item.resultGrade || '-';

      // evalData 파싱 로직
      let parsedIsDraft = false;
      if (item.evalData) {
        try {
          const parsedData = typeof item.evalData === 'string' ? JSON.parse(item.evalData) : item.evalData;
          
          if (parsedData.isDraft) parsedIsDraft = true; 

          if (parsedData.result) {
            totalScore = parsedData.result.total_score ?? totalScore;
            resultGrade = parsedData.result.grade || resultGrade;
          }
        } catch (error) { /* Ignore */ }
      }

      const isDraft = item.isDraft === true || item.isDraft === 'true' || item.isDraft === 1 ||
                      item.is_draft === true || item.is_draft === 'true' || item.is_draft === 1 ||
                      parsedIsDraft;

      return {
        id: item.evalId || item.id,
        evalDate: item.evalDate || item.assessmentDate || item.evaluationDate,
        beneficiaryId: item.beneficiaryId,
        beneficiaryName: item.beneficiaryName || item.recipientName || '-',
        careLevel: item.careLevel || '-',
        resultGrade: resultGrade,
        gradeLabel: getGradeLabel(resultGrade),
        totalScore: totalScore,
        status: isDraft ? '임시저장' : '제출됨',
        evaluatorName: item.employeeName || item.evaluatorName || userStore.name || '-',
        comment: item.specialNote || item.comment || '',
        scoreDetails: item.scoreDetails || ''
      };
    });

    // 날짜 최신순 정렬
    formattedData.sort((a, b) => new Date(b.evalDate) - new Date(a.evalDate));

    evalHistory.value = formattedData;
    yearStats.value = calculateYearStats(formattedData);
    
    // 연도 선택 초기화
    const years = Object.keys(yearStats.value).sort((a, b) => b - a);
    if (years.length > 0 && !yearStats.value[selectedYear.value]) {
       selectedYear.value = parseInt(years[0]);
    } else if (years.length === 0) {
       selectedYear.value = new Date().getFullYear();
    }

  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const searchQuery = ref('');

const filteredByYear = computed(() => {
  if (!yearStats.value[selectedYear.value]) return [];
  let items = yearStats.value[selectedYear.value].items || [];

  if (searchQuery.value) {
    const query = searchQuery.value.trim().toLowerCase();
    items = items.filter(item => item.beneficiaryName.toLowerCase().includes(query));
  }
  
  return items;
});

const availableYears = computed(() => {
  return Object.keys(yearStats.value).sort((a, b) => b - a);
});

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = ref(15); 

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredByYear.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredByYear.value.length / itemsPerPage.value);
});

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

watch([activeCategory, selectedYear, searchQuery], () => {
  currentPage.value = 1;
});

// --- Actions ---
const createPayload = (data, isDraft = false) => {
  const commonEvalData = {
    isDraft: isDraft,
    items: {}, 
    result: {
      total_score: data.totalScore,
      grade: data.grade
    },
    comment: data.comment
  };

  if (activeCategory.value === 'fallRisk' && data.fallRisk) {
    commonEvalData.items = data.fallRisk;
  } else if (activeCategory.value === 'bedsore' && data.bedsoreRisk) {
    commonEvalData.items = data.bedsoreRisk;
  } else if (activeCategory.value === 'cognitive') {
    commonEvalData.items = data.responses || data.cognitiveItems || {};
    commonEvalData.educationLevel = data.educationLevel;
  } else if (activeCategory.value === 'needs') {
     commonEvalData.items = data.responses || {};
     commonEvalData.textResponses = data.textResponses || {};
  }

  const payload = {
    beneficiaryId: data.beneficiaryId || props.beneficiaryId, // Ensure ID
    assessmentDate: data.assessmentDate,
    evaluationDate: data.assessmentDate,
    evalDate: data.assessmentDate,
    careWorkerName: data.careWorkerName, // This might be empty if form doesn't provide it
    careWorkerId: props.careWorkerId || null, // [CHANGED] Use prop
    employeeId: userStore.userId,     
    totalScore: data.totalScore,
    resultGrade: data.grade, 
    comment: data.comment,
    isDraft: isDraft, 
    evalData: JSON.stringify(commonEvalData)
  };
  
  return payload;
};

// 중복 체크 (연 1회 제한)
const checkDuplicateEvaluation = async (beneficiaryId, year) => {
  try {
    const listApi = apiMap[activeCategory.value];
    if (!listApi) return false;

    // ByBeneficiary API
    const response = await listApi(beneficiaryId);
    const data = response?.data ?? response;
    
    if (!data || !Array.isArray(data)) return false;

    const exists = data.some(item => {
      const itemYear = new Date(item.evalDate || item.assessmentDate || item.evaluationDate).getFullYear();
      
      let isDraft = item.isDraft === true || item.isDraft === 'true' || item.isDraft === 1;
      
      if (!isDraft && item.evalData) {
         try {
            const parsed = typeof item.evalData === 'string' ? JSON.parse(item.evalData) : item.evalData;
            if (parsed.isDraft) isDraft = true;
         } catch (e) {}
      }

      return itemYear === year && !isDraft;
    });

    return exists;
  } catch (error) {
    return false; 
  }
};

const handleSubmit = async (data) => {
  try {
    const createApi = createApiMap[activeCategory.value];
    if (!createApi) {
      alert('저장 기능이 준비되지 않았습니다.');
      return;
    }

    const targetBeneficiaryId = data.beneficiaryId || props.beneficiaryId;
    const evalYear = new Date(data.assessmentDate).getFullYear();
    const isDuplicate = await checkDuplicateEvaluation(targetBeneficiaryId, evalYear);

    if (isDuplicate) {
      alert(`${evalYear}년도 해당 수급자의 평가는 이미 완료되었습니다.\n수정은 '작성 내역' 탭에서 가능합니다.`);
      return;
    }

    const payload = createPayload({ ...data, beneficiaryId: targetBeneficiaryId }, false); 
    await createApi(payload);
    alert('평가가 저장되었습니다.'); 
    activeView.value = 'history';
    await loadEvaluationHistory();
  } catch (error) {
    alert(`평가 저장 실패: ${error.message}`);
  }
};

const handleSaveDraft = async (data) => {
  try {
    const createApi = createApiMap[activeCategory.value];
    if (!createApi) {
      alert('저장 기능이 준비되지 않았습니다.');
      return;
    }

    const targetBeneficiaryId = data.beneficiaryId || props.beneficiaryId;
    const payload = createPayload({ ...data, beneficiaryId: targetBeneficiaryId }, true); 
    await createApi(payload);
    alert('임시저장 되었습니다.');
    activeView.value = 'history';
    await loadEvaluationHistory();
  } catch (error) {
    alert(`임시저장 실패: ${error.message}`);
  }
};

const showDetailModal = ref(false);
const detailItem = ref(null);
const showEditModal = ref(false);
const editItem = ref(null);

const parseDetailData = (item) => {
  let parsed = { ...item };
  parsed.recipientName = item.beneficiaryName || item.recipientName;

  if (item.evalData) {
    try {
      const evalJson = typeof item.evalData === 'string' ? JSON.parse(item.evalData) : item.evalData;
      
      if (activeCategory.value === 'fallRisk') {
        parsed.fallRisk = evalJson.items || {};
      } else if (activeCategory.value === 'bedsore') {
        parsed.bedsoreRisk = evalJson.items || {};
      } else if (activeCategory.value === 'cognitive') {
        parsed.responses = evalJson.items || {};
        parsed.educationLevel = evalJson.educationLevel || 'MIDDLE_HIGH';
      } else if (activeCategory.value === 'needs') {
        parsed.responses = evalJson.items || {};
        parsed.textResponses = evalJson.textResponses || {};
      }
      
      if (evalJson.comment) parsed.comment = evalJson.comment;
      
    } catch (e) {
      console.error('evalData 파싱 실패:', e);
    }
  }
  return parsed;
};

const openDetailModal = async (item) => {
  try {
    const detailApi = detailApiMap[activeCategory.value];
    let data = { ...item };

    if (detailApi) {
      if (!item.id) throw new Error('evalId is required');
      const response = await detailApi(item.id);
      data = response?.data ?? response;
    }

    data.id = data.id || data.evalId || item.id;
    detailItem.value = parseDetailData(data);
    showDetailModal.value = true;
  } catch (error) {
    console.error('평가 상세 조회 실패:', error);
    alert('평가 정보를 불러오는데 실패했습니다.');
  }
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  detailItem.value = null;
};

const openEditModal = async (item) => {
  try {
    const detailApi = detailApiMap[activeCategory.value];
    let data = { ...item };

    if (detailApi) {
      const targetId = item.id || (item.value && item.value.id);
      if (!targetId) throw new Error('evalId is required');
      
      const response = await detailApi(targetId);
      data = response?.data ?? response;
    }

    data.id = data.id || data.evalId || item.id;
    editItem.value = parseDetailData(data);
    showEditModal.value = true;
  } catch (error) {
    console.error('평가 수정 로딩 실패:', error);
    alert('평가 정보를 불러오는데 실패했습니다.');
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editItem.value = null;
};

const handleEditSubmit = async (formData) => {
  try {
    const updateApi = updateApiMap[activeCategory.value];
    if (!updateApi) {
      alert('수정 기능이 준비되지 않았습니다.');
      return;
    }
    
    const evalId = formData.id || (editItem.value && (editItem.value.id || editItem.value.evalId));
    if (!evalId) throw new Error('평가 ID를 찾을 수 없습니다.');

    const payload = createPayload(formData, false);
    
    // 수정 시에는 기존 ID 유지 필요? (보통 update API는 ID를 URL param으로 받음)
    await updateApi(evalId, payload);
    alert('수정되었습니다.');
    closeEditModal();
    closeDetailModal();
    await loadEvaluationHistory();
  } catch (error) {
     console.error('수정 실패:', error);
    alert('평가 수정 실패');
  }
};

const handleEditDraft = async (formData) => {
  try {
    const updateApi = updateApiMap[activeCategory.value];
    if (!updateApi) return;
    
    const evalId = formData.id || (editItem.value && (editItem.value.id || editItem.value.evalId));
    if (!evalId) throw new Error('평가 ID를 찾을 수 없습니다.');

    const payload = createPayload(formData, true);
    await updateApi(evalId, payload);
    alert('임시저장 되었습니다.');
    closeEditModal();
    closeDetailModal();
    await loadEvaluationHistory();
  } catch (error) {
    alert('평가 임시저장 수정 실패');
  }
};

const handleDelete = async (item) => {
  if (!confirm(`${item.beneficiaryName}님의 평가를 삭제하시겠습니까?`)) return;
  try {
     const deleteApis = {
      fallRisk: deleteFallEvaluation,
      bedsore: deleteBedsoreEvaluation,
      cognitive: deleteCognitiveEvaluation,
      needs: deleteNeedsEvaluation
    };
    const deleteApi = deleteApis[activeCategory.value];
    if (deleteApi) await deleteApi(item.id, userStore.userId);
    
    alert('삭제되었습니다.');
    await loadEvaluationHistory();
    closeDetailModal(); 
  } catch (error) {
    alert('삭제 실패');
  }
};

watch(() => props.beneficiaryId, loadEvaluationHistory, { immediate: true });
watch(activeCategory, loadEvaluationHistory);
watch(activeView, (newView) => {
  if (newView === 'history') loadEvaluationHistory();
});
</script>

<template>
  <div class="basic-eval-page">
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        class="category-btn"
        :class="{ active: activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        <span class="tab-icon"><Icon :icon="cat.icon" width="20" height="20" /></span>
        <span>{{ cat.label }}</span>
      </button>
    </div>

    <div class="view-tabs">
      <button
        v-for="tab in viewTabs"
        :key="tab.key"
        class="view-tab-btn"
        :class="{ active: activeView === tab.key }"
        @click="activeView = tab.key"
      >
        <span class="tab-icon"><Icon :icon="tab.icon" width="16" height="16" /></span>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <div class="content-area">
      <div v-if="activeView === 'write'" class="write-mode">
        <div class="form-container">
            <component 
            v-if="currentTabComponent"
            :is="currentTabComponent"
            :key="activeCategory"
            :initialData="{ careWorkerName: employeeName }"
            @submit="handleSubmit"
            @save-draft="handleSaveDraft"
          />
          <div v-else class="empty-state">준비 중입니다.</div>
        </div>
      </div>

      <div v-else class="history-mode">
        <div class="history-header">
          <div class="header-left">
            <h2 class="history-title">{{ categories.find(c => c.key === activeCategory)?.label }} 평가 내역</h2>
            <p class="history-count">총 {{ filteredByYear.length }}건</p>
          </div>
          
          <div class="header-controls">
            <!-- Search removed as we are in beneficiary context -->
            
            <div class="year-filter" v-if="availableYears.length > 0">
              <select v-model="selectedYear" class="year-select">
                <option v-for="year in availableYears" :key="year" :value="parseInt(year)">
                  {{ year }}년
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading-state">데이터를 불러오는 중...</div>

        <div v-else-if="filteredByYear.length > 0" class="history-list">
          <div
            v-for="item in paginatedList"
            :key="item.id"
            class="eval-row"
            @click="openDetailModal(item)"
          >
            <div class="row-col basic-info">
              <div class="info-stack">
                <span class="recipient-name">{{ item.beneficiaryName }}</span>
                
                <div class="badge-row">
                  <span 
                    class="status-badge"
                    :class="item.status === '임시저장' ? 'draft' : 'submitted'"
                  >
                    {{ item.status }}
                  </span>
                  
                  <span 
                    class="grade-badge" 
                    :class="getGradeClass(item.gradeLabel)"
                  >
                    {{ item.resultGrade }}
                  </span>
                </div>
              </div>
            </div>

            <div class="row-col date-info">
              <span class="row-date">{{ item.evalDate?.split('T')[0] }}</span>
              <span class="row-evaluator">평가자: {{ item.evaluatorName }}</span>
            </div>

            <div class="row-col score-info">
                <div v-if="activeCategory !== 'needs'" class="score-wrapper">
                  <span class="score-label">총점</span>
                  <span class="score-value">{{ item.totalScore }}점</span>
                </div>
                <div v-if="item.comment" class="comment-preview">
                  <span class="comment-icon"><Icon icon="line-md:chat" width="16" height="16" /></span>
                  <span class="comment-text">{{ item.comment }}</span>
                </div>
            </div>

            <div class="row-col action-col">
                <span class="chevron"><Icon icon="line-md:chevron-right" width="20" height="20" /></span>
            </div>
          </div>

          <!-- 페이지네이션 컨트롤 -->
          <div class="pagination-controls" v-if="totalPages > 0">
            <button 
              class="page-btn prev-btn" 
              :disabled="currentPage === 1" 
              @click="changePage(currentPage - 1)"
            >
              <Icon icon="line-md:chevron-left" width="16" height="16" />
            </button>
            
            <button 
              v-for="page in totalPages" 
              :key="page" 
              class="page-btn number-btn" 
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            
            <button 
              class="page-btn next-btn" 
              :disabled="currentPage === totalPages" 
              @click="changePage(currentPage + 1)"
            >
              <Icon icon="line-md:chevron-right" width="16" height="16" />
            </button>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>등록된 평가 내역이 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 상세 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>평가 상세 정보</h3>
          <button class="modal-close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
            <component
            v-if="currentTabComponent && detailItem"
            :is="currentTabComponent"
            :initialData="detailItem"
            :readOnly="true"
          />
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailModal">닫기</button>
          <button class="btn-secondary" @click="openEditModal(detailItem)">수정</button>
          <button class="btn-danger" @click="handleDelete(detailItem)">삭제</button>
        </div>
      </div>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content edit-modal" @click.stop>
        <div class="modal-header">
          <h3>평가 수정</h3>
          <button class="modal-close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
            <component
            v-if="currentTabComponent && editItem"
            :is="currentTabComponent"
            :initialData="editItem"
            @submit="handleEditSubmit"
            @save-draft="handleEditDraft"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-eval-page { width: 100%; display: flex; flex-direction: column; }

.category-tabs {
  display: flex; gap: 0.5rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.5rem;
}
.category-btn {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem;
  border: 1px solid #e5e7eb; background: white; color: #6b7280; border-radius: 0.75rem;
  font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.category-btn.active {
  background: #16a34a; color: white; border-color: #16a34a;
  box-shadow: 0 4px 6px rgba(22, 163, 74, 0.2);
}

.view-tabs {
  display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb;
}
.view-tab-btn {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
  border: none; background: transparent; color: #6b7280; font-weight: 600;
  font-size: 0.875rem; cursor: pointer; transition: all 0.2s; border-bottom: 3px solid transparent;
}
.view-tab-btn.active {
  color: #16a34a; border-bottom-color: #16a34a; background: #f0fdf4;
}

.history-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.header-left { display: flex; flex-direction: column; gap: 4px; }
.header-controls { display: flex; align-items: center; gap: 12px; }

.history-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.history-count {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.year-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white;
  cursor: pointer;
  color: #374151;
  outline: none;
}

.history-list {
  display: flex; flex-direction: column; gap: 12px;
}

.eval-row {
  background: white; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 16px 24px; display: grid;
  grid-template-columns: 1.2fr 1.2fr 2fr 40px;
  align-items: center; gap: 16px; transition: all 0.2s; cursor: pointer;
}

.eval-row:hover {
  border-color: #16a34a; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1); transform: translateX(4px);
}

.info-stack {
  display: flex; flex-direction: column; gap: 8px; align-items: flex-start;
}
.recipient-name { font-size: 1.1rem; font-weight: 800; color: #1f2937; margin-bottom: 2px; }

.badge-row { display: flex; gap: 6px; align-items: center; }

.grade-badge {
  display: inline-block; padding: 4px 8px; border-radius: 6px;
  font-size: 0.8rem; font-weight: 600; width: fit-content;
}
.grade-badge.grade-low { background: #dcfce7; color: #16a34a; }
.grade-badge.grade-mid { background: #fef3c7; color: #d97706; }
.grade-badge.grade-high { background: #fee2e2; color: #dc2626; }

.status-badge {
  display: inline-block; padding: 2px 8px; background: #dcfce7; color: #16a34a;
  font-size: 0.7rem; font-weight: 600; border-radius: 4px;
}
.status-badge.draft { background: #fef3c7; color: #d97706; }
.status-badge.submitted { background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; }

.date-info { display: flex; flex-direction: column; gap: 2px; }
.row-date { font-weight: 600; color: #374151; font-size: 0.95rem; }
.row-evaluator { font-size: 0.85rem; color: #6b7280; }

.score-info { display: flex; flex-direction: column; gap: 6px; }
.score-wrapper { display: flex; align-items: center; gap: 6px; }
.score-label { font-size: 0.8rem; color: #6b7280; }
.score-value { font-weight: 700; color: #16a34a; font-size: 1rem; }

.comment-preview {
  display: flex; align-items: center; gap: 6px;
  background: #f9fafb; padding: 6px 10px; border-radius: 6px;
}
.comment-icon { font-size: 0.9rem; }
.comment-text {
  font-size: 0.85rem; color: #4b5563;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;
}

.action-col { text-align: right; color: #9ca3af; font-size: 1.2rem; }

.loading-state, .empty-state {
  text-align: center; padding: 40px; color: #6b7280; background: #f9fafb; border-radius: 12px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}

.modal-content {
  background: white; width: 90%; max-width: 800px;
  height: 90vh; max-height: 900px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex; flex-direction: column; overflow: hidden;
}

.modal-header {
  padding: 20px 24px; border-bottom: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
  background: #fff;
}
.modal-header h3 { font-size: 1.25rem; font-weight: 700; color: #111; margin: 0; }

.modal-close-btn {
  background: transparent; border: none; font-size: 24px; color: #9ca3af; cursor: pointer; padding: 4px;
}

.modal-body {
  flex: 1; overflow-y: auto; padding: 24px; background: #f9fafb;
}

.modal-footer {
  padding: 16px 24px; border-top: 1px solid #e5e7eb; background: white;
  display: flex; justify-content: flex-end; gap: 8px;
}

.btn-secondary {
  padding: 8px 16px; border: 1px solid #d1d5db; background: white;
  color: #374151; border-radius: 6px; font-weight: 500; cursor: pointer;
}
.btn-secondary:hover { background: #f9fafb; }

.btn-danger {
  padding: 8px 16px; border-radius: 6px; background: #fee2e2;
  color: #dc2626; border: none; cursor: pointer; font-weight: 500;
}
.btn-danger:hover { background: #fecaca; }

/* Pagination */
.pagination-controls {
  display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 24px;
}
.page-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border: 1px solid #e5e7eb;
  background: white; border-radius: 6px; cursor: pointer; color: #4b5563;
}
.page-btn:hover:not(:disabled) { border-color: #16a34a; color: #16a34a; background: #f0fdf4; }
.page-btn.active { background: #16a34a; border-color: #16a34a; color: white; font-weight: 600; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #f9fafb; }
</style>
