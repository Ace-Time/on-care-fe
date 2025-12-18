<template>
  <div class="approval-container">
    <div class="top-bar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="제목 또는 요청자 검색..." 
        />
      </div>
      <div class="filter-box">
        <input type="text" disabled class="dummy-input" />
        <input type="text" disabled class="dummy-input" />
      </div>
    </div>

    <div class="list-container">
      <div v-for="item in filteredList" :key="item.id" class="list-item">
        
        <div class="item-main">
          <div class="title-row">
            <span class="title">{{ item.title }}</span>
            <span class="badge category">{{ item.category }}</span>
            <span class="badge priority" :class="getPriorityClass(item.priority)">
              {{ item.priority }}
            </span>
          </div>
          <div class="info-row">
            <span class="user-icon">👤</span>
            <span class="username">{{ item.requestor }}</span>
          </div>
        </div>

        <div class="item-date">
          📅 {{ item.date }}
        </div>

        <div class="item-status">
          <span class="status-badge" :class="getStatusClass(item.status)">
            <span class="status-icon" v-if="item.status === '승인'">✔</span>
            <span class="status-icon" v-else-if="item.status === '반려'">✖</span>
            <span class="status-icon" v-else>🕒</span>
            {{ item.status }}
          </span>
        </div>

      </div>
      
      <div v-if="filteredList.length === 0" class="no-result">
        검색 결과가 없습니다.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 검색어 상태
const searchQuery = ref('');

// 목업 데이터 (이미지 기반)
const approvalList = ref([
  { id: 1, title: '11월 급여 지급 결재', category: '급여', priority: '긴급', requestor: '김관리', date: '2024-11-27', status: '대기중' },
  { id: 2, title: '전동 휠체어 구매 요청', category: '구매', priority: '보통', requestor: '박담당', date: '2024-11-26', status: '승인' },
  { id: 3, title: '휴가 신청 - 이영희', category: '휴가', priority: '낮음', requestor: '이영희', date: '2024-11-25', status: '승인' },
  { id: 4, title: '신규 직원 채용 승인', category: '기타', priority: '긴급', requestor: '최인사', date: '2024-11-24', status: '승인' },
  { id: 5, title: '시설 보수 공사 승인 요청', category: '구매', priority: '보통', requestor: '김관리', date: '2024-11-23', status: '반려' },
  { id: 6, title: '교육 프로그램 참가 신청', category: '기타', priority: '낮음', requestor: '박민수', date: '2024-11-22', status: '대기중' },
  { id: 7, title: '신규 용품 구매 계약', category: '구매', priority: '긴급', requestor: '이자재', date: '2024-11-28', status: '대기중' },
  { id: 8, title: '12월 복지용품 렌탈 계약서', category: '구매', priority: '보통', requestor: '팀장', date: '2024-11-28', status: '대기중' },
  { id: 9, title: '요양보호사 교육비 지원', category: '기타', priority: '낮음', requestor: '팀장', date: '2024-11-27', status: '승인' },
]);

// 검색 필터링 로직
const filteredList = computed(() => {
  return approvalList.value.filter(item => 
    item.title.includes(searchQuery.value) || 
    item.requestor.includes(searchQuery.value)
  );
});

// 우선순위별 스타일 클래스 매핑
const getPriorityClass = (priority) => {
  switch (priority) {
    case '긴급': return 'p-high';
    case '보통': return 'p-medium';
    case '낮음': return 'p-low';
    default: return '';
  }
};

// 상태별 스타일 클래스 매핑
const getStatusClass = (status) => {
  switch (status) {
    case '승인': return 's-approved';
    case '반려': return 's-rejected';
    case '대기중': return 's-waiting';
    default: return '';
  }
};
</script>

<style scoped>
/* 컨테이너 */
.approval-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
  background-color: #ffffff;
  min-height: 100vh;
}

/* 상단 바 */
.top-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-box input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
}

.filter-box {
  display: flex;
  gap: 10px;
}

.dummy-input {
  width: 150px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

/* 리스트 아이템 카드 */
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 20px 25px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  border: 1px solid #eee;
  transition: transform 0.2s;
}

.list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

/* 왼쪽 정보 영역 */
.item-main {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-weight: 600;
  font-size: 1.05rem;
  color: #333;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

/* 뱃지 공통 */
.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 카테고리 뱃지 (보라색 계열) */
.category {
  background-color: #eef2ff;
  color: #6366f1;
}

/* 우선순위 뱃지 */
.p-high { background-color: #fee2e2; color: #ef4444; } /* 긴급 - 붉은색 */
.p-medium { background-color: #ffedd5; color: #f97316; } /* 보통 - 주황색 */
.p-low { background-color: #f3f4f6; color: #6b7280; } /* 낮음 - 회색 */

/* 날짜 영역 */
.item-date {
  flex: 1;
  text-align: center;
  color: #888;
  font-size: 0.95rem;
}

/* 상태 영역 (우측) */
.item-status {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* 상태별 색상 */
.s-waiting {
  background-color: #fef9c3;
  color: #d97706; /* 노랑/오렌지 */
}

.s-approved {
  background-color: #dcfce7;
  color: #16a34a; /* 초록 */
}

.s-rejected {
  background-color: #fee2e2;
  color: #dc2626; /* 빨강 */
}

.no-result {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 반응형 처리 */
@media (max-width: 768px) {
  .list-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .item-date, .item-status {
    width: 100%;
    text-align: left;
    justify-content: flex-start;
  }
}
</style>