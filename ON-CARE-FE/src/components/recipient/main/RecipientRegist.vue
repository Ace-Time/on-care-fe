<template>
  <Teleport to="body">
    <div v-if="visible" class="overlay">
      <div class="modal">
        <header class="modal-header">
          <h3>수급자 정보 수정</h3>
          <button type="button" class="close-btn" @click="$emit('close')">
            ✕
          </button>
        </header>

        <form class="modal-body" @submit.prevent="submit">
          <!-- 1줄 : 이름 / 생년월일 -->
          <div class="grid-2">
            <label class="form-field">
              <span class="form-label">이름</span>
              <input v-model="form.name" class="form-input" type="text" />
            </label>

            <label class="form-field">
              <span class="form-label">생년월일</span>
              <input
                v-model="form.birthdate"
                class="form-input date-input"
                type="date"
              />
            </label>
          </div>

          <!-- 2줄 : 연락처 / 성별 -->
          <div class="grid-2">
            <label class="form-field">
              <span class="form-label">연락처</span>
              <input
                v-model="form.phone"
                class="form-input"
                type="text"
                placeholder="010-0000-0000"
              />
            </label>

            <label class="form-field">
              <span class="form-label">성별</span>
              <select v-model="form.gender" class="form-input">
                <option value="">선택</option>
                <option value="M">남자</option>
                <option value="F">여자</option>
              </select>
            </label>
          </div>

          <!-- 주소 -->
          <label class="form-field">
            <span class="form-label">주소</span>
            <input v-model="form.address" class="form-input" type="text" />
          </label>

          <!-- 보호자명 / 보호자관계 / 보호자 연락처 -->
          <div class="grid-3">
            <div class="grid-3-left">
              <label class="form-field">
                <span class="form-label">보호자명</span>
                <input
                  v-model="form.guardianName"
                  class="form-input"
                  type="text"
                  placeholder="예: 김민준"
                />
              </label>

              <label class="form-field">
                <span class="form-label">관계</span>
                <select v-model="form.guardianRelation" class="form-input">
                  <option value="">선택</option>
                  <option
                    v-for="rel in relationOptions"
                    :key="rel"
                    :value="rel"
                  >
                    {{ rel }}
                  </option>
                </select>
              </label>
            </div>

            <label class="form-field">
              <span class="form-label">보호자 연락처</span>
              <input
                v-model="form.guardianPhone"
                class="form-input"
                type="text"
                placeholder="010-0000-0000"
              />
            </label>
          </div>

          <!-- 장기요양등급 / 만료일 -->
          <div class="grid-2">
            <label class="form-field">
              <span class="form-label">장기요양등급</span>
              <select v-model="form.careLevelId" class="form-input">
                <option :value="null">선택</option>
                <option
                  v-for="lvl in careLevelOptions"
                  :key="lvl.id"
                  :value="lvl.id"
                >
                  {{ lvl.label }}
                </option>
              </select>
            </label>

            <label class="form-field">
              <span class="form-label">장기요양등급 만료일</span>
              <input
                v-model="form.careLevelEndDate"
                class="form-input date-input"
                type="date"
              />
            </label>
          </div>

          <!-- 인정번호 -->
          <label class="form-field">
            <span class="form-label">장기요양등급 인정번호</span>
            <input
              v-model="form.careLevelNumber"
              class="form-input"
              type="text"
            />
          </label>

          <!-- 태그 (다중 선택) -->
          <div class="form-field">
            <span class="form-label">태그</span>
            <div class="chip-group">
              <button
                v-for="tag in tagOptions"
                :key="tag.id"
                type="button"
                class="chip-btn"
                :class="{ active: form.tagIds.includes(tag.id) }"
                @click="toggleTag(tag.id)"
              >
                {{ tag.label }}
              </button>
            </div>
          </div>

          <!-- 위험 요소 (다중 선택) -->
          <div class="form-field">
            <span class="form-label">위험 요소</span>
            <div class="chip-group">
              <button
                v-for="risk in riskOptions"
                :key="risk.id"
                type="button"
                class="chip-btn"
                :class="{ active: form.riskFactorIds.includes(risk.id) }"
                @click="toggleRisk(risk.id)"
              >
                {{ risk.label }}
              </button>
            </div>
          </div>

          <!-- 버튼 -->
          <footer class="modal-footer">
            <button type="submit" class="btn-submit" :disabled="saving">
              {{ saving ? '저장 중...' : '수정' }}
            </button>
            <button type="button" class="btn-cancel" @click="$emit('close')">
              취소
            </button>
          </footer>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import api from '@/lib/api'

