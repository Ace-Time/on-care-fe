<script setup>
import { onMounted, ref, computed } from "vue";
import VisitCounselForm from "@/components/careworker/activity/VisitCounselForm.vue";
import { createCounselingLog, getCounselingLogList, updateCounselingLog, deleteCounselingLog } from '@/api/careworker/counselingLogApi';

const mainTab = ref("write");
const mainTabs = [
  { key: "write", label: "작성하기", icon: "✏️" },
  { key: "history", label: "작성 내역", icon: "📑" },
];

const counselHistory = ref([]);
const loading = ref(false);

// 방문상담 목록 불러오기
const loadCounselingHistory = async () => {
  try {
    loading.value = true;
    const response = await getCounselingLogList();
    const data = response?.data ?? response;

    console.log('📊 방문상담 원본 데이터:', data);

    // 백엔드 응답 데이터를 프론트엔드 형식으로 변환
    counselHistory.value = (data || []).map(item => {
      console.log('📋 개별 항목:', item);
      console.log('📋 항목 키:', Object.keys(item));

      // 날짜 포맷 변환 (visitDate -> YYYY-MM-DD 형식)
      const visitDate = item.counselingDate || item.visitDate || item.visit_date || '';
      const dateObj = visitDate ? new Date(visitDate) : new Date();
      const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const dayOfWeek = dayNames[dateObj.getDay()];
      const formattedDate = visitDate ? `${visitDate.split('T')[0]} (${dayOfWeek})` : '-';

      // 상담 유형 레이블 변환 (백엔드는 띄어쓰기 없는 한글로 저장됨)
      const counselTypeMap = {
        // 띄어쓰기 없는 형태 (백엔드 실제 값)
        '초기상담': '초기 상담',
        '정기상담': '정기 상담',
        '긴급상담': '긴급 상담',
        '종결상담': '종결 상담',
        '보호자상담': '보호자 상담',
        // 짧은 형태
        '초기': '초기 상담',
        '정기': '정기 상담',
        '긴급': '긴급 상담',
        '종결': '종결 상담',
        '보호자': '보호자 상담',
        // 영어 코드 (프론트엔드에서 전송하는 값)
        'initial': '초기 상담',
        'regular': '정기 상담',
        'emergency': '긴급 상담',
        'intermediate': '종결 상담',
        'guardian': '보호자 상담'
      };

      // 반응 레이블 변환 (백엔드는 띄어쓰기 없는 한글로 저장됨)
      const reactionMap = {
        // 띄어쓰기 없는 형태 (백엔드 실제 값)
        '매우만족': '매우 만족',
        '만족': '만족',
        '보통': '보통',
        '불만족': '불만족',
        '매우불만족': '매우 불만족',
        // 영어 코드 (프론트엔드에서 전송하는 값)
        'very_good': '매우 만족',
        'good': '만족',
        'normal': '보통',
        'bad': '불만족',
        'very_bad': '매우 불만족'
      };

      return {
        id: item.counselingId || item.id,
        counselingId: item.counselingId || item.id,
        beneficiaryId: item.beneficiaryId,
        date: formattedDate,
        visitDate: visitDate, // 원본 날짜 저장 (수정 시 사용)
        recipientName: item.beneficiaryName || item.recipientName || '-',
        counselType: counselTypeMap[item.counselingType] || item.counselingType || '-',
        reaction: reactionMap[item.satisfaction] || item.satisfaction || '-',
        // 백엔드가 목록 조회 시 상세 필드를 반환하지 않음 (null로 설정)
        visitPurpose: item.visitPurpose || null,
        observedCondition: item.attendees || null,
        subjectiveNeeds: item.discussionContent || null,
        counselorNotes: item.agreementContent || null,
        counselorSignUrl: item.counselorSignUrl || '',
        guardianSignUrl: item.guardianSignUrl || '',
        nextVisit: item.nextVisitDate ? item.nextVisitDate.split('T')[0] : null,
        // 상세 정보 로드 여부 플래그
        detailsLoaded: false,
        status: item.status || '완료',
        recipientSigned: !!item.guardianSignUrl,
        caregiverSigned: !!item.counselorSignUrl,
      };
    });

    console.log('📊 변환된 방문상담 목록:', counselHistory.value);
  } catch (error) {
    console.error('❌ 방문상담 목록 불러오기 실패:', error);
    counselHistory.value = [];
  } finally {
    loading.value = false;
  }
};

