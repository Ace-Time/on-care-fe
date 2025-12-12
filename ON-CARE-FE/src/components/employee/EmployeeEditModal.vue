<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  employee: { type: Object, required: true },
  isOpen: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'submit']);

// 폼 데이터 초기화
const form = ref({
  ...props.employee,
  specialties: props.employee.specialties ? [...props.employee.specialties] : [],
  // workHistory가 객체 배열이라고 가정 (없으면 빈 배열)
  workHistory: props.employee.workHistory ? JSON.parse(JSON.stringify(props.employee.workHistory)) : []
});

// 전문분야 입력용 임시 변수
const newSpecialty = ref('');

// 근무 이력 입력용 임시 변수 (객체 형태)
const newHistory = ref({
  company: '',
  startDate: '',
  endDate: ''
});

// 모달 열릴 때 데이터 동기화
watch(() => props.employee, (newVal) => {
  form.value = {
    ...newVal,
    specialties: newVal.specialties ? [...newVal.specialties] : [],
    workHistory: newVal.workHistory ? JSON.parse(JSON.stringify(newVal.workHistory)) : []
  };
  // 열릴 때 경력 자동 계산 한 번 실행
  updateCareerString();
}, { deep: true });

// --- 로직: 경력 자동 계산 ---
const updateCareerString = () => {
  let totalMonths = 0;

  form.value.workHistory.forEach(item => {
    if (item.startDate && item.endDate) {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      // 월 차이 계산
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      // 최소 1개월 보장
      totalMonths += Math.max(0, months);
    }
  });

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let careerStr = '';
  if (years > 0) careerStr += `${years}년 `;
  if (months > 0) careerStr += `${months}개월`;
  if (totalMonths === 0) careerStr = '신입';

  form.value.career = careerStr;
};

// --- 핸들러 ---

// 전문분야 추가
const addSpecialty = () => {
  if (newSpecialty.value.trim()) {
    form.value.specialties.push(newSpecialty.value.trim());
    newSpecialty.value = '';
  }
};
const removeSpecialty = (index) => {
  form.value.specialties.splice(index, 1);
};

// 근무 이력 추가
const addHistory = () => {
  if (!newHistory.value.company || !newHistory.value.startDate || !newHistory.value.endDate) {
    alert('회사명, 시작일, 종료일을 모두 입력해주세요.');
    return;
  }
  
  // 날짜 유효성 체크
  if (newHistory.value.startDate > newHistory.value.endDate) {
    alert('종료일이 시작일보다 빠를 수 없습니다.');
    return;
  }

  form.value.workHistory.push({ ...newHistory.value });
  
  // 입력창 초기화
  newHistory.value = { company: '', startDate: '', endDate: '' };
  
  // 경력 재계산
  updateCareerString();
};

// 근무 이력 삭제
const removeHistory = (index) => {
  form.value.workHistory.splice(index, 1);
  updateCareerString();
};