const props = defineProps({
  visible: { type: Boolean, default: false },
  // ✅ 어떤 수급자를 수정할지 반드시 필요
  beneficiaryId: { type: Number, default: null }
})

const emit = defineEmits(['close', 'updated'])

const saving = ref(false)

/** 카테고리 옵션들(디자인 유지용) */
const relationOptions = ['아들', '딸', '손자', '손녀', '친구', '기타']

/**
 * ✅ 여기 옵션은 "id 기반"으로 바꿨음 (백엔드가 tagIds / riskFactorIds 받으니까)
 * - 현재 프론트에 별도 조회 API가 없어서, 기존 배열 순서를 id로 가정(index+1)
 * - 너희 DB id가 다르면 여기 id만 맞춰주면 됨
 */
const tagOptions = [
  { id: 1, label: '말벗' },
  { id: 2, label: '산책' },
  { id: 3, label: '음악' },
  { id: 4, label: '종교' },
  { id: 5, label: '운동' },
  { id: 6, label: '영화' },
  { id: 7, label: '게임' },
  { id: 8, label: '서예' },
  { id: 9, label: '요리' }
]

const riskOptions = [
  { id: 1, label: '낙상' },
  { id: 2, label: '욕창' },
  { id: 3, label: '치매' },
  { id: 4, label: '고혈압' },
  { id: 5, label: '당뇨' },
  { id: 6, label: '뇌졸증' },
  { id: 7, label: '거동불편' },
  { id: 8, label: '공격성' },
  { id: 9, label: '몽유병' }
]

const careLevelOptions = [
  { id: 1, label: '1등급' },
  { id: 2, label: '2등급' },
  { id: 3, label: '3등급' },
  { id: 4, label: '4등급' },
  { id: 5, label: '5등급' },
  { id: 6, label: '인지지원등급' }
]

const form = reactive({
  // beneficiary
  name: '',
  birthdate: '',
  phone: '',
  gender: '',
  address: '',
  // status는 화면엔 없지만 PUT에 필요해서 내부 보관
  status: 1,

  // guardian
  guardianName: '',
  guardianRelation: '',
  guardianPhone: '',

  // care level
  careLevelId: null,
  careLevelEndDate: '',
  careLevelNumber: '',

  // multi
  tagIds: [],
  riskFactorIds: []
})

const resetForm = () => {
  form.name = ''
  form.birthdate = ''
  form.phone = ''
  form.gender = ''
  form.address = ''
  form.status = 1

  form.guardianName = ''
  form.guardianRelation = ''
  form.guardianPhone = ''

  form.careLevelId = null
  form.careLevelEndDate = ''
  form.careLevelNumber = ''

  form.tagIds = []
  form.riskFactorIds = []
}

/**
 * ✅ 모달 열릴 때 상세조회해서 기존 값 프리필
 * GET /api/beneficiaries/{id} 응답을 기준으로 채움
 */
