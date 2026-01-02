<script setup>
import { onMounted, ref, computed, watch } from "vue";
import VisitCounselForm from "@/components/careworker/activity/VisitCounselForm.vue";
import { createCounselingLog, getCounselingLogList, updateCounselingLog, deleteCounselingLog, getCounselingLogDetail } from '@/api/careworker/counselingLogApi';
import { useUserStore } from '@/stores/user';
import { Icon } from '@iconify/vue';

const userStore = useUserStore();

const mainTab = ref("write");
const mainTabs = [
      { key: "write", label: "작성하기", icon: "line-md:edit" },
      { key: "history", label: "작성 내역", icon: "line-md:document-list" },
    ];

const counselHistory = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedCounselType = ref('');

const filteredCounselHistory = computed(() => {
  let result = counselHistory.value;

  if (selectedCounselType.value) {
    result = result.filter(item => item.counselType === selectedCounselType.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.trim().toLowerCase();
    result = result.filter(item => 
      item.recipientName.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = ref(15);

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredCounselHistory.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredCounselHistory.value.length / itemsPerPage.value);
});

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

// 필터 변경 시 페이지 초기화
watch([selectedCounselType, searchQuery], () => {
  currentPage.value = 1;
});

// 매핑 데이터 (API 코드 <-> UI 텍스트 변환용)
const counselTypeMap = {
  'initial': '초기 상담', 'regular': '정기 상담', 'emergency': '긴급 상담', 'intermediate': '종결 상담', 'guardian': '보호자 상담',
  // DB에서 한글로 저장된 경우 대비
  '초기상담': '초기 상담', '정기상담': '정기 상담', '긴급상담': '긴급 상담', '종결상담': '종결 상담', '보호자상담': '보호자 상담'
};
const reactionMap = {
  'very_good': '매우 만족', 'good': '만족', 'normal': '보통', 'bad': '불만족', 'very_bad': '매우 불만족',
  // DB 한글 대비
  '매우만족': '매우 만족', '만족': '만족', '보통': '보통', '불만족': '불만족', '매우불만족': '매우 불만족'
};

// 역매핑 (UI 텍스트 -> API 코드 변환용, 저장 시 사용)
const counselTypeReverseMap = { '초기 상담': 'initial', '정기 상담': 'regular', '긴급 상담': 'emergency', '종결 상담': 'intermediate', '보호자 상담': 'guardian' };
const reactionReverseMap = { '매우 만족': 'very_good', '만족': 'good', '보통': 'normal', '불만족': 'bad', '매우 불만족': 'very_bad' };


// 방문상담 목록 불러오기
const loadCounselingHistory = async () => {
  try {
    loading.value = true;
    const response = await getCounselingLogList();
    const data = response?.data ?? response;

    counselHistory.value = (data || []).map(item => {
      const visitDate = item.counselingDate || item.visitDate || item.visit_date || '';
      const dateObj = visitDate ? new Date(visitDate) : new Date();
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const dayOfWeek = dayNames[dateObj.getDay()];
      const formattedDate = visitDate ? `${visitDate.split('T')[0]} (${dayOfWeek})` : '-';

      // 임시저장 여부 확인
      const isDraft = item.isDraft === true || item.isDraft === 'true' || item.isDraft === 1 || item.status === '임시저장';

      return {
        id: item.counselingId || item.id,
        counselingId: item.counselingId || item.id,
        beneficiaryId: item.beneficiaryId,
        date: formattedDate,
        visitDate: visitDate,
        recipientName: item.beneficiaryName || item.recipientName || '-',
        counselType: counselTypeMap[item.counselingType] || item.counselingType || '-',
        reaction: reactionMap[item.satisfaction] || item.satisfaction || '-',
        visitPurpose: item.visitPurpose || null,
        observedCondition: item.attendees || null,
        subjectiveNeeds: item.discussionContent || null,
        counselorNotes: item.agreementContent || null,
        counselorSignUrl: item.counselorSignUrl || '',
        guardianSignUrl: item.guardianSignUrl || '',
        nextVisit: item.nextVisitDate ? item.nextVisitDate.split('T')[0] : null,
        status: isDraft ? '임시저장' : '완료',
        isDraft: isDraft,
        recipientSigned: !!item.guardianSignUrl,
        caregiverSigned: !!item.counselorSignUrl,
      };
    });
  } catch (error) {
    counselHistory.value = [];
  } finally {
    loading.value = false;
  }
};


// 모달 상태 관리
const showDetailModal = ref(false); 
const showEditModal = ref(false);   
const showSignatureModal = ref(false); 

const selectedItem = ref(null); 
const editForm = ref(null);     
const editingItemId = ref(null);

const signatureType = ref("");
const canvasRef = ref(null);
const isDrawing = ref(false);
const lastPoint = ref({ x: 0, y: 0 });

// --- 상세 보기 ---
const openDetail = async (item) => {
  try {
    const detailResponse = await getCounselingLogDetail(item.counselingId);
    const detailData = detailResponse?.data ?? detailResponse;

    selectedItem.value = {
      ...item,
      // 상세 데이터 병합
      visitPurpose: detailData.visitPurpose || item.visitPurpose || '-',
      observedCondition: detailData.attendees || item.observedCondition || '-',
      subjectiveNeeds: detailData.discussionContent || item.subjectiveNeeds || '-',
      counselorNotes: detailData.agreementContent || item.counselorNotes || '-',
      nextVisit: detailData.nextVisitDate ? detailData.nextVisitDate.split('T')[0] : '-',
      // 서명 URL 업데이트
      counselorSignUrl: detailData.counselorSignUrl || item.counselorSignUrl || '',
      guardianSignUrl: detailData.guardianSignUrl || item.guardianSignUrl || '',
      recipientSigned: !!(detailData.guardianSignUrl || item.guardianSignUrl),
      caregiverSigned: !!(detailData.counselorSignUrl || item.counselorSignUrl),
    };

    showDetailModal.value = true;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      alert('서버 응답 시간이 초과되었습니다.\n데이터 중복 문제로 인해 처리가 지연되고 있을 수 있습니다.');
    } else if (error.response?.status === 500) {
      alert('서버 내부 오류가 발생했습니다. (데이터 중복 가능성)');
    } else {
      alert('상세 정보를 불러올 수 없습니다.');
    }
  }
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedItem.value = null;
};

const handleSubmit = async (formData, isDraft = false) => {
  try {
    const submitData = {
      beneficiaryId: parseInt(formData.beneficiaryId, 10),
      counselingDate: formData.visit_date,
      counselingType: counselTypeReverseMap[formData.visit_type] || formData.visit_type || 'regular',
      satisfaction: reactionReverseMap[formData.reaction] || formData.reaction || 'normal',
      visitPurpose: formData.visit_detail || (isDraft ? '' : '방문 상담'),
      attendees: formData.observed_condition || (isDraft ? '' : '수급자'),
      discussionContent: formData.subjective_needs || (isDraft ? '' : '상담 진행'),
      agreementContent: formData.counselor_notes || (isDraft ? '' : '상담 완료'),
      counselorSignUrl: formData.counselorSignUrl || '',
      guardianSignUrl: formData.guardianSignUrl || '',
      nextVisitDate: formData.next_action || null,
      isDraft: isDraft,
      careWorkerId: userStore.userId, 
      employeeId: userStore.userId
    };

    await createCounselingLog(submitData);
    alert(isDraft ? '임시저장 되었습니다.' : '방문상담이 성공적으로 제출되었습니다.');
    mainTab.value = 'history';
    await loadCounselingHistory();
  } catch (error) {
    if (error.response?.status === 500) {
      alert('서버 내부 오류가 발생했습니다. (데이터 중복 가능성)\n관리자에게 문의해 주세요.');
    } else {
      alert(isDraft ? '임시저장에 실패했습니다.' : '방문상담 제출에 실패했습니다.');
    }
  }
};

const handleSaveDraft = (formData) => { 
  handleSubmit(formData, true);
};

const openEditModal = async (item) => {
  try {
    editingItemId.value = item.id;
    // selectedItem에 있는 데이터를 기반으로 수정 폼 초기화
    editForm.value = {
      ...item,
      // UI 텍스트를 다시 폼 값(코드)으로 변환할 필요가 있음 (computed에서 처리)
    };
    showEditModal.value = true;
  } catch (error) {
    alert('수정 데이터를 불러오는데 실패했습니다.');
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingItemId.value = null;
  editForm.value = null;
};

// 수정 폼 데이터 변환
const editFormData = computed(() => {
  if (!editForm.value) return null;
  
  // UI 텍스트 -> 폼 코드 역변환
  const typeCode = Object.keys(counselTypeMap).find(key => counselTypeMap[key] === editForm.value.counselType) || 'regular';
  const reactCode = Object.keys(reactionMap).find(key => reactionMap[key] === editForm.value.reaction) || 'normal';
  
  // 날짜 포맷팅 (YYYY-MM-DDTHH:mm)
  let formattedDate = '';
  if (editForm.value.visitDate) {
    formattedDate = editForm.value.visitDate.length > 16 ? editForm.value.visitDate.slice(0, 16) : editForm.value.visitDate;
  }

  return {
    beneficiaryId: editForm.value.beneficiaryId,
    recipientName: editForm.value.recipientName, // 수급자명 추가
    visit_date: formattedDate,
    visit_type: typeCode, // regular, initial 등
    reaction: reactCode,  // good, bad 등
    visit_detail: editForm.value.visitPurpose,
    observed_condition: editForm.value.observedCondition,
    subjective_needs: editForm.value.subjectiveNeeds,
    counselor_notes: editForm.value.counselorNotes,
    next_action: (editForm.value.nextVisit === '-' ? '' : editForm.value.nextVisit),
    counselorSignUrl: editForm.value.counselorSignUrl,
    guardianSignUrl: editForm.value.guardianSignUrl
  };
});

// ... (skip lines 171-192)

const handleEditSubmit = async (formData, isDraft = false) => {
  try {
    const updateData = {
      beneficiaryId: parseInt(formData.beneficiaryId, 10),
      counselingDate: formData.visit_date,
      counselingType: counselTypeReverseMap[formData.visit_type] || formData.visit_type,
      satisfaction: reactionReverseMap[formData.reaction] || formData.reaction,
      visitPurpose: formData.visit_detail,
      attendees: formData.observed_condition,
      discussionContent: formData.subjective_needs,
      agreementContent: formData.counselor_notes,
      counselorSignUrl: formData.counselorSignUrl || '', 
      guardianSignUrl: formData.guardianSignUrl || '',
      nextVisitDate: (formData.next_action && formData.next_action !== '-') ? formData.next_action : null,
      isDraft: isDraft,
      careWorkerId: userStore.userId, 
      employeeId: userStore.userId
    };

    await updateCounselingLog(editingItemId.value, updateData);
    await loadCounselingHistory();
    // 상세창 데이터 갱신을 위해 다시 조회하거나 목록 갱신 후 닫기
    alert(isDraft ? "임시저장 되었습니다." : "수정되었습니다.");
    closeEditModal();
    closeDetailModal(); 
  } catch (error) {
    if (error.response?.status === 500) {
      alert('서버 내부 오류가 발생했습니다. (데이터 중복 가능성 or 날짜 형식 오류)\n관리자에게 문의해 주세요.');
    } else {
      alert(isDraft ? "임시저장 실패" : "수정에 실패했습니다.");
    }
  }
};

const handleEditDraft = (formData) => {
  handleEditSubmit(formData, true);
};

const deleteHistory = async (id) => {
  if (!confirm("삭제하시겠습니까?")) return;
  try {
    await deleteCounselingLog(id);
    await loadCounselingHistory();
    closeDetailModal();
    alert("삭제되었습니다.");
  } catch (error) {
    alert("삭제 실패");
  }
};

// --- 서명 로직 (저장 포함) ---
const openSignatureModal = (type) => {
  signatureType.value = type;
  showSignatureModal.value = true;
  setTimeout(() => resetCanvas(), 100);
};

const closeSignatureModal = () => {
  showSignatureModal.value = false;
  signatureType.value = "";
};

const resetCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  // 흰색 배경으로 채우기 (투명 배경 방지)
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
};

const pointerPos = (event) => {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
};
const startDraw = (event) => { event.preventDefault(); isDrawing.value = true; lastPoint.value = pointerPos(event); };
const draw = (event) => { if (!isDrawing.value) return; event.preventDefault(); const canvas = canvasRef.value; const ctx = canvas.getContext("2d"); const { x, y } = pointerPos(event); ctx.beginPath(); ctx.moveTo(lastPoint.value.x, lastPoint.value.y); ctx.lineTo(x, y); ctx.stroke(); lastPoint.value = { x, y }; };
const endDraw = () => { isDrawing.value = false; };

// 서명 저장 및 API 호출
const saveSignature = async () => {
  if (!selectedItem.value) return;
  const canvas = canvasRef.value;
  const dataUrl = canvas.toDataURL("image/png"); // PNG 포맷

  try {
    // 1. 현재 상세 데이터 가져오기 (기존 값 유지)
    const currentItem = selectedItem.value;
    
    // 2. API 전송용 데이터 구성
    const updateData = {
      beneficiaryId: parseInt(currentItem.beneficiaryId, 10),
      counselingDate: currentItem.visitDate, // 원본 날짜 (YYYY-MM-DDTHH:mm format needed if not formatted)
      // UI 텍스트 -> API 코드 변환
      counselingType: counselTypeReverseMap[currentItem.counselType] || currentItem.counselType,
      satisfaction: reactionReverseMap[currentItem.reaction] || currentItem.reaction,
      visitPurpose: currentItem.visitPurpose,
      attendees: currentItem.observedCondition,
      discussionContent: currentItem.subjectiveNeeds,
      agreementContent: currentItem.counselorNotes,
      nextVisitDate: currentItem.nextVisit && currentItem.nextVisit !== '-' ? currentItem.nextVisit : null,
      
      // *** 서명 업데이트 ***
      counselorSignUrl: signatureType.value === 'caregiver' ? dataUrl : (currentItem.counselorSignUrl || null),
      guardianSignUrl: signatureType.value === 'recipient' ? dataUrl : (currentItem.guardianSignUrl || null)
    };

    // 날짜 포맷 안전 장치 (필요 시)
    if (updateData.counselingDate.length < 16) {
        // 날짜 형식이 안 맞을 경우 현재 시간 또는 원본 유지 등 처리 필요
        // 여기선 단순화
        updateData.counselingDate = new Date().toISOString().slice(0, 16);
    }

    // 3. 업데이트 API 호출
    await updateCounselingLog(currentItem.id, updateData);

    // 4. 로컬 상태 즉시 업데이트 (화면 반영)
    if (signatureType.value === "recipient") {
      selectedItem.value.recipientSigned = true;
      selectedItem.value.guardianSignUrl = dataUrl;
    } else {
      selectedItem.value.caregiverSigned = true;
      selectedItem.value.counselorSignUrl = dataUrl;
    }

    alert("서명이 저장되었습니다.");
    closeSignatureModal();
    
    // 5. 목록 백그라운드 갱신
    await loadCounselingHistory();

  } catch (error) {
    alert("서명 저장 중 오류가 발생했습니다.");
  }
};

onMounted(() => {
  loadCounselingHistory();
});
</script>

<template>
  <div class="visit-counsel-page">
    <main class="main-content">
      <div class="main-tabs">
        <button
          v-for="tab in mainTabs"
          :key="tab.key"
          class="main-tab-btn"
          :class="{ active: mainTab === tab.key }"
          @click="mainTab = tab.key"
        >
          <Icon :icon="tab.icon" class="tab-icon" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div v-if="mainTab === 'write'" class="write-section">
        <VisitCounselForm @submit="handleSubmit" @save-draft="handleSaveDraft" />
      </div>

      <div v-else class="history-section">
        <div class="history-header">
          <div class="header-left">
            <h2 class="history-title">방문상담 작성 내역</h2>
            <p class="history-count">총 {{ filteredCounselHistory.length }}건</p>
          </div>
          <div class="search-bar">
            <select v-model="selectedCounselType" class="type-filter">
              <option value="">전체 유형</option>
              <option v-for="type in Object.keys(counselTypeReverseMap)" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
            <input 
              type="text" 
              :value="searchQuery"
              @input="searchQuery = $event.target.value"
              placeholder="수급자 검색..." 
              class="search-input"
            />
          </div>
        </div>

        <div class="history-list">
          <div 
            v-for="item in paginatedHistory" 
            :key="item.id" 
            class="counsel-row"
            @click="openDetail(item)"
          >
            <div class="row-col basic-info">
              <div class="name-wrapper">
                <span class="recipient-name">{{ item.recipientName }}</span>
              </div>
            </div>

            <div class="row-col date-info">
              <span class="row-date">{{ item.date }}</span>
            </div>

            <div class="row-col type-info">
              <span class="type-tag">{{ item.counselType }}</span>
              <span class="reaction-tag" :class="{'bad': item.reaction.includes('불만')}">
                {{ item.reaction }}
              </span>
            </div>

            <div class="row-col status-info">
               <span class="status-badge" :class="{ 'draft': item.status === '임시저장' }">{{ item.status }}</span>
            </div>

            <div class="row-col action-col">
              <Icon icon="line-md:chevron-right" class="chevron" />
            </div>
          </div>
        </div>

        <!-- 페이지네이션 컨트롤 -->
        <div class="pagination-controls" v-if="totalPages > 0">
          <button 
            class="page-btn prev-btn" 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
          >
            <Icon icon="line-md:chevron-left" />
          </button>
          
          <button 
            v-for="page in totalPages" 
            :key="page" 
            class="page-btn number-btn" 
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          
          <button 
            class="page-btn next-btn" 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)"
          >
            <Icon icon="line-md:chevron-right" />
          </button>
        </div>
      </div>
    </main>

    <div v-if="showDetailModal && selectedItem" class="modal-overlay" @click.self="closeDetailModal">
      <div class="modal-content detail-modal">
        <div class="modal-header">
          <h3>방문상담 상세 정보</h3>
          <button class="modal-close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4 class="section-title">방문 목적</h4>
            <p class="section-content">{{ selectedItem.visitPurpose }}</p>
          </div>
          <div class="detail-section">
            <h4 class="section-title">참석자 / 상태</h4>
            <p class="section-content">{{ selectedItem.observedCondition }}</p>
          </div>
          <div class="detail-section highlight">
            <h4 class="section-title">주요 논의사항</h4>
            <p class="section-content">{{ selectedItem.subjectiveNeeds }}</p>
          </div>
          <div class="detail-section success">
            <h4 class="section-title">합의 및 조치사항</h4>
            <p class="section-content">{{ selectedItem.counselorNotes }}</p>
          </div>
          <div class="detail-section next-visit">
            <span class="label"><Icon icon="line-md:calendar" /> 다음 방문 예정:</span>
            <span class="value">{{ selectedItem.nextVisit }}</span>
          </div>

          <div class="signature-section">
            <div class="signature-box" @click="openSignatureModal('recipient')">
              <span class="sig-label">수급자 서명</span>
              <div v-if="selectedItem.guardianSignUrl" class="sig-img-wrapper">
                 <img :src="selectedItem.guardianSignUrl" alt="수급자 서명" class="sig-img" />
              </div>
              <div v-else class="sig-status">
                서명 하기 <Icon icon="line-md:edit-twotone" />
              </div>
            </div>

            <div class="signature-box" @click="openSignatureModal('caregiver')">
              <span class="sig-label">요양보호사 서명</span>
              <div v-if="selectedItem.counselorSignUrl" class="sig-img-wrapper">
                 <img :src="selectedItem.counselorSignUrl" alt="요양보호사 서명" class="sig-img" />
              </div>
              <div v-else class="sig-status">
                 서명 하기 <Icon icon="line-md:edit-twotone" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDetailModal">닫기</button>
          <button class="btn-secondary" @click="openEditModal(selectedItem)">수정</button>
          <button class="btn-danger" @click="deleteHistory(selectedItem.id)">삭제</button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content edit-modal">
        <div class="modal-header">
          <h3>방문상담 수정</h3>
          <button class="modal-close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <VisitCounselForm
            v-if="editForm"
            :initialData="editFormData"
            @submit="handleEditSubmit"
            @save-draft="handleEditDraft"
          />
        </div>
      </div>
    </div>

    <div v-if="showSignatureModal" class="modal-overlay signature-overlay" @click="closeSignatureModal">
      <div class="modal-content signature-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ signatureType === "recipient" ? "수급자 서명" : "요양보호사 서명" }}</h3>
          <button class="modal-close-btn" @click="closeSignatureModal">×</button>
        </div>
        <div class="modal-body">
          <div class="signature-pad">
            <p class="signature-instruction">패드 위에 정자로 서명해 주세요.</p>
            <canvas
              ref="canvasRef"
              class="signature-canvas"
              width="500"
              height="200"
              @pointerdown="startDraw"
              @pointermove="draw"
              @pointerup="endDraw"
              @pointerleave="endDraw"
            ></canvas>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeSignatureModal">취소</button>
          <button class="btn-save" @click="saveSignature">서명 저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 페이지 기본 설정 */
