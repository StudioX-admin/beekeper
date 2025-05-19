<template>
  <div class="company-management">
    <div class="page-header">
      <h1>기업 관리</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        기업 등록
      </button>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="기업명으로 검색"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="companyTypeFilter" @change="handleSearch">
          <option value="">전체 업체</option>
          <option value="transporter">운반업체</option>
          <option value="processor">처리업체</option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </div>
    </div>

    <!-- 기업 목록 -->
    <div class="company-list">
      <table>
        <thead>
          <tr>
            <th>기업명</th>
            <th>업체구분</th>
            <th>사업자등록번호</th>
            <th>대표자명</th>
            <th>연락처</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in companies" :key="company.id">
            <td>{{ company.name }}</td>
            <td>{{ getCompanyTypeText(company.type) }}</td>
            <td>{{ company.business_number }}</td>
            <td>{{ company.owner_name }}</td>
            <td>{{ company.phone }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(company.status)]">
                {{ getStatusText(company.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewCompany(company)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit')"
                  class="edit-btn"
                  @click="editCompany(company)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete')"
                  class="delete-btn"
                  @click="confirmDelete(company)"
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

    <!-- 기업 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '기업 수정' : '기업 등록' }}</h2>
        <form @submit.prevent="submitCompany">
          <div class="form-group">
            <label>기업명</label>
            <input
              type="text"
              v-model="companyForm.name"
              required
            />
          </div>
          <div class="form-group">
            <label>업체구분</label>
            <select v-model="companyForm.type" required>
              <option value="transporter">운반업체</option>
              <option value="processor">처리업체</option>
            </select>
          </div>
          <div class="form-group">
            <label>사업자등록번호</label>
            <input
              type="text"
              v-model="companyForm.business_number"
              required
            />
          </div>
          <div class="form-group">
            <label>대표자명</label>
            <input
              type="text"
              v-model="companyForm.owner_name"
              required
            />
          </div>
          <div class="form-group">
            <label>연락처</label>
            <input
              type="tel"
              v-model="companyForm.phone"
              required
            />
          </div>
          <div class="form-group">
            <label>이메일</label>
            <input
              type="email"
              v-model="companyForm.email"
              required
            />
          </div>
          <div class="form-group">
            <label>주소</label>
            <input
              type="text"
              v-model="companyForm.address"
              required
            />
          </div>
          <div class="dialog-actions">
            <button type="button" @click="closeDialog">취소</button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 기업 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog-overlay">
      <div class="dialog detail-dialog">
        <h2>기업 상세</h2>
        <div class="company-detail">
          <div class="detail-header">
            <h3>{{ selectedCompany.name }}</h3>
            <div class="detail-info">
              <span>업체구분: {{ getCompanyTypeText(selectedCompany.type) }}</span>
              <span :class="['status-badge', getStatusClass(selectedCompany.status)]">
                {{ getStatusText(selectedCompany.status) }}
              </span>
            </div>
          </div>
          <div class="detail-content">
            <p><strong>사업자등록번호:</strong> {{ selectedCompany.business_number }}</p>
            <p><strong>대표자명:</strong> {{ selectedCompany.owner_name }}</p>
            <p><strong>연락처:</strong> {{ selectedCompany.phone }}</p>
            <p><strong>이메일:</strong> {{ selectedCompany.email }}</p>
            <p><strong>주소:</strong> {{ selectedCompany.address }}</p>
            <p><strong>등록일:</strong> {{ formatDate(selectedCompany.created_at) }}</p>
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
        <h2>기업 삭제</h2>
        <p>정말로 이 기업을 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteCompany">삭제</button>
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
import { companyService } from '@/services/company'

// 상태
const companies = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const companyTypeFilter = ref('')
const statusFilter = ref('')
const showDialog = ref(false)
const showDetailDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedCompany = ref(null)

// 폼 데이터
const companyForm = ref({
  name: '',
  type: '',
  business_number: '',
  owner_name: '',
  phone: '',
  email: '',
  address: ''
})

// 사용자 스토어
const userStore = useUserStore()

// 권한 체크
const hasPermission = (action) => {
  const role = userStore.user?.role
  if (!role) return false

  const permissions = {
    admin: ['create', 'view', 'edit', 'delete'],
    manager: ['view'],
    staff: ['view']
  }

  return permissions[role]?.includes(action) || false
}

// 업체구분 텍스트
const companyTypeTexts = {
  transporter: '운반업체',
  processor: '처리업체'
}

// 상태 클래스
const statusClasses = {
  active: 'status-active',
  inactive: 'status-inactive'
}

// 상태 텍스트
const statusTexts = {
  active: '활성',
  inactive: '비활성'
}

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd', { locale: ko })
}

// 업체구분 텍스트 가져오기
const getCompanyTypeText = (type) => {
  return companyTypeTexts[type] || type
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

// 기업 목록 로드
const loadCompanies = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        type: companyTypeFilter.value,
        status: statusFilter.value
      }
      const data = await companyService.getCompanies(params)
      companies.value = data.companies
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadCompanies()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadCompanies()
}

// 기업 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  companyForm.value = {
    name: '',
    type: '',
    business_number: '',
    owner_name: '',
    phone: '',
    email: '',
    address: ''
  }
  showDialog.value = true
}

// 기업 수정 다이얼로그 열기
const editCompany = (company) => {
  isEdit.value = true
  selectedCompany.value = company
  companyForm.value = { ...company }
  showDialog.value = true
}

// 기업 상세 보기
const viewCompany = async (company) => {
  try {
    await withLoading(async () => {
      const data = await companyService.getCompany(company.id)
      selectedCompany.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 기업 삭제 확인
const confirmDelete = (company) => {
  selectedCompany.value = company
  showDeleteConfirm.value = true
}

// 기업 삭제
const deleteCompany = async () => {
  try {
    await withLoading(async () => {
      await companyService.deleteCompany(selectedCompany.value.id)
      showDeleteConfirm.value = false
      loadCompanies()
    })
  } catch (error) {
    showError(error)
  }
}

// 기업 저장
const submitCompany = async () => {
  try {
    await withLoading(async () => {
      if (isEdit.value) {
        await companyService.updateCompany(selectedCompany.value.id, companyForm.value)
      } else {
        await companyService.createCompany(companyForm.value)
      }

      showDialog.value = false
      loadCompanies()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedCompany.value = null
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedCompany.value = null
}

onMounted(() => {
  loadCompanies()
})
</script>

<style scoped>
.company-management {
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

.company-list {
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
.form-group select {
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

.company-detail {
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