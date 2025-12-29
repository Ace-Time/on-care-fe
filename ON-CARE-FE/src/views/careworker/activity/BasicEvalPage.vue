<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useUserStore } from '@/stores/user';

// 1. 각 평가 폼 컴포넌트 임포트
import FallRiskAssessmentForm from "@/components/careworker/activity/FallRiskAssessmentForm.vue";
import BedsoreAssessmentForm from "@/components/careworker/activity/BedsoreAssessmentForm.vue";
import CognitiveAssessmentForm from "@/components/careworker/activity/CognitiveAssessmentForm.vue";
import NeedsAssessmentForm from "@/components/careworker/activity/NeedsAssessmentForm.vue"; // 파일 없으면 주석

// 2. API 임포트
import {
  getFallEvaluationList,
  getBedsoreEvaluationList,
  getCognitiveEvaluationList,
  getNeedsEvaluationList,
  deleteFallEvaluation,
  deleteBedsoreEvaluation,
  deleteCognitiveEvaluation,
  deleteNeedsEvaluation,
} from '@/api/careworker';

const userStore = useUserStore();
const mainTab = ref("write");
const activeTab = ref("fallRisk");
const evalHistory = ref([]);
const loading = ref(false);
const selectedYear = ref(new Date().getFullYear());
const yearStats = ref({});

const subTabs = [
  { key: "fallRisk", label: "낙상위험도", component: FallRiskAssessmentForm },
  { key: "bedsore", label: "욕창위험도", component: BedsoreAssessmentForm },
  { key: "cognitive", label: "인지기능", component: CognitiveAssessmentForm },
  { key: "needs", label: "욕구사정", component: NeedsAssessmentForm || null },
];

const apiMap = {
  fallRisk: getFallEvaluationList,
  bedsore: getBedsoreEvaluationList,
  cognitive: getCognitiveEvaluationList,
  needs: getNeedsEvaluationList,
};

// 현재 탭 컴포넌트
const currentTabComponent = computed(() => {
  const tab = subTabs.find(t => t.key === activeTab.value);
  return tab ? tab.component : null;
});

// 평가 등급 판정 (resultGrade에서 추출)
const getGradeLabel = (resultGrade) => {
  if (!resultGrade) return '-';

  // Backend에서 받은 resultGrade 문자열에서 등급 추출
  // 예: "낙상 위험 낮음", "낙상 위험 높음", "낙상 위험 매우 높음", "인지기능 정상" 등
  if (resultGrade.includes('낮음') || resultGrade.includes('정상')) return '낮음';
  if (resultGrade.includes('중간') || resultGrade.includes('보통')) return '중간';
  if (resultGrade.includes('높음')) return '높음'; // "매우 높음"도 포함

  return '-';
};

// 연도별 통계 계산
const calculateYearStats = (data) => {
  const stats = {};

  data.forEach(item => {
    const itemDate = new Date(item.evalDate || item.assessmentDate || item.evaluationDate);
    const year = itemDate.getFullYear();

    if (!stats[year]) {
      stats[year] = {
        count: 0,
        totalScore: 0,
        grades: { 낮음: 0, 중간: 0, 높음: 0 },
        items: []
      };
    }

    const score = item.totalScore || 0;
    const grade = getGradeLabel(item.resultGrade);

    stats[year].count++;
    stats[year].totalScore += score;
    stats[year].grades[grade]++;
    stats[year].items.push(item);
  });

  // 평균 점수 계산
  Object.keys(stats).forEach(year => {
    stats[year].avgScore = Math.round(stats[year].totalScore / stats[year].count);
  });

  return stats;
};

const loadEvaluationHistory = async () => {
  loading.value = true;
  evalHistory.value = [];
  yearStats.value = {};

  try {
    const currentApi = apiMap[activeTab.value];
    if (!currentApi) return;

    const response = await currentApi();
    const data = response?.data ?? response;

    const formattedData = (data || []).map(item => {

      // 백엔드가 직접 제공하는 값 우선 사용
      let totalScore = item.totalScore ?? 0;
      let resultGrade = item.resultGrade || '-';

      // 백엔드가 값을 제공하지 않으면 evalData 파싱 시도
      if ((totalScore === 0 || resultGrade === '-') && item.evalData) {
        try {
          const parsedData = typeof item.evalData === 'string'
            ? JSON.parse(item.evalData)
            : item.evalData;

          if (parsedData.result) {
            totalScore = parsedData.result.total_score ?? totalScore;
            resultGrade = parsedData.result.grade || resultGrade;
          }
        } catch (error) {
          // evalData 파싱 실패 시 기본값 사용
        }
      }

      return {
        id: item.evalId || item.id,
        evalDate: item.evalDate || item.assessmentDate || item.evaluationDate,
        beneficiaryId: item.beneficiaryId,
        beneficiaryName: item.beneficiaryName || item.recipientName || '-',
        careLevel: item.careLevel || '-',
        resultGrade: resultGrade,
        totalScore: totalScore,
        status: item.status || '완료',
        evaluatorName: item.employeeName || item.evaluatorName || userStore.name || '-',
        comment: item.specialNote || item.comment || '',
        scoreDetails: item.scoreDetails || ''
      };
    });

    evalHistory.value = formattedData;
    yearStats.value = calculateYearStats(formattedData);
  } catch (error) {
    // 평가 데이터 로딩 실패
  } finally {
    loading.value = false;
  }
};

