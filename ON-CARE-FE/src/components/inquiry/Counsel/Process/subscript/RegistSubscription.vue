<template>
  <div class="advanced-info-container">
    <div class="step-title">4단계 : 계약 완료</div>

    <div class="info-card">
      <div class="card-title">계약 정보 입력</div>
      
      <div class="input-grid">
        
        <div class="input-group">
          <label class="label">이름</label>
          <input type="text" class="input-field" placeholder="이름 입력" />
        </div>
        <div class="input-group">
          <label class="label">생년월일</label>
          <div class="input-with-icon">
            <input type="date" class="input-field" />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div class="input-group">
          <label class="label">연락처</label>
          <div class="input-with-icon">
            <input type="text" class="input-field" placeholder="번호 입력" />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
        <div class="input-group">
          <label class="label">성별</label>
          <select class="input-field">
            <option value="" disabled selected>성별 선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>

        <div class="input-group full-width">
          <label class="label">주소</label>
          <input type="text" class="input-field" placeholder="주소 입력" />
        </div>

        <div class="input-group">
          <label class="label">보호자명 / 관계</label>
          <div class="split-inputs">
            <input type="text" class="input-field flex-grow" placeholder="보호자 이름" />
            <input type="text" class="input-field relation-box" placeholder="관계" />
          </div>
        </div>
        <div class="input-group">
          <label class="label">보호자 연락처</label>
          <div class="input-with-icon">
            <input type="text" class="input-field" placeholder="010-0000-0000" />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>

        <div class="input-group">
          <label class="label">장기요양등급</label>
          <select class="input-field">
            <option value="" disabled selected>등급 선택</option>
            <option>1등급</option>
            <option>2등급</option>
            <option>3등급</option>
            <option>4등급</option>
            <option>5등급</option>
            <option>인지지원등급</option>
          </select>
        </div>
        <div class="input-group">
          <label class="label">장기요양등급 인정번호</label>
          <input type="text" class="input-field" placeholder="인정번호 입력" />
        </div>

        <div class="input-group">
          <label class="label">장기요양등급 시작일</label>
          <div class="input-with-icon">
            <input type="date" class="input-field" />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="input-group">
          <label class="label">장기요양등급 만료일</label>
          <div class="input-with-icon">
            <input type="date" class="input-field" />
            <svg class="icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div class="input-group full-width">
          <label class="label">태그</label>
          <div class="chip-group">
            <button 
              v-for="tag in tagOptions" 
              :key="tag" 
              class="chip-btn" 
              :class="{ active: selectedTags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <div class="input-group full-width">
          <label class="label">위험 요소</label>
          <div class="chip-group">
            <button 
              v-for="risk in riskOptions" 
              :key="risk" 
              class="chip-btn danger" 
              :class="{ active: selectedRisks.includes(risk) }"
              @click="toggleRisk(risk)"
            >
              {{ risk }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 태그 데이터
const tagOptions = ['기초수급', '독거', '차상위', '치매', '와상', '배회'];
const selectedTags = ref([]);

const toggleTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag);
  } else {
    selectedTags.value.push(tag);
  }
};

// 위험 요소 데이터
const riskOptions = ['낙상 위험', '배회 위험', '욕창 위험', '미끄럼 위험'];
const selectedRisks = ref([]);

const toggleRisk = (risk) => {
  if (selectedRisks.value.includes(risk)) {
    selectedRisks.value = selectedRisks.value.filter(r => r !== risk);
  } else {
    selectedRisks.value.push(risk);
  }
};
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

/* 2. 카드 스타일 */
.info-card {
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

/* 3. 그리드 시스템 */
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

/* 4. 입력 필드 스타일 */
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
  box-sizing: border-box;
  width: 100%;
}

.input-field:focus {
  border-color: #00A63E;
  box-shadow: 0 0 0 3px rgba(0, 166, 62, 0.1);
}

.input-field::placeholder {
  color: #9CA3AF;
}

/* 아이콘이 있는 인풋 컨테이너 */
.input-with-icon {
  position: relative;
  width: 100%;
}

.input-with-icon .input-field {
  padding-right: 40px; /* 아이콘 공간 확보 */
}

.icon-svg {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9CA3AF; /* placeholder 색상과 맞춤 */
  pointer-events: none; /* 아이콘 클릭 시에도 인풋 포커스 되도록 */
}

/* 보호자 정보 (이름/관계) 분할 레이아웃 */
.split-inputs {
  display: flex;
  gap: 10px;
}

.flex-grow {
  flex: 1;
}

.relation-box {
  width: 100px;
  flex: none;
}

/* 5. 칩 버튼 스타일 (태그/위험요소) */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-btn {
  padding: 8px 16px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 999px;
  font-size: 13px;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn:hover {
  background-color: #F9FAFB;
  border-color: #9CA3AF;
}

/* 활성화 상태 (초록색) */
.chip-btn.active {
  background-color: #F0FDF4; /* 연한 초록 */
  border-color: #00A63E;
  color: #00A63E;
  font-weight: 600;
}

/* 위험요소 활성화 상태 (빨간색) */
.chip-btn.danger.active {
  background-color: #FEF2F2;
  border-color: #DC2626;
  color: #DC2626;
}

/* 반응형 */
@media (max-width: 640px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
}
</style>