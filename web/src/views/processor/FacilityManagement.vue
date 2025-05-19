<template>
  <div class="facility-management">
    <div class="page-header">
      <h1>시설 관리</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        시설 등록
      </button>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="시설명으로 검색"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="active">운영중</option>
          <option value="maintenance">점검중</option>
          <option value="inactive">비활성</option>
        </select>
      </div>
    </div>

    <!-- 시설 목록 -->
    <div class="facility-list">
      <table>
        <thead>
          <tr>
            <th>시설명</th>
            <th>처리용량</th>
            <th>상태</th>
            <th>최근 점검일</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="facility in facilities" :key="facility.id">
            <td>{{ facility.name }}</td>
            <td>{{ facility.capacity }}톤/일</td>
            <td>
              <span :class="['status-badge', getStatusClass(facility.status)]">
                {{ getStatusText(facility.status) }}
              </span>
            </td>
            <td>{{ formatDate(facility.last_maintenance_date) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewFacility(facility)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit')"
                  class="edit-btn"
                  @click="editFacility(facility)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete')"
                  class="delete-btn"
                  @click="confirmDelete(facility)"
                >
                  삭제
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

    <!-- 시설 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '시설 수정' : '시설 등록' }}</h2>
        <form @submit.prevent="submitFacility">
          <div class="form-group">
            <label>시설명</label>
            <input
              type="text"
              v-model="facilityForm.name"
              required
            />
          </div>
          <div class="form-group">
            <label>처리용량 (톤/일)</label>
            <input
              type="number"
              v-model="facilityForm.capacity"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div class="form-group">
            <label>상태</label>
            <select v-model="facilityForm.status" required>
              <option value="active">운영중</option>
              <option value="maintenance">점검중</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
          <div class="form-group">
            <label>최근 점검일</label>
            <input
              type="date"
              v-model="facilityForm.last_maintenance_date"
              required
            />
          </div>
          <div class="form-group">
            <label>설명</label>
            <textarea
              v-model="facilityForm.description"
              rows="3"
            ></textarea>
          </div>
          <div class="dialog-actions">
            <button type="button" @click="closeDialog">취소</button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 시설 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog-overlay">
      <div class="dialog detail-dialog">
        <h2>시설 상세</h2>
        <div class="facility-detail">
          <div class="detail-header">
            <h3>{{ selectedFacility.name }}</h3>
            <div class="detail-info">
              <span>처리용량: {{ selectedFacility.capacity }}톤/일</span>
              <span :class="['status-badge', getStatusClass(selectedFacility.status)]">
                {{ getStatusText(selectedFacility.status) }}
              </span>
            </div>
          </div>
          <div class="detail-content">
            <p><strong>최근 점검일:</strong> {{ formatDate(selectedFacility.last_maintenance_date) }}</p>
            <p><strong>설명:</strong> {{ selectedFacility.description }}</p>
            <p><strong>등록일:</strong> {{ formatDate(selectedFacility.created_at) }}</p>
          </div>
        </div>
        <div class="dialog-actions">
          <button @click="closeDetailDialog">닫기</button>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 다이얼로그 -->
    <div v-if="showDeleteConfirm" class="dialog-overlay">
      <div class="dialog">
        <h2>시설 삭제</h2>
        <p>정말로 이 시설을 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteFacility">삭제</button>
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
import { facilityService } from '@/services/facility'

// 상태
const facilities = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const showDialog = ref(false)
const showDetailDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedFacility = ref(null)

// 폼 데이터
const facilityForm = ref({
  name: '',
  capacity: '',
  status: 'active',
  last_maintenance_date: '',
  description: ''
})

// 사용자 스토어
const userStore = useUserStore()

// 권한 체크
const hasPermission = (action) => {
  const role = userStore.user?.role
  if (!role) return false

  const permissions = {
    admin: ['create', 'view', 'edit', 'delete'],
    manager: ['create', 'view', 'edit', 'delete'],
    staff: ['view']
  }

  return permissions[role]?.includes(action) || false
}

// 상태 클래스
const statusClasses = {
  active: 'status-active',
  maintenance: 'status-maintenance',
  inactive: 'status-inactive'
}

// 상태 텍스트
const statusTexts = {
  active: '운영중',
  maintenance: '점검중',
  inactive: '비활성'
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

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 시설 목록 로드
const loadFacilities = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
      const data = await facilityService.getFacilities(params)
      facilities.value = data.facilities
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadFacilities()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadFacilities()
}

// 시설 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  facilityForm.value = {
    name: '',
    capacity: '',
    status: 'active',
    last_maintenance_date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  }
  showDialog.value = true
}

// 시설 수정 다이얼로그 열기
const editFacility = (facility) => {
  isEdit.value = true
  selectedFacility.value = facility
  facilityForm.value = { ...facility }
  showDialog.value = true
}

// 시설 상세 보기
const viewFacility = async (facility) => {
  try {
    await withLoading(async () => {
      const data = await facilityService.getFacility(facility.id)
      selectedFacility.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 시설 삭제 확인
const confirmDelete = (facility) => {
  selectedFacility.value = facility
  showDeleteConfirm.value = true
}

// 시설 삭제
const deleteFacility = async () => {
  try {
    await withLoading(async () => {
      await facilityService.deleteFacility(selectedFacility.value.id)
      showDeleteConfirm.value = false
      loadFacilities()
    })
  } catch (error) {
    showError(error)
  }
}

// 시설 저장
const submitFacility = async () => {
  try {
    await withLoading(async () => {
      if (isEdit.value) {
        await facilityService.updateFacility(selectedFacility.value.id, facilityForm.value)
      } else {
        await facilityService.createFacility(facilityForm.value)
      }

      showDialog.value = false
      loadFacilities()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedFacility.value = null
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedFacility.value = null
}

onMounted(() => {
  loadFacilities()
})
</script>

<style scoped>
.facility-management {
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

.facility-list {
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

.status-active {
  background-color: #4a90e2;
  color: white;
}

.status-maintenance {
  background-color: #f5a623;
  color: white;
}

.status-inactive {
  background-color: #999;
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

.edit-btn {
  background-color: #f5a623;
  color: white;
}

.delete-btn {
  background-color: #d0021b;
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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
}

.dialog-actions button:first-child {
  background-color: #f5f5f5;
}

.dialog-actions button:last-child {
  background-color: #4a90e2;
  color: white;
}

.facility-detail {
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

.detail-content p {
  margin: 10px 0;
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