// 연도별 데이터 필터링
const filteredByYear = computed(() => {
  if (!selectedYear.value || !yearStats.value[selectedYear.value]) return [];
  return yearStats.value[selectedYear.value].items || [];
});

// 사용 가능한 연도 목록
const availableYears = computed(() => {
  return Object.keys(yearStats.value).sort((a, b) => b - a);
});

const handleSubmit = async (data) => {
  try {
    // 평가 타입별 API 선택 및 templateId 매핑
    const createApis = {
      fallRisk: {
        fn: async (submitData) => {
          const { createFallEvaluation } = await import('@/api/careworker/evaluationApi');
          return createFallEvaluation(submitData);
        },
        templateId: 1, // 낙상위험도 평가 템플릿 ID
        templateCode: 'FALL'
      },
      bedsore: {
        fn: async (submitData) => {
          const { createBedsoreEvaluation } = await import('@/api/careworker/evaluationApi');
          return createBedsoreEvaluation(submitData);
        },
        templateId: 2, // 욕창위험도 평가 템플릿 ID
        templateCode: 'BEDSORE'
      },
      cognitive: {
        fn: async (submitData) => {
          const { createCognitiveEvaluation } = await import('@/api/careworker/evaluationApi');
          return createCognitiveEvaluation(submitData);
        },
        templateId: 3, // 인지기능 평가 템플릿 ID
        templateCode: 'COGNITIVE'
      },
      needs: {
        fn: async (submitData) => {
          const { createNeedsEvaluation } = await import('@/api/careworker/evaluationApi');
          return createNeedsEvaluation(submitData);
        },
        templateId: 4, // 욕구사정 평가 템플릿 ID
        templateCode: 'NEEDS'
      }
    };

    const apiConfig = createApis[activeTab.value];
    if (!apiConfig) {
      alert('저장 API를 찾을 수 없습니다.');
      return;
    }

    // 백엔드 API 형식으로 데이터 변환 (result 객체와 answers 배열 포함)
    let evalData = {};

    if (activeTab.value === 'fallRisk') {
      // 낙상위험도 평가 데이터 구조화
      const { fallRiskAssessment } = await import('@/mock/careworker/fallRiskData');
      const scores = data.fallRisk || {};

      // answers 배열 생성
      const answers = fallRiskAssessment.items.map(item => {
        const score = scores[item.code];
        const selectedChoice = item.choices.find(choice => choice && choice.score === score);

        return {
          code: item.code,
          label: item.label,
          selected: selectedChoice ? {
            score: selectedChoice.score,
            label: selectedChoice.label
          } : null
        };
      });

      // 총점 및 등급 계산
      const totalScore = data.totalScore || 0;
      const grade = data.grade || '낙상 위험 낮음';

      evalData = {
        template_code: apiConfig.templateCode,
        template_version: 1,
        result: {
          total_score: totalScore,
          grade: grade
        },
        answers: answers
      };
    } else if (activeTab.value === 'bedsore') {
      // 욕창위험도 평가 데이터 구조화
      const { bedsoreAssessment } = await import('@/mock/careworker/bedsoreData');
      const scores = data.bedsoreRisk || {};

      // answers 배열 생성
      const answers = bedsoreAssessment.items.map(item => {
        const score = scores[item.code];
        const selectedChoice = item.choices.find(choice => choice && choice.score === score);

        return {
          code: item.code,
          label: item.label,
          selected: selectedChoice ? {
            score: selectedChoice.score,
            label: selectedChoice.label
          } : null
        };
      });

      // 총점 및 등급 계산
      let totalScore = 0;
      Object.values(scores).forEach(score => {
        const num = Number(score);
        if (!isNaN(num)) totalScore += num;
      });

      // 등급 결정 (욕창은 점수가 높을수록 위험도가 낮음)
      let grade;
      if (totalScore >= 19) {
        grade = '낮음(위험 없음)';
      } else if (totalScore >= 13) {
        grade = '중간(약간~중도 위험)';
      } else {
        grade = '매우 높음(위험 매우 높음)';
      }

      evalData = {
        template_code: apiConfig.templateCode,
        template_version: 1,
        result: {
          total_score: totalScore,
          grade: grade
        },
        answers: answers
      };
    } else if (activeTab.value === 'cognitive') {
      // 인지기능 평가 데이터 구조화
      const { cognitiveAssessment } = await import('@/mock/careworker/cognitiveData');
      const responses = data.responses || {};
      const educationLevel = data.educationLevel || 'MIDDLE_HIGH';

      // answers 배열 생성 (섹션별로 구성)
      const answers = [];
      cognitiveAssessment.sections.forEach(section => {
        section.items.forEach(item => {
          const response = responses[item.code];
          answers.push({
            code: item.code,
            section: section.code,
            section_title: section.title,
            question: item.question,
            selected: response !== undefined ? response : null
          });
        });
      });

      // 총점 계산 (프론트엔드에서 계산된 값 사용)
      const totalScore = data.totalScore || 0;

      // 등급 결정 (학력 기준)
      const eduLevel = cognitiveAssessment.education_levels.find(e => e.code === educationLevel);
      const cutoff = eduLevel ? eduLevel.cutoff : 24;
      const grade = totalScore >= cutoff ? '인지기능 정상' : '인지기능 저하 의심';

      evalData = {
        template_code: apiConfig.templateCode,
        template_version: 1,
        education_level: educationLevel,
        result: {
          total_score: totalScore,
          grade: grade,
          cutoff: cutoff
        },
        answers: answers
      };
    } else if (activeTab.value === 'needs') {
      // 욕구사정 평가 데이터 구조화
      const { needsAssessment } = await import('@/mock/careworker/needsData');
      const responses = data.responses || {};
      const textResponses = data.textResponses || {};

      // answers 배열 생성 (섹션별로 구성)
      const answers = [];
      needsAssessment.sections.forEach(section => {
        section.items.forEach(item => {
          const response = responses[item.code];
          const textValue = textResponses[item.code];

          answers.push({
            code: item.code,
            section: section.code,
            label: item.label,
            type: item.type,
            selected: response !== undefined ? response : null,
            text_value: textValue || null
          });
        });
      });

      evalData = {
        template_code: apiConfig.templateCode,
        template_version: 1,
        result: {
          total_score: 0, // 욕구사정은 점수 개념이 없음
          grade: '작성완료'
        },
        answers: answers
      };
    }

    // 욕구사정의 경우 총평(summary)을 specialNote로 사용
    let specialNote = data.comment || '';
    if (activeTab.value === 'needs' && data.responses?.summary) {
      specialNote = data.responses.summary;
    }

    const submitData = {
      beneficiaryId: parseInt(data.beneficiaryId, 10),
      templateId: apiConfig.templateId,
      evalDate: data.assessmentDate,
      evalData: evalData,
      specialNote: specialNote
    };

    await apiConfig.fn(submitData);

    alert('평가가 성공적으로 저장되었습니다.');

    // 작성 내역 탭으로 이동
    mainTab.value = 'history';
    await loadEvaluationHistory();
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || '평가 저장에 실패했습니다.';
    alert(errorMessage);
  }
};

