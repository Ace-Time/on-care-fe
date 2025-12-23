import api from '@/lib/api'

/**
 * =========================
 * Beneficiaries
 * =========================
 */

// 수급자 목록 조회
export const getBeneficiaryList = () =>
  api.get('/matching/beneficiaries/list')

// 수급자 상세 조회
export const getBeneficiaryDetail = (beneficiaryId) =>
  api.get(`/matching/beneficiaries/${beneficiaryId}`)

/**
 * =========================
 * CareWorkers (Matching)
 * =========================
 */

// 특정 수급자 기준 후보 요양보호사 카드 조회 (한 방)
export const getCandidateCareWorkerCards = (beneficiaryId) =>
    api.get('/matching/careworkers/list', {
      params: { beneficiaryId },
    })


// 요양보호사 상세 조회
export const getCareWorkerDetail = (careWorkerId) =>
  api.get(`/matching/careworkers/${careWorkerId}`)