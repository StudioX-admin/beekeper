<template>
  <div class="waste-list">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn">
          <img src="../../assets/images/icon_back.png" alt="">
        </RouterLink>
        <span class="title">폐기물 목록</span>
      </div>
      <RouterLink to="/waste/register" class="add_btn">
        <img src="../../assets/images/icon_add.png" alt="">
      </RouterLink>
    </div>

    <!-- 검색 및 필터 -->
    <div class="search_filter">
      <div class="search_box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="검색어를 입력하세요"
          @input="handleSearch"
        >
        <img src="../../assets/images/icon_search.png" alt="">
      </div>
      <div class="filter_box">
        <select v-model="selectedType" @change="handleFilter">
          <option value="">전체 종류</option>
          <option v-for="type in WASTE_TYPES" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
        <select v-model="selectedStatus" @change="handleFilter">
          <option value="">전체 상태</option>
          <option v-for="status in WASTE_STATUS" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 폐기물 목록 -->
    <div class="waste_items" v-if="wastes.length > 0">
      <div v-for="waste in wastes" :key="waste.id" class="waste_item" @click="showDetail(waste)">
        <div class="waste_info">
          <div class="waste_type">
            <span class="type_badge" :class="waste.type.toLowerCase()">
              {{ getWasteTypeName(waste.type) }}
            </span>
            <span class="status_badge" :class="waste.status.toLowerCase()">
              {{ getWasteStatusName(waste.status) }}
            </span>
          </div>
          <div class="waste_quantity">
            {{ waste.quantity }} {{ getWasteTypeUnit(waste.type) }}
          </div>
          <div class="waste_date">
            {{ formatDate(waste.createdAt) }}
          </div>
        </div>
        <div class="waste_images" v-if="waste.images && waste.images.length > 0">
          <img :src="waste.images[0]" alt="폐기물 이미지">
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div class="empty_state" v-else>
      <img src="../../assets/images/empty_state.png" alt="">
      <p>등록된 폐기물이 없습니다.</p>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page_btn"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        이전
      </button>
      <span class="page_info">{{ currentPage }} / {{ totalPages }}</span>
      <button
        class="page_btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        다음
      </button>
    </div>

    <!-- 상세 정보 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog_overlay" @click="closeDetail">
      <div class="dialog" @click.stop>
        <h2>폐기물 상세 정보</h2>
        <div class="dialog_content">
          <div class="detail_item">
            <label>종류</label>
            <span>{{ getWasteTypeName(selectedWaste.type) }}</span>
          </div>
          <div class="detail_item">
            <label>수량</label>
            <span>{{ selectedWaste.quantity }} {{ getWasteTypeUnit(selectedWaste.type) }}</span>
          </div>
          <div class="detail_item">
            <label>상태</label>
            <span class="status_badge" :class="selectedWaste.status.toLowerCase()">
              {{ getWasteStatusName(selectedWaste.status) }}
            </span>
          </div>
          <div class="detail_item">
            <label>등록일</label>
            <span>{{ formatDate(selectedWaste.createdAt) }}</span>
          </div>
          <div class="detail_item" v-if="selectedWaste.description">
            <label>설명</label>
            <p>{{ selectedWaste.description }}</p>
          </div>
          <div class="detail_images" v-if="selectedWaste.images && selectedWaste.images.length > 0">
            <label>이미지</label>
            <div class="image_grid">
              <img
                v-for="(image, index) in selectedWaste.images"
                :key="index"
                :src="image"
                alt="폐기물 이미지"
                @click="showImagePreview(image)"
              >
            </div>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeDetail">닫기</button>
          <button
            v-if="selectedWaste.status === 'PENDING'"
            @click="updateStatus('PROCESSING')"
            class="action_btn"
          >
            처리 시작
          </button>
          <button
            v-if="selectedWaste.status === 'PROCESSING'"
            @click="updateStatus('COMPLETED')"
            class="action_btn"
          >
            처리 완료
          </button>
          <button
            v-if="selectedWaste.status === 'PENDING'"
            @click="deleteWaste"
            class="delete_btn"
          >
            삭제
          </button>
        </div>
      </div>
    </div>

    <!-- 이미지 프리뷰 다이얼로그 -->
    <div v-if="showImagePreviewDialog" class="dialog_overlay" @click="closeImagePreview">
      <div class="image_preview_dialog" @click.stop>
        <img :src="previewImage" alt="이미지 프리뷰">
        <button class="close_btn" @click="closeImagePreview">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { wasteService, WASTE_TYPES, WASTE_STATUS } from '@/services/waste'

const router = useRouter()
const { showError } = useErrorHandler()
const { isLoading, withLoading } = useLoading()

