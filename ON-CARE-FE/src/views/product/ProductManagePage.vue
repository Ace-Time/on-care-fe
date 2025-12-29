<template>
  <div class="manage-page">
    <!-- 왼쪽: 검색 + 테이블들 -->
    <div class="manage-main">
      
      <!-- 검색 바 -->
      <ProductSearchBar
        v-model:searchText="searchMasterValue"
        v-model:selectedCategory="selectedCategory"
        :categories="categoryOptions"
        @search="handleSearchForMaster"
      />

      <!-- 상단 관리 용품 리스트 -->
      <ProductManageTable
        :products="masterProducts"
        :is-last-batch="isLastMasterApiBatch"
        :selected-id="selectedProduct?.id ?? null"
        :categories="categories"
        @needMoreData="fetchNextMasterBatch"
        @row-click="handleRowClick"
      />

      <br>
      <!-- 검색 바 -->
      <ProductSearchBar
        v-model:searchText="searchMasterValue"
        v-model:selectedCategory="selectedStatus"
        :categories="productStatusOptions"
        @search="1"
      />

      <!-- 하단 상세 현황 -->
      <ProductManageDetailTable
        :products="ProductsDetail"
        :is-last-batch="isLastProductsApiBatch"
        :selected-detail-id="selectedDetailRow?.id ?? null"
        :selected-product-name="selectedMasterName"
        @row-click="handleDetailRowClick"
        @needMoreData="fetchNextProductBatch"
      />
    </div>

    <!-- 오른쪽 제품 히스토리 패널 (기본은 안 보이고, 클릭했을 때만 생성) -->
    <ProductHistoryPanel
      v-if="isHistoryOpen && selectedDetailRow"
      :product="selectedProduct"
      :detail-row="selectedDetailRow"
      :events="selectedHistoryEvents"
      @close="isHistoryOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed ,onMounted, watch} from 'vue'
import searchIcon from '@/assets/img/common/search.png'
import { getMasterDetail, getMasterCategoryCode, getProductStatus, getProducts, getProductHistory } from '@/api/product/productAPI.js'

import ProductSearchBar from '@/components/product/ProductSearchBar.vue'
import { productManageMock } from '@/mock/product/productManageMock.js'
import { productManageDetailMock } from '@/mock/product/productManageDetailMock.js'
import { productHistoryMock } from '@/mock/product/productHistoryMock.js'

import ProductManageTable from '@/components/product/ProductManageTable.vue'
import ProductManageDetailTable from '@/components/product/ProductManageDetailTable.vue'
import ProductHistoryPanel from '@/components/product/ProductHistoryPanel.vue'

const selectedMasterName = ref('');

// 검색어
const searchMasterValue = ref('')
const searchProductsValue = ref('')

// 선택된 카테고리(드롭다운)
const selectedCategory = ref('C000')
const selectedStatus = ref(0)
const productsApiPage = ref(0)          // 제품 정보 페이지 번호
const masterApiPage = ref(0)          // 마스터 정보 페이지 번호
let productMap = new Map(); // key: master, value: List<Product> 제품 정보
const masterProducts = ref([]) // 마스터 정보 리스트
const ProductsDetail = ref([]) // 마스터 정보 리스트
const categoryOptions = ref([]);
const productStatusOptions = ref([]);
const categories = ref([]); 
const productStatuses = ref([]);
const isLastMasterApiBatch = ref(false) // 마스터정보 마지막 페이지 상태
const isLastProductsApiBatch = ref(false) // 제품 정보 마지막 페이지 상태

const pageSIze = 5;

onMounted(async() => {
  const master_category = await getMasterCategoryCode();
  categories.value = {...master_category};

  categoryOptions.value = master_category;
  categoryOptions.value.unshift({id:'C000', name:'전체'})

  const product_statusData = await getProductStatus();
  productStatuses.value = {...product_statusData};

  productStatusOptions.value = product_statusData;
  productStatusOptions.value.unshift({id: 0 , name:'전체'})

  await handleSearchForMaster();
})


// 검색 
const fetchMasterApiBatch = async (pageIdx) => {
  const data = await getMasterDetail({
      page: pageIdx,
      size: pageSIze, // 50개씩 요청
      codeOrName: searchMasterValue.value,
      ...(selectedCategory.value === 'C000' ? {} : { categoryCode: selectedCategory.value })
    })

  if (data && data.content) {
      // 검색 할 때마다 데이터를 뒤에 이어 붙임
      masterProducts.value.push(...data.content)
      
      // 상태 업데이트
      isLastMasterApiBatch.value = data.last
      masterApiPage.value = data.number
  }
  console.log('masterProducts',masterProducts.value);
}

