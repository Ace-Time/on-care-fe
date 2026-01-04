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
 * 이탈위험 - 상담 요청 알림 발송
 * @param {number} beneficiaryId
 */
export const sendChurnRiskNotification = (beneficiaryId) => {
  return api.post(`/api/customer-manage/beneficiaries/${beneficiaryId}/churn-risk/notify`);
};

/**
 * 불만상담 - 후속조치 등록 및 알림 발송
 * @param {Object} data - { beneficiaryId, counselId, followUpContent, actionType }
 */
export const registerComplaintFollowUp = (data) => {
  return api.post('/api/customer-manage/complaint/follow-up', data);
};

/**
 * 해지상담 - 해지 등록
 * @param {Object} data - { beneficiaryId, plannedTerminationDate, terminationReason }
 */
export const registerTermination = (data) => {
  return api.post('/api/customer-manage/termination', data);
};

/**
 * 렌탈상담 - 요양보호사 알림 발송
 * @param {number} beneficiaryId
 */
export const sendRentalNotification = (beneficiaryId) => {
  return api.post(`/api/customer-manage/beneficiaries/${beneficiaryId}/rental/notify`);
};