// 상태
const wastes = ref([])
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const showDetailDialog = ref(false)
const selectedWaste = ref(null)
const showImagePreviewDialog = ref(false)
const previewImage = ref('')

// 폐기물 목록 로드
const loadWastes = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        type: selectedType.value,
        status: selectedStatus.value
      }
      const response = await wasteService.getWastes(params)
      wastes.value = response.items
      totalPages.value = response.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadWastes()
}

// 필터 처리
const handleFilter = () => {
  currentPage.value = 1
  loadWastes()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadWastes()
}

// 상세 정보 표시
const showDetail = (waste) => {
  selectedWaste.value = waste
  showDetailDialog.value = true
}

// 상세 정보 닫기
const closeDetail = () => {
  showDetailDialog.value = false
  selectedWaste.value = null
}

// 상태 업데이트
const updateStatus = async (status) => {
  try {
    await withLoading(async () => {
      await wasteService.updateWasteStatus(selectedWaste.value.id, status)
      closeDetail()
      loadWastes()
    })
  } catch (error) {
    showError(error)
  }
}

// 폐기물 삭제
const deleteWaste = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await withLoading(async () => {
      await wasteService.deleteWaste(selectedWaste.value.id)
      closeDetail()
      loadWastes()
    })
  } catch (error) {
    showError(error)
  }
}

// 이미지 프리뷰 표시
const showImagePreview = (image) => {
  previewImage.value = image
  showImagePreviewDialog.value = true
}

// 이미지 프리뷰 닫기
const closeImagePreview = () => {
  showImagePreviewDialog.value = false
  previewImage.value = ''
}

// 유틸리티 함수
const getWasteTypeName = (type) => {
  return WASTE_TYPES[type]?.name || type
}

const getWasteTypeUnit = (type) => {
  return WASTE_TYPES[type]?.unit || ''
}

const getWasteStatusName = (status) => {
  return WASTE_STATUS[status]?.name || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadWastes()
})
</script>

<style scoped>
.waste-list {
  padding: 20px;
}

.sub_top_title {
  padding: 14px 16px;
  border-bottom: 1px solid #F2F2F2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub_top_title > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub_top_title .title {
  font-weight: 600;
  font-size: 18px;
  line-height: 28px;
}

.sub_top_title .back_btn,
.sub_top_title .add_btn {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub_top_title .back_btn > img,
.sub_top_title .add_btn > img {
  width: 100%;
}

.search_filter {
  margin: 20px 0;
}

.search_box {
  position: relative;
  margin-bottom: 12px;
}

.search_box input {
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search_box img {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
}

.filter_box {
  display: flex;
  gap: 8px;
}

.filter_box select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.waste_items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.waste_item {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.waste_info {
  flex: 1;
}

.waste_type {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.type_badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type_badge.general {
  background-color: #E3F2FD;
  color: #1976D2;
}

.type_badge.construction {
  background-color: #FFF3E0;
  color: #F57C00;
}

.type_badge.hazardous {
  background-color: #FFEBEE;
  color: #D32F2F;
}

.type_badge.recyclable {
  background-color: #E8F5E9;
  color: #388E3C;
}

.status_badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status_badge.pending {
  background-color: #F5F5F5;
  color: #757575;
}

.status_badge.processing {
  background-color: #E3F2FD;
  color: #1976D2;
}

.status_badge.completed {
  background-color: #E8F5E9;
  color: #388E3C;
}

.waste_quantity {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.waste_date {
  font-size: 12px;
  color: #666;
}

.waste_images {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.waste_images img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty_state {
  text-align: center;
  padding: 40px 0;
}

.empty_state img {
  width: 120px;
  margin-bottom: 16px;
}

.empty_state p {
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page_btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.page_btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page_info {
  font-size: 14px;
  color: #666;
}

.dialog_overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.dialog h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog_content {
  margin-bottom: 20px;
}

.detail_item {
  margin-bottom: 16px;
}

.detail_item label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.detail_item span,
.detail_item p {
  font-size: 14px;
}

.detail_images {
  margin-top: 24px;
}

.image_grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.image_grid img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.dialog_actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog_actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action_btn {
  background-color: #FED15E;
  color: #000;
  font-weight: 600;
}

.delete_btn {
  background-color: #FFEBEE;
  color: #D32F2F;
  font-weight: 600;
}

.image_preview_dialog {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image_preview_dialog img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close_btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

@media (max-width: 768px) {
  .waste-list {
    padding: 16px;
  }

  .search_box input,
  .filter_box select {
    font-size: 16px; /* iOS에서 자동 확대 방지 */
  }

  .dialog {
    margin: 16px;
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style> 