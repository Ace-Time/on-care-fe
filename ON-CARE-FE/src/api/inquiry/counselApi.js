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