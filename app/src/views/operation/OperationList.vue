<template>
  <div class="operation-list">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn">
          <img src="../../assets/images/icon_back.png" alt="">
        </RouterLink>
        <span class="title">운영 일정</span>
      </div>
      <RouterLink to="/operation/register" class="add_btn">
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
        <select v-model="selectedStatus" @change="handleFilter">
          <option value="">전체 상태</option>
          <option v-for="status in OPERATION_STATUS" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 운영 일정 목록 -->
    <div class="operation_items" v-if="operations.length > 0">
      <div v-for="operation in operations" :key="operation.id" class="operation_item" @click="showDetail(operation)">
        <div class="operation_info">
          <div class="operation_status">
            <span class="status_badge" :class="operation.status.toLowerCase()">
              {{ getOperationStatusName(operation.status) }}
            </span>
          </div>
          <div class="operation_facility">
            {{ operation.facilityName }}
          </div>
          <div class="operation_date">
            {{ formatDate(operation.date) }}
          </div>
          <div class="operation_time">
            {{ operation.startTime }} - {{ operation.endTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div class="empty_state" v-else>
      <img src="../../assets/images/empty_state.png" alt="">
      <p>등록된 운영 일정이 없습니다.</p>
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
        <h2>운영 일정 상세 정보</h2>
        <div class="dialog_content">
          <div class="detail_item">
            <label>시설명</label>
            <span>{{ selectedOperation.facilityName }}</span>
          </div>
          <div class="detail_item">
            <label>날짜</label>
            <span>{{ formatDate(selectedOperation.date) }}</span>
          </div>
          <div class="detail_item">
            <label>시간</label>
            <span>{{ selectedOperation.startTime }} - {{ selectedOperation.endTime }}</span>
          </div>
          <div class="detail_item">
            <label>상태</label>
            <span class="status_badge" :class="selectedOperation.status.toLowerCase()">
              {{ getOperationStatusName(selectedOperation.status) }}
            </span>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeDetail">닫기</button>
          <button
            v-if="selectedOperation.status === 'SCHEDULED'"
            @click="updateStatus('IN_PROGRESS')"
            class="action_btn"
          >
            운영 시작
          </button>
          <button
            v-if="selectedOperation.status === 'IN_PROGRESS'"
            @click="updateStatus('COMPLETED')"
            class="action_btn"
          >
            운영 완료
          </button>
          <button
            v-if="['SCHEDULED', 'IN_PROGRESS'].includes(selectedOperation.status)"
            @click="updateStatus('CANCELLED')"
            class="delete_btn"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { operationService, OPERATION_STATUS } from '@/services/operation'

const router = useRouter()
const { showError } = useErrorHandler()
const { isLoading, withLoading } = useLoading()

// 상태
const operations = ref([])
const searchQuery = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const showDetailDialog = ref(false)
const selectedOperation = ref(null)

// 운영 일정 목록 로드
const loadOperations = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: selectedStatus.value
      }
      const response = await operationService.getOperations(params)
      operations.value = response.items
      totalPages.value = response.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadOperations()
}

// 필터 처리
const handleFilter = () => {
  currentPage.value = 1
  loadOperations()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadOperations()
}

// 상세 정보 표시
const showDetail = (operation) => {
  selectedOperation.value = operation
  showDetailDialog.value = true
}

// 상세 정보 닫기
const closeDetail = () => {
  showDetailDialog.value = false
  selectedOperation.value = null
}

// 상태 업데이트
const updateStatus = async (status) => {
  try {
    await withLoading(async () => {
      await operationService.updateOperationStatus(selectedOperation.value.id, status)
      closeDetail()
      loadOperations()
    })
  } catch (error) {
    showError(error)
  }
}

// 유틸리티 함수
const getOperationStatusName = (status) => {
  return OPERATION_STATUS[status]?.name || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadOperations()
})
</script>

<style scoped>
.operation-list {
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

.operation_items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.operation_item {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.operation_info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.operation_status {
  margin-bottom: 4px;
}

.status_badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status_badge.scheduled {
  background-color: #E3F2FD;
  color: #1976D2;
}

.status_badge.in_progress {
  background-color: #FFF3E0;
  color: #F57C00;
}

.status_badge.completed {
  background-color: #E8F5E9;
  color: #388E3C;
}

.status_badge.cancelled {
  background-color: #FFEBEE;
  color: #D32F2F;
}

.operation_facility {
  font-size: 16px;
  font-weight: 500;
}

.operation_date {
  font-size: 14px;
  color: #666;
}

.operation_time {
  font-size: 14px;
  color: #666;
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

.detail_item span {
  font-size: 14px;
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

@media (max-width: 768px) {
  .operation-list {
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