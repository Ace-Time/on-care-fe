<!-- src/components/recipient/main/category/servicerental/Rental.vue -->
<template>
  <div class="rental-wrapper">
    <div class="rental-header">
      <h4>렌탈 용품</h4>
      <span class="rental-count">총 {{ rentals.length }}개</span>
    </div>

    <!-- ✅ 단일 리스트 -->
    <ul class="svc-card-list scroll-list">
      <li v-if="!beneficiaryId" class="empty">수급자를 선택해주세요.</li>
      <li v-else-if="loading" class="empty">불러오는 중...</li>
      <li v-else-if="errorMsg" class="empty">{{ errorMsg }}</li>
      <li v-else-if="rentals.length === 0" class="empty">렌탈 이력이 없습니다.</li>

      <li
        v-else
        v-for="item in rentals"
        :key="itemKey(item)"
        class="svc-card rental-card"
        :class="{ current: !isEnded(item) }"
        @click="openModal(item)"
      >
        <div class="svc-left">
          <span class="pill code-pill">{{ item.productAssetId }}</span>
          <span class="svc-name">{{ item.productName }}</span>

          <!-- ✅ 상태 뱃지 (종료면 회색, 그 외 초록) -->
          <span class="pill status-pill" :class="statusPillClass(item.contractStatusName)">
            {{ item.contractStatusName || (isEnded(item) ? "종료" : "계약중") }}
          </span>
        </div>

        <div class="svc-right">
          <span class="rental-meta">
            {{ item.startDate }} ~ {{ item.endDate || (isEnded(item) ? "-" : "진행중") }}
          </span>

          <span class="svc-amount">{{ formatCurrency(item.monthlyAmount) }}</span>

          <span class="pill month-pill">
            {{ item.durationMonths ? item.durationMonths + "개월" : "" }}
          </span>

          <span class="svc-status">상세</span>
        </div>
      </li>
    </ul>

    <!-- ✅ 모달 -->
    <RentalModal
      v-model="showModal"
      :beneficiary-id="beneficiaryId"
      :type="selectedType"
      :summary-item="selectedRental"
      @completed="handleCompleted"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, toRaw } from "vue"; // ✅ toRaw 추가
import api from "@/lib/api";
import RentalModal from "../modal/RentalModal.vue";

const props = defineProps({
  beneficiaryId: { type: Number, default: null },
});

const loading = ref(false);
const errorMsg = ref("");

/** ✅ 단일 리스트 */
const rentals = ref([]);

/** ✅ 모달 상태 */
const showModal = ref(false);
const selectedRental = ref(null);

/**
 * ✅ 기존 모달이 type(current/past)을 받는 구조라 유지
 * - 단일 리스트지만 "표시/버튼 제어용"으로만 사용
 */
const selectedType = ref("current");

const formatCurrency = (n) => `${(n ?? 0).toLocaleString("ko-KR")}원`;

/** ✅ 종료 판단(표시 기준): cs.name 기준 */
const isEnded = (it) => String(it?.contractStatusName || "").trim() === "종료";

/** ✅ key는 rp.id(구분값) 우선 */
const itemKey = (it) => {
  if (it?.rentalProductId != null) return `rp-${it.rentalProductId}`;
  return `rc-${it?.rentalContractId ?? "x"}-pa-${it?.productAssetId ?? "x"}`;
};

/** ✅ 상태 뱃지 클래스 */
const statusPillClass = (statusName) => {
  const s = String(statusName || "").trim();
  return s === "종료" ? "ended" : "using";
};

/**
 * ✅ 백엔드 응답을 최대한 유연하게 처리
 * - 1) { items: [...] }
 * - 2) 그냥 배열 [...]
 * - 3) 예전형 { current: [...], history: [...] }
 */
const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.current) || Array.isArray(data?.history)) {
    return [...(data.current ?? []), ...(data.history ?? [])];
  }
  return [];
};

