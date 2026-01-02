<template>
  <div class="advanced-info-container" ref="rootRef">
    <div class="step-title">3단계 : 사전 정보 등록</div>

    <div class="info-card">
      <div class="card-title">수급자 정보</div>
      <div class="input-grid">
        <div class="input-group">
          <label class="label">이름 <span class="required">*</span></label>
          <input type="text" class="input-field" v-model="form.name" />
        </div>
        <div class="input-group">
          <label class="label">생년월일</label>
          <input type="text" class="input-field" placeholder="YYYY-MM-DD" v-model="form.birthdate" />
        </div>
        <div class="input-group">
          <label class="label">연락처 <span class="required">*</span></label>
          <input type="text" class="input-field" v-model="form.phone" />
        </div>
        <div class="input-group">
          <label class="label">본인부담비율 (%)</label>
          <input type="text" class="input-field" v-model="form.copayRate" />
        </div>
        <div class="input-group full-width">
          <label class="label">거주지</label>
          <input type="text" class="input-field" v-model="form.address" />
        </div>
        <div class="input-group full-width">
          <label class="label">상세 주소</label>
          <input type="text" class="input-field" v-model="form.detailAddress" />
        </div>
      </div>
    </div>

    <div class="tab-header">
      <div 
        v-for="tab in tabs" 
        :key="tab.id" 
        class="tab-item" 
        :class="{ active: currentTab === tab.id }"
        @click="currentTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="tab-content">
      
      <div v-show="currentTab === 'rental'" class="help-section">
        <div class="section-header">
          <div class="main-text">렌탈 계약 성사에 도움이 될 수 있습니다</div>
          <div class="sub-text">고객과의 렌탈 계약에 있어 도움이 될 정보입니다.</div>
        </div>
        <div class="questions-list">
          <div class="question-row border-bottom">
            <div class="q-text">렌탈 용품 대여에 있어 금액적 부분이 우선되나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.rental_cost === 'Y'" @toggle="setYesNo('rental_cost', 'Y')" />
              <CheckOption label="아니요" :checked="form.rental_cost === 'N'" @toggle="setYesNo('rental_cost', 'N')" />
            </div>
          </div>
          <div class="question-row border-bottom">
            <div class="q-text">용품 대여에 있어 보호자에게 일임하는 편인가요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.rental_delegate === 'Y'" @toggle="setYesNo('rental_delegate', 'Y')" />
              <CheckOption label="아니요" :checked="form.rental_delegate === 'N'" @toggle="setYesNo('rental_delegate', 'N')" />
            </div>
          </div>
          <div class="question-row border-bottom">
            <div class="q-text">현재 기구의 도움 없이 거동이 힘드신 편인가요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.mobility_help === 'Y'" @toggle="setYesNo('mobility_help', 'Y')" />
              <CheckOption label="아니요" :checked="form.mobility_help === 'N'" @toggle="setYesNo('mobility_help', 'N')" />
            </div>
          </div>
          <div class="question-row border-bottom">
            <div class="q-text">현재 기구의 도움 없이 목욕이 힘드신 편인가요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.bath_help === 'Y'" @toggle="setYesNo('bath_help', 'Y')" />
              <CheckOption label="아니요" :checked="form.bath_help === 'N'" @toggle="setYesNo('bath_help', 'N')" />
            </div>
          </div>
          <div class="question-row">
            <div class="q-text">렌탈 용품에 있어 보편적인 상품을 선호하나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.rental_preference === 'Y'" @toggle="setYesNo('rental_preference', 'Y')" />
              <CheckOption label="아니요" :checked="form.rental_preference === 'N'" @toggle="setYesNo('rental_preference', 'N')" />
            </div>
          </div>
        </div>
      </div>

      <div v-show="currentTab === 'matching'" class="help-section">
        <div class="section-header">
          <div class="main-text">수급자 매칭에 도움이 될 수 있습니다.</div>
          <div class="sub-text">고객과 요양보호사의 최적 매칭을 위한 정보입니다</div>
        </div>
        
        <div class="question-row border-bottom">
          <div class="q-text">매치 태그</div>
          <div class="options-list">
            <CheckOption 
              v-for="tag in matchTags" 
              :key="tag" 
              :label="tag" 
              :checked="form.selectedMatchTags.includes(tag)"
              @toggle="toggleMultiSelect('selectedMatchTags', tag)"
            />
          </div>
        </div>

        <div class="question-row border-bottom">
          <div class="q-text">위험요소 수집</div>
          <div class="options-list">
            <CheckOption 
              v-for="risk in riskFactors" 
              :key="risk" 
              :label="risk" 
              :checked="form.selectedRisks.includes(risk)"
              @toggle="toggleMultiSelect('selectedRisks', risk)"
            />
          </div>
        </div>

        <div class="question-row">
          <div class="q-text">어떤 서비스를 희망하시나요?</div>
          <div class="options-list">
            <CheckOption label="방문목욕" :checked="form.wantedServices.includes('방문목욕')" @toggle="toggleMultiSelect('wantedServices', '방문목욕')" />
            <CheckOption label="방문간호" :checked="form.wantedServices.includes('방문간호')" @toggle="toggleMultiSelect('wantedServices', '방문간호')" />
            <CheckOption label="방문요양" :checked="form.wantedServices.includes('방문요양')" @toggle="toggleMultiSelect('wantedServices', '방문요양')" />
          </div>
        </div>
      </div>

      <div v-show="currentTab === 'inquiry'" class="help-section">
        <div class="section-header">
          <div class="main-text">문의 해결에 도움이 될 수 있습니다.</div>
          <div class="sub-text">차후 고객에게 문의가 들어왔을 경우 도움이 될 수 있습니다.</div>
        </div>
        <div class="questions-list">
          <div class="question-row border-bottom">
            <div class="q-text">전화보다 문자를 통한 소통을 선호하시나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.comm_text === 'Y'" @toggle="setYesNo('comm_text', 'Y')" />
              <CheckOption label="아니요" :checked="form.comm_text === 'N'" @toggle="setYesNo('comm_text', 'N')" />
            </div>
          </div>
          <div class="question-row">
            <div class="q-text">정기적인 연락을 중요시하나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.comm_regular === 'Y'" @toggle="setYesNo('comm_regular', 'Y')" />
              <CheckOption label="아니요" :checked="form.comm_regular === 'N'" @toggle="setYesNo('comm_regular', 'N')" />
            </div>
          </div>
        </div>
      </div>

      <div v-show="currentTab === 'complain'" class="help-section">
        <div class="section-header">
          <div class="main-text">고객 컴플레인 해결에 도움이 될 수 있습니다.</div>
          <div class="sub-text">컴플레인 대응에 있어 도움이 될 만한 정보입니다</div>
        </div>
        <div class="questions-list">
          <div class="question-row border-bottom">
            <div class="q-text">요양 보호사의 잦은 변동에 우려를 갖고 있나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.complain_change === 'Y'" @toggle="setYesNo('complain_change', 'Y')" />
              <CheckOption label="아니요" :checked="form.complain_change === 'N'" @toggle="setYesNo('complain_change', 'N')" />
            </div>
          </div>
          <div class="question-row border-bottom">
            <div class="q-text">서비스 제공에 있어 요양사와의 성격이 우선되나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.complain_personality === 'Y'" @toggle="setYesNo('complain_personality', 'Y')" />
              <CheckOption label="아니요" :checked="form.complain_personality === 'N'" @toggle="setYesNo('complain_personality', 'N')" />
            </div>
          </div>
          <div class="question-row">
            <div class="q-text">서비스 제공에 있어 금액적 요소가 우선되나요?</div>
            <div class="yes-no-group">
              <CheckOption label="예" :checked="form.complain_cost === 'Y'" @toggle="setYesNo('complain_cost', 'Y')" />
              <CheckOption label="아니요" :checked="form.complain_cost === 'N'" @toggle="setYesNo('complain_cost', 'N')" />
            </div>
          </div>
        </div>
      </div>

      <div v-show="currentTab === 'terminate'" class="help-section">
        <div class="section-header">
          <div class="main-text">고객 해지 상담에 도움이 될 수 있습니다.</div>
          <div class="sub-text">고객의 어려움을 도울 수 있는 정보입니다.</div>
        </div>
        <div class="question-row">
          <div class="q-text">서비스 사용에 있어 금전적 어려움이 있나요?</div>
          <div class="yes-no-group">
            <CheckOption label="예" :checked="form.terminate_cost === 'Y'" @toggle="setYesNo('terminate_cost', 'Y')" />
            <CheckOption label="아니요" :checked="form.terminate_cost === 'N'" @toggle="setYesNo('terminate_cost', 'N')" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { defineComponent, h, reactive, ref, onMounted } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
});