.visit-counsel-page {
  background-color: transparent;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  padding-bottom: 3rem;
}

/* 탭 스타일 */
.main-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.main-tab-btn {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
  border: none; background: transparent; color: #6b7280;
  font-weight: 600; font-size: 0.875rem; cursor: pointer;
  transition: all 0.2s; border-bottom: 3px solid transparent;
}
.main-tab-btn.active { color: #16a34a; border-bottom-color: #16a34a; background: #f0fdf4; }
.tab-icon { font-size: 1.125rem; }

/* 작성 내역 리스트 (Row Style) */
.history-section { padding: 0; }

.history-header {
  margin-bottom: 1.5rem; padding: 1.5rem;
  background: white; border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 1rem;
}

.header-left { display: flex; flex-direction: column; gap: 4px; }
.search-bar { display: flex; align-items: center; }

.type-filter {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 150px;
  transition: all 0.2s;
  margin-right: 8px;
  cursor: pointer;
  background-color: white;
}
.type-filter:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 200px;
  transition: all 0.2s;
}
.search-input:focus {
  outline: none;
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.1);
}

.history-title { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin: 0 0 0.5rem 0; }
.history-count { font-size: 0.875rem; color: #6b7280; margin: 0; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.counsel-row {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 24px;
  display: grid;
  /* 그리드: 이름 | 날짜 | 유형/만족도 | 상태 | 화살표 */
  grid-template-columns: 1.2fr 1.5fr 2fr 1fr 40px;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  cursor: pointer;
}

