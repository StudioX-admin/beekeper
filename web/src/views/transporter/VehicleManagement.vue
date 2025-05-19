<template>
  <div class="vehicle-management">
    <div class="page-header">
      <h1>차량 관리</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        차량 등록
      </button>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="차량번호로 검색"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="active">운행중</option>
          <option value="maintenance">정비중</option>
          <option value="inactive">비활성</option>
        </select>
      </div>
    </div>

    <!-- 차량 목록 -->
    <div class="vehicle-list">
      <table>
        <thead>
          <tr>
            <th>차량번호</th>
            <th>차종</th>
            <th>적재용량</th>
            <th>상태</th>
            <th>최근 점검일</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in vehicles" :key="vehicle.id">
            <td>{{ vehicle.plate_number }}</td>
            <td>{{ vehicle.type }}</td>
            <td>{{ vehicle.capacity }}톤</td>
            <td>
              <span :class="['status-badge', getStatusClass(vehicle.status)]">
                {{ getStatusText(vehicle.status) }}
              </span>
            </td>
            <td>{{ formatDate(vehicle.last_maintenance_date) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewVehicle(vehicle)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit')"
                  class="edit-btn"
                  @click="editVehicle(vehicle)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete')"
                  class="delete-btn"
                  @click="confirmDelete(vehicle)"
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

    <!-- 차량 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '차량 수정' : '차량 등록' }}</h2>
        <form @submit.prevent="submitVehicle">
          <div class="form-group">
            <label>차량번호</label>
            <input
              type="text"
              v-model="vehicleForm.plate_number"
              required
            />
          </div>
          <div class="form-group">
            <label>차종</label>
            <input
              type="text"
              v-model="vehicleForm.type"
              required
            />
          </div>
          <div class="form-group">
            <label>적재용량 (톤)</label>
            <input
              type="number"
              v-model="vehicleForm.capacity"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div class="form-group">
            <label>상태</label>
            <select v-model="vehicleForm.status" required>
              <option value="active">운행중</option>
              <option value="maintenance">정비중</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
          <div class="form-group">
            <label>최근 점검일</label>
            <input
              type="date"
              v-model="vehicleForm.last_maintenance_date"
              required
            />
          </div>
          <div class="form-group">
            <label>설명</label>
            <textarea
              v-model="vehicleForm.description"
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

    <!-- 차량 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog-overlay">
      <div class="dialog detail-dialog">
        <h2>차량 상세</h2>
        <div class="vehicle-detail">
          <div class="detail-header">
            <h3>{{ selectedVehicle.plate_number }}</h3>
            <div class="detail-info">
              <span>차종: {{ selectedVehicle.type }}</span>
              <span>적재용량: {{ selectedVehicle.capacity }}톤</span>
              <span :class="['status-badge', getStatusClass(selectedVehicle.status)]">
                {{ getStatusText(selectedVehicle.status) }}
              </span>
            </div>
          </div>
          <div class="detail-content">
            <p><strong>최근 점검일:</strong> {{ formatDate(selectedVehicle.last_maintenance_date) }}</p>
            <p><strong>설명:</strong> {{ selectedVehicle.description }}</p>
            <p><strong>등록일:</strong> {{ formatDate(selectedVehicle.created_at) }}</p>
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
        <h2>차량 삭제</h2>
        <p>정말로 이 차량을 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteVehicle">삭제</button>
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
import { vehicleService } from '@/services/vehicle'

// 상태
const vehicles = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const showDialog = ref(false)
const showDetailDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedVehicle = ref(null)

// 폼 데이터
const vehicleForm = ref({
  plate_number: '',
  type: '',
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
  active: '운행중',
  maintenance: '정비중',
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

// 차량 목록 로드
const loadVehicles = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
      const data = await vehicleService.getVehicles(params)
      vehicles.value = data.vehicles
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadVehicles()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadVehicles()
}

// 차량 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  vehicleForm.value = {
    plate_number: '',
    type: '',
    capacity: '',
    status: 'active',
    last_maintenance_date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  }
  showDialog.value = true
}

// 차량 수정 다이얼로그 열기
const editVehicle = (vehicle) => {
  isEdit.value = true
  selectedVehicle.value = vehicle
  vehicleForm.value = { ...vehicle }
  showDialog.value = true
}

// 차량 상세 보기
const viewVehicle = async (vehicle) => {
  try {
    await withLoading(async () => {
      const data = await vehicleService.getVehicle(vehicle.id)
      selectedVehicle.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 차량 삭제 확인
const confirmDelete = (vehicle) => {
  selectedVehicle.value = vehicle
  showDeleteConfirm.value = true
}

// 차량 삭제
const deleteVehicle = async () => {
  try {
    await withLoading(async () => {
      await vehicleService.deleteVehicle(selectedVehicle.value.id)
      showDeleteConfirm.value = false
      loadVehicles()
    })
  } catch (error) {
    showError(error)
  }
}

// 차량 저장
const submitVehicle = async () => {
  try {
    await withLoading(async () => {
      if (isEdit.value) {
        await vehicleService.updateVehicle(selectedVehicle.value.id, vehicleForm.value)
      } else {
        await vehicleService.createVehicle(vehicleForm.value)
      }

      showDialog.value = false
      loadVehicles()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedVehicle.value = null
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedVehicle.value = null
}

onMounted(() => {
  loadVehicles()
})
</script>

<style scoped>
.vehicle-management {
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

.vehicle-list {
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

.vehicle-detail {
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