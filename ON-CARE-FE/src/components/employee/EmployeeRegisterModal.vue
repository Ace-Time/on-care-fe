<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'submit']);

// 폼 초기 데이터
const initialForm = {
  name: '',
  role: '요양보호사',
  phone: '',
  email: '',
  address: '',
  hireDate: new Date().toISOString().split('T')[0],
  emergencyContact: '',
  status: '활동중', // 기본값
  career: '',
  specialties: [],
  workHistory: []
};

const form = ref({ ...initialForm });

// 임시 입력 변수
const newSpecialty = ref('');
const newHistory = ref('');

// 핸들러
const addSpecialty = () => {
  if (newSpecialty.value.trim()) {
    form.value.specialties.push(newSpecialty.value.trim());
    newSpecialty.value = '';
  }
};

const addHistory = () => {
  if (newHistory.value.trim()) {
    form.value.workHistory.push(newHistory.value.trim());
    newHistory.value = '';
  }
};

const removeSpecialty = (index) => form.value.specialties.splice(index, 1);
const removeHistory = (index) => form.value.workHistory.splice(index, 1);

const handleSubmit = () => {
  if (!form.value.name || !form.value.phone) {
    alert('필수 정보를 입력해주세요.');
    return;
  }
  emit('submit', { ...form.value });
  // 초기화 (선택사항)
  form.value = { ...initialForm, specialties: [], workHistory: [] };
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h3>직원 등록</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body custom-scrollbar">
        
        <div class="form-section green-theme">
          <h4 class="section-title">기본 정보</h4>
          <div class="grid-2">
            <div class="form-group"><label>이름 *</label><input v-model="form.name" type="text" class="input" placeholder="이름 입력" /></div>
            <div class="form-group">
              <label>역할 *</label>
              <select v-model="form.role" class="input">
                <option>요양보호사</option><option>센터장</option><option>사회복지사</option>
              </select>
            </div>
            <div class="form-group"><label>전화번호 *</label><input v-model="form.phone" type="text" class="input" placeholder="010-0000-0000" /></div>
            <div class="form-group"><label>이메일 *</label><input v-model="form.email" type="email" class="input" /></div>
            
            <div class="form-group full-width"><label>주소</label><input v-model="form.address" type="text" class="input" /></div>
            
            <div class="form-group"><label>입사일</label><input v-model="form.hireDate" type="date" class="input" /></div>
            <div class="form-group"><label>비상 연락처</label><input v-model="form.emergencyContact" type="text" class="input" placeholder="010-0000-0000" /></div>
            <div class="form-group">
              <label>활동 상태</label>
              <select v-model="form.status" class="input">
                <option>활동중</option><option>휴가</option><option>퇴사</option>
              </select>
            </div>
            <div class="form-group"><label>경력 연수</label><input v-model="form.career" type="text" class="input" placeholder="예: 8" /></div>
          </div>
        </div>

        <div class="form-section blue-theme">
          <h4 class="section-title">전문분야 및 태그</h4>
          <div class="form-group">
            <label class="sub-label">전문 분야 (태그) <span class="example">예: 치매케어, 뇌졸중, 파킨슨 등</span></label>
            <div class="input-with-button">
              <input v-model="newSpecialty" type="text" class="input" placeholder="전문분야 입력 후 추가 버튼 클릭 또는 Enter" @keyup.enter="addSpecialty" />
              <button class="btn-sm btn-blue" @click="addSpecialty">추가</button>
            </div>
          </div>
          <div class="tags-list">
            <span v-for="(tag, idx) in form.specialties" :key="idx" class="tag tag-green">
              {{ tag }} <button @click="removeSpecialty(idx)" class="tag-remove">×</button>
            </span>
          </div>
        </div>

        <div class="form-section purple-theme">
          <h4 class="section-title">추가 정보</h4>
          <div class="form-group">
            <label class="sub-label">근무 이력</label>
            <div class="input-with-button">
              <input v-model="newHistory" type="text" class="input" placeholder="근무 이력 입력 후 추가 버튼 클릭 또는 Enter" @keyup.enter="addHistory" />
              <button class="btn-sm btn-purple" @click="addHistory">추가</button>
            </div>
          </div>
          <ul class="history-list">
            <li v-for="(hist, idx) in form.workHistory" :key="idx" class="history-item">
              {{ hist }} <button @click="removeHistory(idx)" class="list-remove">삭제</button>
            </li>
          </ul>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-submit" @click="handleSubmit">등록</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 모달 레이아웃 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-box { background: white; width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-height: 90vh; display: flex; flex-direction: column; }

/* 헤더 */
.modal-header { padding: 20px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 20px; font-weight: 700; color: #166534; margin: 0; } /* 초록색 타이틀 */
.close-btn { background: none; border: none; cursor: pointer; color: #999; }

/* 바디 */
.modal-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 24px; }

/* 섹션 스타일 (테두리 & 배경색) */
.form-section { padding: 20px; border-radius: 8px; border: 1px solid transparent; }
.green-theme { background-color: #f0fdf4; border-color: #dcfce7; }
.green-theme .section-title { color: #166534; }
.blue-theme { background-color: #eff6ff; border-color: #dbeafe; }
.blue-theme .section-title { color: #1e40af; }
.purple-theme { background-color: #faf5ff; border-color: #f3e8ff; }
.purple-theme .section-title { color: #6b21a8; }

.section-title { margin: 0 0 16px 0; font-size: 16px; font-weight: 700; }

/* 입력 폼 */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #4b5563; }
.sub-label { font-size: 13px; font-weight: 600; color: #4b5563; display: block; margin-bottom: 4px; }
.example { font-weight: normal; color: #9ca3af; font-size: 12px; margin-left: 4px; }

.input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; background: white; }
.green-theme .input:focus { border-color: #22c55e; }
.blue-theme .input:focus { border-color: #3b82f6; }
.purple-theme .input:focus { border-color: #a855f7; }

/* 입력 + 버튼 조합 */
.input-with-button { display: flex; gap: 8px; }
.input-with-button .input { flex: 1; }
.btn-sm { padding: 0 20px; border-radius: 6px; font-size: 14px; font-weight: 600; color: white; border: none; cursor: pointer; flex-shrink: 0; }
.btn-blue { background-color: #3b82f6; }
.btn-purple { background-color: #a855f7; }

/* 태그 & 리스트 */
.tags-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.tag { padding: 4px 10px; border-radius: 4px; font-size: 13px; display: flex; align-items: center; gap: 6px; }
.tag-green { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.tag-remove { background: none; border: none; cursor: pointer; color: #166534; font-weight: bold; font-size: 14px; padding: 0; }

.history-list { margin-top: 10px; padding-left: 4px; list-style: none; }
.history-item { font-size: 14px; color: #374151; padding: 4px 0; display: flex; justify-content: space-between; border-bottom: 1px dashed #e5e7eb; }
.list-remove { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px; }

/* 푸터 (등록 버튼) */
.modal-footer { padding: 20px 24px; border-top: 1px solid #f0f0f0; background: #fff; }
.btn-submit { width: 100%; padding: 14px; background-color: #4ade80; color: white; font-size: 16px; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.btn-submit:hover { background-color: #22c55e; }

/* 스크롤바 */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; }
</style>