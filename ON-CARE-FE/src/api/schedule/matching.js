import api from '@/lib/api'

/**
 * =========================
 * Beneficiaries
 * =========================
 */

// 수급자 목록 조회
export const getBeneficiaryList = ({ page = 0, size = 8, keyword = '', assigned } = {}) => {
  const params = {
    page,
    size,
    ...(keyword && String(keyword).trim() ? { keyword: String(keyword).trim() } : {}),
    ...(assigned === 'Y' || assigned === 'N' ? { assigned } : {}),
  }
  return api.get('/api/matching/beneficiaries/list', { params })
}

// 수급자 상세 조회
export const getBeneficiaryDetail = (beneficiaryId) =>
  api.get(`/api/matching/beneficiaries/${beneficiaryId}`)

/**
 * =========================
 * CareWorkers (Matching)
 * =========================
 */

// 특정 수급자 기준 후보 요양보호사 카드 조회
export const getCandidateCareWorkerCards = ({
  beneficiaryId,
  page = 0,
  size = 8,
  keyword = null,
  sort = 'TOTAL',
} = {}) =>
  api.get('/api/matching/careworkers/list', {
    params: {
      beneficiaryId,
      page,
      size,
      ...(keyword && String(keyword).trim() ? { keyword: String(keyword).trim() } : {}),
      ...(sort ? { sort } : {}),
    },
  })

// 방문일정(confirmed) 시간 기준 배정가능 요양보호사 카드 조회
export const getVisitAvailableCareWorkerCards = ({
  vsId,
  startDt,
  endDt,
  page = 0,
  sort = 'TOTAL',
} = {}) =>
  api.get('/api/matching/careworkers/visit-available', {
    params: { vsId, startDt, endDt, page, sort },
  })
  
// 요양보호사 상세 조회
export const getCareWorkerDetail = (careWorkerId) =>
  api.get(`/api/matching/careworkers/${careWorkerId}`)

/**
 * =========================
 * CareWorker Change
 * =========================
 */

// 매칭 요양보호사 변경
export const changeMatchingCareWorker = (matchingId, careWorkerId) =>
  api.patch(`/api/change/matchings/${matchingId}/care-worker`, {
    careWorkerId,
  })

// 방문일정(confirmed) 요양보호사 변경
export const changeVisitScheduleCareWorker = (vsId, careWorkerId) =>
  api.patch(`/api/change/visit-schedules/${vsId}/care-worker`, {
    careWorkerId,
  })

// 매칭
export const assignMatchingCareWorker = ({
  beneficiaryId,
  careWorkerId,
  effectiveDate,
}) =>
  api.post('/api/matching/assign', {
    beneficiaryId,
    careWorkerId,
    effectiveDate,
  })
  
// 방문일정 "생성" 시간 기준 배정가능 요양보호사 카드 조회
export const getCreateVisitAvailableCareWorkerCards = ({
  beneficiaryId,
  startDt,
  endDt,
  serviceTypeId,
  page = 0,
  size = 8,
  keyword = null,          
  sort = 'TOTAL',
} = {}) =>
  api.get('/api/matching/careworkers/visit-create-available', {
    params: {
      beneficiaryId,
      startDt,
      endDt,
      serviceTypeId,
      page,
      size,
      ...(keyword && String(keyword).trim() ? { keyword: String(keyword).trim() } : {}), 
      sort,
    },
  })

  // 방문일정 생성
export const createVisitSchedule = ({
  beneficiaryId,
  careWorkerId,
  serviceTypeId, 
  startDt,
  endDt,
  note,          
}) =>
  api.post('/api/matching/visit-schedules', {
    beneficiaryId,
    careWorkerId,
    serviceTypeId,
    startDt,
    endDt,
    note,         
  })

  export const unassignMatchingCareWorker = (beneficiaryId, effectiveDate) => {
    return api.delete(`/api/matching/assign/${beneficiaryId}`, {
      params: { effectiveDate },
    })
  }