/** ✅ 단일 리스트 조회 */
const fetchRentals = async () => {
  if (!props.beneficiaryId) {
    rentals.value = [];
    return;
  }

  loading.value = true;
  errorMsg.value = "";

  try {
    const { data } = await api.get(`/api/beneficiaries/${props.beneficiaryId}/rentals`);
    const list = normalizeList(data);

    // ✅ 프론트 정렬: (종료 아닌 것 먼저) -> startDate 최신순 -> rp.id 내림차순
    rentals.value = [...list].sort((a, b) => {
      const aEnded = isEnded(a) ? 1 : 0;
      const bEnded = isEnded(b) ? 1 : 0;
      if (aEnded !== bEnded) return aEnded - bEnded;

      const ad = String(a?.startDate || "");
      const bd = String(b?.startDate || "");
      if (ad < bd) return 1;
      if (ad > bd) return -1;

      return Number(b?.rentalProductId ?? 0) - Number(a?.rentalProductId ?? 0);
    });
  } catch (e) {
    console.error(e);
    rentals.value = [];
    errorMsg.value = "렌탈 정보를 불러오지 못했습니다.";
  } finally {
    loading.value = false;
  }
};

/**
 * ✅ (중요) 모달에 넘길 때는 "순수 객체"로 만들어서 넘겨야 DataCloneError 안 남
 * - structuredClone / JSON.stringify 절대 의존하지 말고
 * - 필요한 필드만 뽑아서 새 객체로 만들어서 전달
 */
const toPlainRental = (item) => {
  const raw = toRaw(item);
  return {
    rentalProductId: raw?.rentalProductId ?? null,   // rp.id (구분값)
    rentalContractId: raw?.rentalContractId ?? null, // rc.id
    productAssetId: raw?.productAssetId ?? null,     // cp.id
    productName: raw?.productName ?? null,
    contractStatusName: raw?.contractStatusName ?? null, // cs.name
    rentalStatusName: raw?.rentalStatusName ?? null,     // rps.name (있으면)
    startDate: raw?.startDate ?? null,               // rc.start_date
    endDate: raw?.endDate ?? null,                   // rc.end_date
    monthlyAmount: raw?.monthlyAmount ?? null,
    durationMonths: raw?.durationMonths ?? null,
  };
};

/** ✅ 클릭 → 모달 오픈 */
const openModal = (item) => {
  selectedRental.value = toPlainRental(item);      // ✅ 여기!
  selectedType.value = isEnded(item) ? "past" : "current"; // (버튼 제어용)
  showModal.value = true;
};

/** ✅ 모달에서 완료처리 성공하면 목록 재조회 */
const handleCompleted = async (res) => {
  if (res?.success) await fetchRentals();
};

onMounted(fetchRentals);

watch(
  () => props.beneficiaryId,
  () => {
    showModal.value = false;
    selectedRental.value = null;
    selectedType.value = "current";
    fetchRentals();
  }
);
</script>

<style scoped>
.rental-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ✅ 상단 헤더 */
.rental-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 2px 6px;
}
.rental-header h4 {
  margin: 0;
  font-size: 13px;
}
.rental-count {
  font-size: 11px;
  color: #6b7280;
}

/* 리스트 */
.svc-card-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* ✅ 스크롤 + 스크롤바 스타일(웹킷/파폭) */
.scroll-list {
  max-height: 360px;
  overflow-y: auto;
  padding-right: 6px; /* 스크롤바 공간 */

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

/* Chrome / Edge / Safari */
.scroll-list::-webkit-scrollbar {
  width: 8px;
}
.scroll-list::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}
.scroll-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.svc-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  background-color: #f9fafb;
  font-size: 12px;
  margin-bottom: 6px;
  cursor: pointer;
}
.svc-card:hover {
  background-color: #e5f2ff;
}

/* ✅ 현재(종료 아님) 항목 강조 */
.svc-card.current {
  background-color: #ecfdf3;
}
.svc-card.current:hover {
  background-color: #dff7ea;
}

.svc-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.svc-right {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
}
.svc-name {
  font-weight: 500;
}
.svc-amount {
  font-weight: 600;
}
.svc-status {
  color: #6b7280;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
}
.code-pill {
  background-color: #f3e8ff;
  color: #7c3aed;
}
.month-pill {
  background-color: #eef2ff;
  color: #4f46e5;
}

/* ✅ 상태 뱃지 */
.status-pill.using {
  background-color: #dcfce7;
  color: #15803d;
}
.status-pill.ended {
  background-color: #e5e7eb;
  color: #374151;
}

.rental-meta {
  color: #6b7280;
  font-size: 11px;
}

.empty {
  padding: 14px 10px;
  color: #6b7280;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .svc-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .svc-right {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
