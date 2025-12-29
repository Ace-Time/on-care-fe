<script setup>
import { ref, computed, watch, defineProps, defineEmits, onMounted } from 'vue';
import { cognitiveAssessment } from '@/mock/careworker/cognitiveData';
import { getMyBeneficiaries } from '@/api/careworker';
import { useUserStore } from '@/stores/user';

const props = defineProps({
  initialData: { type: Object, default: null },
  readOnly: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'save-draft']);
const userStore = useUserStore();

const beneficiaries = ref([]);
const loadingBeneficiaries = ref(false);

const loadBeneficiaries = async () => {
  try {
    loadingBeneficiaries.value = true;
    const response = await getMyBeneficiaries();
    const data = response?.data ?? response;
    beneficiaries.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('API Error:', error);
    beneficiaries.value = [];
  } finally {
    loadingBeneficiaries.value = false;
  }
};

const formData = ref({
  beneficiaryId: props.initialData?.beneficiaryId ?? 0,
  careWorkerName: props.initialData?.careWorkerName || userStore.name || '',
  assessmentDate: props.initialData?.assessmentDate || new Date().toISOString().split('T')[0],
  educationLevel: props.initialData?.educationLevel || 'MIDDLE_HIGH',
  responses: props.initialData?.responses || props.initialData?.cognitiveItems || {},
  comment: props.initialData?.comment || ''
});

// Watch for initialData changes (for edit mode)
watch(() => props.initialData, (newData) => {
  // initialData에 실제 데이터가 있을 때만 업데이트 (beneficiaryId가 있는 경우만)
  if (newData && Object.keys(newData).length > 0 && newData.beneficiaryId) {
    formData.value = {
      beneficiaryId: newData.beneficiaryId,
      careWorkerName: newData.careWorkerName || userStore.name || '',
      assessmentDate: newData.assessmentDate || formData.value.assessmentDate,
      educationLevel: newData.educationLevel || formData.value.educationLevel,
      responses: newData.responses || newData.cognitiveItems || formData.value.responses || {},
      comment: newData.comment || formData.value.comment || ''
    };
  }
}, { deep: true, immediate: true });

// 섹션별 점수 계산
const getSectionScore = (section) => {
  let score = 0;
  section.items.forEach(item => {
    const val = formData.value.responses[item.code];

    // 1. 숫자 입력 (동물 이름)
    if (item.type === 'NUMBER_INPUT') {
      const count = parseInt(val) || 0;
      const rule = item.auto_score_rule?.find(r => count >= r.min && count <= r.max);
      if (rule) score += rule.score;
    }
    // 2. O/X형 (true면 1점)
    else if (section.type === 'OX') {
      if (val === true) score += 1; // OX 타입은 각 항목당 1점
    }
    // 3. 선택형 (값 자체가 점수)
    else if (item.choices && typeof val === 'number') {
      score += val;
    }
  });

  // 환산 점수 적용
  if (section.type === 'CONVERT_SCORE' && section.convert_rule) {
    const { base_total, converted_total } = section.convert_rule;
    score = Math.round((score / base_total) * converted_total);
  }

  return Math.min(score, section.max_score);
};

// 총점
const totalScore = computed(() => {
  let total = 0;
  cognitiveAssessment.sections.forEach(sec => {
    if (sec.max_score > 0) total += getSectionScore(sec);
  });
  return total;
});

// 동물 이름 대기 현재 점수 (개별 표시용)
const getAnimalScore = (item) => {
  const count = parseInt(formData.value.responses[item.code]) || 0;
  const rule = item.auto_score_rule?.find(r => count >= r.min && count <= r.max);
  return rule ? rule.score : 0;
};

const selectedEduInfo = computed(() => {
  return cognitiveAssessment.education_levels.find(e => e.code === formData.value.educationLevel);
});

// 토글 (O/X) - 정답일 때 클릭
const toggleOX = (code) => {
  const current = formData.value.responses[code];
  formData.value.responses[code] = !current;
};

// 선택형 라디오 버튼
const setResponse = (code, value) => {
  formData.value.responses[code] = value;
};

const handleSubmit = () => {
  if (!formData.value.beneficiaryId) return alert('수급자를 선택하세요.');
  emit('submit', {
    ...formData.value,
    totalScore: totalScore.value,
    grade: totalScore.value >= (selectedEduInfo.value?.cutoff || 0) ? '정상' : '인지저하 의심'
  });
};

const handleSaveDraft = () => {
  emit('save-draft', { ...formData.value });
};

onMounted(() => {
  loadBeneficiaries();
});
</script>

