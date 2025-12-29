<script setup>
import { ref, computed, watch, defineProps, defineEmits, onMounted } from 'vue';
// 1. Mock 데이터 임포트 (컴포넌트 내부에 데이터를 정의하지 않음)
import { bedsoreAssessment } from '@/mock/careworker/bedsoreData';
import { getMyBeneficiaries } from '@/api/careworker';
import { useUserStore } from '@/stores/user';

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['submit', 'save-draft']);

// User store
const userStore = useUserStore();

// 담당 수급자 목록 상태
const beneficiaries = ref([]);
const loadingBeneficiaries = ref(false);

// 담당 수급자 목록 불러오기
const loadBeneficiaries = async () => {
  try {
    loadingBeneficiaries.value = true;
    const response = await getMyBeneficiaries();
    const data = response?.data ?? response;
    beneficiaries.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ 담당 수급자 목록 불러오기 실패:', error);
    beneficiaries.value = [];
  } finally {
    loadingBeneficiaries.value = false;
  }
};

// Form data 초기화
const formData = ref({
  beneficiaryId: props.initialData?.beneficiaryId ?? 0,
  recipientName: props.initialData?.recipientName || '',
  careWorkerName: props.initialData?.careWorkerName || userStore.name || '',
  assessmentDate: props.initialData?.assessmentDate || new Date().toISOString().split('T')[0],
  bedsoreRisk: props.initialData?.bedsoreRisk || {},
  comment: props.initialData?.comment || ''
});

// Watch for initialData changes (for edit mode)
watch(() => props.initialData, (newData) => {
  // initialData에 실제 데이터가 있을 때만 업데이트 (beneficiaryId가 있는 경우만)
  if (newData && Object.keys(newData).length > 0 && newData.beneficiaryId) {
    formData.value = {
      beneficiaryId: newData.beneficiaryId,
      recipientName: newData.recipientName || formData.value.recipientName,
      careWorkerName: newData.careWorkerName || userStore.name || '',
      assessmentDate: newData.assessmentDate || formData.value.assessmentDate,
      bedsoreRisk: newData.bedsoreRisk || formData.value.bedsoreRisk || {},
      comment: newData.comment || formData.value.comment || ''
    };
  }
}, { deep: true, immediate: true });

// 욕창위험도 점수 계산 (Computed)
const totalBedsoreScore = computed(() => {
  let total = 0;
  if (formData.value.bedsoreRisk) {
    Object.values(formData.value.bedsoreRisk).forEach(score => {
      const num = Number(score);
      if (!isNaN(num)) total += num;
    });
  }
  return total;
});

// 욕창위험도 등급 판정 (Computed)
const bedsoreGrade = computed(() => {
  const score = totalBedsoreScore.value;
  const ranges = bedsoreAssessment.grading.ranges;
  
  // 점수 범위에 맞는 등급 찾기
  const grade = ranges.find(r => score >= r.min && score <= r.max);
  
  // 범위에 없으면(예외) 마지막 등급(가장 위험하거나 기본값) 반환
  return grade || ranges[ranges.length - 1];
});

// 점수 범위 텍스트 포맷팅 (예: 19점 ~ 23점)
const formatRange = (min, max) => {
  if (min === 0) return `${max}점 이하`;
  if (max >= 99) return `${min}점 이상`;
  return `${min}점 ~ ${max}점`;
};

// 항목 선택 함수
const selectBedsoreRisk = (itemCode, choice) => {
  if (!choice) return; // choice가 null이면(빈 칸) 실행 안 함
  formData.value.bedsoreRisk[itemCode] = choice.score;
};

// 선택된 항목인지 확인
const isSelected = (itemCode, score) => {
  return formData.value.bedsoreRisk?.[itemCode] === score;
};

// 폼 제출 핸들러
const handleSubmit = () => {
  // 1. 필수값 검증
  if (!formData.value.beneficiaryId) {
    alert('수급자를 선택해주세요.');
    return;
  }
  if (!formData.value.careWorkerName) {
    alert('작성자명을 입력해주세요.');
    return;
  }
  
  // 2. 모든 항목 평가 여부 검증
  const requiredCount = bedsoreAssessment.items.length;
  const selectedCount = Object.keys(formData.value.bedsoreRisk).length;

  if (selectedCount < requiredCount) {
    alert('모든 평가 항목을 선택해주세요.');
    return;
  }

  emit('submit', {
    ...formData.value,
    totalScore: totalBedsoreScore.value,
    grade: bedsoreGrade.value.label
  });
};

