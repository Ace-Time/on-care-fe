# 요양보호사(Careworker) API

요양보호사 관련 모든 백엔드 API를 연결하는 프론트엔드 API 모듈입니다.

## 📁 파일 구조

```
api/careworker/
├── dashboardApi.js          # 대시보드 API (홈 화면)
├── scheduleApi.js           # 일정 조회 API
├── careLogApi.js            # 요양일지 API
├── todoApi.js               # 할 일 API
├── visitScheduleApi.js      # 방문 일정 API
├── personalScheduleApi.js   # 개인 일정 API
├── evaluationApi.js         # 평가 API (욕창, 인지기능, 낙상, 욕구사정)
├── counselingLogApi.js      # 방문상담 API
├── index.js                 # 통합 export
└── README.md                # 문서
```

## 🔗 백엔드 연결 매핑

| 프론트엔드 API | 백엔드 Controller |
|---------------|------------------|
| `dashboardApi.js` | `DashboardQueryController` |
| `scheduleApi.js` | `ScheduleQueryController` |
| `careLogApi.js` | `CareLogCommandController` |
| `todoApi.js` | `TodoCommandController` |
| `visitScheduleApi.js` | `VisitScheduleCommandController` |
| `personalScheduleApi.js` | `PersonalScheduleCommandController` |
| `evaluationApi.js` | `BedsoreEvaluationCommandController` |
| `evaluationApi.js` | `CognitiveEvaluationCommandController` |
| `evaluationApi.js` | `FallEvaluationCommandController` |
| `evaluationApi.js` | `NeedsEvaluationCommandController` |
| `counselingLogApi.js` | `CounselingLogCommandController` |

## 📖 사용 방법

### 1. 개별 파일에서 import

```javascript
import { getDashboardSummary, getTodaySchedules } from '@/api/careworker/dashboardApi';
import { createCareLog, updateCareLog } from '@/api/careworker/careLogApi';
```

### 2. index.js에서 통합 import

```javascript
import {
  getDashboardSummary,
  getTodaySchedules,
  createCareLog,
  updateCareLog
} from '@/api/careworker';
```

## 🎯 API 함수 목록

### Dashboard API (dashboardApi.js)
- `getDashboardSummary()` - 대시보드 요약 정보
- `getUrgentNotifications()` - 긴급 알림 목록
- `getTodaySchedules()` - 오늘의 일정
- `getTodos()` - 할 일 목록
- `getBeneficiaryDetail(beneficiaryId)` - 수급자 상세
- `getTodoDetail(todoId)` - 할 일 상세
- `getCareLogBySchedule(vsId)` - 일정별 요양일지

### Schedule API (scheduleApi.js)
- `getSchedules({ startDate, endDate })` - 캘린더 일정 조회
- `getScheduleDetail(scheduleId)` - 일정 상세 조회
- `getPersonalTypes()` - 개인 일정 유형 목록

### Care Log API (careLogApi.js)
- `createCareLog(data)` - 요양일지 작성
- `updateCareLog(logId, data)` - 요양일지 수정
- `deleteCareLog(logId)` - 요양일지 삭제

### Todo API (todoApi.js)
- `createTodo(data)` - 할 일 등록
- `updateTodo(todoId, data)` - 할 일 수정
- `completeTodo(todoId)` - 할 일 완료
- `uncompleteTodo(todoId)` - 할 일 완료 취소
- `deleteTodo(todoId)` - 할 일 삭제

### Visit Schedule API (visitScheduleApi.js)
- `startVisit(vsId, data)` - 방문 서비스 시작
- `completeVisit(vsId, data)` - 방문 서비스 종료
- `createVisitSchedule(data)` - 방문 일정 작성
- `updateVisitSchedule(vsId, data)` - 방문 일정 수정
- `deleteVisitSchedule(vsId)` - 방문 일정 삭제

### Personal Schedule API (personalScheduleApi.js)
- `createPersonalSchedule(data)` - 개인 일정 작성
- `updatePersonalSchedule(psId, data)` - 개인 일정 수정
- `deletePersonalSchedule(psId)` - 개인 일정 삭제

### Evaluation API (evaluationApi.js)

#### 욕창위험도 평가
- `createBedsoreEvaluation(data)` - 작성
- `updateBedsoreEvaluation(evalId, data)` - 수정
- `deleteBedsoreEvaluation(evalId)` - 삭제

#### 인지기능 평가
- `createCognitiveEvaluation(data)` - 작성
- `updateCognitiveEvaluation(evalId, data)` - 수정
- `deleteCognitiveEvaluation(evalId)` - 삭제

