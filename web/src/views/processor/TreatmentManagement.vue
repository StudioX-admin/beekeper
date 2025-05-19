<template>
  <div class="treatment-management">
    <div class="page-header">
      <h1>폐기물 처리 관리</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        처리 등록
      </button>
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
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="pending">대기중</option>
          <option value="in_progress">처리중</option>
          <option value="completed">처리완료</option>
          <option value="cancelled">취소됨</option>
        </select>
      </div>
    </div>

    <!-- 처리 목록 -->
    <div class="treatment-list">
      <table>
        <thead>
          <tr>
            <th>폐기물명</th>
            <th>수량</th>
            <th>처리일</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="treatment in treatments" :key="treatment.id">
            <td>{{ treatment.waste_name }}</td>
            <td>{{ treatment.quantity }}톤</td>
            <td>{{ formatDate(treatment.treatment_date) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(treatment.status)]">
                {{ getStatusText(treatment.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewTreatment(treatment)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit') && treatment.status === 'pending'"
                  class="edit-btn"
                  @click="editTreatment(treatment)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete') && treatment.status === 'pending'"
                  class="delete-btn"
                  @click="confirmDelete(treatment)"
                >
                  삭제
                </button>
                <button
                  v-if="hasPermission('edit') && treatment.status === 'pending'"
                  class="start-btn"
                  @click="startTreatment(treatment)"
                >
                  처리시작
                </button>
                <button
                  v-if="hasPermission('edit') && treatment.status === 'in_progress'"
                  class="complete-btn"
                  @click="completeTreatment(treatment)"
                >
                  처리완료
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

    <!-- 처리 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '처리 수정' : '처리 등록' }}</h2>
        <form @submit.prevent="submitTreatment">
          <div class="form-group">
            <label>폐기물</label>
            <select v-model="treatmentForm.waste_id" required>
              <option v-for="waste in availableWastes" :key="waste.id" :value="waste.id">
                {{ waste.name }} ({{ waste.quantity }}톤)
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>처리일</label>
            <input
              type="date"
              v-model="treatmentForm.treatment_date"
              required
            />
          </div>
          <div class="form-group">
            <label>처리량 (톤)</label>
            <input
              type="number"
              v-model="treatmentForm.quantity"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div class="form-group">
            <label>설명</label>
            <textarea
              v-model="treatmentForm.description"
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

    <!-- 처리 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog-overlay">
      <div class="dialog detail-dialog">
        <h2>처리 상세</h2>
        <div class="treatment-detail">
          <div class="detail-header">
            <h3>{{ selectedTreatment.waste_name }}</h3>
            <div class="detail-info">
              <span>수량: {{ selectedTreatment.quantity }}톤</span>
              <span>처리일: {{ formatDate(selectedTreatment.treatment_date) }}</span>
              <span :class="['status-badge', getStatusClass(selectedTreatment.status)]">
                {{ getStatusText(selectedTreatment.status) }}
              </span>
            </div>
          </div>
          <div class="detail-content">
            <p><strong>설명:</strong> {{ selectedTreatment.description }}</p>
            <p><strong>등록일:</strong> {{ formatDate(selectedTreatment.created_at) }}</p>
            <p><strong>수정일:</strong> {{ formatDate(selectedTreatment.updated_at) }}</p>
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
        <h2>처리 삭제</h2>
        <p>정말로 이 처리를 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteTreatment">삭제</button>
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
import { treatmentService } from '@/services/treatment'
import { wasteService } from '@/services/waste'

// 상태
const treatments = ref([])
const availableWastes = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const showDialog = ref(false)
const showDetailDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedTreatment = ref(null)

// 폼 데이터
const treatmentForm = ref({
  waste_id: '',
  treatment_date: '',
  quantity: '',
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
  pending: 'status-pending',
  in_progress: 'status-progress',
  completed: 'status-completed',
  cancelled: 'status-cancelled'
}

// 상태 텍스트
const statusTexts = {
  pending: '대기중',
  in_progress: '처리중',
  completed: '처리완료',
  cancelled: '취소됨'
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

// 처리 목록 로드
const loadTreatments = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
      const data = await treatmentService.getTreatments(params)
      treatments.value = data.treatments
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 사용 가능한 폐기물 목록 로드
const loadAvailableWastes = async () => {
  try {
    await withLoading(async () => {
      const data = await wasteService.getWastes({ status: 'pending' })
      availableWastes.value = data.wastes
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadTreatments()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadTreatments()
}

// 처리 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  treatmentForm.value = {
    waste_id: '',
    treatment_date: format(new Date(), 'yyyy-MM-dd'),
    quantity: '',
    description: ''
  }
  showDialog.value = true
}

// 처리 수정 다이얼로그 열기
const editTreatment = (treatment) => {
  isEdit.value = true
  selectedTreatment.value = treatment
  treatmentForm.value = {
    waste_id: treatment.waste_id,
    treatment_date: format(new Date(treatment.treatment_date), 'yyyy-MM-dd'),
    quantity: treatment.quantity,
    description: treatment.description
  }
  showDialog.value = true
}

// 처리 상세 보기
const viewTreatment = async (treatment) => {
  try {
    await withLoading(async () => {
      const data = await treatmentService.getTreatment(treatment.id)
      selectedTreatment.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 처리 삭제 확인
const confirmDelete = (treatment) => {
  selectedTreatment.value = treatment
  showDeleteConfirm.value = true
}

// 처리 삭제
const deleteTreatment = async () => {
  try {
    await withLoading(async () => {
      await treatmentService.deleteTreatment(selectedTreatment.value.id)
      showDeleteConfirm.value = false
      loadTreatments()
    })
  } catch (error) {
    showError(error)
  }
}

// 처리 저장
const submitTreatment = async () => {
  try {
    await withLoading(async () => {
      if (isEdit.value) {
        await treatmentService.updateTreatment(selectedTreatment.value.id, treatmentForm.value)
      } else {
        await treatmentService.createTreatment(treatmentForm.value)
      }

      showDialog.value = false
      loadTreatments()
    })
  } catch (error) {
    showError(error)
  }
}

// 처리 시작
const startTreatment = async (treatment) => {
  try {
    await withLoading(async () => {
      await treatmentService.startTreatment(treatment.id)
      loadTreatments()
    })
  } catch (error) {
    showError(error)
  }
}

// 처리 완료
const completeTreatment = async (treatment) => {
  try {
    await withLoading(async () => {
      await treatmentService.completeTreatment(treatment.id)
      loadTreatments()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedTreatment.value = null
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedTreatment.value = null
}

onMounted(() => {
  loadTreatments()
  loadAvailableWastes()
})
</script>

<style scoped>
.treatment-management {
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

.treatment-list {
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

.status-cancelled {
  background-color: #d0021b;
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

.start-btn {
  background-color: #7ed321;
  color: white;
}

.complete-btn {
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

.treatment-detail {
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