// 임시저장 핸들러
const handleSaveDraft = () => {
  emit('save-draft', {
    ...formData.value,
    totalScore: totalBedsoreScore.value,
    grade: bedsoreGrade.value.label
  });
};

// 마운트 시 실행
onMounted(() => {
  loadBeneficiaries();
});
</script>

<template>
  <div class="bedsore-assessment-form">
    <section class="form-section basic-info">
      <div class="section-header">
        <h2>{{ bedsoreAssessment.title }}</h2>
        <p class="section-desc">욕창 발생 위험도를 평가하여 예방 관리 계획을 수립합니다.</p>
      </div>

      <div class="info-grid">
        <div class="info-row">
          <label>수급자명 <span v-if="!readOnly" class="required">*</span></label>
          <input
            v-if="readOnly"
            v-model="formData.recipientName"
            type="text"
            disabled
            class="readonly-field"
          />
          <select v-else v-model.number="formData.beneficiaryId" :disabled="loadingBeneficiaries">
            <option :value="0">{{ loadingBeneficiaries ? '불러오는 중...' : '선택하세요' }}</option>
            <option v-for="b in beneficiaries" :key="b.beneficiaryId" :value="b.beneficiaryId">{{ b.name }}</option>
          </select>
        </div>
        <div class="info-row">
          <label>작성자명 <span v-if="!readOnly" class="required">*</span></label>
          <input v-model="formData.careWorkerName" type="text" placeholder="입력하세요" :disabled="readOnly" />
        </div>
        <div class="info-row">
          <label>평가일</label>
          <input v-model="formData.assessmentDate" type="date" :disabled="readOnly" />
        </div>
      </div>
    </section>

    <section class="form-section bedsore-section">
      <h3 class="section-title">평가 항목</h3>

      <div class="bedsore-table">
        <div class="table-header">
          <div class="header-label">평가항목</div>
          <div class="header-scores">
            <div
              v-for="col in bedsoreAssessment.columns"
              :key="col.score"
              class="score-col"
            >
              {{ col.label }}
            </div>
          </div>
        </div>

        <div
          v-for="item in bedsoreAssessment.items"
          :key="item.code"
          class="table-row"
        >
          <div class="row-label">
            {{ item.label }} <span class="required">*</span>
          </div>
          
          <div class="row-choices">
            <div 
              v-for="(choice, index) in item.choices" 
              :key="index" 
              class="choice-cell"
              :class="{ 
                'empty-cell': !choice, 
                active: choice && isSelected(item.code, choice.score) 
              }"
              @click="selectBedsoreRisk(item.code, choice)"
            >
              <template v-if="choice">
                <input 
                  type="radio" 
                  :name="`bedsore-${item.code}`" 
                  :value="choice.score"
                  :checked="isSelected(item.code, choice.score)"
                />
                <span class="choice-text">{{ choice.label }}</span>
              </template>
            </div>
          </div>
        </div>

        <div class="table-result-row">
          <div class="total-label">합계 점수</div>
          <div class="total-value">{{ totalBedsoreScore }}점</div>
        </div>
      </div>

      <div class="grading-criteria-box" :style="{ borderColor: bedsoreGrade.border }">
        <h4 class="criteria-title">점수 판정 기준</h4>
        
        <div class="criteria-table">
          <div class="c-head">
            <div class="c-col">점수</div>
            <div class="c-col">평가</div>
          </div>
          <div class="c-body">
            <div v-for="(range, idx) in bedsoreAssessment.grading.ranges" :key="idx" class="c-row">
              <div class="c-col">{{ formatRange(range.min, range.max) }}</div>
              <div class="c-col">{{ range.label }}</div>
            </div>
          </div>
        </div>

        <div class="current-eval-banner" :style="{ backgroundColor: bedsoreGrade.bg }">
          <span class="banner-label">현재 평가:</span>
          <span 
            class="banner-result-badge"
            :class="bedsoreGrade.badgeClass"
            :style="{ 
               backgroundColor: bedsoreGrade.badgeClass ? '' : (bedsoreGrade.color === 'yellow' ? '#fefcbf' : '#fff'),
               color: bedsoreGrade.color === 'yellow' ? '#744210' : bedsoreGrade.color 
            }"
          >
            {{ totalBedsoreScore }}점 - {{ bedsoreGrade.label }}
          </span>
        </div>
      </div>

      <div v-if="bedsoreAssessment.grading.comment_field" class="comment-section">
        <label>특이사항 및 예방 관리 계획</label>
        <textarea
          v-model="formData.comment"
          placeholder="욕창 위험 요인, 예방 조치 사항, 관리 계획 등을 기록해주세요."
          rows="5"
        ></textarea>
      </div>
    </section>

    <div class="form-actions">
      <button type="button" class="btn-secondary" @click="handleSaveDraft">
        임시저장
      </button>
      <button type="button" class="btn-primary" @click="handleSubmit">
        제출하기
      </button>
    </div>
  </div>
