<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  employees: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'submit']);

const caregivers = computed(() => props.employees.filter(e => e.role === '요양보호사'));
const selectedIds = ref([]);
const form = ref({ year: '2025', date: '', institution: '', hours: '', status: '이수', file: '' });

const toggleAll = (e) => {
  if (e.target.checked) selectedIds.value = caregivers.value.map(c => c.id);
  else selectedIds.value = [];
};

const handleSubmit = () => {
  if (selectedIds.value.length === 0) return alert('대상자를 선택해주세요.');
  emit('submit', { ids: selectedIds.value, data: form.value });
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-box">
      <div class="modal-header">
        <h3 class="header-title">보수교육 일괄 등록</h3>
        <button @click="$emit('close')" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="section-title-row">
          <svg class="icon-blue" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span class="main-title">요양보호사 선택</span>
          <span class="count-badge">{{ selectedIds.length }}명 선택됨</span>
        </div>

        <div class="selection-box">
          <div class="check-row header-row">
            <input type="checkbox" @change="toggleAll" :checked="selectedIds.length === caregivers.length && caregivers.length > 0" class="checkbox" />
            <label class="check-label">전체 선택</label>
          </div>
          <div class="list-scroll custom-scrollbar">
            <div v-for="emp in caregivers" :key="emp.id" class="check-row item-row" @click="selectedIds.includes(emp.id) ? selectedIds = selectedIds.filter(id => id !== emp.id) : selectedIds.push(emp.id)">
              <input type="checkbox" :value="emp.id" v-model="selectedIds" class="checkbox" @click.stop />
              <div class="item-info">
                <div class="info-top">
                  <span class="name">{{ emp.name }}</span>
                  <span class="status-tag" :class="emp.status === '활동중' ? 'tag-green' : 'tag-yellow'">{{ emp.status }}</span>
                </div>
                <p class="phone">{{ emp.phone }}</p>
              </div>
            </div>
          </div>
        </div>

        <h4 class="form-title">교육 정보</h4>
        <div class="form-container">
          <div class="form-group"><label>교육 연도</label><input v-model="form.year" type="number" class="input" placeholder="2025" /></div>
          <div class="form-group"><label>이수일</label><input v-model="form.date" type="date" class="input" /></div>
          <div class="form-group"><label>교육기관</label><input v-model="form.institution" type="text" class="input" placeholder="예: 한국보건복지인력개발원" /></div>
          <div class="form-group"><label>교육시간</label><input v-model="form.hours" type="number" class="input" placeholder="0" /></div>
          <div class="form-group"><label>이수 여부</label><input v-model="form.status" type="text" class="input" readonly /></div>
          <div class="form-group full-width"><label>첨부파일</label><input v-model="form.file" type="text" class="input" placeholder="파일명 또는 URL" /></div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">취소</button>
        <button @click="handleSubmit" class="btn-submit">{{ selectedIds.length }}명 교육 등록</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal-box { background: white; width: 480px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.header-title { font-size: 18px; font-weight: 700; color: #166534; margin: 0; }
.close-btn { background: none; border: none; cursor: pointer; color: #9ca3af; }
.modal-body { padding: 20px; overflow-y: auto; flex: 1; }
.modal-footer { padding: 16px 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; background: #fff; gap: 8px; }

/* 아이콘 및 타이틀 */
.icon-blue { color: #2563eb; }
.section-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.main-title { font-weight: 700; color: #1f2937; }
.count-badge { padding: 2px 8px; background-color: #dbeafe; color: #2563eb; font-size: 12px; font-weight: 700; border-radius: 9999px; }

/* 선택 리스트 */
.selection-box { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
.check-row { display: flex; align-items: center; gap: 12px; padding: 12px; }
.header-row { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; }
.item-row { cursor: pointer; transition: background 0.2s; }
.item-row:hover { background-color: #f9fafb; }
.check-label { font-size: 14px; font-weight: 500; color: #374151; }
.list-scroll { max-height: 180px; overflow-y: auto; }
.checkbox { width: 16px; height: 16px; border-radius: 4px; border: 1px solid #d1d5db; cursor: pointer; accent-color: #2563eb; }

/* 아이템 정보 */
.item-info { flex: 1; display: flex; justify-content: space-between; align-items: center; }
.info-top { display: flex; align-items: center; gap: 8px; }
.name { font-size: 14px; font-weight: 700; color: #1f2937; }
.status-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
.tag-green { background-color: #dcfce7; color: #15803d; }
.tag-yellow { background-color: #fef9c3; color: #a16207; }
.phone { font-size: 12px; color: #6b7280; margin: 0; }

/* 폼 */
.form-title { font-size: 14px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0; }
.form-container { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 13px; font-weight: 500; color: #4b5563; }
.input { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.input:focus { border-color: #3b82f6; }

/* 버튼 */
.btn-cancel { padding: 10px 24px; background-color: #6b7280; color: white; border-radius: 8px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; }
.btn-cancel:hover { background-color: #4b5563; }
.btn-submit { flex: 1; padding: 10px; background-color: #3b82f6; color: white; border-radius: 8px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; }
.btn-submit:hover { background-color: #2563eb; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
</style>