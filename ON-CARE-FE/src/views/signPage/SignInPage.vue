<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo-area">
        <img src="@/assets/img/common/oncareIcon.png" alt="OnCare Logo" class="logo-image" />
         <h2 class="login-title">로그인</h2>
      </div>

      <!-- 직원 구분 -->
      <div class="field-container">
        <label class="field-label">직원 구분</label>
        <div class="role-selector">
          <button 
            type="button"
            class="role-btn" 
            :class="{ active: selectedRole === 'admin' }" 
            @click="selectRole('admin')"
          >
            관리자
          </button>
          <button 
            type="button"
            class="role-btn" 
            :class="{ active: selectedRole === 'caregiver' }" 
            @click="selectRole('caregiver')"
          >
            요양보호사
          </button>
        </div>
      </div>

      <!-- 이메일 -->
      <div class="field-container">
        <label class="field-label">이메일</label>
        <div class="input-group">
          <img src="@/assets/img/sign/email.png" class="input-icon" />
          <input type="text" placeholder="이메일을 입력하세요" v-model="email" />
        </div>
      </div>

      <!-- 비밀번호 -->
      <div class="field-container">
        <label class="field-label">비밀번호</label>
        <div class="input-group">
          <img src="@/assets/img/sign/password.png" class="input-icon" />
          <input type="password" placeholder="비밀번호를 입력하세요" v-model="pwd" @keyup.enter="handleLogin"/>
        </div>
      </div>

      <button class="login-button" @click="handleLogin">
        로그인
      </button>
    </div>

    <p class="copyright">
      © 2025 OnCare. All rights reserved.
    </p>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import api from '@/lib/api'
import {jwtDecode} from 'jwt-decode'
const router = useRouter();
const userStore = useUserStore();

/**
 * 권한별 아이디
 * id : cs.kim@example.com            관리자
 * id : hj.kim@example.com            요양보호사
 * pwd : pwd123    (공통)
 */

const email = ref('');
const pwd = ref('');
const selectedRole = ref(''); // 기본값: 선택 안함

const selectRole = (role) => {
  // 이미 선택된 역할을 다시 클릭하면 선택 해제 및 초기화
  if (selectedRole.value === role) {
    selectedRole.value = '';
    email.value = '';
    pwd.value = '';
    return;
  }

  // 새로운 역할 선택 시 데이터 자동 입력
  selectedRole.value = role;
  if (role === 'admin') {
    email.value = 'cs.kim@example.com';
    pwd.value = 'pwd123';
  } else {
    email.value = 'hj.kim@example.com';
    pwd.value = 'pwd123';
  }
};

const handleLogin = async() => {
  try {
    const response = await api.post('/api/auth/login',
      {
        useremail: email.value,
        password: pwd.value
      },
      {
          headers: {
            'Content-Type': 'application/json',
            }
      });

    const { accessToken, tokenType } = response.data;

    // JWT 디코딩 (핵심)
    const decoded = jwtDecode(accessToken);

    userStore.setToken(accessToken , tokenType);
    userStore.logIn(decoded);

    // 요양보호사(jobname === '요양보호사')면 홈페이지로, 아니면 대시보드로 이동
    if (decoded.jobname === '요양보호사') {
      router.push({ name: 'home' })
    } else {
      router.push({ name: 'dashboard' })
    }
  } catch (error) {
    alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    console.error(error);
  }
}
</script>

<style scoped>
/* 전체 레이아웃 */
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f6fbf8;
  font-family: 'Noto Sans KR', sans-serif;
}

/* 카드 */
.login-card {
  width: 420px;
  max-width: 92vw;
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 48px 36px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
}

/* 로고/타이틀 */
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
}

.logo-image {
  width: 100px;
  height: 100px;
  margin-bottom: 12px;
}

.login-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1a5928; /* Green theme */
}

/* 필드 컨테이너 */
.field-container {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 8px;
}

/* 직원 구분 버튼 */
.role-selector {
  display: flex;
  gap: 12px;
}

.role-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.role-btn:hover {
  background-color: #f9fafb;
}

.role-btn.active {
  border-color: #22c55e;
  background-color: #f0fdf4;
  color: #166534;
  font-weight: 600;
}

/* 입력창 */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e4e4e4;
  padding: 12px 14px;
  transition: border-color 0.2s;
}

.input-group:focus-within {
  border-color: #22c55e;
}

.input-icon {
  width: 20px;
  margin-right: 10px;
  opacity: 0.5;
}

.input-group input {
  flex: 1;
  border: none;
  font-size: 15px;
  background: transparent;
  outline: none;
  color: #1f2937;
}

.input-group input::placeholder {
  color: #9ca3af;
}

/* 로그인 버튼 */
.login-button {
  width: 100%;
  padding: 14px 0;
  border-radius: 10px;
  border: none;
  background: #00c950; /* Primary Green */
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.login-button:hover {
  background-color: #00b347;
}

.login-button:active {
  transform: scale(0.98);
}

.copyright {
  margin-top: 24px;
  font-size: 13px;
  color: #9ca3af;
}
</style>