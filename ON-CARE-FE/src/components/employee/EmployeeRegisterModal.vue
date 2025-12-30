<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'submit']);

// 키보드 이벤트 핸들러
const handleKeydown = (e) => {
  if (!props.isOpen) return;

  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    // Ctrl+Enter 또는 Cmd+Enter로 제출
    if (isFormValid.value) {
      handleSubmit();
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

// [설정] 선택 가능한 서비스 목록
const serviceOptions = [
  { id: 1, name: '방문요양' },
  { id: 2, name: '방문목욕' },
  { id: 3, name: '방문간호' }
];

// 1. 폼 초기 데이터 (자격증 관련 필드 제거됨)
const initialForm = {
  name: '',
  birth: '',
  gender: 'F',
  address: '',
  email: '',
  phone: '',
  emergencyNumber: '',
  hireDate: new Date().toISOString().split('T')[0],

  deptCode: 1,
  jobCode: 5,
  statusId: 1,
  managerId: null,

  careers: [],
  career: ''
};

const form = ref({ ...initialForm });

// 🏙️ 서울시 행정동 데이터
const seoulAreas = {
  "강남구": ["개포1동", "개포2동", "개포4동", "논현1동", "논현2동", "대치1동", "대치2동", "대치4동", "도곡1동", "도곡2동", "삼성1동", "삼성2동", "세곡동", "수서동", "신사동", "압구정동", "역삼1동", "역삼2동", "일원1동", "일원2동", "일원본동", "청담동"],
  "강동구": ["강일동", "고덕1동", "고덕2동", "길동", "둔촌1동", "둔촌2동", "명일1동", "명일2동", "상일동", "성내1동", "성내2동", "성내3동", "암사1동", "암사2동", "암사3동", "천호1동", "천호2동", "천호3동"],
  "강북구": ["미아동", "번1동", "번2동", "번3동", "삼각산동", "삼양동", "송중동", "송천동", "수유1동", "수유2동", "수유3동", "우이동", "인수동"],
  "강서구": ["가양1동", "가양2동", "가양3동", "공항동", "등촌1동", "등촌2동", "등촌3동", "발산1동", "방화1동", "방화2동", "방화3동", "염창동", "우장산동", "화곡1동", "화곡2동", "화곡3동", "화곡4동", "화곡6동", "화곡8동", "화곡본동"],
  "관악구": ["낙성대동", "난곡동", "난향동", "남현동", "대학동", "미성동", "보라매동", "삼성동", "서림동", "서원동", "성현동", "신림동", "신사동", "신원동", "은천동", "인헌동", "조원동", "중앙동", "청림동", "청룡동", "행운동"],
  "광진구": ["광장동", "구의1동", "구의2동", "구의3동", "군자동", "능동", "자양1동", "자양2동", "자양3동", "자양4동", "중곡1동", "중곡2동", "중곡3동", "중곡4동", "화양동"],
  "구로구": ["가리봉동", "개봉1동", "개봉2동", "개봉3동", "고척1동", "고척2동", "구로1동", "구로2동", "구로3동", "구로4동", "구로5동", "수궁동", "신도림동", "오류1동", "오류2동", "항동"],
  "금천구": ["가산동", "독산1동", "독산2동", "독산3동", "독산4동", "시흥1동", "시흥2동", "시흥3동", "시흥4동", "시흥5동"],
  "노원구": ["공릉1동", "공릉2동", "상계10동", "상계1동", "상계2동", "상계3.4동", "상계5동", "상계6.7동", "상계8동", "상계9동", "월계1동", "월계2동", "월계3동", "중계1동", "중계2.3동", "중계4동", "중계본동", "하계1동", "하계2동"],
  "도봉구": ["도봉1동", "도봉2동", "방학1동", "방학2동", "방학3동", "쌍문1동", "쌍문2동", "쌍문3동", "쌍문4동", "창1동", "창2동", "창3동", "창4동", "창5동"],
  "동대문구": ["답십리1동", "답십리2동", "용신동", "이문1동", "이문2동", "장안1동", "장안2동", "전농1동", "전농2동", "제기동", "청량리동", "회기동", "휘경1동", "휘경2동"],
  "동작구": ["노량진1동", "노량진2동", "대방동", "사당1동", "사당2동", "사당3동", "사당4동", "사당5동", "상도1동", "상도2동", "상도3동", "상도4동", "신대방1동", "신대방2동", "흑석동"],
  "마포구": ["공덕동", "대흥동", "도화동", "망원1동", "망원2동", "상암동", "서강동", "서교동", "성산1동", "성산2동", "신수동", "아현동", "연남동", "염리동", "용강동", "합정동"],
  "서대문구": ["남가좌1동", "남가좌2동", "북가좌1동", "북가좌2동", "북아현동", "신촌동", "연희동", "천연동", "충현동", "홍은1동", "홍은2동", "홍제1동", "홍제2동", "홍제3동"],
  "서초구": ["내곡동", "반포1동", "반포2동", "반포3동", "반포4동", "반포본동", "방배1동", "방배2동", "방배3동", "방배4동", "방배본동", "서초1동", "서초2동", "서초3동", "서초4동", "양재1동", "양재2동", "잠원동"],
  "성동구": ["금호1가동", "금호2.3가동", "금호4가동", "마장동", "사근동", "성수1가1동", "성수1가2동", "성수2가1동", "성수2가3동", "송정동", "옥수동", "왕십리2동", "왕십리도선동", "용답동", "응봉동", "행당1동", "행당2동"],
  "성북구": ["길음1동", "길음2동", "돈암1동", "돈암2동", "동선동", "보문동", "삼선동", "석관동", "성북동", "안암동", "월곡1동", "월곡2동", "장위1동", "장위2동", "장위3동", "정릉1동", "정릉2동", "정릉3동", "정릉4동", "종암동"],
  "송파구": ["가락1동", "가락2동", "가락본동", "거여1동", "거여2동", "마천1동", "마천2동", "문정1동", "문정2동", "방이1동", "방이2동", "삼전동", "석촌동", "송파1동", "송파2동", "오금동", "오륜동", "위례동", "잠실2동", "잠실3동", "잠실4동", "잠실6동", "잠실7동", "잠실본동", "장지동", "풍납1동", "풍납2동"],
  "양천구": ["목1동", "목2동", "목3동", "목4동", "목5동", "신월1동", "신월2동", "신월3동", "신월4동", "신월5동", "신월6동", "신월7동", "신정1동", "신정2동", "신정3동", "신정4동", "신정6동", "신정7동"],
  "영등포구": ["당산1동", "당산2동", "대림1동", "대림2동", "대림3동", "도림동", "문래동", "신길1동", "신길3동", "신길4동", "신길5동", "신길6동", "신길7동", "양평1동", "양평2동", "여의동", "영등포동", "영등포본동"],
  "용산구": ["남영동", "보광동", "서빙고동", "용문동", "용산2가동", "원효로1동", "원효로2동", "이촌1동", "이촌2동", "이태원1동", "이태원2동", "청파동", "한강로동", "한남동", "효창동", "후암동"],
  "은평구": ["갈현1동", "갈현2동", "구산동", "녹번동", "대조동", "불광1동", "불광2동", "수색동", "신사1동", "신사2동", "역촌동", "응암1동", "응암2동", "응암3동", "증산동", "진관동"],
  "종로구": ["가회동", "교남동", "무악동", "부암동", "사직동", "삼청동", "숭인1동", "숭인2동", "이화동", "종로1.2.3.4가동", "종로5.6가동", "창신1동", "창신2동", "창신3동", "청운효자동", "평창동", "혜화동"],
  "중구": ["광희동", "다산동", "동화동", "명동", "소공동", "신당5동", "신당동", "약수동", "을지로동", "장충동", "중림동", "청구동", "필동", "회현동", "황학동"],
  "중랑구": ["망우3동", "망우본동", "면목2동", "면목3.8동", "면목4동", "면목5동", "면목7동", "면목본동", "묵1동", "묵2동", "상봉1동", "상봉2동", "신내1동", "신내2동", "중화1동", "중화2동"]
};

// 선택된 구/동
const selectedGu = ref('');
const selectedDong = ref('');

// 구 목록 (가나다순 정렬)
const guOptions = computed(() => Object.keys(seoulAreas).sort());

// 동 목록 (선택된 구에 따라 갱신)
const dongOptions = computed(() => {
  if (!selectedGu.value) return [];
  return seoulAreas[selectedGu.value].sort();
});

// 구 변경 시 동 초기화 및 주소 업데이트
const handleGuChange = () => {
  selectedDong.value = '';
  updateAddress();
};

// 동 변경 시 주소 업데이트
const handleDongChange = () => {
  updateAddress();
};

// 주소 업데이트 함수
const updateAddress = () => {
  if (selectedGu.value && selectedDong.value) {
    form.value.address = `서울시 ${selectedGu.value} ${selectedDong.value}`;
  } else if (selectedGu.value) {
    form.value.address = `서울시 ${selectedGu.value}`;
  } else {
    form.value.address = '';
  }
};

// 📌 정규표현식 정의 (백엔드와 동일하게 맞춤)
const REGEX = {
  // 010-XXXX-XXXX
  phone: /^010-\d{4}-\d{4}$/,

  // 이메일 형식
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // 이름 (한글 2~5자)
  name: /^[가-힣]{2,5}$/
};

// 에러 메시지 저장소
const errors = ref({
  phone: '',
  email: '',
  name: '',
  emergencyNumber: ''
});

// 📞 전화번호 자동 포맷팅 함수
const formatPhone = (event, field) => {
  // 1. 입력된 값에서 숫자만 추출
  const rawValue = event.target.value.replace(/[^0-9]/g, '');

  let formatted = '';

  // 2. 길이에 따라 하이픈 위치 결정 (010-XXXX-XXXX 기준)
  if (rawValue.length < 4) {
    formatted = rawValue;
  } else if (rawValue.length < 8) {
    formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`;
  } else {
    formatted = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`;
  }

  // 3. 변수에 반영 (화면 갱신)
  form.value[field] = formatted;

  // 4. 유효성 검사 실행
  validateField(field);
};

// 🛡️ 유효성 검사 함수
const validateField = (field) => {
  const value = form.value[field];

  switch (field) {
    case 'phone':
      if (!value) {
        errors.value.phone = "";
      } else if (!REGEX.phone.test(value)) {
        errors.value.phone = "010-0000-0000 형식으로 입력해주세요.";
      } else {
        errors.value.phone = "";
      }
      break;

    case 'email':
      if (!value) {
        errors.value.email = "";
      } else if (!REGEX.email.test(value)) {
        errors.value.email = "올바른 이메일 형식이 아닙니다.";
      } else {
        errors.value.email = "";
      }
      break;

    case 'name':
      if (!value) {
        errors.value.name = "";
      } else if (!REGEX.name.test(value)) {
        errors.value.name = "이름은 한글 2~5글자여야 합니다.";
      } else {
        errors.value.name = "";
      }
      break;

    case 'emergencyNumber':
      if (!value) {
        errors.value.emergencyNumber = "";
      } else if (!REGEX.phone.test(value)) {
        errors.value.emergencyNumber = "010-0000-0000 형식으로 입력해주세요.";
      } else {
        errors.value.emergencyNumber = "";
      }
      break;
  }
};

// 전체 폼이 유효한지 체크 (버튼 활성화용)
const isFormValid = computed(() => {
  // 필수값 체크 (DB Not Null Constraint)
  // name, phone, email, address, hireDate, jobCode, statusId are NOT NULL
  if (!form.value.name || !form.value.phone || !form.value.email || !form.value.address || !form.value.hireDate) return false;

  // 에러가 하나라도 있으면 false
  if (errors.value.phone || errors.value.email || errors.value.name || errors.value.emergencyNumber) return false;

  return true;
});

// 만 20세 이상 기준 날짜 계산
const maxBirthDate = computed(() => {
  const today = new Date();
  // 오늘 연도에서 20을 뺌
  const year20Ago = today.getFullYear() - 20;

  // 20년 전의 오늘 날짜 객체 생성
  const limitDate = new Date(year20Ago, today.getMonth(), today.getDate());

  // YYYY-MM-DD 형식으로 변환
  return limitDate.toISOString().split('T')[0];
});

// 경력 추가용 임시 변수
const newCareer = ref({
  companyName: '',
  start: '',
  end: '',
  task: ''
});

// 체크된 서비스 ID들을 담을 배열
const selectedServiceIds = ref([]); 

// --- [1] 총 경력 계산 로직 ---
const calculateTotalCareer = () => {
  let totalMonths = 0;

  form.value.careers.forEach(item => {
    if (item.start && item.end) {
      const [startYear, startMonth] = item.start.split('-').map(Number);
      const [endYear, endMonth] = item.end.split('-').map(Number);
      
      const startDate = new Date(startYear, startMonth - 1);
      const endDate = new Date(endYear, endMonth - 1);
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
      
      if (months > 0) totalMonths += months;
    }
  });

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let result = '';
  if (years > 0) result += `${years}년 `;
  if (months > 0) result += `${months}개월`;
  if (totalMonths === 0 && form.value.careers.length === 0) result = ''; 
  else if (totalMonths === 0) result = '신입';

  form.value.career = result.trim();
};

// --- [2] 핸들러 ---

// 경력 추가
const addCareer = () => {
  if (!newCareer.value.companyName || !newCareer.value.start || !newCareer.value.end) {
    alert('회사명과 근무 기간을 입력해주세요.');
    return;
  }
  
  if (newCareer.value.start > newCareer.value.end) {
    alert('종료일이 시작일보다 빨라야 합니다.');
    return;
  }

  const workPeriod = `${newCareer.value.start.replace('-', '.')} - ${newCareer.value.end.replace('-', '.')}`;
  
  form.value.careers.push({
    companyName: newCareer.value.companyName,
    workPeriod: workPeriod,
    task: newCareer.value.task,
    start: newCareer.value.start,
    end: newCareer.value.end
  });

  calculateTotalCareer(); 
  newCareer.value = { companyName: '', start: '', end: '', task: '' };
};

// 경력 삭제
const removeCareer = (index) => {
  form.value.careers.splice(index, 1);
  calculateTotalCareer(); 
};

// 최종 제출
const handleSubmit = () => {
  // 유효성 검사
  if (!isFormValid.value) {
    alert('필수 정보를 올바르게 입력해주세요.');
    return;
  }

  // 생년월일 검증 - 만 20세 이상인지 체크
  if (form.value.birth && form.value.birth > maxBirthDate.value) {
    alert('만 20세 이상만 등록 가능합니다.');
    return;
  }

  const payload = {
    ...form.value,
    serviceTypeIds: selectedServiceIds.value
    // certificates 필드 제거됨
  };

  emit('submit', payload);

  // 초기화
  form.value = { ...initialForm, careers: [] };
  selectedServiceIds.value = [];
  errors.value = { phone: '', email: '', name: '', emergencyNumber: '' };
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
            <div class="form-group">
              <label>이름 *</label>
              <input
                v-model="form.name"
                type="text"
                class="input"
                :class="{ 'input-error': errors.name }"
                placeholder="이름 입력"
                @input="validateField('name')"
              />
              <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
            </div>

            <div class="form-group">
              <label>성별 *</label>
              <select v-model="form.gender" class="input">
                <option value="F">여성</option>
                <option value="M">남성</option>
              </select>
            </div>

            <div class="form-group">
              <label>생년월일</label>
              <input
                v-model="form.birth"
                type="date"
                class="input"
                :max="maxBirthDate"
              />
              <p class="hint-text">{{ maxBirthDate }} 이전 출생자만 등록 가능</p>
            </div>

            <div class="form-group">
              <label>연락처 *</label>
              <input
                :value="form.phone"
                type="text"
                class="input"
                :class="{ 'input-error': errors.phone }"
                placeholder="010-1234-5678"
                maxlength="13"
                @input="formatPhone($event, 'phone')"
              />
              <p v-if="errors.phone" class="error-msg">{{ errors.phone }}</p>
            </div>

            <div class="form-group">
              <label>이메일 *</label>
              <input
                v-model="form.email"
                type="email"
                class="input"
                :class="{ 'input-error': errors.email }"
                placeholder="user@example.com"
                @input="validateField('email')"
              />
              <p v-if="errors.email" class="error-msg">{{ errors.email }}</p>
            </div>

            <div class="form-group">
              <label>비상 연락처</label>
              <input
                :value="form.emergencyNumber"
                type="text"
                class="input"
                :class="{ 'input-error': errors.emergencyNumber }"
                placeholder="010-9876-5432"
                maxlength="13"
                @input="formatPhone($event, 'emergencyNumber')"
              />
              <p v-if="errors.emergencyNumber" class="error-msg">{{ errors.emergencyNumber }}</p>
            </div>

            <div class="form-group full-width">
              <label>주소 (행정동) *</label>
              <div class="address-select-group">
                <select v-model="selectedGu" @change="handleGuChange" class="input">
                  <option disabled value="">구 선택</option>
                  <option v-for="gu in guOptions" :key="gu" :value="gu">{{ gu }}</option>
                </select>
                <select v-model="selectedDong" @change="handleDongChange" :disabled="!selectedGu" class="input">
                  <option disabled value="">동 선택</option>
                  <option v-for="dong in dongOptions" :key="dong" :value="dong">{{ dong }}</option>
                </select>
              </div>
              <input v-model="form.address" type="text" class="input readonly-input" placeholder="구와 동을 선택하면 자동으로 입력됩니다" readonly />
            </div>
          </div>
        </div>

        <div class="form-section blue-theme">
          <h4 class="section-title">직무 정보</h4>
          <div class="grid-2">
            <div class="form-group"><label>입사일 *</label><input v-model="form.hireDate" type="date" class="input" /></div>
            
            <div class="form-group">
              <label>직급 (Job) *</label>
              <select v-model="form.jobCode" class="input">
                <option :value="1">센터장</option>
                <option :value="2">관리자</option>
                <option :value="3">사원</option>
                <option :value="4">영업상담</option>
                <option :value="5">요양보호사</option>
              </select>
            </div>
            
            <div class="form-group full-width">
              <label>경력 연수 (자동 계산)</label>
              <input 
                v-model="form.career" 
                type="text" 
                class="input readonly-input" 
                placeholder="근무 이력을 추가하면 자동 계산됩니다" 
                readonly 
              />
            </div>
          </div>
        </div>

        <div class="form-section purple-theme">
          <h4 class="section-title">추가 정보</h4>
          
          <div class="form-group">
            <label class="sub-label">제공 서비스 (중복 선택 가능)</label>
            <div class="checkbox-group">
              <label 
                v-for="service in serviceOptions" 
                :key="service.id" 
                class="checkbox-label"
              >
                <input 
                  type="checkbox" 
                  :value="service.id" 
                  v-model="selectedServiceIds" 
                />
                {{ service.name }}
              </label>
            </div>
          </div>

          <div class="career-input-box mt-4">
            <label class="sub-label">경력 사항</label>
            <div class="form-group">
              <input v-model="newCareer.companyName" type="text" class="input" placeholder="회사명" />
            </div>
            <div class="grid-2-mini">
              <input v-model="newCareer.start" type="month" class="input" title="시작년월" />
              <input v-model="newCareer.end" type="month" class="input" title="종료년월" />
            </div>
            <div class="form-group">
              <input v-model="newCareer.task" type="text" class="input" placeholder="담당 업무" />
            </div>
            <button class="btn-full purple-btn" @click="addCareer">경력 추가</button>
          </div>

          <div class="history-list">
            <div v-for="(career, idx) in form.careers" :key="idx" class="history-item purple-item">
              <div class="history-content">
                <span class="history-company">{{ career.companyName }}</span>
                <span class="history-date">{{ career.workPeriod }}</span>
                <span class="history-task">{{ career.task }}</span>
              </div>
              <button class="btn-remove" @click="removeCareer(idx)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div v-if="form.careers.length === 0" class="empty-text">추가된 경력이 없습니다.</div>
          </div>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-submit" :disabled="!isFormValid" @click="handleSubmit">등록하기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 기존 스타일 유지 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-box { background: white; width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 20px; font-weight: 700; color: #166534; margin: 0; }
.close-btn { background: none; border: none; cursor: pointer; color: #999; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 24px; }
.form-section { padding: 20px; border-radius: 8px; border: 1px solid transparent; }
.green-theme { background-color: #f0fdf4; border-color: #dcfce7; }
.green-theme .section-title { color: #166534; }
.blue-theme { background-color: #eff6ff; border-color: #dbeafe; }
.blue-theme .section-title { color: #1e40af; }
.purple-theme { background-color: #faf5ff; border-color: #f3e8ff; }
.purple-theme .section-title { color: #6b21a8; }
.section-title { margin: 0 0 16px 0; font-size: 16px; font-weight: 700; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 600; color: #4b5563; }
.sub-label { font-size: 13px; font-weight: 600; color: #4b5563; display: block; margin-bottom: 4px; }
.input { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; background: white; }
.input:focus { border-color: #22c55e; }
.readonly-input { background-color: #f3f4f6; color: #6b7280; cursor: not-allowed; border-color: #e5e7eb; }
.btn-full { width: 100%; padding: 10px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; color: white; margin-top: 8px; }
.purple-btn { background-color: #a855f7; }
.purple-btn:hover { background-color: #9333ea; }
.checkbox-group { display: flex; gap: 15px; flex-wrap: wrap; padding: 12px; background-color: white; border: 1px solid #e5e7eb; border-radius: 6px; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; user-select: none; color: #4b5563; }
.checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #a855f7; }
.career-input-box { display: flex; flex-direction: column; gap: 8px; }
.grid-2-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.mt-4 { margin-top: 16px; }
.history-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
.purple-item { background-color: #f3e8ff; color: #6b21a8; }
.history-content { display: flex; flex-direction: column; gap: 2px; }
.history-company { font-weight: bold; }
.history-date { font-size: 12px; color: #666; }
.history-task { font-size: 12px; color: #555; font-style: italic; }
.btn-remove { background: none; border: none; cursor: pointer; color: currentColor; opacity: 0.6; }
.empty-text { font-size: 13px; color: #999; text-align: center; }
.modal-footer { padding: 20px 24px; border-top: 1px solid #f0f0f0; background: #fff; }
.btn-submit { width: 100%; padding: 14px; background-color: #4ade80; color: white; font-size: 16px; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.btn-submit:hover { background-color: #22c55e; }
.btn-submit:disabled { background-color: #d1d5db; cursor: not-allowed; }
.btn-submit:disabled:hover { background-color: #d1d5db; }
.error-msg { color: #dc2626; font-size: 12px; margin-top: 4px; }
.hint-text { color: #6b7280; font-size: 11px; margin-top: 4px; }
.input-error { border-color: #dc2626 !important; }
.input-error:focus { border-color: #dc2626 !important; }
.address-select-group { display: flex; gap: 10px; margin-bottom: 8px; }
.address-select-group .input { flex: 1; }
.address-select-group .input:disabled { background-color: #f3f4f6; color: #999; cursor: not-allowed; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d1d5db; border-radius: 3px; }
</style>