<template>
  <div class="cognitive-assessment-form">
    <header class="page-header">
      <h2 class="page-title">인지기능 평가</h2>
      <p class="page-desc">연 1회 평가가 필요합니다. 평가 결과를 기록하세요.</p>
    </header>

    <section class="form-section info-section">
      <div class="info-grid">
        <div class="info-item">
          <label>평가 날짜 <span v-if="!readOnly" class="req">*</span></label>
          <input type="date" v-model="formData.assessmentDate" class="form-input" :disabled="readOnly" />
        </div>
        <div class="info-item">
          <label>수급자 <span v-if="!readOnly" class="req">*</span></label>
          <input
            v-if="readOnly"
            :value="formData.recipientName || beneficiaries.find(b => b.id === formData.beneficiaryId)?.name || '-'"
            type="text"
            disabled
            class="form-input readonly-field"
          />
          <select v-else v-model.number="formData.beneficiaryId" class="form-input">
            <option :value="0">선택하세요</option>
            <option v-for="b in beneficiaries" :key="b.beneficiaryId" :value="b.beneficiaryId">{{ b.name }}</option>
          </select>
        </div>
      </div>
    </section>

    <div class="assessment-body">
      <div class="assessment-title-box">
        <h3>인지기능 평가 척도 (CIST 기반)</h3>
      </div>

      <div class="education-section">
        <label>수급자 학력 (판정 기준 적용)</label>
        <select v-model="formData.educationLevel" class="edu-select">
          <option v-for="edu in cognitiveAssessment.education_levels" :key="edu.code" :value="edu.code">
            {{ edu.label }}
          </option>
        </select>
      </div>

      <section 
        v-for="section in cognitiveAssessment.sections" 
        :key="section.code" 
        class="question-section"
      >
        <div class="sec-header">
          <h4 class="sec-title">
            {{ section.title }} 
            <span class="max-score-text">[{{ section.max_score }}점]</span>
          </h4>
          <span v-if="section.max_score > 0" class="sec-current-score">
            {{ getSectionScore(section) }}점 <span v-if="section.type === 'CONVERT_SCORE'">(환산)</span>
          </span>
        </div>

        <div v-if="section.instruction" class="instruction-box">
          <p>{{ section.instruction }}</p>
          <p v-if="section.sub_instruction" class="sub-inst">{{ section.sub_instruction }}</p>
        </div>

        <div class="items-list">
          <div v-for="item in section.items" :key="item.code" class="q-item-row">
            
            <div class="q-text-group">
              <p class="q-question">{{ item.question }}</p>
              <p v-if="item.desc" class="q-desc">{{ item.desc }}</p>
            </div>

            <div v-if="section.type === 'OX'" class="input-area toggle-area">
              <button 
                type="button" 
                class="ox-btn"
                :class="{ active: formData.responses[item.code] === true }"
                @click="toggleOX(item.code)"
              >
                {{ formData.responses[item.code] ? '⭕ 정답 (1점)' : '❌ 오답 (0점)' }}
              </button>
            </div>

            <div v-else-if="item.type === 'NUMBER_INPUT'" class="input-area number-type">
              <span class="input-label">입력: 수급자가 말한 동물의 개수</span>
              <input type="number" v-model="formData.responses[item.code]" class="mini-input" placeholder="0" min="0" />
              <span class="unit">{{ item.unit }}</span>
              <div class="auto-calc-info">
                <p class="calc-rule">{{ item.grading_info }}</p>
                <p class="current-calc">현재 점수: <strong>{{ getAnimalScore(item) }}점</strong></p>
              </div>
            </div>

            <div v-else-if="item.choices" class="input-area radio-stack">
              <label v-for="choice in item.choices" :key="choice.label" class="radio-label full-width">
                <input type="radio" :name="item.code" :value="choice.value !== undefined ? choice.value : choice.score"
                       :checked="formData.responses[item.code] === (choice.value !== undefined ? choice.value : choice.score)"
                       @change="setResponse(item.code, choice.value !== undefined ? choice.value : choice.score)" />
                <span class="r-text">{{ choice.label }}</span>
              </label>
            </div>

          </div>
        </div>
      </section>
    </div>

    <div class="summary-box">
      <div class="summary-header">
        <span class="summary-title">합계 점수</span>
        <span class="total-score-display">{{ totalScore }} / {{ cognitiveAssessment.max_score }}점</span>
      </div>
      <div class="summary-detail">
        <span v-for="sec in cognitiveAssessment.sections" :key="sec.code">
          {{ sec.title.split(' ')[1] }} {{ getSectionScore(sec) }}점 
          <span v-if="sec.code !== 'G'">+</span>
        </span>
      </div>
    </div>

    <div class="criteria-box">
      <h4 class="criteria-title">판정 기준 (학력별 절단점)</h4>
      <div class="criteria-grid">
        <div v-for="edu in cognitiveAssessment.education_levels" :key="edu.code" 
             class="criteria-item" :class="{ active: formData.educationLevel === edu.code }">
          <span class="c-label">{{ edu.label }}</span>
          <span class="c-value">: {{ edu.range }}</span>
        </div>
      </div>
      <div class="criteria-footer">
        <p class="c-info green-text">
          {{ cognitiveAssessment.grading.description }} 
          <strong>{{ selectedEduInfo?.label }}</strong>
        </p>
        <p class="c-info gray-text">
          {{ cognitiveAssessment.grading.warning }}
        </p>
      </div>
    </div>

    <div class="comment-area">
      <label>특이사항 및 제안</label>
      <textarea v-model="formData.comment" placeholder="특이사항, 개선방안 등을 입력하세요"></textarea>
    </div>

    <div class="form-actions">
      <button class="btn-save" @click="handleSubmit">💾 저장</button>
    </div>
  </div>
