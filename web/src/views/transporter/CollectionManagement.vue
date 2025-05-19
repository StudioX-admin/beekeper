<template>
  <div class="collection-management">
    <div class="page-header">
      <h1>폐기물 수거 관리</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        수거 등록
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
          <option value="in_progress">수거중</option>
          <option value="completed">수거완료</option>
          <option value="cancelled">취소됨</option>
        </select>
      </div>
    </div>

    <!-- 수거 목록 -->
    <div class="collection-list">
      <table>
        <thead>
          <tr>
            <th>폐기물명</th>
            <th>수량</th>
            <th>수거일</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="collection in collections" :key="collection.id">
            <td>{{ collection.waste_name }}</td>
            <td>{{ collection.quantity }}톤</td>
            <td>{{ formatDate(collection.collection_date) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(collection.status)]">
                {{ getStatusText(collection.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewCollection(collection)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit') && collection.status === 'pending'"
                  class="edit-btn"
                  @click="editCollection(collection)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete') && collection.status === 'pending'"
                  class="delete-btn"
                  @click="confirmDelete(collection)"
                >
                  삭제
                </button>
                <button
                  v-if="hasPermission('edit') && collection.status === 'pending'"
                  class="start-btn"
                  @click="startCollection(collection)"
                >
                  수거시작
                </button>
                <button
                  v-if="hasPermission('edit') && collection.status === 'in_progress'"
                  class="complete-btn"
                  @click="completeCollection(collection)"
                >
                  수거완료
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

    <!-- 수거 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '수거 수정' : '수거 등록' }}</h2>
        <form @submit.prevent="submitCollection">
          <div class="form-group">
            <label>폐기물</label>
            <select v-model="collectionForm.waste_id" required>
              <option v-for="waste in availableWastes" :key="waste.id" :value="waste.id">
                {{ waste.name }} ({{ waste.quantity }}톤)
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>수거일</label>
            <input
              type="date"
              v-model="collectionForm.collection_date"
              required
            />
          </div>
          <div class="form-group">
            <label>수거량 (톤)</label>
            <input
              type="number"
              v-model="collectionForm.quantity"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div class="form-group">
            <label>설명</label>
            <textarea
              v-model="collectionForm.description"
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

    <!-- 수거 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog-overlay">
      <div class="dialog detail-dialog">
        <h2>수거 상세</h2>
        <div class="collection-detail">
          <div class="detail-header">
            <h3>{{ selectedCollection.waste_name }}</h3>
            <div class="detail-info">
              <span>수량: {{ selectedCollection.quantity }}톤</span>
              <span>수거일: {{ formatDate(selectedCollection.collection_date) }}</span>
              <span :class="['status-badge', getStatusClass(selectedCollection.status)]">
                {{ getStatusText(selectedCollection.status) }}
              </span>
            </div>
          </div>
          <div class="detail-content">
            <p><strong>설명:</strong> {{ selectedCollection.description }}</p>
            <p><strong>등록일:</strong> {{ formatDate(selectedCollection.created_at) }}</p>
            <p><strong>수정일:</strong> {{ formatDate(selectedCollection.updated_at) }}</p>
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
        <h2>수거 삭제</h2>
        <p>정말로 이 수거를 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteCollection">삭제</button>
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
import { collectionService } from '@/services/collection'
import { wasteService } from '@/services/waste'

// 상태
const collections = ref([])
const availableWastes = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const showDialog = ref(false)
const showDetailDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedCollection = ref(null)

// 폼 데이터
const collectionForm = ref({
  waste_id: '',
  collection_date: '',
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
  in_progress: '수거중',
  completed: '수거완료',
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

// 수거 목록 로드
const loadCollections = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
      const data = await collectionService.getCollections(params)
      collections.value = data.collections
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
  loadCollections()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadCollections()
}

// 수거 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  collectionForm.value = {
    waste_id: '',
    collection_date: format(new Date(), 'yyyy-MM-dd'),
    quantity: '',
    description: ''
  }
  showDialog.value = true
}

// 수거 수정 다이얼로그 열기
const editCollection = (collection) => {
  isEdit.value = true
  selectedCollection.value = collection
  collectionForm.value = {
    waste_id: collection.waste_id,
    collection_date: format(new Date(collection.collection_date), 'yyyy-MM-dd'),
    quantity: collection.quantity,
    description: collection.description
  }
  showDialog.value = true
}

// 수거 상세 보기
const viewCollection = async (collection) => {
  try {
    await withLoading(async () => {
      const data = await collectionService.getCollection(collection.id)
      selectedCollection.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 수거 삭제 확인
const confirmDelete = (collection) => {
  selectedCollection.value = collection
  showDeleteConfirm.value = true
}

// 수거 삭제
const deleteCollection = async () => {
  try {
    await withLoading(async () => {
      await collectionService.deleteCollection(selectedCollection.value.id)
      showDeleteConfirm.value = false
      loadCollections()
    })
  } catch (error) {
    showError(error)
  }
}

// 수거 저장
const submitCollection = async () => {
  try {
    await withLoading(async () => {
      if (isEdit.value) {
        await collectionService.updateCollection(selectedCollection.value.id, collectionForm.value)
      } else {
        await collectionService.createCollection(collectionForm.value)
      }

      showDialog.value = false
      loadCollections()
    })
  } catch (error) {
    showError(error)
  }
}

// 수거 시작
const startCollection = async (collection) => {
  try {
    await withLoading(async () => {
      await collectionService.startCollection(collection.id)
      loadCollections()
    })
  } catch (error) {
    showError(error)
  }
}

// 수거 완료
const completeCollection = async (collection) => {
  try {
    await withLoading(async () => {
      await collectionService.completeCollection(collection.id)
      loadCollections()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedCollection.value = null
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedCollection.value = null
}

onMounted(() => {
  loadCollections()
  loadAvailableWastes()
})
</script>

<style scoped>
.collection-management {
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

.collection-list {
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

.collection-detail {
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