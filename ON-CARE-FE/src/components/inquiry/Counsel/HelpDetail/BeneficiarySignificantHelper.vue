<template>
  <div class="significant-helper">
    <div class="helper-header">
      <h3 class="helper-title">{{ categoryTitle }} 특이사항</h3>
      <div class="header-actions">
        <button class="btn-add" @click="openAddModal" title="추가">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
        <button class="btn-refresh" @click="loadSignificants" title="새로고침">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">특이사항 로딩 중...</div>
    
    <div v-else-if="significants.length === 0" class="empty-state">
      <p>등록된 특이사항이 없습니다.</p>
      <button class="btn-add-first" @click="openAddModal">첫 특이사항 추가하기</button>
    </div>

    <div v-else class="significants-list">
      <div 
        v-for="(item, index) in significants" 
        :key="`${item.significantId}-${index}`"
        class="significant-item"
      >
        <div class="significant-content">
          <span class="significant-badge">{{ item.significantName }}</span>
        </div>
        <button class="btn-delete" @click="removeSignificant(item)" title="삭제">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="significants.length > 0" class="helper-footer">
      <p class="helper-desc">💡 이 특이사항을 참고하여 상담을 진행하세요</p>
    </div>

    <!-- 추가 모달 -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">특이사항 추가</h3>
          <button class="btn-close" @click="closeAddModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="loadingMaster" class="loading-modal">특이사항 목록 로딩 중...</div>
          
          <div v-else class="significants-grid">
            <div 
              v-for="sig in availableSignificants" 
              :key="sig.significantId"
              class="sig-card"
              :class="{ 'selected': selectedSignificant === sig.significantId }"
              @click="selectSignificant(sig.significantId)"
            >
              <div class="sig-name">{{ sig.significantName }}</div>
            </div>
          </div>

          <div v-if="!loadingMaster && availableSignificants.length === 0" class="empty-modal">
            추가 가능한 특이사항이 없습니다.
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeAddModal">취소</button>
          <button 
            class="btn btn-primary" 
            :disabled="!selectedSignificant || isAdding"
            @click="addSignificant"
          >
            {{ isAdding ? '추가 중...' : '추가하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  getBeneficiarySignificantsApi, 
  deleteBeneficiarySignificantApi,
  addBeneficiarySignificantApi,
  getAllSignificantsApi
} from '@/api/inquiry/counselApi';
import { useToast } from '@/lib/toast';

const props = defineProps({
  beneficiaryId: {
    type: [Number, String],
    required: true
  },
  category: {
    type: String,
    required: true,
    validator: (value) => ['렌탈성사도움', '문의해결도움', '컴플레인해결도움', '해지상담도움'].includes(value)
  }
});

const toast = useToast();

const significants = ref([]);
const allSignificants = ref([]);
const loading = ref(false);
const loadingMaster = ref(false);
const showAddModal = ref(false);
const selectedSignificant = ref(null);
const isAdding = ref(false);

const categoryTitle = computed(() => props.category);

// 이미 추가된 특이사항 ID 목록
const addedSignificantIds = computed(() => 
  significants.value.map(s => s.significantId)
);

// 추가 가능한 특이사항 (현재 카테고리 & 미추가)
const availableSignificants = computed(() => {
  return allSignificants.value.filter(sig => 
    sig.categoryName === props.category && 
    !addedSignificantIds.value.includes(sig.significantId)
  );
});

// 특이사항 조회
const loadSignificants = async () => {
  if (!props.beneficiaryId) {
    console.warn('⚠️ beneficiaryId 없음');
    return;
  }

  loading.value = true;
  
  try {
    const response = await getBeneficiarySignificantsApi(props.beneficiaryId, props.category);
    
    significants.value = response.data || [];
    console.log('✅ 특이사항 로드:', significants.value);
    
  } catch (error) {
    console.error('❌ 특이사항 로드 실패:', error);
    toast.error('특이사항을 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

// 모든 특이사항 마스터 조회
const loadAllSignificants = async () => {
  loadingMaster.value = true;
  
  try {
    const response = await getAllSignificantsApi();
    allSignificants.value = response.data || [];
    console.log('✅ 전체 특이사항 로드:', allSignificants.value);
    
  } catch (error) {
    console.error('❌ 전체 특이사항 로드 실패:', error);
    toast.error('특이사항 목록을 불러오는데 실패했습니다.');
  } finally {
    loadingMaster.value = false;
  }
};

// 추가 모달 열기
const openAddModal = async () => {
  showAddModal.value = true;
  selectedSignificant.value = null;
  
  if (allSignificants.value.length === 0) {
    await loadAllSignificants();
  }
};

// 추가 모달 닫기
const closeAddModal = () => {
  showAddModal.value = false;
  selectedSignificant.value = null;
};

// 특이사항 선택
const selectSignificant = (significantId) => {
  selectedSignificant.value = significantId;
};

// 특이사항 추가
const addSignificant = async () => {
  if (!selectedSignificant.value) {
    toast.error('특이사항을 선택해주세요.');
    return;
  }

  isAdding.value = true;

  try {
    await addBeneficiarySignificantApi(props.beneficiaryId, selectedSignificant.value);
    
    toast.success('특이사항이 추가되었습니다.');
    
    // 목록 새로고침
    await loadSignificants();
    
    closeAddModal();
    
  } catch (error) {
    console.error('❌ 특이사항 추가 실패:', error);
    toast.error(error.response?.data?.message || '추가에 실패했습니다.');
  } finally {
    isAdding.value = false;
  }
};

// 특이사항 삭제
const removeSignificant = async (item) => {
  if (!confirm(`"${item.significantName}"을(를) 삭제하시겠습니까?`)) {
    return;
  }

  try {
    await deleteBeneficiarySignificantApi(item.beneficiaryId, item.significantId);
    
    // 로컬 상태에서도 제거
    significants.value = significants.value.filter(s => s.significantId !== item.significantId);
    
    toast.success('특이사항이 삭제되었습니다.');
    
  } catch (error) {
    console.error('❌ 특이사항 삭제 실패:', error);
    toast.error('삭제에 실패했습니다.');
  }
};

// 수급자 ID나 카테고리 변경 시 재조회
watch(() => [props.beneficiaryId, props.category], () => {
  loadSignificants();
}, { immediate: false });

onMounted(() => {
  loadSignificants();
});
</script>

<style scoped>
.significant-helper {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.helper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.helper-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.btn-add,
.btn-refresh {
  padding: 6px;
  background: transparent;
  border: none;
  color: #6B7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add:hover {
  background: #DBEAFE;
  color: #1D4ED8;
}

.btn-refresh:hover {
  background: #E5E7EB;
  color: #111827;
}

.loading {
  text-align: center;
  color: #6B7280;
  padding: 20px;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 30px 20px;
  color: #9CA3AF;
  font-size: 14px;
}

.btn-add-first {
  margin-top: 12px;
  padding: 8px 16px;
  background: #00A63E;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-first:hover {
  background: #008C35;
}

.significants-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.significant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  transition: all 0.2s;
}

.significant-item:hover {
  border-color: #D1D5DB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.significant-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.significant-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #DBEAFE;
  color: #1E40AF;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
}

.btn-delete {
  padding: 4px;
  background: transparent;
  border: none;
  color: #EF4444;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  background: #FEE2E2;
}

.helper-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
}

.helper-desc {
  font-size: 12px;
  color: #6B7280;
  margin: 0;
  font-style: italic;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-close {
  padding: 4px;
  background: transparent;
  border: none;
  color: #6B7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #F3F4F6;
  color: #111827;
}

.modal-body {
  padding: 24px;
  min-height: 200px;
}

.loading-modal {
  text-align: center;
  padding: 40px;
  color: #6B7280;
}

.empty-modal {
  text-align: center;
  padding: 40px;
  color: #9CA3AF;
}

.significants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.sig-card {
  padding: 12px;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.sig-card:hover {
  border-color: #00A63E;
  background: #F0FDF4;
}

.sig-card.selected {
  border-color: #00A63E;
  background: #DCFCE7;
}

.sig-name {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #F3F4F6;
  color: #374151;
}

.btn-cancel:hover {
  background: #E5E7EB;
}

.btn-primary {
  background: #00A63E;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #008C35;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}
</style>
