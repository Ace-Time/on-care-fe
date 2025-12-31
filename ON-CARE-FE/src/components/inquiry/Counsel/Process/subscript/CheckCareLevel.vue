<template>
  <div class="care-level-container" ref="rootRef">
    <div class="step-title">2단계 : 등급 확인</div>

    <div class="care-check-box">
      <div class="text-group">
        <div class="main-text">장기 요양 등급 판정 여부</div>
        <div class="sub-text">고객이 이미 장기 요양 등급을 받았는지 확인해주세요</div>
      </div>

      <div class="selection-row">
        <div 
          class="selection-card" 
          :class="{ 'active-yes': form.hasGrade === 'yes' }"
          @click="selectOption('yes')"
        >
          <div class="card-content">
            <span class="symbol">O</span>
            <span class="label">등급 보유</span>
          </div>
        </div>

        <div 
          class="selection-card" 
          :class="{ 'active-no': form.hasGrade === 'no' }"
          @click="selectOption('no')"
        >
          <div class="card-content">
            <span class="symbol">X</span>
            <span class="label">등급 미보유</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="form.hasGrade === 'yes'" class="grade-form-container">
      <div class="form-header">
        <div class="icon-check">
          <div class="check-shape"></div>
        </div>
        <div class="header-title">등급 정보 입력</div>
      </div>

      <div class="form-body">
        
        <div class="form-group">
          <label class="input-label">장기 요양 등급 <span class="required">*</span></label>
          
          <div class="dropdown-wrapper" @click="toggleDropdown">
            <div class="input-box dropdown" :class="{ 'active': isDropdownOpen }">
              <span class="placeholder" :class="{ 'selected': form.selectedGrade }">
                {{ form.selectedGrade || '등급을 선택하세요' }}
              </span>
              <div class="arrow-down"></div>
            </div>
            
            <ul v-if="isDropdownOpen" class="dropdown-menu">
              <li 
                v-for="grade in gradeOptions" 
                :key="grade" 
                class="dropdown-item"
                @click.stop="selectGrade(grade)"
              >
                {{ grade }}
              </li>
            </ul>
          </div>
          
          <p class="helper-text">* 1등급이 가장 중증이며, 인지지원등급은 치매 환자 대상입니다</p>
        </div>

        <div class="form-group">
          <label class="input-label">장기요양등급 인정번호 <span class="required">*</span></label>
          <input 
            type="text" 
            class="input-box" 
            placeholder="인정번호를 입력하세요" 
            v-model="form.careLevelNumber"
          />
          <p class="helper-text">* 장기요양인정서에 기재된 인정번호를 입력하세요</p>
        </div>

        <div class="form-group">
          <label class="input-label">등급 인정 기간 <span class="required">*</span></label>
          
          <div class="date-row">
            <div class="date-col">
              <div class="input-box date-input-box">
                <input 
                  type="date" 
                  v-model="form.startDate" 
                  class="real-date-input"
                  required
                />
              </div>
              <span class="sub-label">시작일</span>
            </div>
            
            <div class="tilde">~</div>

            <div class="date-col">
              <div class="input-box date-input-box">
                <input 
                  type="date" 
                  v-model="form.endDate" 
                  class="real-date-input"
                  required
                />
              </div>
              <span class="sub-label">종료일</span>
            </div>
          </div>

          <p v-if="dateError" class="error-text">{{ dateError }}</p>
          <p v-else class="helper-text">* 장기 요양 등급 인정 유효기간을 입력하세요 (일반적으로 1-2년)</p>
        </div>

      </div>
    </div>

    <div v-if="form.hasGrade === 'no'" class="guide-container">
      <div class="guide-header">
        <div class="icon-warning">
          <div class="warning-mark">!</div>
        </div>
        <div class="header-title">장기 요양 등급 신청 안내</div>
      </div>

      <div class="info-card blue-border">
        <div class="card-content">
          <div class="card-title">대리인 신청 가능</div>
          <div class="card-desc">
            본인이 직접 신청하기 어려운 경우, 
            <span class="highlight">가족이나 지정된 대리인</span>이 신청할 수 있습니다. 
            대리 신청 시 위임장과 대리인 신분증이 추가로 필요합니다.
          </div>
          <div class="card-list">
            <div class="list-item"><span class="bullet"></span>대리 신청 가능 대상: 가족, 친족, 사회복지시설 종사자 등</div>
            <div class="list-item"><span class="bullet"></span>필수 서류: 위임장, 대리인 신분증 사본</div>
          </div>
        </div>
      </div>

      <div class="step-card">
        <div class="card-title">📋 신청 절차</div>
        <div class="steps-list">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-text">
              <div class="step-title-text">서류 준비</div>
              <div class="step-desc">위 필요 서류를 다운로드하고 작성합니다</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-text">
              <div class="step-title-text">공단 방문 또는 우편 신청</div>
              <div class="step-desc">가까운 공단 지사 방문 또는 우편으로 신청서 제출</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-text">
              <div class="step-title-text">방문 조사</div>
              <div class="step-desc">공단 직원이 가정 방문하여 심신 상태 조사 (약 15일 이내)</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-text">
              <div class="step-title-text">등급 판정</div>
              <div class="step-desc">등급판정위원회 심의 및 결과 통보 (약 30일 이내)</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
});

