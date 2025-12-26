<template>
  <section class="matching-panel">
    <header class="panel-header">
      <h2 class="panel-title">요양보호사</h2>
      <span class="count-badge">{{ caregivers.length }}명</span>
    </header>

    <div class="search-bar">
      <img :src="searchIcon" class="search-icon" />
      <input v-model="search" type="text" placeholder="요양보호사 검색..." />
    </div>

    <div v-if="loading" class="loading">불러오는 중...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="table-scroll">
      <table class="list-table">
        <tbody>
          <tr
            v-for="item in pagedList"
            :key="item.careWorkerId ?? item.id"
            class="list-row"
            @click="handleSelect(item)"
          >
            <td class="name">{{ item.name }}</td>
            <td>
              <span :class="badgeClass(item.gender)">
                {{ item.gender }}
              </span>
            </td>
            <td>
              <div class="tags">
                <span v-for="tag in item.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </td>
          </tr>

          <tr v-if="!pagedList.length">
            <td colspan="3" class="dash">표시할 요양보호사가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">〈</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page === totalPages">〉</button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import searchIcon from '@/assets/img/common/search.png'
import { getCandidateCareWorkerCards } from '@/api/schedule/matching.js'

const props = defineProps({
  recipient: { type: Object, default: null },
})

const emit = defineEmits(['select-caregiver'])

const search = ref('')
const page = ref(1)
const pageSize = 10

const loading = ref(false)
const error = ref('')
const caregiversRaw = ref([])

const getBeneficiaryId = (obj) => obj?.beneficiaryId ?? obj?.id ?? null

const loadCareWorkers = async () => {
  const beneficiaryId = getBeneficiaryId(props.recipient)

  if (!beneficiaryId) {
    caregiversRaw.value = []
    error.value = ''
    return
  }

  try {
    loading.value = true
    error.value = ''

    const res = await getCandidateCareWorkerCards(beneficiaryId)
    const list = Array.isArray(res?.data) ? res.data : []

    caregiversRaw.value = list.map((c) => {
      const careWorkerId = c?.careWorkerId ?? c?.id ?? null
      return {
        careWorkerId,
        name: c?.name ?? '-',
        gender: c?.gender ?? '-',
        tags: Array.isArray(c?.tags) ? c.tags : [],
      }
    })
  } catch (e) {
    error.value = e?.response?.data?.message || '요양보호사 목록을 불러오지 못했습니다.'
    caregiversRaw.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => getBeneficiaryId(props.recipient),
  () => {
    page.value = 1
    search.value = ''
    loadCareWorkers()
  },
  { immediate: true }
)

watch(search, () => {
  page.value = 1
})

const caregivers = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return caregiversRaw.value

  return caregiversRaw.value.filter((c) =>
    [c.name, c.gender, ...(c.tags || [])].some((f) =>
      String(f ?? '').toLowerCase().includes(q)
    )
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(caregivers.value.length / pageSize))
)

const pagedList = computed(() =>
  caregivers.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

const prevPage = () => {
  if (page.value > 1) page.value--
}
const nextPage = () => {
  if (page.value < totalPages.value) page.value++
}

const handleSelect = (item) => {
  const careWorkerId = item?.careWorkerId ?? item?.id ?? null
  emit('select-caregiver', { ...item, careWorkerId })
}

const badgeClass = (gender) => ({
  badge: true,
  male: gender === '남자',
  female: gender === '여자',
})
</script>

<style scoped>
.matching-panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  height: 480px;
}

/* 제목 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a5928;
}

.count-badge {
  padding: 4px 10px;
  background: #f3e8ff;
  border-radius: 999px;
  font-size: 13px;
  color: #9333ea;
}

/* 검색바 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  margin-bottom: 10px;
}

.search-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

/* 리스트 스크롤 영역 */
.table-scroll {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  max-height: 320px;
}

.table-scroll::-webkit-scrollbar {
  width: 6px;
}
.table-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 8px;
}

/* 테이블 */
.list-table {
  width: 100%;
  border-collapse: collapse;
}

/* 행 */
.list-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.list-row:hover {
  background: #f9fafb;
}

.list-table td {
  padding: 10px 6px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 15px;
}

.name {
  font-weight: 500;
}

.dash {
  color: #9ca3af;
}

/* 성별 뱃지 */
.badge {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.male {
  background: #e0f2fe;
  color: #0284c7;
}

.female {
  background: #fde2e8;
  color: #ec4899;
}

/* 태그 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  background: #dcfce7;
  color: #15803d;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  padding-top: 8px;
}

.pagination button {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
}
</style>