const handleSaveDraft = () => {
  alert("임시저장 되었습니다.");
};

// 상세보기 모달
const showDetailModal = ref(false);
const detailItem = ref(null);

// 수정 모달
const showEditModal = ref(false);
const editItem = ref(null);

// 상세보기 열기
const openDetailModal = async (item) => {
  try {

    // 현재 평가 타입에 따른 API 선택
    const detailApis = {
      fallRisk: async () => {
        const { getFallEvaluationDetail } = await import('@/api/careworker/evaluationApi');
        return getFallEvaluationDetail(item.id);
      },
      bedsore: async () => {
        const { getBedsoreEvaluationDetail } = await import('@/api/careworker/evaluationApi');
        return getBedsoreEvaluationDetail(item.id);
      },
      cognitive: async () => {
        const { getCognitiveEvaluationDetail } = await import('@/api/careworker/evaluationApi');
        return getCognitiveEvaluationDetail(item.id);
      },
      needs: async () => {
        const { getNeedsEvaluationDetail } = await import('@/api/careworker/evaluationApi');
        return getNeedsEvaluationDetail(item.id);
      }
    };

    const getDetail = detailApis[activeTab.value];
    if (!getDetail) {
      detailItem.value = item;
      showDetailModal.value = true;
      return;
    }

    const detailResponse = await getDetail();
    const detailData = detailResponse?.data ?? detailResponse;

    // 평가 타입별 데이터 추출 (백엔드에서 evalData 필드가 JSON 문자열로 저장됨)
    let evalData = {};
    let parsedEvalData = null;

    if (detailData.evalData) {
      try {
        parsedEvalData = typeof detailData.evalData === 'string'
          ? JSON.parse(detailData.evalData)
          : detailData.evalData;

        if (parsedEvalData.answers && Array.isArray(parsedEvalData.answers)) {
          if (activeTab.value === 'fallRisk' || activeTab.value === 'bedsore') {
            parsedEvalData.answers.forEach(answer => {
              if (answer.code && answer.selected && typeof answer.selected.score === 'number') {
                evalData[answer.code] = answer.selected.score;
              }
            });
          }
          else if (activeTab.value === 'cognitive') {
            const responses = {};
            parsedEvalData.answers.forEach(answer => {
              if (answer.code && answer.selected !== undefined && answer.selected !== null) {
                responses[answer.code] = answer.selected;
              }
            });
            evalData.educationLevel = parsedEvalData.education_level || 'MIDDLE_HIGH';
            evalData.responses = responses;
          }
          else if (activeTab.value === 'needs') {
            const responses = {};
            const textResponses = {};
            parsedEvalData.answers.forEach(answer => {
              if (answer.code && answer.selected !== undefined && answer.selected !== null) {
                responses[answer.code] = answer.selected;
              }
              if (answer.text_value) {
                textResponses[answer.code] = answer.text_value;
              }
            });
            evalData.responses = responses;
            evalData.textResponses = textResponses;
          }
        } else {
          evalData = parsedEvalData;
        }
      } catch (error) {
        evalData = {};
      }
    }

    // 평가 폼 데이터 구조로 변환
    const formattedDetail = {
      ...item,
      beneficiaryId: detailData.beneficiaryId || item.beneficiaryId,
      recipientName: detailData.beneficiaryName || item.beneficiaryName,
      careWorkerName: detailData.employeeName || detailData.evaluatorName || item.evaluatorName || userStore.name,
      assessmentDate: detailData.evalDate?.split('T')[0] || item.evalDate?.split('T')[0],
      comment: detailData.specialNote || item.specialNote || ''
    };

    // 평가 타입별 데이터 매핑
    if (activeTab.value === 'fallRisk') {
      formattedDetail.fallRisk = evalData;
    } else if (activeTab.value === 'bedsore') {
      formattedDetail.bedsoreRisk = evalData;
    } else if (activeTab.value === 'cognitive') {
      formattedDetail.educationLevel = evalData.educationLevel || 'MIDDLE_HIGH';
      formattedDetail.responses = evalData.responses || evalData;
    } else if (activeTab.value === 'needs') {
      formattedDetail.responses = evalData.responses || evalData;
      formattedDetail.textResponses = evalData.textResponses || {};
    }

    detailItem.value = formattedDetail;
    showDetailModal.value = true;
  } catch (error) {
    detailItem.value = item;
    showDetailModal.value = true;
  }
};