// 서명 모달
const showSignatureModal = ref(false);
const signatureType = ref("");
const currentItemId = ref(null);
const canvasRef = ref(null);
const isDrawing = ref(false);
const lastPoint = ref({ x: 0, y: 0 });
const signatureData = ref(null);

// 수정/삭제 모달
const showEditModal = ref(false);
const editForm = ref(null);
const editingItemId = ref(null);

// 방문상담 제출 처리
const handleSubmit = async (formData) => {
  try {
    console.log("📝 방문상담 제출 데이터:", formData);

    // 필수 필드 검증
    if (!formData.beneficiaryId) {
      alert('수급자를 선택해주세요.');
      return;
    }

    // 상담 유형을 백엔드 형식으로 변환 (띄어쓰기 없는 한글)
    const counselTypeReverseMap = {
      'initial': '초기상담',
      'regular': '정기상담',
      'emergency': '긴급상담',
      'intermediate': '종결상담',
      'guardian': '보호자상담'
    };

    // 만족도를 백엔드 형식으로 변환 (띄어쓰기 없는 한글)
    const reactionReverseMap = {
      'very_good': '매우만족',
      'good': '만족',
      'normal': '보통',
      'bad': '불만족',
      'very_bad': '매우불만족'
    };

    // 프론트엔드 formData를 백엔드 API 형식으로 변환
    const submitData = {
      beneficiaryId: parseInt(formData.beneficiaryId, 10),
      counselingDate: formData.visit_date, // datetime-local (백엔드 필드명에 맞춤)
      counselingType: counselTypeReverseMap[formData.visit_type] || formData.visit_type || '정기상담', // 필수: 상담 유형 (띄어쓰기 없음)
      satisfaction: reactionReverseMap[formData.reaction] || formData.reaction || '보통', // 필수: 만족도
      visitPurpose: formData.visit_detail || '방문 상담', // 필수
      attendees: formData.observed_condition || '수급자', // 필수: 참석자
      discussionContent: formData.subjective_needs || '상담 진행', // 필수: 논의 내용
      agreementContent: formData.counselor_notes || '상담 완료', // 필수: 합의 내용
      counselorSignUrl: '', // 필수: 요양보호사 서명 URL (빈 문자열)
      guardianSignUrl: '', // 필수: 보호자 서명 URL (빈 문자열)
      nextVisitDate: formData.next_action || null // 선택
    };

    console.log('📤 API 전송 데이터:', submitData);

    const result = await createCounselingLog(submitData);
    console.log('✅ 방문상담 작성 완료. API 응답:', result);

    alert('방문상담이 성공적으로 제출되었습니다.');

    // 작성 내역 탭으로 전환하고 목록 새로고침
    mainTab.value = 'history';
    await loadCounselingHistory();
  } catch (error) {
    console.error('❌ 방문상담 제출 실패:', error);
    alert('방문상담 제출에 실패했습니다.');
  }
};

const handleSaveDraft = (data) => {
  console.log("방문상담 임시저장:", data);
  alert("임시저장 기능은 추후 구현 예정입니다.");
};

