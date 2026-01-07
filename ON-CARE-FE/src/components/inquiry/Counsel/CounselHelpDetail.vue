<template>
    <div class="card detail-section">
    <div class="card-header simple">
      <div class="header-title">상세 페이지</div>
    </div>
    
    <div class="detail-body">
      <div v-if="customer?.customerType === 'potential'">
        <SubscriptProcess 
        :customer="customer" />
      </div>
      <div v-if="counselDetail" class="selected-detail">
        <CounselDetailCard v-bind="counselDetail" />
      </div>
      
      <div v-if="category === '렌탈상담'" class="rental-product-area">
        <ProductSearchBar
          v-model:searchText="searchText"
          v-model:selectedStatus="selectedCategoryCode"
          :statusList="categoryOptions"
          placeholder="용품명 또는 코드로 검색..."
          :showInput="true"
          @search="onSearch"
        />

        <ProductManageTable
          :products="masterRows"
          :is-last-batch="masterIsLast"
          :categories="rawCategories"
          :selected-id="selectedId"
          @needMoreData="fetchMoreMaster"
          @row-click="onRowClick"
          @open-rental="openRental"
        />
      </div>
      
      <div v-else class="empty-guide">
        고객의 이전 상담 이력을 확인해보세요
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getMasterDetail, getMasterCategoryCode, getProducts } from '@/api/product/productAPI.js';
import CounselDetailCard from '@/components/inquiry/Counsel/CounselDetailCard.vue';
import SubscriptProcess from '@/components/inquiry/Counsel/Process/SubscriptProcess.vue';
// Product 관련 컴포넌트
import ProductSearchBar from '@/components/product/ProductSearchBar.vue';
import ProductManageTable from '@/components/product/ProductManageTable.vue';

// import BeneficiarySignificantHelp from '@/components/inquiry/Counsel/HelpDetail/BeneficiarySignificantHelper.vue';

const props = defineProps({
  category: { type: String, default: '' },
  counselDetail: { type: Object, default: null },
  customer: { type: Object, default: null },
})

/** -----------------------------
 *  검색/필터 상태
 * ------------------------------*/
const searchText = ref('')
const selectedCategoryCode = ref('C000') // '전체' 의미로 사용

// raw categories(원본) / searchbar용 options(가공)
const rawCategories = ref([])
const categoryOptions = ref([{ id: 'C000', name: '전체' }])

/** -----------------------------
 *  테이블 데이터 (master-detail)
 * ------------------------------*/
const masterRows = ref([])
const masterPage = ref(0)
const masterIsLast = ref(false)
const pageSize = 10

const selectedId = ref(null)

// category 목록 로딩 + searchbar options 세팅
async function loadCategories() {
  const list = await getMasterCategoryCode()
  rawCategories.value = Array.isArray(list) ? list : []

  // SearchBar는 {id, name}을 기대하므로 안전하게 매핑
  categoryOptions.value = [
    { id: 'C000', name: '전체' },
    ...rawCategories.value.map((c) => ({
      id: c.id ?? c.categoryCode ?? c.code ?? c.category_code,
      name: c.name ?? c.categoryName ?? c.category_name,
    })),
  ].filter((x) => x.id != null)
}

async function fetchMaster(reset = false) {
  if (reset) {
    masterRows.value = []
    masterIsLast.value = false
    masterPage.value = 0
  }

  const codeOrName = searchText.value?.trim()
  const categoryCode =
    selectedCategoryCode.value && selectedCategoryCode.value !== 'C000'
      ? selectedCategoryCode.value
      : null

  const data = await getMasterDetail({
    page: masterPage.value,
    size: pageSize,
    codeOrName: codeOrName ? codeOrName : null,
    categoryCode,
  })

  const content = data?.content ?? []
  masterRows.value.push(...content)

  masterIsLast.value = Boolean(data?.last)
  masterPage.value = typeof data?.number === 'number' ? data.number : masterPage.value
}

async function fetchMoreMaster() {
  if (masterIsLast.value) return
  masterPage.value += 1
  await fetchMaster(false)
}

// ✅ 엔터(검색) 시: reset 후 1페이지부터
async function onSearch() {
  await fetchMaster(true)
}

// ✅ 카테고리 변경 시도: 즉시 다시 조회(원하면 엔터로만 하게 바꿀 수도 있음)
watch(selectedCategoryCode, async () => {
  if (props.category === '렌탈상담') {
    await fetchMaster(true)
  }
})

function onRowClick(item) {
  selectedId.value = item?.id ?? null
}

function openRental(item) {
  // 여기서 계약 모달(예: RentalRegisterModal) 열면 됨
  // emit('open-rental', item) 같은 식으로 상위로 올리거나,
  // CounselHelpDetail 내부에서 modal state로 처리
}

/** -----------------------------
 *  렌탈상담 진입 시 초기 로드
 * ------------------------------*/
watch(
  () => props.category,
  async (v) => {
    if (v === '렌탈상담') {
      // 초기 상태
      searchText.value = ''
      selectedCategoryCode.value = 'C000'
      selectedId.value = null

      await loadCategories()
      await fetchMaster(true)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.card { background: white; border-radius: 10px; border: 1px solid #E5E7EB; display: flex; flex-direction: column; overflow: hidden; height: 100%; min-height: 340px; }
.card-header { padding: 16px; border-bottom: 1px solid #E5E7EB; }
.header-title { color: #388E3C; font-size: 20px; font-weight: 600; line-height: 28px; }

.detail-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }

.history-box { background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 14px; padding: 20px; flex-shrink: 0; }
.sub-title { color: #364153; font-size: 14px; margin-bottom: 8px; }
.history-content { display: flex; flex-direction: column; gap: 8px; }
.history-top { display: flex; justify-content: space-between; align-items: center; }
.history-badge { background: #DBEAFE; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #4A5565; }
.history-date { font-size: 12px; color: #4A5565; }
.history-manager { font-size: 12px; color: #6A7282; }
.history-desc { font-size: 14px; color: #4A5565; line-height: 1.5; margin: 0; }

.empty-guide { text-align: center; color: #999; padding: 40px 0; font-size: 14px; }
.selected-detail {
  border-radius: 10px;
  overflow: hidden;
}
</style>