// 상세보기 닫기
const closeDetailModal = () => {
  showDetailModal.value = false;
  detailItem.value = null;
};

// 수정 모달 열기
const openEditModal = async (item) => {
  try {

    // 현재 평가 타입에 따른 API 선택
    const detailApis = {
      fallRisk: async () => {
        const { getFallEvaluationDetail } = await import('@/api/careworker/evaluationApi');
        return getFallEvaluationDetail(item.id);
      },
      bedsore: async () => {
        const { getBedsoreEvaluationDetail } = await import('@/api/careworker/evaluationApi');
        return getBedsoreEvaluationDetail(item.id);
      },
      cognitive: async () => {
        const { getCognitiveEvaluationDetail } = await import('@/api/careworker/evaluationApi');
        return getCognitiveEvaluationDetail(item.id);
      },
      needs: async () => {
        const { getNeedsEvaluationDetail } = await import('@/api/careworker/evaluationApi');
        return getNeedsEvaluationDetail(item.id);
      }
    };

    const getDetail = detailApis[activeTab.value];
    if (!getDetail) {
      editItem.value = item;
      showEditModal.value = true;
      return;
    }

    const detailResponse = await getDetail();
    const detailData = detailResponse?.data ?? detailResponse;

    // 평가 타입별 데이터 추출 (백엔드에서 evalData 필드가 JSON 문자열로 저장됨)
    let evalData = {};
    let parsedEvalData = null;

    if (detailData.evalData) {
      try {
        parsedEvalData = typeof detailData.evalData === 'string'
          ? JSON.parse(detailData.evalData)
          : detailData.evalData;

        if (parsedEvalData.answers && Array.isArray(parsedEvalData.answers)) {
          if (activeTab.value === 'fallRisk' || activeTab.value === 'bedsore') {
            parsedEvalData.answers.forEach(answer => {
              if (answer.code && answer.selected && typeof answer.selected.score === 'number') {
                evalData[answer.code] = answer.selected.score;
              }
            });
          }
          else if (activeTab.value === 'cognitive') {
            const responses = {};
            parsedEvalData.answers.forEach(section => {
              if (section.items && Array.isArray(section.items)) {
                section.items.forEach(item => {
                  if (item.code && item.value !== undefined && item.value !== null) {
                    responses[item.code] = item.value;
                  }
                });
              }
            });
            evalData.educationLevel = parsedEvalData.education_level || 'MIDDLE_HIGH';
            evalData.responses = responses;
          }
          else if (activeTab.value === 'needs') {
            const responses = {};
            const textResponses = {};
            parsedEvalData.answers.forEach(section => {
              if (section.items && Array.isArray(section.items)) {
                section.items.forEach(item => {
                  if (item.code && item.value !== undefined && item.value !== null) {
                    responses[item.code] = item.value;
                  }
                  if (item.text_value) {
                    textResponses[item.code] = item.text_value;
                  }
                });
              }
            });
            evalData.responses = responses;
            evalData.textResponses = textResponses;
          }
        } else {
          evalData = parsedEvalData;
        }
      } catch (error) {
        evalData = {};
      }
    }

    // 평가 폼 데이터 구조로 변환
    const formattedDetail = {
      ...item,
      beneficiaryId: detailData.beneficiaryId || item.beneficiaryId,
      recipientName: detailData.beneficiaryName || item.beneficiaryName,
      careWorkerName: detailData.employeeName || detailData.evaluatorName || item.evaluatorName || userStore.name,
      assessmentDate: detailData.evalDate?.split('T')[0] || item.evalDate?.split('T')[0],
      comment: detailData.specialNote || item.specialNote || ''
    };

    // 평가 타입별 데이터 매핑
    if (activeTab.value === 'fallRisk') {
      formattedDetail.fallRisk = evalData;
    } else if (activeTab.value === 'bedsore') {
      formattedDetail.bedsoreRisk = evalData;
    } else if (activeTab.value === 'cognitive') {
      formattedDetail.educationLevel = evalData.educationLevel || parsedEvalData?.education_level || 'MIDDLE_HIGH';
      formattedDetail.responses = evalData.responses || {};
    } else if (activeTab.value === 'needs') {
      formattedDetail.responses = evalData.responses || {};
      formattedDetail.textResponses = evalData.textResponses || {};
    }

    editItem.value = formattedDetail;
    showEditModal.value = true;
  } catch (error) {
    editItem.value = item;
    showEditModal.value = true;
  }
};