.counsel-row:hover {
  border-color: #8b5cf6; /* 보라색 테마 */
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  transform: translateX(4px);
}

.row-col.basic-info .recipient-name { font-size: 1rem; font-weight: 700; color: #1f2937; }
.row-col.date-info .row-date { font-size: 0.9rem; color: #374151; font-weight: 600; }

.row-col.type-info { display: flex; gap: 8px; align-items: center; }
.type-tag {
  font-size: 0.8rem; font-weight: 600; color: #4b5563;
  background: #f3f4f6; padding: 2px 6px; border-radius: 4px;
}
.reaction-tag { font-size: 0.8rem; color: #16a34a; font-weight: 600; }
.reaction-tag.bad { color: #dc2626; }

.status-badge {
  display: inline-block; padding: 2px 8px; background: #dcfce7;
  color: #16a34a; font-size: 0.7rem; font-weight: 600; border-radius: 4px;
}

.row-col.action-col { text-align: right; color: #d1d5db; font-size: 1.5rem; font-weight: 300; }

/* 페이지네이션 스타일 */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #16a34a;
  color: #16a34a;
  background: #f0fdf4;
}

.page-btn.active {
  background: #16a34a;
  border-color: #16a34a;
  color: white;
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

/* 상세 모달 스타일 */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem; z-index: 2000;
}
.signature-overlay { z-index: 2100; } 

.modal-content {
  width: min(700px, 95%); background: white; border-radius: 0.75rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18); overflow: hidden;
  border: 1px solid #e5e7eb; display: flex; flex-direction: column; max-height: 90vh;
}
.edit-modal { width: min(900px, 95%); }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); /* 보라색 테마 */
}
.modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #581c87; }
.modal-close-btn {
  border: none; background: white; width: 32px; height: 32px; border-radius: 50%;
  font-size: 1.25rem; color: #6b7280; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.modal-body { padding: 1.5rem; overflow-y: auto; }

/* 상세 내용 섹션 */
.detail-section {
  background: #f9fafb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 0.75rem;
}
.detail-section.highlight { background: #eff6ff; border-left: 4px solid #3b82f6; }
.detail-section.success { background: #f0fdf4; border-left: 4px solid #16a34a; }
.section-title { font-size: 0.8rem; font-weight: 700; color: #374151; margin: 0 0 0.5rem 0; }
.section-content { font-size: 0.9rem; color: #4b5563; margin: 0; line-height: 1.5; }
.next-visit { display: flex; gap: 0.5rem; background: #fffbeb; color: #92400e; font-weight: 600; }

/* 서명 박스 */
.signature-section { display: flex; gap: 1rem; margin-top: 1.5rem; }
.signature-box {
  flex: 1; border: 2px dashed #d1d5db; border-radius: 0.5rem; padding: 1rem;
  text-align: center; cursor: pointer; transition: all 0.2s; position: relative;
  min-height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center;
}
.signature-box:hover { border-color: #8b5cf6; background: #faf5ff; }
.sig-label { font-size: 0.8rem; font-weight: 700; color: #6b7280; margin-bottom: 0.5rem; }
.sig-status { font-size: 0.85rem; color: #9ca3af; }
.sig-img-wrapper { width: 100%; height: 100px; display: flex; justify-content: center; align-items: center; }
.sig-img { max-width: 100%; max-height: 100%; object-fit: contain; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.5rem;
  padding: 1rem 1.25rem; border-top: 1px solid #e5e7eb; background: #f9fafb;
}

.btn-secondary { padding: 0.6rem 1.2rem; border-radius: 0.5rem; background: white; border: 1px solid #d1d5db; cursor: pointer; }
.btn-danger { padding: 0.6rem 1.2rem; border-radius: 0.5rem; background: #ef4444; color: white; border: none; cursor: pointer; }
.btn-save { padding: 0.6rem 1.2rem; border-radius: 0.5rem; background: #8b5cf6; color: white; border: none; cursor: pointer; }
.btn-cancel { padding: 0.6rem 1.2rem; border-radius: 0.5rem; background: white; border: 1px solid #d1d5db; cursor: pointer; }

/* 캔버스 */
.signature-canvas { width: 100%; border: 2px solid #e5e7eb; border-radius: 0.5rem; cursor: crosshair; }

@media (max-width: 768px) {
  .counsel-row { grid-template-columns: 1fr; gap: 8px; padding: 16px; }
  .row-col.action-col { display: none; }
  .signature-section { flex-direction: column; }
}
</style>