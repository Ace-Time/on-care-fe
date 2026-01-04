import api from '@/lib/api';

/**
 * 고객 검색 API
 * @param {string} keyword - 검색어 (이름 또는 전화번호)
 */
export const searchCustomers = (keyword) => {
  // 백엔드 Controller: requestCustomerList(@RequestParam String keyword)
  return api.get('/api/counsel/customers', {
    params: { keyword }
  });
};

/**
 * 상담 리스트 조회
 * @param {number|string} customerId - Path Variable
 * @param {Object} params - Query Params { customerType, page, size }
 */
export const getCounselList = (customerId, params) => {
  // [중요] 함수 인자에 customerId가 반드시 있어야 함
  return api.get(`/api/counsel/customers/${customerId}/counsels`, { params });
};

/**
 * 상담 상세 정보 조회
 * @param {number|string} counselId - 상담 ID
 */
export const getCounselDetail = (counselId) => {
  // 백엔드: CounselQueryController.requestCounselDetail
  return api.get(`/api/counsel/${counselId}`);
};

/**
 * [신규 고객] 가입 상담 등록
 * POST /api/counsel/subscription
 */
export const registNewSubscription = (data) => {
  return api.post('/api/counsel/subscription', data);
};

/**
 * [신규 고객] 통합 상담 등록 (렌탈, 문의, 컴플레인, 해지)
 * POST /api/counsel/general
 */
export const registNewGeneralCounsel = (data) => {
  return api.post('/api/counsel/general', data);
};

/**
 * [기존 고객] 가입 상담 등록
 * POST /api/counsel/{customerId}/subscription
 */
export const registExistingSubscription = (customerId, params, data) => {
  // params: { customerType, customerCategoryName }
  return api.post(`/api/counsel/${customerId}/subscription`, data, { params });
};

/**
 * [기존 고객] 통합 상담 등록
 * POST /api/counsel/{customerId}/general
 */
export const registExistingGeneral = (customerId, params, data) => {
  // params: { customerType }
  return api.post(`/api/counsel/${customerId}/general`, data, { params });
};

/**
 * 가입상담 단계별 데이터 저장
 * POST /api/counsel/potentialStage/{stage}/{customerId}
 * @param {number|string} customerId - 잠재고객 ID
 * @param {number} stage - 단계 번호 (1, 2, 3, 4)
 * @param {Object} data - 저장할 데이터 { stage, potentialCustomerId, stageData, processStatus }
 */
export const saveStageDataApi = (customerId, stage, data) => {
  // 백엔드: CounselCommandController.saveStageData
  return api.post(`/api/counsel/potentialStage/${stage}/${customerId}`, data);
};

/**
 * 가입상담 단계별 데이터 조회
 * GET /api/counsel/potentialStage/{customerId}
 * @param {number|string} customerId - 잠재고객 ID
 * @returns {Promise} - { stageData: { 1: {...}, 2: {...}, 3: {...}, 4: {...} } }
 */
export const getStageDataApi = (customerId) => {
  // 백엔드: CounselCommandController.getStageData
  return api.get(`/api/counsel/potentialStage/${customerId}`);
};

// 매칭 태그 조회
export const getMatchTagsApi = () => {
  return api.get('/api/beneficiaries/meta/tags');
};

// 위험 요소 조회
export const getRiskFactorsApi = () => {
  return api.get('/api/beneficiaries/meta/risk-factors');
};

/**
 * 신규 수급자 등록 (4단계 계약 완료)
 * POST /api/counsel/regist/newBeneficiary
 * @param {Object} data - RegistNewBeneficiary DTO 형식의 데이터
 * @returns {Promise} - { success: boolean, message: string, beneficiaryId: number }
 */
export const registNewBeneficiaryApi = (data) => {
  return api.post('/api/counsel/regist/newBeneficiary', data);
};

/**
 * 수급자 특이사항 조회
 * GET /api/counsel/beneficiaries/{beneficiaryId}/significants?category=카테고리명
 */
export const getBeneficiarySignificantsApi = (beneficiaryId, category) => {
  const params = category ? { category } : {};
  return api.get(`/api/counsel/beneficiaries/${beneficiaryId}/significants`, { params });
};

/**
 * 모든 특이사항 마스터 조회
 * GET /api/counsel/significants/master
 */
export const getAllSignificantsApi = () => {
  return api.get('/api/counsel/significants/master');
};

/**
 * 수급자 특이사항 추가
 * POST /api/counsel/beneficiaries/{beneficiaryId}/significants
 */
export const addBeneficiarySignificantApi = (beneficiaryId, significantId) => {
  return api.post(`/api/counsel/beneficiaries/${beneficiaryId}/significants`, {
    significantId
  });
};

/**
 * 수급자 특이사항 삭제
 * DELETE /api/counsel/beneficiaries/{beneficiaryId}/significants/{significantId}
 */
export const deleteBeneficiarySignificantApi = (beneficiaryId, significantId) => {
  return api.delete(`/api/counsel/beneficiaries/${beneficiaryId}/significants/${significantId}`);
};

/**
 * 잠재고객 등록
 * POST /api/counsel/potentialCustomer
 */
export const registPotentialCustomerApi = (data) => {
  return api.post('/api/counsel/potentialCustomer', data);
};

/**
 * 신규 고객 통합상담 등록
 * POST /api/counsel/general
 */
export const registNewGeneralCounselApi = (data) => {
  return api.post('/api/counsel/general', data);
};

/**
 * 기존 고객 통합상담 등록
 * POST /api/counsel/{customerId}/general?customerType=potential
 */
export const registGeneralCounselApi = (data, customerId, customerType) => {
  return api.post(`/api/counsel/${customerId}/general`, data, {
    params: { customerType }
  });
};

/**
 * 고객 중복 체크 API (전화번호 기준)
 * @param {Object} data - { phone: string }
 * @returns {Promise} - { exists: boolean, type?: 'potential' | 'beneficiary' }
 * 
 * 중복 조건:
 * - 전화번호가 같으면 중복
 * - type으로 어떤 테이블에서 중복인지 확인 가능
 */
export const checkDuplicateCustomerApi = (data) => {
  return axios.post('/api/counsel/check-duplicate', data);
};
