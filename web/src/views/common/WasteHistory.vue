<template>
  <div class="waste-history">
    <div class="page-header">
      <h1>폐기물 이력 관리</h1>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="폐기물명으로 검색"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="typeFilter" @change="handleSearch">
          <option value="">전체 유형</option>
          <option value="general">일반폐기물</option>
          <option value="hazardous">유해폐기물</option>
          <option value="medical">의료폐기물</option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="pending">대기중</option>
          <option value="in_progress">처리중</option>
          <option value="completed">처리완료</option>
        </select>
      </div>
      <div class="filter-group">
        <input
          type="date"
          v-model="startDate"
          @change="handleSearch"
        />
        <span>~</span>
        <input
          type="date"
          v-model="endDate"
          @change="handleSearch"
        />
      </div>
    </div>

    <!-- 이력 목록 -->
    <div class="history-list">
      <table>
        <thead>
          <tr>
            <th>폐기물명</th>
            <th>유형</th>
            <th>수량</th>
            <th>상태</th>
            <th>처리일</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="history in histories" :key="history.id">
            <td>{{ history.waste_name }}</td>
            <td>{{ getWasteTypeText(history.waste_type) }}</td>
            <td>{{ history.quantity }}톤</td>
            <td>
              <span :class="['status-badge', getStatusClass(history.status)]">
                {{ getStatusText(history.status) }}
              </span>
            </td>
            <td>{{ formatDate(history.processed_date) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewHistory(history)"
                >
                  상세
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        이전
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        다음
      </button>
    </div>

    <!-- 이력 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog-overlay">
      <div class="dialog detail-dialog">
        <h2>이력 상세</h2>
        <div class="history-detail">
          <div class="detail-header">
            <h3>{{ selectedHistory.waste_name }}</h3>
            <div class="detail-info">
              <span>유형: {{ getWasteTypeText(selectedHistory.waste_type) }}</span>
              <span>수량: {{ selectedHistory.quantity }}톤</span>
              <span :class="['status-badge', getStatusClass(selectedHistory.status)]">
                {{ getStatusText(selectedHistory.status) }}
              </span>
            </div>
          </div>
          <div class="detail-content">
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-date">
                  {{ formatDate(selectedHistory.created_at) }}
                </div>
                <div class="timeline-content">
                  <h4>폐기물 등록</h4>
                  <p>등록자: {{ selectedHistory.created_by }}</p>
                </div>
              </div>
              <div v-if="selectedHistory.collection_date" class="timeline-item">
                <div class="timeline-date">
                  {{ formatDate(selectedHistory.collection_date) }}
                </div>
                <div class="timeline-content">
                  <h4>수거 완료</h4>
                  <p>수거자: {{ selectedHistory.collected_by }}</p>
                  <p>수거량: {{ selectedHistory.collection_quantity }}톤</p>
                </div>
              </div>
              <div v-if="selectedHistory.treatment_date" class="timeline-item">
                <div class="timeline-date">
                  {{ formatDate(selectedHistory.treatment_date) }}
                </div>
                <div class="timeline-content">
                  <h4>처리 완료</h4>
                  <p>처리자: {{ selectedHistory.treated_by }}</p>
                  <p>처리량: {{ selectedHistory.treatment_quantity }}톤</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="closeDetailDialog">닫기</button>
        </div>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <div
      v-if="snackbar"
      class="error-message"
      @click="snackbar = false"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useUserStore } from '@/stores/user'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { historyService } from '@/services/history'

// 상태
const histories = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const showDetailDialog = ref(false)
const selectedHistory = ref(null)

// 사용자 스토어
const userStore = useUserStore()

// 권한 체크
const hasPermission = (action) => {
  const role = userStore.user?.role
  if (!role) return false

  const permissions = {
    admin: ['view'],
    manager: ['view'],
    staff: ['view']
  }

  return permissions[role]?.includes(action) || false
}

// 상태 클래스
const statusClasses = {
  pending: 'status-pending',
  in_progress: 'status-progress',
  completed: 'status-completed'
}

// 상태 텍스트
const statusTexts = {
  pending: '대기중',
  in_progress: '처리중',
  completed: '처리완료'
}

// 폐기물 유형 텍스트
const wasteTypeTexts = {
  general: '일반폐기물',
  hazardous: '유해폐기물',
  medical: '의료폐기물'
}

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd', { locale: ko })
}

// 상태 클래스 가져오기
const getStatusClass = (status) => {
  return statusClasses[status] || ''
}

// 상태 텍스트 가져오기
const getStatusText = (status) => {
  return statusTexts[status] || status
}

// 폐기물 유형 텍스트 가져오기
const getWasteTypeText = (type) => {
  return wasteTypeTexts[type] || type
}

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 이력 목록 로드
const loadHistories = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        type: typeFilter.value,
        status: statusFilter.value,
        start_date: startDate.value,
        end_date: endDate.value
      }
      const data = await historyService.getHistories(params)
      histories.value = data.histories
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadHistories()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadHistories()
}

// 이력 상세 보기
const viewHistory = async (history) => {
  try {
    await withLoading(async () => {
      const data = await historyService.getHistory(history.id)
      selectedHistory.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedHistory.value = null
}

onMounted(() => {
  loadHistories()
})
</script>

<style scoped>
.waste-history {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-group {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.history-list {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status-pending {
  background-color: #f5a623;
  color: white;
}

.status-progress {
  background-color: #4a90e2;
  color: white;
}

.status-completed {
  background-color: #7ed321;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.view-btn {
  background-color: #4a90e2;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.detail-dialog {
  max-width: 800px;
}

.history-detail {
  margin-bottom: 20px;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-header h3 {
  margin: 0 0 10px 0;
}

.detail-info {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 0.9em;
}

.detail-content {
  margin-bottom: 20px;
}

.timeline {
  position: relative;
  padding: 20px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  height: 100%;
  width: 2px;
  background-color: #ddd;
}

.timeline-item {
  position: relative;
  padding-left: 50px;
  margin-bottom: 30px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #4a90e2;
  border: 2px solid white;
}

.timeline-date {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}

.timeline-content {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
}

.timeline-content h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.timeline-content p {
  margin: 5px 0;
  color: #666;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.dialog-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4a90e2;
  color: white;
}

.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  background-color: #d0021b;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
</style> 