const rootRef = ref(null);

// --- 탭 설정 ---
const currentTab = ref('rental');
const tabs = [
  { id: 'rental', label: '렌탈성사도움' },
  { id: 'matching', label: '매칭도움' },
  { id: 'inquiry', label: '문의해결도움' },
  { id: 'complain', label: '컴플레인해결도움' },
  { id: 'terminate', label: '해지상담도움' }
];

const matchTags = ['말벗', '산책', '음악', '영화', '게임', '서예', '요리'];
const riskFactors = ['뇌졸증', '치매', '거동불편', '당뇨', '고혈압', '공격성', '몽유병', '낙상위험', '욕창위험'];

// --- 통합 폼 데이터 ---
const form = reactive({
  // 기본 정보
  name: '김수급자',
  birthdate: '',
  phone: '010-7829-3354',
  copayRate: '15',
  address: '강남구 테헤란로',
  detailAddress: '101동 1001호',

  // Yes/No 문항들
  rental_cost: null,
  rental_delegate: null,
  mobility_help: null,
  bath_help: null,
  rental_preference: null,
  
  comm_text: null,
  comm_regular: null,
  
  complain_change: null,
  complain_personality: null,
  complain_cost: null,
  
  terminate_cost: null,

  // 다중 선택 문항들
  selectedMatchTags: [],
  selectedRisks: [],
  wantedServices: []
});

