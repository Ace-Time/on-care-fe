<script setup>
import { ref, computed, watch, defineProps, defineEmits, onMounted } from 'vue';
// [수정됨] 파일명을 실제 존재하는 'needsData'로 변경
import { needsAssessment } from '@/mock/careworker/needsData';
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

// 담당 수급자 목록
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

// Form data
const formData = ref({
  beneficiaryId: props.initialData?.beneficiaryId ?? 0,
  recipientName: props.initialData?.recipientName || '',
  careWorkerName: props.initialData?.careWorkerName || userStore.name || '',
  assessmentDate: props.initialData?.assessmentDate || new Date().toISOString().split('T')[0],
  responses: props.initialData?.responses || props.initialData?.needsItems || {}, // 답변 저장: { weight: 60, diet_type: ['일반식'] }
  textResponses: props.initialData?.textResponses || {}, // 기타 텍스트 저장: { diet_type_기타: '...' }
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
      responses: newData.responses || newData.needsItems || formData.value.responses || {},
      textResponses: newData.textResponses || formData.value.textResponses || {}
    };
  }
}, { deep: true, immediate: true });

// --- 페이지네이션 (섹션 단위) ---
const currentPage = ref(1);
const sectionsPerPage = 3; // 한 페이지당 3개 섹션

const totalPages = computed(() => Math.ceil(needsAssessment.sections.length / sectionsPerPage));