//  자식 컴포넌트에서 서버에 다음페이지 요청 시 
const fetchNextMasterBatch = async () => {
  if (!isLastMasterApiBatch.value) {
    await fetchMasterApiBatch(masterApiPage.value + 1)
  }
}

const searchTerm = ref('')
const stockFilter = ref('all')

// 전체 데이터
const allItems = ref(productManageMock)

// 상단 리스트 필터링
const filteredItems = computed(() => {
  let list = allItems.value

  // 재고 필터
  if (stockFilter.value === 'hasStock') {
    list = list.filter((i) => i.totalStock > 0)
  } else if (stockFilter.value === 'zero') {
    list = list.filter((i) => i.totalStock === 0)
  }

  // 검색
  if (searchTerm.value) {
    const keyword = searchTerm.value.toLowerCase()
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(keyword) ||
        i.code.toLowerCase().includes(keyword)
    )
  }

  return list
})

// 선택된 상단 용품
const selectedProduct = ref(null)

const handleRowClick = (item) => {
  selectedProduct.value = item
  // 상단 용품 바꾸면 상세 선택 및 히스토리도 초기화
  selectedDetailRow.value = null
  isHistoryOpen.value = false
  productsApiPage.value = 0

  selectedMasterName.value = selectedProduct.value.name;

  const productCode = selectedProduct.value.id
  
    if(!productMap.has(productCode)) 
      fetchProductApiBatch(productsApiPage);
    else {
      ProductsDetail.value = productMap.get(productCode);
    }
}

// 선택된 용품의 상세 데이터
const selectedDetailItems = computed(() => {
  if (!selectedProduct.value) return []

  if(!productMap.has(selectedProduct.value.id)) {
    
  }

  return productManageDetailMock.filter(
    (row) => row.productCode === selectedProduct.value.code
  )
})



//  자식 컴포넌트에서 서버에 다음페이지 요청 시 
const fetchNextProductBatch = async () => {
  if (!isLastMasterApiBatch.value) {
    await fetchProductApiBatch(masterApiPage.value + 1)
  }
}


// 검색 
const fetchProductApiBatch = async (pageIdx) => {
  
  const productCode = selectedProduct.value.id;

  const data = await getProducts({
      page: pageIdx,
      size: pageSIze, // 50개씩 요청
      productCode : productCode,
      productStatus: selectedStatus.value,
    })

  if (data && data.content) {
    const tempProduct = data.content;
    
    if(!productMap.has(productCode)) 
      productMap.set(productCode,[])

    productMap.get(productCode).push(...tempProduct);
    ProductsDetail.value = [...productMap.get(productCode)];

    
    // 상태 업데이트
    isLastProductsApiBatch.value = data.last
    productsApiPage.value = data.number
  }
}

// 상세 행 선택 + 히스토리 패널
const selectedDetailRow = ref(null)
const isHistoryOpen = ref(false)

const handleDetailRowClick = (row) => {
  selectedDetailRow.value = row
  isHistoryOpen.value = true
}

// 선택된 상세 행의 히스토리
const selectedHistoryEvents = computed( async() => {
  if (!selectedDetailRow.value) return []

  const data = await getProductHistory({
      page: 0,
      size: pageSIze, // 50개씩 요청
      productId: selectedDetailRow.value.id,
      // 조건절, status 나중에 추가
  })

  console.log("이력 조회 ::: ", data.content);

  return data != null && data.content != null ? data.content : null; 
})

//  검색 (초기화) 
const handleSearchForMaster = async () => {
  masterProducts.value = []
  masterApiPage.value = 0
  isLastMasterApiBatch.value = false

  handleSearchForProduct()
  await fetchMasterApiBatch(0)
}


//  검색 (초기화) 
const handleSearchForProduct = async () => {
  productMap = new Map(); 
  ProductsDetail.value = [];
  productsApiPage.value = 0
  isLastProductsApiBatch.value = false;
  
  // await fetchProductApiBatch(0)
}




watch(selectedCategory, handleSearchForMaster );

watch(selectedStatus, handleSearchForMaster );

</script>

<style scoped>
.manage-page {
  padding: 24px 2px 32px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;       
  overflow-x: hidden; 
}

/* 왼쪽 영역은 남는 공간 전부 */
.manage-main {
  flex: 1;
  min-width: 0;
}

:deep(.product-history-panel) { 
  width: 360px;      
  flex-shrink: 0;    
  position: sticky;  
  top: 24px;
}

/* 검색 / 셀렉트 영역 */
.top-filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

.search-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.search-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}

.stock-select {
  min-width: 120px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
}
</style>