// 수정 모달 닫기
const closeEditModal = () => {
  showEditModal.value = false;
  editItem.value = null;
};

// 수정 제출
const handleEditSubmit = async (formData) => {
  try {

    const updateApis = {
      fallRisk: {
        fn: async (id, data) => {
          const { updateFallEvaluation } = await import('@/api/careworker/evaluationApi');
          return updateFallEvaluation(id, data);
        },
        templateId: 1,
        templateCode: 'FALL'
      },
      bedsore: {
        fn: async (id, data) => {
          const { updateBedsoreEvaluation } = await import('@/api/careworker/evaluationApi');
          return updateBedsoreEvaluation(id, data);
        },
        templateId: 2,
        templateCode: 'BEDSORE'
      },
      cognitive: {
        fn: async (id, data) => {
          const { updateCognitiveEvaluation } = await import('@/api/careworker/evaluationApi');
          return updateCognitiveEvaluation(id, data);
        },
        templateId: 3,
        templateCode: 'COGNITIVE'
      },
      needs: {
        fn: async (id, data) => {
          const { updateNeedsEvaluation } = await import('@/api/careworker/evaluationApi');
          return updateNeedsEvaluation(id, data);
        },
        templateId: 4,
        templateCode: 'NEEDS'
      }
    };

    const apiConfig = updateApis[activeTab.value];
    if (!apiConfig) {
      alert('수정 API를 찾을 수 없습니다.');
      return;
    }

    // 백엔드 API 형식으로 데이터 변환 (생성할 때와 동일한 형식)
    let evalData = {};

    if (activeTab.value === 'fallRisk') {
      // 낙상위험도 평가 데이터 구조화
      const { fallRiskAssessment } = await import('@/mock/careworker/fallRiskData');
      const scores = formData.fallRisk || {};

      // answers 배열 생성
      const answers = fallRiskAssessment.items.map(item => {
        const score = scores[item.code];
        const selectedChoice = item.choices.find(choice => choice && choice.score === score);

        return {
          code: item.code,
          label: item.label,
          selected: selectedChoice ? {
            score: selectedChoice.score,
            label: selectedChoice.label
          } : null
        };
      });

      // 총점 및 등급 계산
      let totalScore = 0;
      Object.values(scores).forEach(score => {
        const num = Number(score);
        if (!isNaN(num)) totalScore += num;
      });

      // 등급 결정
      let grade;
      if (totalScore <= 4) {
        grade = '낙상 위험 낮음';
      } else if (totalScore <= 10) {
        grade = '낙상 위험 높음';
      } else {
        grade = '낙상 위험 매우 높음';
      }

      evalData = {
        template_code: apiConfig.templateCode,
        template_version: 1,
        result: {
          total_score: totalScore,
          grade: grade
        },
        answers: answers
      };
    } else if (activeTab.value === 'bedsore') {
      // 욕창위험도 평가 데이터 구조화
      const { bedsoreAssessment } = await import('@/mock/careworker/bedsoreData');
      const scores = formData.bedsoreRisk || {};

      // answers 배열 생성
      const answers = bedsoreAssessment.items.map(item => {
        const score = scores[item.code];
        const selectedChoice = item.choices.find(choice => choice && choice.score === score);

        return {
          code: item.code,
          label: item.label,
          selected: selectedChoice ? {
            score: selectedChoice.score,
            label: selectedChoice.label
          } : null
        };
      });

      // 총점 및 등급 계산
      let totalScore = 0;
      Object.values(scores).forEach(score => {
        const num = Number(score);
        if (!isNaN(num)) totalScore += num;
      });

      // 등급 결정 (욕창은 점수가 높을수록 위험도가 낮음)
      let grade;
      if (totalScore >= 19) {
        grade = '낮음(위험 없음)';
      } else if (totalScore >= 13) {
        grade = '중간(약간~중도 위험)';
      } else {
        grade = '매우 높음(위험 매우 높음)';
      }

      evalData = {
        template_code: apiConfig.templateCode,
        template_version: 1,
        result: {
          total_score: totalScore,
          grade: grade
        },
        answers: answers
      };
    } else if (activeTab.value === 'cognitive') {
      // 인지기능 평가 데이터 구조화
      const { cognitiveAssessment } = await import('@/mock/careworker/cognitiveData');
      const responses = formData.responses || {};
      const educationLevel = formData.educationLevel || 'MIDDLE_HIGH';

      // answers 배열 생성 (섹션별로 구성)
      const answers = [];
      cognitiveAssessment.sections.forEach(section => {
        section.items.forEach(item => {
          const response = responses[item.code];
          answers.push({
            code: item.code,
            section: section.code,
            question: item.question,
            selected: response !== undefined ? response : null
          });
        });
      });

      // 총점 계산
      let totalScore = 0;
      // 복잡한 점수 계산 로직 생략 (프론트에서 계산된 값 사용 권장)
      // formData에 totalScore가 있으면 사용
      if (formData.totalScore) {
        totalScore = formData.totalScore;
      } else {
        // 간단한 계산 (실제로는 더 복잡함)
        Object.values(responses).forEach(val => {
          if (typeof val === 'number') totalScore += val;
        });
      }

      // 등급 결정 (학력 기준)
      const eduLevel = cognitiveAssessment.education_levels.find(e => e.code === educationLevel);
      const cutoff = eduLevel ? eduLevel.cutoff : 24;
      const grade = totalScore >= cutoff ? '인지기능 정상' : '인지기능 저하 의심';

      evalData = {
        template_code: apiConfig.templateCode,
        template_version: 1,
        education_level: educationLevel,
        result: {
          total_score: totalScore,
          grade: grade,
          cutoff: cutoff
        },
        answers: answers
      };
    } else if (activeTab.value === 'needs') {
      // 욕구사정 평가 데이터 구조화
      const { needsAssessment } = await import('@/mock/careworker/needsData');
      const responses = formData.responses || {};
      const textResponses = formData.textResponses || {};

      // answers 배열 생성 (섹션별로 구성)
      const answers = [];
      needsAssessment.sections.forEach(section => {
        section.items.forEach(item => {
          const response = responses[item.code];
          const textValue = textResponses[item.code];

          answers.push({
            code: item.code,
            section: section.code,
            label: item.label,
            type: item.type,
            selected: response !== undefined ? response : null,
            text_value: textValue || null
          });
        });
      });

      evalData = {
        template_code: apiConfig.templateCode,
        template_version: 1,
        result: {
          total_score: 0, // 욕구사정은 점수 개념이 없음
          grade: '작성완료'
        },
        answers: answers
      };
    }

    // 욕구사정의 경우 총평(summary)을 specialNote로 사용
    let specialNote = formData.comment || '';
    if (activeTab.value === 'needs' && formData.responses?.summary) {
      specialNote = formData.responses.summary;
    }

    const submitData = {
      beneficiaryId: parseInt(formData.beneficiaryId, 10),
      templateId: apiConfig.templateId,
      evalDate: formData.assessmentDate,
      evalData: evalData,
      specialNote: specialNote
    };

    await apiConfig.fn(editItem.value.id, submitData);

    alert('평가가 성공적으로 수정되었습니다.');
    closeEditModal();
    await loadEvaluationHistory();
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || '평가 수정에 실패했습니다.';
    alert(errorMessage);
  }
};