const currentSections = computed(() => {
  const start = (currentPage.value - 1) * sectionsPerPage;
  const end = start + sectionsPerPage;
  return needsAssessment.sections.slice(start, end);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// --- 로직 헬퍼 함수 ---

// 체크박스 토글
const toggleCheckbox = (code, value) => {
  if (!formData.value.responses[code]) formData.value.responses[code] = [];
  
  const index = formData.value.responses[code].indexOf(value);
  if (index === -1) {
    formData.value.responses[code].push(value);
  } else {
    formData.value.responses[code].splice(index, 1);
    // 선택 해제 시 관련 텍스트도 삭제
    if (formData.value.textResponses[`${code}_${value}`]) {
      delete formData.value.textResponses[`${code}_${value}`];
    }
  }
};

// 조건부 표시 (showWhen)
const checkShowCondition = (condition) => {
  if (!condition) return true;
  // condition: { has_children: '유' } -> responses['has_children'] === '유' 인지 확인
  return Object.keys(condition).every(key => formData.value.responses[key] === condition[key]);
};

// 텍스트 입력창 표시 여부 (hasTextWhen)
const shouldShowTextInput = (item, choice) => {
  if (!item.hasTextWhen) return false;
  
  // 체크박스인 경우: 배열에 포함되어 있고, hasTextWhen 리스트에도 있을 때
  if (item.type === 'checkbox') {
    return formData.value.responses[item.code]?.includes(choice) && item.hasTextWhen.includes(choice);
  } 
  // 라디오인 경우: 값이 일치하고, hasTextWhen 리스트에도 있을 때
  else if (item.type === 'radio') {
    return formData.value.responses[item.code] === choice && item.hasTextWhen.includes(choice);
  }
  return false;
};

// 폼 제출
const handleSubmit = () => {
  if (!formData.value.beneficiaryId) {
    alert('수급자를 선택해주세요.');
    return;
  }
  if (!formData.value.careWorkerName) {
    alert('작성자명을 입력해주세요.');
    return;
  }

  emit('submit', { ...formData.value });
};

const handleSaveDraft = () => {
  emit('save-draft', { ...formData.value });
};

onMounted(() => {
  loadBeneficiaries();
});
</script>

<template>
  <div class="needs-assessment-form">
    <section class="form-section basic-info">
      <div class="section-header">
        <h2>{{ needsAssessment.title }}</h2>
        <p class="section-desc">수급자의 전반적인 상태와 욕구를 파악하고 맞춤형 서비스를 계획합니다</p>
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

    <div class="page-indicator">
      <div class="page-numbers">
        <button 
          v-for="page in totalPages" 
          :key="page" 
          class="page-dot"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>
      <span class="page-text">{{ currentPage }} / {{ totalPages }} 단계</span>
    </div>

    <section
      v-for="section in currentSections"
      :key="section.code"
      class="form-section needs-section"
    >
      <div class="sec-header">
        <span class="sec-code">{{ section.code }}</span>
        <h3 class="sec-title">{{ section.title }}</h3>
      </div>

      <div class="items-container">
        <div 
          v-for="item in section.items" 
          :key="item.code" 
          class="item-group"
          v-show="checkShowCondition(item.showWhen)"
        >
          <label v-if="item.type !== 'compound' && item.type !== 'table_radio'" class="item-label">
            {{ item.label }}
          </label>

          <div v-if="['text', 'number'].includes(item.type)" class="input-wrapper">
            <input 
              :type="item.type" 
              v-model="formData.responses[item.code]" 
              :placeholder="`${item.label} 입력`"
              class="form-input"
            />
            <span v-if="item.unit" class="unit">{{ item.unit }}</span>
          </div>

          <div v-else-if="item.type === 'textarea'" class="textarea-wrapper">
            <textarea 
              v-model="formData.responses[item.code]" 
              rows="4" 
              placeholder="내용을 입력하세요"
            ></textarea>
          </div>

          <div v-else-if="item.type === 'radio'" class="radio-group">
            <div v-for="choice in item.choices" :key="choice" class="choice-wrap">
              <label class="radio-label" :class="{ active: formData.responses[item.code] === choice }">
                <input 
                  type="radio" 
                  :name="item.code" 
                  :value="choice" 
                  v-model="formData.responses[item.code]"
                />
                {{ choice }}
              </label>
              <input 
                v-if="shouldShowTextInput(item, choice)"
                type="text" 
                v-model="formData.textResponses[`${item.code}_${choice}`]" 
                class="sub-text-input" 
                :placeholder="item.textLabel?.[choice] || '내용 입력'"
              />
            </div>
          </div>

          <div v-else-if="item.type === 'checkbox'" class="checkbox-group">
            <div v-for="choice in item.choices" :key="choice" class="choice-wrap">
              <label class="checkbox-label" :class="{ active: formData.responses[item.code]?.includes(choice) }">
                <input 
                  type="checkbox" 
                  :value="choice" 
                  :checked="formData.responses[item.code]?.includes(choice)"
                  @change="toggleCheckbox(item.code, choice)"
                />
                {{ choice }}
              </label>
              <input 
                v-if="shouldShowTextInput(item, choice)"
                type="text" 
                v-model="formData.textResponses[`${item.code}_${choice}`]" 
                class="sub-text-input" 
                :placeholder="item.textLabel?.[choice] || '내용 입력'"
              />
              <div v-if="item.subItems && formData.responses[item.code]?.includes(choice)" class="sub-items">
                <div v-for="sub in item.subItems" :key="sub.code">
                  <span v-if="sub.showWhen === choice">
                    <input type="text" v-model="formData.responses[sub.code]" :placeholder="sub.label" class="mini-input" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="item.type === 'table_radio'" class="table-wrapper">
            <table class="adl-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th v-for="col in item.columns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in item.rows" :key="row">
                  <td class="row-head">{{ row }}</td>
                  <td v-for="col in item.columns" :key="col" class="center-td">
                    <input 
                      type="radio" 
                      :name="`${item.code}_${row}`" 
                      :value="col"
                      v-model="formData.responses[`${item.code}_${row}`]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="item.type === 'compound'" class="compound-wrapper">
            <span class="compound-label">{{ item.label }}</span>
            <div class="compound-fields">
              <div 
                v-for="field in item.fields" 
                :key="field.code" 
                class="sub-field"
                v-show="checkShowCondition(field.showWhen)"
              >
                <label v-if="field.label" class="sub-label">{{ field.label }}</label>
                
                <input 
                  v-if="field.type === 'text' || field.type === 'number'"
                  :type="field.type" 
                  v-model="formData.responses[field.code]"
                  class="form-input mini"
                />
                
                <div v-else-if="field.type === 'radio'" class="radio-inline">
                  <label v-for="c in field.choices" :key="c" class="radio-label small">
                    <input type="radio" :name="field.code" :value="c" v-model="formData.responses[field.code]" />
                    {{ c }}
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <div class="nav-buttons">
      <button v-if="currentPage > 1" class="btn-nav" @click="goToPage(currentPage - 1)">← 이전</button>
      <div class="spacer"></div>
      <button v-if="currentPage < totalPages" class="btn-nav next" @click="goToPage(currentPage + 1)">다음 단계 →</button>
      
      <div v-if="currentPage === totalPages" class="submit-group">
        <button class="btn-sec" @click="handleSaveDraft">임시저장</button>
        <button class="btn-pri" @click="handleSubmit">제출하기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.needs-assessment-form {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
  color: #333;
}

/* 헤더 & 기본정보 */
.form-section { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.section-header h2 { text-align: center; color: #10b981; font-size: 1.5rem; margin-bottom: 5px; }
.section-desc { text-align: center; color: #6b7280; font-size: 0.9rem; }

.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; }
.info-row { display: flex; flex-direction: column; gap: 5px; }
.info-row label { font-size: 0.85rem; font-weight: 600; color: #4b5563; }
.info-row input, .info-row select { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }

/* 페이지 인디케이터 */
.page-indicator { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; gap: 8px; }
.page-numbers { display: flex; gap: 8px; }
.page-dot { width: 10px; height: 10px; border-radius: 50%; background: #e5e7eb; border: none; padding: 0; cursor: pointer; transition: all 0.3s; text-indent: -9999px; }
.page-dot.active { background: #10b981; transform: scale(1.2); }
.page-text { font-size: 0.85rem; color: #10b981; font-weight: 600; }

/* 섹션 스타일 */
.needs-section { border-top: 4px solid #10b981; }
.sec-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; }
.sec-code { background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem; }
.sec-title { font-size: 1.1rem; color: #374151; margin: 0; }

/* 아이템 공통 */
.item-group { margin-bottom: 20px; }
.item-label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 8px; color: #1f2937; }

/* 입력 필드 */
.input-wrapper { display: flex; align-items: center; gap: 5px; }
.form-input { padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.9rem; flex: 1; max-width: 300px; }
.unit { color: #6b7280; font-size: 0.85rem; }
.textarea-wrapper textarea { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; resize: vertical; }

/* 라디오/체크박스 */
.radio-group, .checkbox-group { display: flex; flex-wrap: wrap; gap: 10px; }
.choice-wrap { display: flex; align-items: center; gap: 5px; }
.radio-label, .checkbox-label { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 20px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; background: #fff; }
.radio-label:hover, .checkbox-label:hover { background: #f0fdf4; border-color: #10b981; }
.radio-label.active, .checkbox-label.active { background: #d1fae5; border-color: #10b981; color: #065f46; font-weight: 600; }
.radio-label input, .checkbox-label input { accent-color: #10b981; display: none; }

/* 추가 텍스트 입력 */
.sub-text-input { border: none; border-bottom: 1px solid #9ca3af; padding: 2px 5px; outline: none; font-size: 0.85rem; width: 120px; transition: border 0.2s; }
.sub-text-input:focus { border-bottom: 2px solid #10b981; }

/* 테이블 (ADL) */
.table-wrapper { overflow-x: auto; }
.adl-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.adl-table th, .adl-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: center; }
.adl-table th { background: #f9fafb; font-weight: 600; color: #374151; }
.adl-table .row-head { text-align: left; font-weight: 500; background: #fff; }
.adl-table input { accent-color: #10b981; cursor: pointer; }

/* 복합 필드 */
.compound-wrapper { background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6; }
.compound-label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 0.9rem; }
.compound-fields { display: flex; flex-wrap: wrap; gap: 15px; align-items: center; }
.sub-field { display: flex; align-items: center; gap: 6px; }
.sub-label { font-size: 0.85rem; color: #555; }
.radio-inline { display: flex; gap: 8px; }
.radio-label.small { padding: 4px 8px; font-size: 0.8rem; }
.mini { max-width: 80px; }

/* 하단 네비게이션 */
.nav-buttons { display: flex; align-items: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
.spacer { flex: 1; }
.btn-nav { padding: 10px 20px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-weight: 600; color: #4b5563; }
.btn-nav:hover { background: #f9fafb; }
.btn-nav.next { background: #10b981; color: white; border: none; }
.btn-nav.next:hover { background: #059669; }

.submit-group { display: flex; gap: 10px; }
.btn-sec { padding: 10px 20px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-pri { padding: 10px 25px; border: none; background: #10b981; color: white; border-radius: 6px; cursor: pointer; font-weight: 600; }

@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; }
  .compound-fields { flex-direction: column; align-items: flex-start; }
  .radio-group, .checkbox-group { flex-direction: column; align-items: flex-start; }
  .choice-wrap { width: 100%; }
}
</style>


