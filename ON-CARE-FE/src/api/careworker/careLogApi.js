import api from '@/lib/api';

/**
 * 요양일지 API
 */

// ===== Query APIs =====

// 1. 요양보호사별 요양일지 목록 조회
export const getCareLogList = async () => {
  const res = await api.get('/api/care-logs');
  return res.data;
};

// 2. 수급자별 요양일지 목록 조회
export const getCareLogListByBeneficiary = async (beneficiaryId) => {
  if (!beneficiaryId) throw new Error('beneficiaryId is required');

  const res = await api.get(`/api/care-logs/beneficiary/${beneficiaryId}`);
  return res.data;
};

// 3. 요양일지 상세 조회
export const getCareLogDetail = async (logId) => {
  if (!logId) throw new Error('logId is required');

  const res = await api.get(`/api/care-logs/${logId}`);
  return res.data;
};

// ===== Command APIs =====

// 4. 요양일지 작성
export const createCareLog = async (data) => {
  const res = await api.post('/api/care-logs', data);
  return res.data;
};

// 5. 요양일지 수정
export const updateCareLog = async (logId, data) => {
  if (!logId) throw new Error('logId is required');

  const res = await api.patch(`/api/care-logs/${logId}`, data);
  return res.data;
};

// 6. 요양일지 삭제
export const deleteCareLog = async (logId) => {
  if (!logId) throw new Error('logId is required');

  const res = await api.delete(`/api/care-logs/${logId}`);
  return res.data;
};
