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
 * 이탈위험 알림 발송
 */
export const sendChurnRiskNotification = (beneficiaryId) => {
  return api.post(`/api/customer-manage/${beneficiaryId}/notification/churn-risk`);
};

/**
 * 불만 후속조치 등록
 */
export const registerComplaintFollowUp = (beneficiaryId, data) => {
  return api.post(`/api/customer-manage/${beneficiaryId}/complaint/follow-up`, data);
};

/**
 * 해지 등록
 */
export const registerTermination = (beneficiaryId, data) => {
  return api.post(`/api/customer-manage/${beneficiaryId}/termination`, data);
};

/**
 * 렌탈 알림 발송
 */
export const sendRentalNotification = (beneficiaryId) => {
  return api.post(`/api/customer-manage/${beneficiaryId}/notification/rental`);
};