const openEditModal = async (item) => {
  try {
    editingItemId.value = item.id;

    // 백엔드에서 상세 정보 조회
    console.log('📝 방문상담 상세 조회:', item.counselingId);
    const { getCounselingLogDetail } = await import('@/api/careworker/counselingLogApi');
    const detailResponse = await getCounselingLogDetail(item.counselingId);
    const detailData = detailResponse?.data ?? detailResponse;

    console.log('📝 상세 응답 데이터:', detailData);

    // 상세 데이터와 목록 데이터 병합
    editForm.value = {
      ...item,
      // 상세 정보로 덮어쓰기
      visitPurpose: detailData.visitPurpose || item.visitPurpose,
      observedCondition: detailData.attendees || item.observedCondition,
      subjectiveNeeds: detailData.discussionContent || item.subjectiveNeeds,
      counselorNotes: detailData.agreementContent || item.counselorNotes,
      counselorSignUrl: detailData.counselorSignUrl || item.counselorSignUrl,
      guardianSignUrl: detailData.guardianSignUrl || item.guardianSignUrl,
      nextVisit: detailData.nextVisitDate || item.nextVisit,
    };

    console.log('📝 최종 편집 폼 데이터:', editForm.value);
    showEditModal.value = true;
  } catch (error) {
    console.error('❌ 방문상담 상세 조회 실패:', error);
    // 조회 실패 시 기존 데이터로 진행
    editForm.value = { ...item };
    showEditModal.value = true;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingItemId.value = null;
  editForm.value = null;
};

// 상세 정보 토글 함수
const toggleDetails = async (item) => {
  // 이미 로드된 경우 토글만
  if (item.detailsLoaded) {
    item.showDetails = !item.showDetails;
    return;
  }

  // 상세 정보 로드
  try {
    console.log('📝 상세 정보 조회:', item.counselingId);
    const { getCounselingLogDetail } = await import('@/api/careworker/counselingLogApi');
    const detailResponse = await getCounselingLogDetail(item.counselingId);
    const detailData = detailResponse?.data ?? detailResponse;

    console.log('📝 상세 데이터:', detailData);

    // 항목에 상세 정보 추가
    item.visitPurpose = detailData.visitPurpose || '정보 없음';
    item.observedCondition = detailData.attendees || '정보 없음';
    item.subjectiveNeeds = detailData.discussionContent || '정보 없음';
    item.counselorNotes = detailData.agreementContent || '정보 없음';
    item.nextVisit = detailData.nextVisitDate ? detailData.nextVisitDate.split('T')[0] : '-';
    item.detailsLoaded = true;
    item.showDetails = true;
  } catch (error) {
    console.error('❌ 상세 정보 조회 실패:', error);
    alert('상세 정보를 불러올 수 없습니다.');
  }
};

// 수정 폼 데이터 변환 (백엔드 응답 → 프론트엔드 폼 형식)
const editFormData = computed(() => {
  if (!editForm.value) return null;

  // 상담 유형 코드로 역변환
  const counselTypeCodeMap = {
    '초기 상담': 'initial',
    '정기 상담': 'regular',
    '긴급 상담': 'emergency',
    '종결 상담': 'intermediate',
    '보호자 상담': 'guardian'
  };

  // 만족도 코드로 역변환
  const satisfactionCodeMap = {
    '매우 만족': 'very_good',
    '만족': 'good',
    '보통': 'normal',
    '불만족': 'bad',
    '매우 불만족': 'very_bad'
  };

  return {
    beneficiaryId: editForm.value.beneficiaryId,
    visit_date: editForm.value.visitDate,
    visit_type: counselTypeCodeMap[editForm.value.counselType] || editForm.value.counselType,
    reaction: satisfactionCodeMap[editForm.value.reaction] || editForm.value.reaction,
    visit_detail: editForm.value.visitPurpose,
    observed_condition: editForm.value.observedCondition,
    subjective_needs: editForm.value.subjectiveNeeds,
    counselor_notes: editForm.value.counselorNotes,
    next_action: editForm.value.nextVisit
  };
});

// 수정 폼 제출 처리
const handleEditSubmit = async (formData) => {
  try {
    console.log('📝 방문상담 수정 데이터:', formData);

    // 상담 유형을 백엔드 형식으로 변환 (띄어쓰기 없는 한글)
    const counselTypeReverseMap = {
      'initial': '초기상담',
      'regular': '정기상담',
      'emergency': '긴급상담',
      'intermediate': '종결상담',
      'guardian': '보호자상담'
    };

    // 만족도를 백엔드 형식으로 변환 (띄어쓰기 없는 한글)
    const reactionReverseMap = {
      'very_good': '매우만족',
      'good': '만족',
      'normal': '보통',
      'bad': '불만족',
      'very_bad': '매우불만족'
    };

    // 프론트엔드 formData를 백엔드 API 형식으로 변환
    const updateData = {
      beneficiaryId: parseInt(formData.beneficiaryId, 10),
      counselingDate: formData.visit_date, // 백엔드 필드명에 맞춤
      counselingType: counselTypeReverseMap[formData.visit_type] || formData.visit_type || '정기상담', // 필수 (띄어쓰기 없음)
      satisfaction: reactionReverseMap[formData.reaction] || formData.reaction || '보통', // 필수
      visitPurpose: formData.visit_detail || '방문 상담', // 필수
      attendees: formData.observed_condition || '수급자', // 필수
      discussionContent: formData.subjective_needs || '상담 진행', // 필수
      agreementContent: formData.counselor_notes || '상담 완료', // 필수
      counselorSignUrl: editForm.value.counselorSignUrl || '', // 필수
      guardianSignUrl: editForm.value.guardianSignUrl || '', // 필수
      nextVisitDate: formData.next_action || null // 선택
    };

    console.log('📤 API 전송 데이터:', updateData);

    await updateCounselingLog(editingItemId.value, updateData);

    // 목록 새로고침
    await loadCounselingHistory();

    alert("방문상담 내역이 수정되었습니다.");
    closeEditModal();
  } catch (error) {
    console.error('❌ 방문상담 수정 실패:', error);
    alert("방문상담 내역 수정에 실패했습니다.");
  }
};

const deleteHistory = async (id) => {
  const targetId = id ?? editingItemId.value;
  if (!targetId) return;
  if (!confirm("이 방문상담 내역을 삭제하시겠습니까?")) return;

  try {
    await deleteCounselingLog(targetId);

    // 목록 새로고침
    await loadCounselingHistory();

    if (editingItemId.value === targetId) {
      closeEditModal();
    }
    alert("삭제되었습니다.");
  } catch (error) {
    console.error('❌ 방문상담 삭제 실패:', error);
    alert("방문상담 내역 삭제에 실패했습니다.");
  }
};

const openSignatureModal = (itemId, type) => {
  currentItemId.value = itemId;
  signatureType.value = type;
  showSignatureModal.value = true;
  signatureData.value = null;
  resetCanvas();
};

const closeSignatureModal = () => {
  showSignatureModal.value = false;
  signatureType.value = "";
  currentItemId.value = null;
};

const pointerPos = (event) => {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
};

const startDraw = (event) => {
  event.preventDefault();
  isDrawing.value = true;
  lastPoint.value = pointerPos(event);
};

const draw = (event) => {
  if (!isDrawing.value) return;
  event.preventDefault();
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { x, y } = pointerPos(event);
  ctx.beginPath();
  ctx.moveTo(lastPoint.value.x, lastPoint.value.y);
  ctx.lineTo(x, y);
  ctx.stroke();
  lastPoint.value = { x, y };
};

const endDraw = () => {
  isDrawing.value = false;
};

const resetCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#1f2937";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
};