const rootRef = ref(null);

const form = reactive({
  hasGrade: null,       // 'yes' | 'no'
  selectedGrade: '',
  careLevelNumber: '',  // 인정번호
  startDate: '',
  endDate: ''
});

const isDropdownOpen = ref(false);
const dateError = ref('');
const gradeOptions = ['1등급', '2등급', '3등급', '4등급', '5등급', '인지지원등급'];

const selectOption = (value) => {
  form.hasGrade = value;
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectGrade = (grade) => {
  form.selectedGrade = grade;
  isDropdownOpen.value = false;
};

const validateDates = () => {
  if (!form.startDate || !form.endDate) {
    dateError.value = '';
    return;
  }

  const start = new Date(form.startDate);
  const end = new Date(form.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start > end) {
    dateError.value = "종료일은 시작일보다 이후여야 합니다.";
    return;
  }
  if (end < today) {
    dateError.value = "현재 기준으로 기간이 만료된 등급은 등록할 수 없습니다.";
    return;
  }
  const maxDate = new Date(start);
  maxDate.setFullYear(start.getFullYear() + 2);
  if (end > maxDate) {
    dateError.value = "등급 인정 기간은 최대 2년을 초과할 수 없습니다.";
    return;
  }
  dateError.value = '';
};

watch(() => [form.startDate, form.endDate], validateDates);

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
  const inputs = clone.querySelectorAll('input');
  const originalInputs = rootRef.value.querySelectorAll('input');
  
  inputs.forEach((input, index) => {
    if (originalInputs[index]) {
       input.setAttribute('value', originalInputs[index].value);
    }
  });

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
/* =========================================
   1. 공통 레이아웃
   ========================================= */
.care-level-container {
  width: 100%;
  height: auto;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-title {
  color: #101828;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  margin-left: 0;
}

/* =========================================
   2. 파란색 박스 (O/X 선택)
   ========================================= */
.care-check-box {
  width: 100%;
  background: #EFF6FF;
  border-radius: 12px;
  border: 1px solid #BEDBFF;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.text-group { display: flex; flex-direction: column; gap: 4px; }
.main-text { color: #101828; font-size: 16px; font-weight: 600; line-height: 24px; }
.sub-text { color: #4B5563; font-size: 14px; line-height: 20px; }

.selection-row { display: flex; gap: 16px; width: 100%; }

.selection-card {
  flex: 1; 
  height: 84px;
  background: white;
  border-radius: 12px;
  border: 1px solid #D1D5DC;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}
.selection-card:hover { background-color: #F9FAFB; border-color: #9CA3AF; }

.card-content { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.symbol { color: #364153; font-size: 28px; font-weight: 700; line-height: 1; }
.label { color: #364153; font-size: 14px; font-weight: 500; }

.selection-card.active-yes { background: #00C950; border-color: #00A63E; box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.10); }
.selection-card.active-no { background: #FB2C36; border-color: #E7000B; box-shadow: 0px 4px 6px -4px rgba(0, 0, 0, 0.10); }
.selection-card.active-yes .symbol, .selection-card.active-yes .label,
.selection-card.active-no .symbol, .selection-card.active-no .label { color: white; }

/* =========================================
   3. [YES] 초록색 등급 정보 입력 폼
   ========================================= */
.grade-form-container {
  width: 100%;
  background: #F0FDF4;
  border-radius: 12px;
  border: 1px solid #B9F8CF;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  animation: slideDown 0.3s ease-out;
}

.form-header { display: flex; align-items: center; gap: 8px; }
.icon-check { width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; }
.check-shape { width: 8px; height: 5px; border-left: 2px solid #00A63E; border-bottom: 2px solid #00A63E; transform: rotate(-45deg) translate(1px, -1px); }
.header-title { color: #101828; font-size: 16px; font-weight: 600; line-height: 24px; }

.form-body { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.input-label { color: #101828; font-size: 14px; font-weight: 500; }
.required { color: #FB2C36; margin-left: 2px; }

.input-box {
  width: 100%; height: 44px; padding: 0 12px; background: white;
  border: 1px solid #E5E7EB; border-radius: 8px; font-size: 14px; color: #333;
  outline: none; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between;
}
.input-box:focus-within { border-color: #00A63E; box-shadow: 0 0 0 2px rgba(0, 166, 62, 0.1); }
.placeholder { color: #9CA3AF; }
.helper-text { color: #4B5563; font-size: 12px; margin: 0; line-height: 1.4; }

.dropdown-wrapper { position: relative; width: 100%; }
.dropdown { cursor: pointer; }
.arrow-down { width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #6B7280; }
.placeholder.selected { color: #333; }

.dropdown-menu {
  position: absolute; top: 105%; left: 0; width: 100%; background: white;
  border: 1px solid #E5E7EB; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 10; list-style: none; padding: 0; margin: 0; max-height: 200px; overflow-y: auto;
}
.dropdown-item { padding: 10px 12px; font-size: 14px; color: #333; cursor: pointer; }
.dropdown-item:hover { background-color: #F0FDF4; color: #00A63E; }

.date-row { display: flex; align-items: flex-start; gap: 12px; }
.date-col { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.tilde { padding-top: 10px; color: #4B5563; }
.sub-label { color: #6B7280; font-size: 12px; }
.date-input-box { position: relative; overflow: hidden; }
.real-date-input { width: 100%; height: 100%; border: none; background: transparent; outline: none; font-family: inherit; font-size: 14px; color: #333; cursor: pointer; }
.error-text { color: #E7000B; font-size: 12px; margin-top: 4px; font-weight: 500; }

/* =========================================
   4. [NO] 주황색 안내 가이드 스타일
   ========================================= */
.guide-container {
  width: 100%;
  background: #FFF7ED; /* 연한 주황색 배경 */
  border-radius: 12px;
  border: 1px solid #FFD6A7;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 4px;
  animation: slideDown 0.3s ease-out;
}

.guide-header { display: flex; align-items: center; gap: 8px; }
.icon-warning {
  width: 20px; height: 20px; border: 1.5px solid #F54900;
  border-radius: 4px; display: flex; justify-content: center; align-items: center;
}
.warning-mark { color: #F54900; font-weight: bold; font-size: 14px; }

/* 안내 카드 */
.info-card {
  background: white; border-radius: 10px; padding: 20px 24px;
  display: flex; gap: 12px;
}
.blue-border { border-left: 4px solid #2B7FFF; }

.card-title { color: #101828; font-size: 16px; font-weight: 600; line-height: 24px; margin-bottom: 8px;}
.card-desc { color: #4A5565; font-size: 14px; line-height: 1.6; margin-bottom: 12px; }
.highlight { color: #155DFC; font-weight: 500; }

.card-list { display: flex; flex-direction: column; gap: 4px; }
.list-item { display: flex; align-items: center; gap: 8px; color: #4A5565; font-size: 14px; }
.bullet { width: 6px; height: 6px; background: #2B7FFF; border-radius: 50%; flex-shrink: 0; }

/* 절차 카드 */
.step-card {
  background: linear-gradient(90deg, #F0FDF4 0%, #EFF6FF 100%);
  border-radius: 10px; border: 1px solid #B9F8CF; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
}
.steps-list { display: flex; flex-direction: column; gap: 16px; }
.step-item { display: flex; gap: 12px; }
.step-number {
  width: 24px; height: 24px; background: #00C950; border-radius: 50%;
  color: white; font-size: 12px; font-weight: 600;
  display: flex; justify-content: center; align-items: center; flex-shrink: 0;
}
.step-text { display: flex; flex-direction: column; }
.step-title-text { color: #101828; font-size: 14px; font-weight: 600; line-height: 20px; }
.step-desc { color: #4A5565; font-size: 12px; line-height: 1.4; }

/* 애니메이션 공통 */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 모바일 대응 */
@media (max-width: 640px) {
  .selection-row { flex-direction: column; }
  .selection-card { width: 100%; height: 72px; }
  .date-row { flex-direction: column; gap: 12px; }
  .tilde { display: none; }
}
</style>