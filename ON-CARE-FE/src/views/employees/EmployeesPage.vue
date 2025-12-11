<template>
  <div class="employees-page">
    <!-- 상단 헤더 -->
    <div class="page-header">
      <div class="title-area">
        <h1 class="page-title">직원 관리</h1>
        <p class="page-desc">요양보호사 및 직원 정보 관리</p>
      </div>

      <button class="add-button" @click="onAddEmployee">
        + 직원 추가
      </button>
    </div>

    <!-- 본문 -->
    <div class="content-box">
      <h3 class="section-title">직원 목록</h3>

      <p class="placeholder-text">
        ※ 여기는 직원 관리 메인 화면입니다.<br />
        실제 기능/테이블은 이후 연동하면 됩니다.
      </p>
    </div>
  </div>
</template>

<script setup>
const onAddEmployee = () => {
  console.log("직원 추가 버튼 클릭됨")
}
</script>

<style scoped>
/* 페이지 전체 패딩 */
.employees-page {
  padding: 0 24px 24px;
}

/* 상단 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 0 12px;
}

/* 제목 + 설명 */
.title-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 30px;
  font-weight: 600;
  color: #1a5928;
  margin: 0;
}

.page-desc {
  font-size: 14px;
  color: #4a5565;
  margin: 0;
}

/* 직원 추가 버튼 */
.add-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  background-color: #00c950;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}

/* 본문 박스 */
.content-box {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  padding: 20px 24px;
  margin-top: 16px;
}

/* 섹션 제목 */
.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

/* 안내 문구 */
.placeholder-text {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}
</style>