// 삭제
const handleDelete = async (item) => {
  if (!confirm(`${item.beneficiaryName}님의 평가를 삭제하시겠습니까?`)) {
    return;
  }

  try {

    const deleteApis = {
      fallRisk: deleteFallEvaluation,
      bedsore: deleteBedsoreEvaluation,
      cognitive: deleteCognitiveEvaluation,
      needs: deleteNeedsEvaluation
    };

    const deleteApi = deleteApis[activeTab.value];
    if (!deleteApi) {
      alert('삭제 API를 찾을 수 없습니다.');
      return;
    }

    await deleteApi(item.id);

    alert('평가가 삭제되었습니다.');
    await loadEvaluationHistory();
  } catch (error) {
    alert('평가 삭제에 실패했습니다.');
  }
};

watch([activeTab, mainTab], ([, newMain]) => {
  if (newMain === 'history') loadEvaluationHistory();
});

onMounted(() => {
  if (mainTab.value === 'history') loadEvaluationHistory();
});
</script>

<template>
  <div class="basic-eval-page">
    <div class="main-tabs">
      <button :class="{ active: mainTab === 'write' }" @click="mainTab = 'write'">📝 작성하기</button>
      <button :class="{ active: mainTab === 'history' }" @click="mainTab = 'history'">🗂️ 작성 내역</button>
    </div>

    <div class="sub-tabs">
      <button
        v-for="tab in subTabs"
        :key="tab.key"
        class="sub-tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="content-area">
      <div v-if="mainTab === 'write'" class="write-mode">
        <component 
          v-if="currentTabComponent"
          :is="currentTabComponent"
          :key="activeTab"
          @submit="handleSubmit"
          @save-draft="handleSaveDraft"
        />
        <div v-else class="empty-state">준비 중입니다.</div>
      </div>

      <div v-else class="history-mode">
        <!-- 헤더 -->
        <div class="history-header">
          <h2>{{ subTabs.find(t => t.key === activeTab)?.label }} 평가 작성내역</h2>
          <p class="total-count">총 {{ evalHistory.length }}건의 평가가 등록되어 있습니다</p>
        </div>

        <div v-if="loading" class="loading">로딩중...</div>

        <div v-else-if="evalHistory.length > 0" class="history-content">
          <!-- 연도별 통계 요약 -->
          <div class="year-stats-summary">
            <div
              v-for="year in availableYears"
              :key="year"
              class="year-stat-card"
              @click="selectedYear = parseInt(year)"
              :class="{ active: selectedYear === parseInt(year) }"
            >
              <h3 class="year-title">{{ year }}년</h3>
              <div class="stat-info">
                <div class="stat-row">
                  <span class="stat-count">{{ yearStats[year].count }}건</span>
                  <span class="stat-avg" v-if="activeTab !== 'needs'">평균 점수: {{ yearStats[year].avgScore }}점</span>
                </div>
                <div class="grade-distribution">
                  <span class="grade-item">낮음 {{ yearStats[year].grades['낮음'] }}건</span>
                  <span class="grade-item">중간 {{ yearStats[year].grades['중간'] }}건</span>
                  <span class="grade-item">높음 {{ yearStats[year].grades['높음'] }}건</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 선택된 연도의 상세 목록 -->
          <div v-if="selectedYear && yearStats[selectedYear]" class="year-detail-section">
            <h3 class="year-detail-title">{{ selectedYear }}년 ({{ yearStats[selectedYear].count }}건)</h3>

            <div class="eval-list">
              <div
                v-for="item in filteredByYear"
                :key="item.id"
                class="eval-card"
              >
                <!-- 카드 헤더 -->
                <div class="eval-card-header">
                  <div class="eval-basic-info">
                    <h4 class="beneficiary-name">{{ item.beneficiaryName }}</h4>
                    <span class="eval-date">{{ item.evalDate?.split('T')[0] }}</span>
                  </div>
                  <div class="eval-status-badges">
                    <span class="grade-badge" :class="`grade-${getGradeLabel(item.resultGrade)}`">
                      {{ item.resultGrade }}
                    </span>
                    <span class="status-badge">{{ item.status }}</span>
                  </div>
                </div>

                <!-- 카드 본문 -->
                <div class="eval-card-body">
                  <div class="eval-info-row">
                    <div class="info-label">등급</div>
                    <div class="info-value">{{ item.careLevel }}</div>
                  </div>
                  <div class="eval-info-row" v-if="activeTab !== 'needs'">
                    <div class="info-label">평가 점수</div>
                    <div class="info-value score-value">{{ item.totalScore }}점</div>
                  </div>
                  <div class="eval-info-row">
                    <div class="info-label">평가자</div>
                    <div class="info-value">{{ item.evaluatorName }}</div>
                  </div>
                  <div class="eval-info-row" v-if="item.scoreDetails">
                    <div class="info-label">평가 상세</div>
                    <div class="info-value score-details">{{ item.scoreDetails }}</div>
                  </div>
                  <div class="eval-info-row" v-if="item.comment">
                    <div class="info-label">특이사항 및 제안</div>
                    <div class="info-value comment">{{ item.comment }}</div>
                  </div>
                </div>

                <!-- 카드 푸터 (액션 버튼) -->
                <div class="eval-card-footer">
                  <button class="btn-detail" @click="openDetailModal(item)">상세보기</button>
                  <button class="btn-edit" @click="openEditModal(item)">수정</button>
                  <button class="btn-delete" @click="handleDelete(item)">삭제</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>등록된 평가 내역이 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 상세보기 모달 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ subTabs.find(t => t.key === activeTab)?.label }} 평가 상세</h3>
          <button class="modal-close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="detailItem" class="detail-content">
            <!-- 평가지 컴포넌트 (읽기 전용) -->
            <div class="detail-section form-section">
              <component
                v-if="currentTabComponent"
                :is="currentTabComponent"
                :initialData="detailItem"
                :readOnly="true"
                :key="`detail-${detailItem.id}`"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-modal-close" @click="closeDetailModal">닫기</button>
        </div>
      </div>
    </div>

    <!-- 수정 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content edit-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ subTabs.find(t => t.key === activeTab)?.label }} 평가 수정</h3>
          <button class="modal-close-btn" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <component
            v-if="currentTabComponent && editItem"
            :is="currentTabComponent"
            :initialData="editItem"
            :key="`edit-${editItem.id}`"
            @submit="handleEditSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-eval-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Noto Sans KR', sans-serif;
}