#### 낙상위험도 평가
- `createFallEvaluation(data)` - 작성
- `updateFallEvaluation(evalId, data)` - 수정
- `deleteFallEvaluation(evalId)` - 삭제

#### 욕구사정 평가
- `createNeedsEvaluation(data)` - 작성
- `updateNeedsEvaluation(evalId, data)` - 수정
- `deleteNeedsEvaluation(evalId)` - 삭제

### Counseling Log API (counselingLogApi.js)
- `createCounselingLog(data)` - 방문상담 작성
- `updateCounselingLog(counselingId, data)` - 방문상담 수정
- `deleteCounselingLog(counselingId)` - 방문상담 삭제

## 💡 사용 예시

### 대시보드 데이터 조회

```javascript
import { getDashboardSummary, getTodaySchedules } from '@/api/careworker';

// 컴포넌트 내에서
const fetchDashboardData = async () => {
  try {
    const summary = await getDashboardSummary();
    console.log('요약 정보:', summary);

    const schedules = await getTodaySchedules();
    console.log('오늘의 일정:', schedules);
  } catch (error) {
    console.error('데이터 조회 실패:', error);
  }
};
```

### 할 일 관리

```javascript
import { createTodo, completeTodo, deleteTodo } from '@/api/careworker';

// 할 일 등록
const addTodo = async () => {
  const newTodo = {
    title: '수급자 방문',
    dueDate: '2025-12-20',
    priority: 'HIGH'
  };

  const result = await createTodo(newTodo);
  console.log('등록된 할 일 ID:', result.data);
};

// 할 일 완료
const markAsComplete = async (todoId) => {
  await completeTodo(todoId);
  console.log('할 일 완료됨');
};

// 할 일 삭제
const removeTodo = async (todoId) => {
  await deleteTodo(todoId);
  console.log('할 일 삭제됨');
};
```

### 요양일지 작성

```javascript
import { createCareLog } from '@/api/careworker';

const submitCareLog = async () => {
  const careLogData = {
    vsId: 123,
    beneficiaryId: 456,
    serviceDate: '2025-12-18',
    // ... 기타 요양일지 필드
  };

  await createCareLog(careLogData);
  console.log('요양일지 작성 완료');
};
```

### 일정 조회

```javascript
import { getSchedules } from '@/api/careworker';

// 이번 주 일정 조회
const fetchWeeklySchedule = async () => {
  const schedules = await getSchedules({
    startDate: '2025-12-16',
    endDate: '2025-12-22'
  });
  console.log('주간 일정:', schedules);
};

// 이번 달 일정 조회
const fetchMonthlySchedule = async () => {
  const schedules = await getSchedules({
    startDate: '2025-12-01',
    endDate: '2025-12-31'
  });
  console.log('월간 일정:', schedules);
};
```

### 평가 작성

```javascript
import {
  createBedsoreEvaluation,
  createCognitiveEvaluation,
  createFallEvaluation,
  createNeedsEvaluation
} from '@/api/careworker';

// 욕창위험도 평가 작성
const submitBedsoreEval = async () => {
  const data = {
    beneficiaryId: 123,
    evalType: 'BEDSORE',
    score: 15,
    // ... 기타 평가 데이터
  };

  await createBedsoreEvaluation(data);
};

// 인지기능 평가 작성
const submitCognitiveEval = async () => {
  const data = {
    beneficiaryId: 123,
    evalType: 'COGNITIVE',
    score: 22,
    // ... 기타 평가 데이터
  };

  await createCognitiveEvaluation(data);
};
```

## 🔧 기술 스택

- **Axios**: HTTP 클라이언트
- **Vite**: 빌드 도구
- **JWT**: 인증 (자동으로 헤더에 추가됨)

## 📝 참고사항

1. **인증 토큰**: 모든 API 호출 시 자동으로 JWT 토큰이 헤더에 추가됩니다 (`@/lib/api.js`에서 설정)
2. **에러 처리**: API 호출 시 try-catch 문으로 에러를 처리해야 합니다
3. **응답 형식**: 백엔드에서 `ApiResponse<T>` 형식으로 응답하며, `res.data`에 실제 데이터가 포함됩니다
4. **테스트 ID**: 백엔드에서 현재 `TEST_CAREGIVER_ID = 1L`로 고정되어 있습니다

## 🚀 다음 단계

1. Vue 컴포넌트에서 API 함수 사용
2. Pinia store에서 상태 관리와 함께 API 호출
3. 에러 핸들링 및 로딩 상태 처리
4. API 응답 데이터 타입 정의 (TypeScript 사용 시)
