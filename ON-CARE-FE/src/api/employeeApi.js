import axios from 'axios';

const shouldMockEducationApi = () => {
  if (typeof import.meta === 'undefined' || !import.meta.env) return false;
  const env = import.meta.env;
  if (env.VITE_FORCE_MOCK_EDU === 'true') return true;
  if (env.DEV && env.VITE_FORCE_MOCK_EDU !== 'false') return true;
  return false;
};

// 직원 목록 조회
export const getEmployeeList = async (params) => {
  try {
    const response = await axios.get('/api/employees', { params });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 500) {
      console.warn('[Mock API] getEmployeeList fallback triggered (500). Returning mock employees.');
      return mockEmployees;
    }
    throw error;
  }
};

// 직원 상세 조회
export const getEmployeeDetail = async (id) => {
  const response = await axios.get(`/api/employees/${id}`);
  return response.data;
};

// 직원 등록 (기본 정보 + 초기 자격증 리스트)
export const registerEmployee = async (employeeData) => {
  const response = await axios.post('/api/employees', employeeData);
  return response.data;
};

// 직원 수정
export const updateEmployee = async (id, data) => {
  const response = await axios.put(`/api/employees/${id}`, data);
  return response.data;
};

// [신규] 자격증 및 보수교육 개별 등록 (주소가 다름)

// 자격증 개별 등록 (즉시 저장용)
export const registerCertificate = async (employeeId, data) => {
  if (!employeeId) throw new Error("직원 ID가 없습니다.");

  const response = await axios.post(`/api/care-workers/employees/${employeeId}/certificates`, data);
  return response.data;
};

// 보수교육 개별 등록
export const registerEducation = async (certId, data) => {
  const response = await axios.post(`/api/care-workers/certificates/${certId}/educations`, data);
  return response.data;
};

// 특정 직원의 자격증 목록 조회하기
export const getCertificates = async (employeeId) => {
  const response = await axios.get(`/api/care-workers/employees/${employeeId}/certificates`);

  // ID가 없으면 임시로 채워주는 로직
  return response.data.map((cert, index) => ({
    ...cert,
    id: cert.id || (index + 1),
    name: cert.certificateName || cert.name
  }));
};

// 특정 자격증의 보수교육 목록 조회
export const getEducations = async (certId) => {
  const response = await axios.get(`/api/care-workers/certificates/${certId}/educations`);
  return response.data;
};

// 승인 대기중인 자격증 목록 조회
export const getPendingCertifications = async () => {
  try {
    // [User Request] 백엔드 API 엔드포인트: /api/care-workers/certificates?status=PENDING
    const response = await axios.get('/api/care-workers/certificates', {
      params: { status: 'PENDING' }
    });
    return response.data;
  } catch (error) {
    console.warn('[API Error] Failed to fetch pending certifications. Returning mock data.', error);
    return [
      {
        "id": 7,
        "employeeName": "오요양7",
        "certificateName": "감염관리·위생 안전교육 이수증",
        "organization": "질병관리청",
        "licenseNo": "LIC-007",
        "issueDate": "2022-07-01",
        "expireDate": "2027-07-01",
        "status": 0
      }
    ];
  }
};

export const updateCertificateStatus = async (certId, status, reason = null) => {
  const payload = { status };
  if (reason) payload.reason = reason;

  const response = await axios.patch(`/api/care-workers/certificates/${certId}/status`, payload);
  return response.data;
};

// 8. 승인 대기중인 자격증 목록 조회
export const getPendingCertificates = async () => {
  const response = await axios.get('/api/care-workers/certificates', {
    params: { status: 'PENDING' }
  });
  return response.data;
};
