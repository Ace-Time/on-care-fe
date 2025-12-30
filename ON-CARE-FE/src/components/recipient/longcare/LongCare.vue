<template>
  <div class="card longcare-wrap">
    <header class="longcare-header">
      <h3>⚠ 장기요양등급 만료 예정</h3>

      <div class="filters">
        <button
          v-for="btn in rangeButtons"
          :key="btn.key"
          type="button"
          class="range-btn"
          :class="{ active: activeRange === btn.key }"
          @click="activeRange = btn.key"
        >
          {{ btn.label }}
        </button>
      </div>
    </header>

    <!-- 상태 -->
    <div v-if="loading" class="state">불러오는 중...</div>
    <div v-else-if="errorMsg" class="state error">{{ errorMsg }}</div>

    <!-- ✅ 스크롤바: wrapper에 max-height + overflow-y -->
    <div v-else class="table-wrap scroll-wrapper">
      <table>
        <thead>
          <tr>
            <th>수급자명</th>
            <th>만료일</th>
            <th>담당요양사</th>
            <th>D-Day</th>
            <th>안내여부</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in filteredItems"
            :key="row.expirationId"
            :class="[
              'clickable-row',
              ddayClass(row.ddayNum),
              row.expirationId === selectedId ? 'is-active' : ''
            ]"
            @click="selectRow(row)"
          >
            <td>{{ row.beneficiaryName }}</td>
            <td>{{ row.endDate }}</td>
            <td>{{ row.careWorkerName || '-' }}</td>
            <td>
              <span class="dday-pill">{{ row.ddayLabel || '-' }}</span>
            </td>
            <td>
              <span
                v-if="String(row.noticeLabel || '').startsWith('완료')"
                class="status-pill complete"
              >
                {{ row.noticeLabel }}
              </span>
              <span v-else class="status-pill pending">
                {{ row.noticeLabel || '미완료' }}
              </span>
            </td>
          </tr>

          <tr v-if="filteredItems.length === 0">
            <td colspan="5" class="empty-row">표시할 항목이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import api from '@/lib/api'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: [Number, String, null],
    default: null
  }
})
const emit = defineEmits(['update:selectedId', 'select', 'loaded'])

const rangeButtons = [
  { key: 'all', label: '전체' },
  { key: '45', label: '45일 이내' },
  { key: '60', label: '60일 이내' },
  { key: '90', label: '90일 이내' }
]
const activeRange = ref('all')

const loading = ref(false)
const errorMsg = ref('')
const serverItems = ref([])

const parseDday = (ddayLabel) => {
  const s = String(ddayLabel || '').trim()
  const m = s.match(/D-\s*(\d+)/i)
  return m ? Number(m[1]) : 999999
}

const normalized = computed(() => {
  const list = (props.items && props.items.length) ? props.items : serverItems.value
  return (list || []).map((it) => ({
    expirationId: it.expirationId,
    beneficiaryName: it.beneficiaryName,
    endDate: it.endDate,
    careWorkerName: it.careWorkerName,
    ddayLabel: it.ddayLabel,
    ddayNum: parseDday(it.ddayLabel),
    noticeLabel: it.noticeLabel,
    extendsStatus: it.extendsStatus,
    outboundStatus: it.outboundStatus,
    noticeCount: it.noticeCount,
    lastNoticeDate: it.lastNoticeDate
  }))
})

const filteredItems = computed(() => {
  let list = normalized.value.filter((i) => i.extendsStatus !== 'N')
  if (activeRange.value === 'all') return list
  const limit = Number(activeRange.value)
  return list.filter((i) => i.ddayNum <= limit)
})

const ddayClass = (ddayNum) => {
  if (ddayNum <= 45) return 'row-red'
  if (ddayNum <= 60) return 'row-yellow'
  if (ddayNum <= 90) return 'row-normal'
  return ''
}

const selectRow = (row) => {
  emit('update:selectedId', row.expirationId)
  emit('select', row)
}

const fetchList = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await api.get('/api/care-level/expirations')
    serverItems.value = data?.items ?? []
    emit('loaded', serverItems.value)
  } catch (e) {
    console.error(e)
    errorMsg.value = '목록을 불러오지 못했습니다.'
    serverItems.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!props.items || props.items.length === 0) fetchList()
})

watch(
  () => props.items,
  () => {}
)
</script>

<style scoped>
/* ✅ 핵심: 부모 레이아웃에서 폭 계산 깨지는 것 방지 */
.longcare-wrap {
  box-sizing: border-box;
  min-width: 0;

  background-color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.04);
}

.longcare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.longcare-header h3 {
  margin: 0;
  font-size: 15px;
}

.filters {
  display: flex;
  gap: 4px;
}
.range-btn {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}
.range-btn.active {
  background-color: #111827;
  color: #fff;
}

.state {
  padding: 10px 0;
  font-size: 12px;
  color: #6b7280;
}
.state.error {
  color: #b91c1c;
}

/* ✅ 스크롤 wrapper */
.scroll-wrapper {
  max-height: 360px;
  overflow-y: auto;
  overflow-x: auto;
  padding-right: 4px;
}

/* 스크롤바 (선택) */
.scroll-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.scroll-wrapper::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 4px;
}
.scroll-wrapper::-webkit-scrollbar-track {
  background-color: transparent;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

thead th {
  text-align: left;
  padding: 8px 10px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
tbody td {
  padding: 8px 10px;
  border-bottom: 1px solid #f3f4f6;
}
.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 16px 10px;
}

.row-red { background-color: #fef2f2; }
.row-yellow { background-color: #fff7ed; }
.row-normal { background-color: #fefce8; }

.clickable-row { cursor: pointer; }
.clickable-row.is-active {
  outline: 2px solid rgba(34, 197, 94, 0.6);
  outline-offset: -2px;
}

.dday-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: #fee2e2;
  color: #b91c1c;
  font-size: 10px;
}
.status-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
}
.status-pill.complete {
  background-color: #dcfce7;
  color: #15803d;
}
.status-pill.pending {
  background-color: #f3f4f6;
  color: #6b7280;
}
</style>