// --- 메서드 ---
const setYesNo = (field, value) => {
  if (form[field] === value) {
    form[field] = null;
  } else {
    form[field] = value;
  }
};

const toggleMultiSelect = (fieldArrayName, item) => {
  const arr = form[fieldArrayName];
  const idx = arr.indexOf(item);
  if (idx > -1) {
    arr.splice(idx, 1);
  } else {
    arr.push(item);
  }
};

// CheckOption 컴포넌트
const CheckOption = defineComponent({
  props: ['label', 'checked'],
  emits: ['toggle'],
  setup(props, { emit }) {
    return () => h('div', 
      { 
        class: 'check-item', 
        onClick: () => emit('toggle') 
      }, 
      [
        h('div', { class: ['check-box', props.checked ? 'checked' : ''] }, [
          props.checked ? h('div', { class: 'check-mark' }) : null
        ]),
        h('span', { class: 'option-label' }, props.label)
      ]
    );
  }
});

onMounted(() => {
  if (props.initialData) {
    Object.assign(form, props.initialData);
  }
});

const getFormData = () => {
  return { ...form };
};

const getHtmlWithState = () => {
  if (!rootRef.value) return '';

  const clone = rootRef.value.cloneNode(true);
  
  // 1. input 값 시각적 동기화
  const inputs = clone.querySelectorAll('input');
  const originalInputs = rootRef.value.querySelectorAll('input');
  inputs.forEach((input, index) => {
    if (originalInputs[index]) {
       input.setAttribute('value', originalInputs[index].value);
    }
  });

  // 2. 탭 관련 UI 제거 (저장본에서는 탭을 보여줄 필요가 없거나, 
  // 혹은 모든 탭의 내용이 저장되어야 함 -> v-show를 썼으므로 모든 내용은 HTML에 포함됨)
  // 다만, 저장된 HTML을 '보기 모드'로 열었을 때는 탭 기능이 동작하지 않으므로
  // 모든 help-section을 display:block으로 강제하는 스타일을 인라인으로 추가하거나
  // 혹은 그대로 저장해도 무방함 (나중에 복원 시 activeTab 로직이 없으면 다 보일 수도 있음)
  
  // 여기서는 원본 그대로 저장하되, 숨겨진 요소(display:none)도 그대로 저장됩니다.
  // 나중에 뷰어에서 볼 때 특정 탭만 보이는 문제가 있을 수 있으므로,
  // 저장용 HTML에서는 style="display: block !important"를 help-section에 주입해주는 것이 안전합니다.
  
  const hiddenSections = clone.querySelectorAll('.help-section');
  hiddenSections.forEach(section => {
    section.style.display = 'flex'; // 강제로 보이게 처리
  });

  // 탭 헤더는 저장된 뷰에서 필요 없을 수 있으므로 제거 (선택 사항)
  const tabHeader = clone.querySelector('.tab-header');
  if (tabHeader) {
    tabHeader.remove();
  }

  const jsonState = JSON.stringify(form);
  clone.setAttribute('data-restorable-state', jsonState);

  return clone.outerHTML;
};