.main-tabs {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #eee;
  margin-bottom: 20px;
}

.main-tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 3px solid transparent;
}

.main-tabs button.active {
  border-bottom-color: #4caf50;
  color: #2e7d32;
}

.sub-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.sub-tab-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
}

.sub-tab-btn.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

/* 작성 내역 */
.history-mode {
  padding: 20px;
}

.history-header {
  margin-bottom: 30px;
}

.history-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.total-count {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

/* 연도별 통계 카드 */
.year-stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.year-stat-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.year-stat-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  transform: translateY(-2px);
}

.year-stat-card.active {
  border-color: #8b5cf6;
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
}

.year-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-count {
  font-size: 1.125rem;
  font-weight: 600;
  color: #8b5cf6;
}

.stat-avg {
  font-size: 0.875rem;
  color: #6b7280;
}

.grade-distribution {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.grade-item {
  font-size: 0.8125rem;
  color: #4b5563;
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
}

/* 연도별 상세 섹션 */
.year-detail-section {
  margin-top: 40px;
}

.year-detail-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

/* 평가 목록 */
.eval-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eval-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.eval-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* 카드 헤더 */
.eval-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
}

.eval-basic-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.beneficiary-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.eval-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.eval-status-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.grade-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.grade-badge.grade-낮음 {
  background: #dcfce7;
  color: #16a34a;
}

