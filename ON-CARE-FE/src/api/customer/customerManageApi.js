import api from '@/lib/api';

/**
 * 수급자 목록 조회 (카테고리 필터링 포함)
 * @param {Object} params - { keyword, category, subCategory, page, size }
 */
export const getBeneficiaryList = (params) => {
  return api.get('/api/customer-manage/beneficiaries', { params });
};

/**
 * 카테고리별 카운트 조회
 */
export const getCategoryCounts = () => {
  return api.get('/api/customer-manage/category-counts');
};

/**
 * 고객 관리 상세 조회 (5단계용)
 * @param {number} beneficiaryId
 */
export const getCustomerManageDetail = (beneficiaryId) => {
  return api.get(`/api/customer-manage/beneficiaries/${beneficiaryId}/detail`);
};

/**
 * 수급자 계약 정보 조회 (beneficiary_history 테이블)
 */
export const getBeneficiaryContractInfo = (beneficiaryId) => {
  return api.get(`/api/customer-manage/${beneficiaryId}/contract`);
};

/**
 * 계약 연장
 */
export const extendBeneficiaryContract = (beneficiaryId, data) => {
  return api.post(`/api/customer-manage/${beneficiaryId}/contract/extend`, data);
};

/**
 * 계약 종료 처리
 */
export const terminateBeneficiaryContract = (beneficiaryId, data) => {
  return api.post(`/api/customer-manage/${beneficiaryId}/contract/terminate`, data);
};



/**
 * 이탈 위험 수급자 알림 발송
 */
export const sendChurnRiskBeneficiariesNotification = (beneficiaryId) => {
  // 예: /api/customer-manage/notify/churn-risk/12345
  return api.post(`/api/customer-manage/notify/churn-risk/${beneficiaryId}`);
};

export const sendComplainNotification = (beneficiaryId) => {
  // 예: /api/customer-manage/notify/complain/12345
  return api.post(`/api/customer-manage/notify/complain/${beneficiaryId}`);
};

export const sendTerminationNotification = (beneficiaryId) => {
  // 예: /api/customer-manage/notify/termination/12345
  return api.post(`/api/customer-manage/notify/termination/${beneficiaryId}`);
};

export const sendExpirationNotification = (beneficiaryId) => {
  // 예: /api/customer-manage/notify/expiration/12345
  return api.post(`/api/customer-manage/notify/expiration/${beneficiaryId}`);
};

export const sendRentalNotification = (beneficiaryId) => {
  // 예: /api/customer-manage/notify/rental/12345
  return api.post(`/api/customer-manage/notify/rental/${beneficiaryId}`);
};