const saveSignature = () => {
  const item = counselHistory.value.find((i) => i.id === currentItemId.value);
  if (!item) return;
  const dataUrl = canvasRef.value?.toDataURL();
  if (signatureType.value === "recipient") {
    item.recipientSigned = true;
    item.recipientSignature = dataUrl;
  } else if (signatureType.value === "caregiver") {
    item.caregiverSigned = true;
    item.caregiverSignature = dataUrl;
  }
  signatureData.value = dataUrl;
  alert("서명이 저장되었습니다.");
  closeSignatureModal();
};

onMounted(() => {
  resetCanvas();
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
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <div v-if="mainTab === 'write'" class="write-section">
        <VisitCounselForm @submit="handleSubmit" @save-draft="handleSaveDraft" />
      </div>

      <div v-else class="history-section">
        <div class="history-header">
          <h2 class="history-title">방문상담 작성 내역</h2>
          <p class="history-count">총 {{ counselHistory.length }}건의 상담이 등록되었습니다</p>
        </div>

        <div class="history-list">
          <div v-for="item in counselHistory" :key="item.id" class="counsel-card">
            <div class="card-header">
              <div class="recipient-info">
                <div class="avatar-circle">👤</div>
                <div class="recipient-details">
                  <h3 class="recipient-name">{{ item.recipientName }}</h3>
                  <p class="counsel-date">{{ item.date }}</p>
                </div>
              </div>
              <span class="status-badge completed">{{ item.status }}</span>
            </div>

            <div class="counsel-info-grid">
              <div class="info-field">
                <span class="field-label">상담 유형</span>
                <span class="field-value">{{ item.counselType }}</span>
              </div>
              <div class="info-field">
                <span class="field-label">만족도</span>
                <span class="field-value">{{ item.reaction }}</span>
              </div>
            </div>

            <!-- 상세보기 버튼 -->
            <div v-if="!item.detailsLoaded" class="details-toggle">
              <button @click="toggleDetails(item)" class="btn-show-details">
                📋 상세 정보 보기
              </button>
            </div>

            <!-- 상세 정보 (로드 후 표시) -->
            <template v-if="item.detailsLoaded">
              <div class="section-box">
                <h4 class="section-title">방문 목적</h4>
                <p class="section-content">{{ item.visitPurpose }}</p>
              </div>

              <div class="section-box">
                <h4 class="section-title">참석 가족</h4>
                <p class="section-content">{{ item.observedCondition }}</p>
              </div>

              <div class="section-box highlight">
                <h4 class="section-title">주요 논의사항</h4>
                <p class="section-content">{{ item.subjectiveNeeds }}</p>
              </div>

              <div class="section-box success">
                <h4 class="section-title">합의 사항</h4>
                <p class="section-content">{{ item.counselorNotes }}</p>
              </div>

              <div class="next-visit">
                <span class="calendar-icon">📅</span>
                <span class="next-visit-label">다음 방문 예정:</span>
                <span class="next-visit-date">{{ item.nextVisit }}</span>
              </div>
            </template>

            <div class="card-footer">
              <div class="signature-section">
                <button
                  class="signature-btn"
                  :class="{ signed: item.recipientSigned }"
                  @click="openSignatureModal(item.id, 'recipient')"
                >
                  <span class="signature-icon">{{ item.recipientSigned ? "✅" : "✍️" }}</span>
                  <span class="signature-label">수급자 서명</span>
                </button>
                <button
                  class="signature-btn"
                  :class="{ signed: item.caregiverSigned }"
                  @click="openSignatureModal(item.id, 'caregiver')"
                >
                  <span class="signature-icon">{{ item.caregiverSigned ? "✅" : "✍️" }}</span>
                  <span class="signature-label">요양보호사 서명</span>
                </button>
              </div>
              <div class="action-buttons">
                <button class="btn-edit" @click="openEditModal(item)">✏️ 수정</button>
                <button class="btn-delete" @click="deleteHistory(item.id)">🗑️ 삭제</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
        <div class="modal-content edit-modal" @click.stop>
          <div class="modal-header">
            <h3>방문상담 수정</h3>
            <button class="modal-close-btn" @click="closeEditModal">×</button>
          </div>
          <div class="modal-body">
            <VisitCounselForm
              v-if="editForm"
              :initialData="editFormData"
              @submit="handleEditSubmit"
            />
          </div>
        </div>
      </div>

      <div v-if="showSignatureModal" class="modal-overlay" @click="closeSignatureModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>{{ signatureType === "recipient" ? "수급자 서명" : "요양보호사 서명" }}</h3>
            <button class="modal-close-btn" @click="closeSignatureModal">×</button>
          </div>
          <div class="modal-body">
            <div class="signature-pad">
              <p class="signature-instruction">패드 위에 서명해 주세요.</p>
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
    </main>
  </div>
</template>

<style scoped>
/* 페이지 전체 컨테이너: 부모 크기에 맞춤 (투명, 100%) */
.visit-counsel-page {
  background-color: transparent; /* 변경 */
  width: 100%; /* 변경 */
  height: 100%; /* 변경 */
  display: flex;
  flex-direction: column;
}

/* 메인 컨텐츠 영역: 제한 해제 및 여백 제거 */
.main-content {
  flex: 1;
  width: 100%;
  max-width: none; /* 변경 */
  margin: 0; /* 변경 */
  padding: 0; /* 변경 */
  padding-bottom: 3rem;
}

/* -------------------------------------------
   아래는 기존 디자인 유지
   ------------------------------------------- */

.main-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.main-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.main-tab-btn:hover {
  color: #16a34a;
  background: #f0fdf4;
}

.main-tab-btn.active {
  color: #16a34a;
  border-bottom-color: #16a34a;
  background: #f0fdf4;
}

.tab-icon {
  font-size: 1.125rem;
}

.history-section {
  padding: 0;
}

.history-header {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.history-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.history-count {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.counsel-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.counsel-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.recipient-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.recipient-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recipient-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.counsel-date {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.completed {
  background: #dcfce7;
  color: #16a34a;
}

.counsel-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}

.field-value {
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
}

.section-box {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.section-box.highlight {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.section-box.success {
  background: #f0fdf4;
  border-left: 4px solid #16a34a;
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.section-content {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0;
  line-height: 1.6;
}

.next-visit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.calendar-icon {
  font-size: 1.125rem;
}

.next-visit-label {
  font-size: 0.875rem;
  color: #92400e;
  font-weight: 600;
}

.next-visit-date {
  font-size: 0.875rem;
  color: #92400e;
  font-weight: 700;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.signature-section {
  display: flex;
  gap: 0.75rem;
  flex: 1;
}

.signature-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px dashed #d1d5db;
  background: white;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.signature-btn:hover {
  border-color: #8b5cf6;
  background: #faf5ff;
  color: #8b5cf6;
}

.signature-btn.signed {
  border-color: #16a34a;
  border-style: solid;
  background: #dcfce7;
  color: #16a34a;
}

.signature-icon {
  font-size: 1.125rem;
}

.signature-label {
  font-size: 0.8125rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons button {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-edit {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-edit:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

/* 상세보기 버튼 */
.details-toggle {
  margin: 1rem 0;
  text-align: center;
}

.btn-show-details {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.btn-show-details:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.btn-show-details:active {
  transform: translateY(0);
}

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
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-content.edit-modal {
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close-btn {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-close-btn:hover {
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.signature-pad {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.signature-instruction {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  text-align: center;
}

.signature-canvas {
  width: 100%;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background: #f9fafb;
  cursor: crosshair;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
}

.btn-save {
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  background: #8b5cf6;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.edit-field span {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #374151;
}

.edit-field input,
.edit-field textarea {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.9375rem;
  color: #111827;
  resize: vertical;
}

.edit-field.full {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .main-tabs {
    flex-direction: column;
    border-bottom: none;
  }

  .main-tab-btn {
    border-bottom: none;
    border-left: 3px solid transparent;
  }

  .main-tab-btn.active {
    border-left-color: #16a34a;
    border-bottom-color: transparent;
  }

  .history-header {
    padding: 1rem;
  }

  .history-title {
    font-size: 1.125rem;
  }

  .history-count {
    font-size: 0.8125rem;
  }

  .counsel-card {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .status-badge {
    align-self: flex-start;
  }

  .avatar-circle {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .recipient-name {
    font-size: 1rem;
  }

  .counsel-info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .section-box {
    padding: 0.75rem;
  }

  .section-title {
    font-size: 0.75rem;
  }

  .section-content {
    font-size: 0.8125rem;
  }

  .next-visit {
    flex-wrap: wrap;
    padding: 0.625rem 0.875rem;
  }

  .card-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .signature-section {
    flex-direction: column;
    width: 100%;
  }

  .signature-btn {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
  }

  .action-buttons button {
    flex: 1;
  }

  .modal-content {
    max-width: 100%;
    margin: 1rem;
  }

  .signature-canvas {
    width: 100%;
    height: 150px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }

  .edit-grid {
    grid-template-columns: 1fr;
  }
}
</style>