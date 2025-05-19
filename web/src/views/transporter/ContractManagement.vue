<template>
  <div class="contract-management">
    <div class="page-header">
      <h1>계약 관리</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        계약 등록
      </button>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="처리업체명, 계약번호로 검색"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="active">활성</option>
          <option value="pending">승인대기</option>
          <option value="expired">만료</option>
          <option value="terminated">해지</option>
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

    <!-- 계약 목록 -->
    <div class="contract-list">
      <table>
        <thead>
          <tr>
            <th>계약번호</th>
            <th>처리업체</th>
            <th>계약기간</th>
            <th>계약금액</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contracts" :key="contract.id">
            <td>{{ contract.contract_number }}</td>
            <td>{{ contract.processor_name }}</td>
            <td>{{ formatDate(contract.start_date) }} ~ {{ formatDate(contract.end_date) }}</td>
            <td>{{ formatCurrency(contract.amount) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(contract.status)]">
                {{ getStatusText(contract.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewContract(contract)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit') && contract.status === 'pending'"
                  class="edit-btn"
                  @click="editContract(contract)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete') && contract.status === 'pending'"
                  class="delete-btn"
                  @click="confirmDelete(contract)"
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

    <!-- 계약 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '계약 수정' : '계약 등록' }}</h2>
        <form @submit.prevent="submitContract">
          <div class="form-group">
            <label>처리업체</label>
            <select v-model="contractForm.processor_id" required>
              <option v-for="processor in processors" :key="processor.id" :value="processor.id">
                {{ processor.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>계약기간</label>
            <div class="date-range">
              <input
                type="date"
                v-model="contractForm.start_date"
                required
              />
              <span>~</span>
              <input
                type="date"
                v-model="contractForm.end_date"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label>계약금액</label>
            <input
              type="number"
              v-model="contractForm.amount"
              required
            />
          </div>
          <div class="form-group">
            <label>계약서 파일</label>
            <input
              type="file"
              @change="handleFileUpload"
              accept=".pdf,.doc,.docx"
            />
          </div>
          <div class="form-group">
            <label>비고</label>
            <textarea
              v-model="contractForm.notes"
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

    <!-- 삭제 확인 다이얼로그 -->
    <div v-if="showDeleteConfirm" class="dialog-overlay">
      <div class="dialog">
        <h2>계약 삭제</h2>
        <p>정말로 이 계약을 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteContract">삭제</button>
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
import { transporterContractService } from '@/services/contract'

// 상태
const contracts = ref([])
const processors = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const showDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedContract = ref(null)

// 폼 데이터
const contractForm = ref({
  processor_id: '',
  start_date: '',
  end_date: '',
  amount: '',
  file: null,
  notes: ''
})

// 권한 체크
const userStore = useUserStore()
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
  pending: 'status-pending',
  expired: 'status-expired',
  terminated: 'status-terminated'
}

// 상태 텍스트
const statusTexts = {
  active: '활성',
  pending: '승인대기',
  expired: '만료',
  terminated: '해지'
}

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd', { locale: ko })
}

// 금액 포맷
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
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

// 계약 목록 로드
const loadContracts = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: statusFilter.value,
        start_date: startDate.value,
        end_date: endDate.value
      }
      const data = await transporterContractService.getContracts(params)
      contracts.value = data.contracts
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 처리업체 목록 로드
const loadProcessors = async () => {
  try {
    await withLoading(async () => {
      const data = await transporterContractService.getProcessors()
      processors.value = data.processors
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadContracts()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadContracts()
}

// 파일 업로드 처리
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    contractForm.value.file = file
  }
}

// 계약 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  contractForm.value = {
    processor_id: '',
    start_date: '',
    end_date: '',
    amount: '',
    file: null,
    notes: ''
  }
  showDialog.value = true
}

// 계약 수정 다이얼로그 열기
const editContract = (contract) => {
  isEdit.value = true
  selectedContract.value = contract
  contractForm.value = { ...contract }
  showDialog.value = true
}

// 계약 상세 보기
const viewContract = (contract) => {
  // TODO: 계약 상세 페이지로 이동
  console.log('View contract:', contract)
}

// 계약 삭제 확인
const confirmDelete = (contract) => {
  selectedContract.value = contract
  showDeleteConfirm.value = true
}

// 계약 삭제
const deleteContract = async () => {
  try {
    await withLoading(async () => {
      await transporterContractService.deleteContract(selectedContract.value.id)
      showDeleteConfirm.value = false
      loadContracts()
    })
  } catch (error) {
    showError(error)
  }
}

// 계약 저장
const submitContract = async () => {
  try {
    await withLoading(async () => {
      const formData = new FormData()
      Object.keys(contractForm.value).forEach(key => {
        if (key === 'file' && contractForm.value[key]) {
          formData.append(key, contractForm.value[key])
        } else {
          formData.append(key, contractForm.value[key])
        }
      })

      if (isEdit.value) {
        await transporterContractService.updateContract(selectedContract.value.id, formData)
      } else {
        await transporterContractService.createContract(formData)
      }

      showDialog.value = false
      loadContracts()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedContract.value = null
}

onMounted(() => {
  loadContracts()
  loadProcessors()
})
</script>

<style scoped>
.contract-management {
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

.date-range {
  display: flex;
  gap: 10px;
  align-items: center;
}

.contract-list {
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