const handleSubmit = () => {
  emit('submit', form.value);
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h3>직원 정보 수정</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div class="modal-body custom-scrollbar">
        
        <section class="form-section green-theme">
          <h4 class="section-title">기본 정보</h4>
          <div class="grid-2">
            <div class="form-group"><label>이름 *</label><input v-model="form.name" type="text" class="input" /></div>
            <div class="form-group">
              <label>역할 *</label>
              <select v-model="form.role" class="input">
                <option>요양보호사</option><option>센터장</option><option>사회복지사</option>
              </select>
            </div>
            <div class="form-group"><label>전화번호 *</label><input v-model="form.phone" type="text" class="input" /></div>
            <div class="form-group"><label>이메일 *</label><input v-model="form.email" type="email" class="input" /></div>
            <div class="form-group full-width"><label>주소</label><input v-model="form.address" type="text" class="input" /></div>
            <div class="form-group"><label>입사일</label><input v-model="form.hireDate" type="date" class="input" /></div>
            <div class="form-group"><label>비상 연락처</label><input v-model="form.emergencyContact" type="text" class="input" /></div>
            <div class="form-group">
              <label>활동 상태</label>
              <select v-model="form.status" class="input">
                <option>활동중</option><option>휴가</option><option>퇴사</option>
              </select>
            </div>
            <div class="form-group">
              <label>총 경력 (자동 계산)</label>
              <input v-model="form.career" type="text" class="input readonly-input" readonly placeholder="근무 이력을 추가하면 계산됩니다" />
            </div>
          </div>
        </section>

        <section class="form-section blue-theme">
          <h4 class="section-title">전문분야 및 태그</h4>
          <div class="form-group">
            <div class="input-with-button">
              <input v-model="newSpecialty" type="text" class="input" placeholder="전문분야 입력" @keyup.enter="addSpecialty" />
              <button class="btn-add blue-btn" @click="addSpecialty">추가</button>
            </div>
          </div>
          <div class="tags-list">
            <span v-for="(tag, index) in form.specialties" :key="index" class="tag-item blue-tag">
              {{ tag }}
              <button class="btn-remove" @click="removeSpecialty(index)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </span>
          </div>
        </section>

        <section class="form-section purple-theme">
          <h4 class="section-title">근무 이력 관리</h4>
          
          <div class="history-input-box">
            <div class="form-group">
              <input v-model="newHistory.company" type="text" class="input" placeholder="회사명 (예: 삼성요양원)" />
            </div>
            <div class="grid-2-mini">
              <input v-model="newHistory.startDate" type="date" class="input" title="시작일" />
              <input v-model="newHistory.endDate" type="date" class="input" title="종료일" />
            </div>
            <button class="btn-full purple-btn" @click="addHistory">이력 추가 (+)</button>
          </div>

          <div class="history-list">
            <div v-for="(item, index) in form.workHistory" :key="index" class="history-item purple-item">
              <div class="history-content">
                <span class="history-company">{{ item.company }}</span>
                <span class="history-date">{{ item.startDate }} ~ {{ item.endDate }}</span>
              </div>
              <button class="btn-remove" @click="removeHistory(index)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div v-if="form.workHistory.length === 0" class="empty-text">등록된 이력이 없습니다.</div>
          </div>
        </section>

      </div>

      <div class="modal-footer">
        <button class="btn-lg btn-green" @click="handleSubmit">수정 완료</button>
        <button class="btn-lg btn-white" @click="$emit('close')">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 기존 스타일 유지 + 추가 스타일 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-box { background: white; width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
.modal-header h3 { margin: 0; font-size: 20px; font-weight: 700; color: #111; }
.close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 24px; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; }

/* 폼 스타일 */
.form-section { padding: 20px; border-radius: 12px; border: 1px solid transparent; }
.section-title { margin: 0 0 16px 0; font-size: 16px; font-weight: 700; }
.green-theme { background-color: #f0fdf4; border-color: #dcfce7; }
.green-theme .section-title { color: #166534; }
.blue-theme { background-color: #eff6ff; border-color: #dbeafe; }
.blue-theme .section-title { color: #1e40af; }
.purple-theme { background-color: #faf5ff; border-color: #f3e8ff; }
.purple-theme .section-title { color: #6b21a8; }

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #374151; }
.input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
.readonly-input { background-color: #f3f4f6; color: #6b7280; cursor: not-allowed; }

/* 근무 이력 입력 박스 */
.history-input-box { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.grid-2-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.btn-full { width: 100%; padding: 8px; border-radius: 8px; border: none; color: white; font-weight: 600; cursor: pointer; font-size: 13px; }

/* 리스트 아이템 */
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
.history-content { display: flex; flex-direction: column; gap: 2px; }
.history-company { font-weight: bold; font-size: 14px; }
.history-date { font-size: 12px; color: #666; }
.purple-item { background-color: #f3e8ff; color: #6b21a8; }
.empty-text { font-size: 13px; color: #9ca3af; text-align: center; padding: 10px; }

/* 버튼 및 태그 */
.input-with-button { display: flex; gap: 8px; }
.input-with-button .input { flex: 1; }
.btn-add { padding: 0 20px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; color: white; }
.btn-remove { background: none; border: none; cursor: pointer; color: currentColor; opacity: 0.6; }
.btn-remove:hover { opacity: 1; }
.blue-btn { background-color: #3b82f6; }
.blue-btn:hover { background-color: #2563eb; }
.purple-btn { background-color: #a855f7; }
.purple-btn:hover { background-color: #9333ea; }

.tags-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.tag-item { display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; }
.blue-tag { background-color: #dbeafe; color: #1e40af; }

.modal-footer { padding: 20px 24px; border-top: 1px solid #f0f0f0; display: flex; gap: 12px; background: #fff; }
.btn-lg { flex: 1; padding: 12px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; text-align: center; }
.btn-green { background-color: #22c55e; color: white; border: none; }
.btn-white { background-color: white; color: #374151; border: 1px solid #d1d5db; }
</style>