</template>

<style scoped>
.cognitive-assessment-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
  color: #333;
}

/* 헤더 */
.page-header { margin-bottom: 20px; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
.page-title { font-size: 1.5rem; color: #2E7D32; margin: 0 0 5px 0; font-weight: 700; }
.page-desc { color: #666; font-size: 0.9rem; margin: 0; }
.req { color: #d32f2f; }

/* 정보 입력 */
.info-grid { display: flex; gap: 20px; margin-bottom: 20px; }
.info-item { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.info-item label { font-size: 0.85rem; font-weight: 600; color: #555; }
.form-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem; }

/* 평가 본문 컨테이너 */
.assessment-body { background: #fffbf0; border: 1px solid #ffe0b2; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
.assessment-title-box { margin-bottom: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; }
.assessment-title-box h3 { margin: 0; font-size: 1.1rem; color: #424242; }

/* 학력 선택 */
.education-section { background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #eee; margin-bottom: 20px; }
.education-section label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 0.9rem; }
.edu-select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }

/* 섹션 스타일 */
.question-section { background: #fff; border: 1px solid #eee; border-radius: 6px; margin-bottom: 15px; padding: 0; overflow: hidden; }
.sec-header { background: #fafafa; padding: 12px 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.sec-title { margin: 0; font-size: 1rem; font-weight: 600; color: #333; }
.max-score-text { color: #757575; font-weight: normal; font-size: 0.9rem; margin-left: 5px; }
.sec-current-score { background: #e8f5e9; color: #2e7d32; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; }

/* 지시문 */
.instruction-box { padding: 15px; background: #fdfdfd; border-bottom: 1px solid #eee; color: #555; font-size: 0.9rem; line-height: 1.5; }
.sub-inst { margin-top: 5px; color: #757575; font-size: 0.85rem; }

/* 문항 리스트 */
.items-list { padding: 15px; }
.q-item-row { margin-bottom: 20px; border-bottom: 1px dashed #eee; padding-bottom: 15px; }
.q-item-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
.q-question { font-weight: 500; font-size: 0.95rem; margin-bottom: 5px; color: #424242; }
.q-desc { font-size: 0.85rem; color: #757575; margin-bottom: 10px; }

/* 입력 영역 공통 */
.input-area { margin-top: 8px; }

/* 토글 버튼 (정답일때 누름) */
.toggle-area { display: flex; justify-content: flex-end; }
.ox-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: #555;
  transition: all 0.2s;
  min-width: 100px;
}
.ox-btn.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

/* 숫자 입력형 */
.number-type { background: #f9f9f9; padding: 10px; border-radius: 4px; border: 1px solid #eee; }
.input-label { margin-right: 10px; font-size: 0.9rem; }
.mini-input { width: 60px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px; margin-right: 5px; }
.auto-calc-info { margin-top: 8px; font-size: 0.8rem; color: #757575; }
.current-calc { margin-top: 4px; color: #2e7d32; }

/* 선택형 (라디오 스택) */
.radio-stack { display: flex; flex-direction: column; gap: 8px; }
.radio-label { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.9rem; color: #555; }
.radio-label:hover { color: #2e7d32; }
.radio-label input[type="radio"] { accent-color: #4caf50; width: 16px; height: 16px; }

/* 결과 요약 (Green Box) */
.summary-box { background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 15px 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
.summary-header { display: flex; justify-content: space-between; align-items: center; }
.summary-title { font-weight: 700; color: #1b5e20; font-size: 1.1rem; }
.total-score-display { font-size: 1.5rem; font-weight: 800; color: #2e7d32; }
.summary-detail { font-size: 0.8rem; color: #555; text-align: right; }

/* 판정 기준표 */
.criteria-box { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
.criteria-title { font-size: 0.95rem; margin-bottom: 10px; color: #333; }
.criteria-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; }
.criteria-item { background: #f9f9f9; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; border: 1px solid #eee; color: #555; }
.criteria-item.active { background: #e3f2fd; border-color: #2196f3; color: #0d47a1; font-weight: 600; }
.criteria-footer { font-size: 0.85rem; border-top: 1px solid #eee; padding-top: 10px; }
.green-text { color: #2e7d32; margin-bottom: 4px; }
.gray-text { color: #757575; }

/* 코멘트 */
.comment-area { margin-bottom: 20px; }
.comment-area label { font-weight: 600; font-size: 0.9rem; margin-bottom: 5px; display: block; }
.comment-area textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; min-height: 80px; resize: vertical; }

/* 버튼 */
.form-actions { display: flex; justify-content: flex-end; }
.btn-save { background: #4caf50; color: white; border: none; padding: 10px 25px; border-radius: 4px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-save:hover { background: #43a047; }

@media (max-width: 768px) {
  .info-grid { flex-direction: column; gap: 10px; }
  .sec-header { flex-direction: column; align-items: flex-start; gap: 5px; }
  .criteria-grid { grid-template-columns: 1fr; }
}
</style>