</template>

<style scoped>
.bedsore-assessment-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 섹션 공통 */
.form-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 0.5rem;
}

.section-desc {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #7c3aed; /* 욕창은 보라색 테마 사용 */
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ede9fe;
}

.required { color: #ef4444; margin-left: 0.25rem; }

/* 기본 정보 그리드 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.info-row { display: flex; flex-direction: column; gap: 0.5rem; }
.info-row label { font-weight: 600; color: #4b5563; font-size: 0.875rem; }
.info-row input, .info-row select {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
}
.info-row input:focus, .info-row select:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

/* 테이블 스타일 */
.bedsore-section { background: #faf5ff; /* 연한 보라 배경 */ }
.bedsore-table {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.table-header {
  display: grid;
  grid-template-columns: 200px 1fr;
  background: #f3f4f6;
  border-bottom: 1px solid #d1d5db;
}

.header-label {
  padding: 1rem;
  font-weight: 700;
  color: #1f2937;
  border-right: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-scores {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4점까지 있으므로 4등분 */
}

.score-col {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #4b5563;
  border-right: 1px solid #e5e7eb;
}
.score-col:last-child { border-right: none; }

.table-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}
.table-row:last-child { border-bottom: none; }

.row-label {
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  border-right: 1px solid #d1d5db;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  background-color: #f9fafb;
}

.row-choices {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.choice-cell {
  padding: 1rem;
  border-right: 1px solid #e5e7eb;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}
.choice-cell:last-child { border-right: none; }

.choice-cell.empty-cell {
  cursor: default;
  background-color: #fafafa;
}
.choice-cell:not(.empty-cell):hover { background: #faf5ff; }

.choice-cell.active {
  background: #ede9fe;
  border-color: #7c3aed;
}

.choice-cell input[type="radio"] { cursor: pointer; accent-color: #7c3aed; }
.choice-text { font-size: 0.8125rem; color: #374151; line-height: 1.4; flex: 1; }

.table-result-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f3f4f6;
  border-top: 2px solid #d1d5db;
  gap: 1rem;
}
.total-label { font-size: 1rem; font-weight: 600; color: #4b5563; }
.total-value { font-size: 1.25rem; font-weight: 800; color: #7c3aed; }

/* 점수 판정 기준 및 배너 */
.grading-criteria-box {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background: white;
  transition: border-color 0.3s;
}

.criteria-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 1rem;
}

.criteria-table {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.c-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #4b5563;
  text-align: center;
}

.c-body .c-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}
.c-row:last-child { border-bottom: none; }
.c-col { padding: 0.75rem; border-right: 1px solid #e5e7eb; }
.c-col:last-child { border-right: none; }

.current-eval-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  background-color: #f9fafb; /* 기본 배경 */
}
.banner-label { font-weight: 600; color: #374151; }
.banner-result-badge {
  padding: 0.3rem 1rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* 배지 색상 (Mock 데이터에 badgeClass가 있다면 활용 가능, 여기선 style 바인딩으로 처리) */
.safe { background-color: #c6f6d5; color: #22543d; }
.caution { background-color: #fefcbf; color: #744210; }
.danger { background-color: #fed7d7; color: #822727; }

/* 특이사항 */
.comment-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
}
.comment-section textarea:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

/* 버튼 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}
.btn-primary {
  background: #7c3aed;
  color: white;
  padding: 0.875rem 2.5rem;
  border-radius: 0.5rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
}
.btn-primary:hover { background: #6d28d9; }
.btn-secondary {
  background: white;
  color: #4b5563;
  padding: 0.875rem 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  font-weight: 700;
  cursor: pointer;
}
.btn-secondary:hover { background: #f9fafb; }

@media (max-width: 768px) {
  .info-grid, .table-header, .table-row { grid-template-columns: 1fr; }
  .header-label, .row-label { border-right: none; border-bottom: 1px solid #d1d5db; }
  .row-choices { grid-template-columns: repeat(4, 1fr); }
  .choice-cell { flex-direction: column; text-align: center; padding: 0.5rem; }
  .choice-text { font-size: 0.75rem; }
  .current-eval-banner { flex-direction: column; gap: 0.5rem; text-align: center; }
}
</style>