const hydrateFromDetail = (d) => {
  // 기본
  form.name = d?.name ?? ''
  form.phone = d?.phone ?? ''
  form.address = d?.address ?? ''
  form.birthdate = d?.birthdate ?? ''
  form.gender = d?.gender ?? ''

  // status: 상세조회는 '서비스 중'/'서비스 해지' 문자열이므로 숫자로 변환
  form.status = d?.status === '서비스 해지' ? 0 : 1

  // 보호자
  form.guardianName = d?.guardianName ?? ''
  form.guardianRelation = d?.guardianRelation ?? ''
  form.guardianPhone = d?.guardianPhone ?? ''

  // 등급 만료일
  form.careLevelEndDate = d?.careLevelEndDate ?? ''

  // ✅ 등급 id는 GET에서 문자열 careLevel만 내려오니까 라벨->id 매핑
  const care = d?.careLevel
  form.careLevelId = careLevelOptions.find((x) => x.label === care)?.id ?? null

  // ⚠️ 현재 네 상세조회 XML에는 인정번호(number)가 SELECT에 없음
  // 혹시 백엔드가 추가해서 내려주면 그때 자동으로 채워짐
  form.careLevelNumber = d?.careLevelNumber ?? ''

  // ✅ 태그: GET은 tags: ["말벗","산책"] 형태라서 label->id로 매핑
  const tags = Array.isArray(d?.tags) ? d.tags : []
  form.tagIds = tags
    .map((t) => tagOptions.find((x) => x.label === t)?.id)
    .filter((id) => typeof id === 'number')

  // ✅ 위험요소: GET은 riskFactors: [{id,name,score}]라서 id로 바로 세팅
  const risks = Array.isArray(d?.riskFactors) ? d.riskFactors : []
  form.riskFactorIds = risks
    .map((r) => r?.id)
    .filter((id) => typeof id === 'number')
}

const fetchDetail = async () => {
  if (!props.beneficiaryId) return
  const { data } = await api.get(`/api/beneficiaries/${props.beneficiaryId}`)
  hydrateFromDetail(data)
}

watch(
  () => props.visible,
  async (v) => {
    if (!v) return
    resetForm()
    if (props.beneficiaryId) {
      try {
        await fetchDetail()
      } catch (e) {
        console.error(e)
        // 프리필 실패해도 모달은 열리게 유지
      }
    }
  }
)

const toggleTag = (tagId) => {
  const idx = form.tagIds.indexOf(tagId)
  if (idx === -1) form.tagIds.push(tagId)
  else form.tagIds.splice(idx, 1)
}

const toggleRisk = (riskId) => {
  const idx = form.riskFactorIds.indexOf(riskId)
  if (idx === -1) form.riskFactorIds.push(riskId)
  else form.riskFactorIds.splice(idx, 1)
}

const submit = async () => {
  if (!props.beneficiaryId) return

  saving.value = true
  try {
    // ✅ 백엔드 컬럼명에 맞춘 payload
    const payload = {
      name: form.name,
      phone: form.phone,
      address: form.address,
      birthdate: form.birthdate,
      gender: form.gender,
      status: form.status,

      guardianName: form.guardianName,
      guardianPhone: form.guardianPhone,
      guardianRelation: form.guardianRelation,

      careLevelId: form.careLevelId,
      careLevelEndDate: form.careLevelEndDate,
      // number는 Long이라 숫자로 보내는 게 안전 (빈값이면 null)
      careLevelNumber:
        form.careLevelNumber === '' || form.careLevelNumber == null
          ? null
          : Number(form.careLevelNumber),

      tagIds: form.tagIds,
      riskFactorIds: form.riskFactorIds
    }

    const { data } = await api.put(
      `/api/beneficiaries/${props.beneficiaryId}`,
      payload
    )

    emit('updated', data)
    emit('close')
  } catch (e) {
    console.error(e)
    // 필요하면 여기서 toast 처리 가능
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  backdrop-filter: blur(3px);
}
.modal {
  width: 760px;
  max-width: calc(100% - 40px);
  background-color: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.3);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #e5e7eb;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
}
.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}

.modal-body {
  padding: 16px 18px 14px;
  font-size: 13px;
}
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
  margin-bottom: 10px;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
  margin-bottom: 10px;
}

.grid-3-left {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 10px 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}
.form-label {
  font-size: 12px;
  color: #6b7280;
}
.form-input {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  font-size: 13px;
}

.date-input {
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip-btn {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 4px 10px;
  font-size: 12px;
  background-color: #f9fafb;
  cursor: pointer;
}
.chip-btn.active {
  background-color: #22c55e;
  border-color: #16a34a;
  color: #fff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.btn-submit,
.btn-cancel {
  min-width: 90px;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}
.btn-submit {
  background-color: #22c55e;
  color: #fff;
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-cancel {
  background-color: #f3f4f6;
  color: #4b5563;
}

@media (max-width: 720px) {
  .grid-2,
  .grid-3,
  .grid-3-left {
    grid-template-columns: 1fr;
  }
}
</style>
