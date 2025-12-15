export const bedsoreHistoryMock = [
  {
    id: 1,
    date: '2025-12-10',
    recipientName: '김영희',
    totalScore: 15,
    grade: '중간(약간~중도 위험)',
    status: '완료'
  },
  {
    id: 2,
    date: '2025-12-08',
    recipientName: '박철수',
    totalScore: 21,
    grade: '낮음(위험 없음)',
    status: '완료'
  },
  {
    id: 3,
    date: '2025-12-05',
    recipientName: '이순자',
    totalScore: 10,
    grade: '매우 높음(위험 매우 높음)',
    status: '완료'
  }
];

export const careLogHistoryMock = [
  {
    id: 1,
    recipientName: '김영희',
    date: '2024-12-04',
    dayOfWeek: '수요일',
    time: '09:00 - 12:00',
    address: '서울시 강남구 테헤란로 123',
    services: ['식사도움', '배설도움', '개인위생', '이동도움', '정서지원'],
    specialNotes: '오전 간단한 파우 활동 진행. 집중력 양호하심. 점심 식사 후 혈압 약 확인.',
    status: '승인됨'
  },
  {
    id: 2,
    recipientName: '박순자',
    date: '2024-12-03',
    dayOfWeek: '화요일',
    time: '14:00 - 17:00',
    address: '서울시 송파구 올림픽로 789',
    services: ['식사도움', '배설도움', '개인위생', '이동도움', '정서지원'],
    specialNotes: '오늘 기분 좋아 보이심. 산책 나가서 30분 정도 걸으심. 저녁 식사 잘 드심.',
    status: '재출현'
  },
  {
    id: 3,
    recipientName: '이철수',
    date: '2024-12-02',
    dayOfWeek: '월요일',
    time: '10:00 - 13:00',
    address: '서울시 강동구 천호대로 456',
    services: ['식사도움', '배설도움', '개인위생'],
    specialNotes: '컨디션 양호. 아침 식사 잘 하심.',
    status: '승인됨'
  }
];

export const counselHistoryMock = [
  {
    id: 1,
    recipientName: '김영희',
    date: '2024-11-15',
    counselType: '정기 상담',
    reaction: '매우 만족',
    visitPurpose: '서비스 만족도 확인 및 추가 요구사항 파악',
    observedCondition: '아들 (김민준)',
    subjectiveNeeds: '어머니의 보행 능력 저하에 대한 우려. 낙상 예방을 위한 추가 장비 필요성 논의.',
    counselorNotes: '보행 보조기 추가 렌탈 검토. 주 2회 물리치료 서비스 상담 예정.',
    nextVisit: '2024-12-15',
    status: '완료',
    recipientSigned: true,
    caregiverSigned: true
  },
  {
    id: 2,
    recipientName: '박순자',
    date: '2024-11-10',
    counselType: '초기 상담',
    reaction: '만족',
    visitPurpose: '신규 서비스 시작 안내 및 요구사항 청취',
    observedCondition: '딸 (박지영)',
    subjectiveNeeds: '주 3회 방문 희망. 식사 준비 및 청소 서비스 중점.',
    counselorNotes: '요구사항 반영하여 서비스 계획 수립. 다음 주부터 본격 시작.',
    nextVisit: '2024-12-10',
    status: '완료',
    recipientSigned: true,
    caregiverSigned: false
  },
  {
    id: 3,
    recipientName: '이철수',
    date: '2024-11-05',
    counselType: '긴급 상담',
    reaction: '보통',
    visitPurpose: '건강 상태 급변에 따른 긴급 방문',
    observedCondition: '아들 (이민호)',
    subjectiveNeeds: '응급 상황 대응 매뉴얼 요청.',
    counselorNotes: '응급 연락망 정리 및 대응 절차 안내 완료.',
    nextVisit: '2024-11-20',
    status: '완료',
    recipientSigned: false,
    caregiverSigned: true
  }
];