defineExpose({
  getFormData,
  getHtmlWithState
});
</script>

<style scoped>
/* 1. 전체 컨테이너 */
.advanced-info-container {
  width: 100%;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
}

.step-title {
  color: #111828;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  margin-left: 0;
}

/* 2. 카드 공통 스타일 */
.info-card, .help-section {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.card-title {
  color: #374151;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

/* --- 탭 스타일 --- */
.tab-header {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0;
  overflow-x: auto; /* 모바일 대응 */
}

.tab-item {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-item:hover {
  color: #374151;
}

.tab-item.active {
  color: #00A63E;
  border-bottom-color: #00A63E;
  font-weight: 600;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 3. 그리드 시스템 및 입력 필드 (기존 유지) */
.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group.full-width {
  grid-column: 1 / -1;
}

.label {
  color: #4B5563;
  font-size: 13px;
  font-weight: 500;
}

.required {
  color: #DC2626;
  margin-left: 2px;
}

.input-field {
  height: 42px;
  padding: 0 14px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field:focus {
  border-color: #00A63E;
  box-shadow: 0 0 0 3px rgba(0, 166, 62, 0.1);
}

.input-field::placeholder {
  color: #9CA3AF;
}

/* 4. 내부 섹션 스타일 */
.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 8px;
}

.main-text { color: #111828; font-size: 16px; font-weight: 600; }
.sub-text { color: #6B7280; font-size: 14px; }

.question-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
}

.question-row.border-bottom {
  border-bottom: 1px solid #F3F4F6;
  margin-bottom: 20px;
  padding-bottom: 20px;
}

.q-text { color: #374151; font-size: 15px; font-weight: 500; }

.yes-no-group { display: flex; gap: 24px; }
.options-list { display: flex; flex-direction: column; gap: 12px; }

/* Deep Selector for checkboxes */
:deep(.check-item) {
  display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none;
}

:deep(.check-box) {
  width: 18px; height: 18px; background: #FFFFFF;
  border: 1px solid #D1D5DB; border-radius: 4px;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}

:deep(.check-box.checked) {
  background: #00A63E; border-color: #00A63E;
}

:deep(.check-mark) {
  width: 5px; height: 9px; border: solid white;
  border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px;
}

:deep(.option-label) { color: #374151; font-size: 14px; }

@media (max-width: 640px) {
  .input-grid { grid-template-columns: 1fr; }
  .yes-no-group { flex-direction: column; gap: 12px; }
}
</style>