.grade-badge.grade-중간 {
  background: #fef3c7;
  color: #d97706;
}

.grade-badge.grade-높음 {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge {
  padding: 4px 10px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* 카드 본문 */
.eval-card-body {
  padding: 10px 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 12px;
}

.eval-info-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.7rem;
}

.info-value {
  color: #1f2937;
  font-size: 0.8125rem;
  line-height: 1.3;
}

.score-value {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #8b5cf6;
}

.score-details {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.3;
  grid-column: span 2;
}

.comment {
  background: #fef3c7;
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 3px solid #f59e0b;
  color: #92400e;
  font-size: 0.75rem;
  line-height: 1.3;
  grid-column: span 4;
}

/* 카드 푸터 */
.eval-card-footer {
  display: flex;
  gap: 6px;
  padding: 8px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.eval-card-footer button {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-detail {
  background: #8b5cf6;
  color: white;
  flex: 1;
}

.btn-detail:hover {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

.btn-edit {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-edit:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.empty-state {
  padding: 80px 20px;
  text-align: center;
  color: #9ca3af;
}

.empty-state p {
  font-size: 1.125rem;
  margin: 0;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 1200px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: white;
}

/* 상세 내용 스타일 */
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.detail-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.detail-value {
  font-size: 1rem;
  color: #1f2937;
  font-weight: 500;
}

.detail-result {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.result-badge {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
}

.result-badge.grade-낮음 {
  background: #dcfce7;
  color: #16a34a;
}

.result-badge.grade-중간 {
  background: #fef3c7;
  color: #d97706;
}

.result-badge.grade-높음 {
  background: #fee2e2;
  color: #dc2626;
}

.result-score {
  font-size: 1.125rem;
  color: #1f2937;
}

.result-score strong {
  font-size: 1.5rem;
  color: #8b5cf6;
  font-weight: 700;
}

.detail-text {
  padding: 16px;
  background: white;
  border-radius: 8px;
  color: #1f2937;
  line-height: 1.6;
  white-space: pre-wrap;
}

.detail-text.highlight {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.btn-modal-close {
  padding: 10px 24px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-close:hover {
  background: #4b5563;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 수정 모달 스타일 */
.modal-content.edit-modal {
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-section {
  background: white;
  border: none;
  padding: 0;
}
</style>