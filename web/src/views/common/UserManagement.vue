<template>
  <div class="user-management">
    <div class="page-header">
      <h1>사용자 관리</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        사용자 등록
      </button>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="이름, 이메일로 검색"
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
          <option value="pending">승인 대기</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
          <option value="rejected">거절</option>
        </select>
      </div>
    </div>

    <!-- 사용자 목록 -->
    <div class="user-list">
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>업체구분</th>
            <th>업체명</th>
            <th>권한</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ getCompanyTypeText(user.company_type) }}</td>
            <td>{{ user.company_name }}</td>
            <td>{{ getRoleText(user.role) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(user.status)]">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewUser(user)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit') && canEditUser(user)"
                  class="edit-btn"
                  @click="editUser(user)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete') && canDeleteUser(user)"
                  class="delete-btn"
                  @click="confirmDelete(user)"
                >
                  삭제
                </button>
                <button
                  v-if="hasPermission('approve') && user.status === 'pending'"
                  class="approve-btn"
                  @click="approveUser(user)"
                >
                  승인
                </button>
                <button
                  v-if="hasPermission('reject') && user.status === 'pending'"
                  class="reject-btn"
                  @click="rejectUser(user)"
                >
                  거절
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

    <!-- 사용자 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '사용자 수정' : '사용자 등록' }}</h2>
        <form @submit.prevent="submitUser">
          <div class="form-group">
            <label>이름</label>
            <input
              type="text"
              v-model="userForm.name"
              required
            />
          </div>
          <div class="form-group">
            <label>이메일</label>
            <input
              type="email"
              v-model="userForm.email"
              required
            />
          </div>
          <div class="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              v-model="userForm.password"
              :required="!isEdit"
            />
          </div>
          <div v-if="isAdmin" class="form-group">
            <label>업체구분</label>
            <select v-model="userForm.company_type" required>
              <option value="transporter">운반업체</option>
              <option value="processor">처리업체</option>
            </select>
          </div>
          <div v-if="isAdmin" class="form-group">
            <label>업체명</label>
            <select v-model="userForm.company_id" required>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>권한</label>
            <select v-model="userForm.role" required>
              <option value="manager">매니저</option>
              <option value="staff">일반직원</option>
            </select>
          </div>
          <div class="dialog-actions">
            <button type="button" @click="closeDialog">취소</button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 사용자 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog-overlay">
      <div class="dialog detail-dialog">
        <h2>사용자 상세</h2>
        <div class="user-detail">
          <div class="detail-header">
            <h3>{{ selectedUser.name }}</h3>
            <div class="detail-info">
              <span>이메일: {{ selectedUser.email }}</span>
              <span>권한: {{ getRoleText(selectedUser.role) }}</span>
              <span :class="['status-badge', getStatusClass(selectedUser.status)]">
                {{ getStatusText(selectedUser.status) }}
              </span>
            </div>
          </div>
          <div class="detail-content">
            <p><strong>소속:</strong> {{ selectedUser.company_name }}</p>
            <p><strong>가입일:</strong> {{ formatDate(selectedUser.created_at) }}</p>
            <p v-if="selectedUser.status === 'rejected'">
              <strong>거절 사유:</strong> {{ selectedUser.rejection_reason }}
            </p>
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
        <h2>사용자 삭제</h2>
        <p>정말로 이 사용자를 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteUser">삭제</button>
        </div>
      </div>
    </div>

    <!-- 거절 사유 입력 다이얼로그 -->
    <div v-if="showRejectDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>사용자 거절</h2>
        <form @submit.prevent="submitRejection">
          <div class="form-group">
            <label>거절 사유</label>
            <textarea
              v-model="rejectionReason"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="dialog-actions">
            <button type="button" @click="showRejectDialog = false">취소</button>
            <button type="submit" class="reject-btn">거절</button>
          </div>
        </form>
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
import { ref, onMounted, computed } from 'vue'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useUserStore } from '@/stores/user'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { userService, adminUserService } from '@/services/user'

// 상태
const users = ref([])
const companies = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const companyTypeFilter = ref('')
const statusFilter = ref('')
const showDialog = ref(false)
const showDetailDialog = ref(false)
const showDeleteConfirm = ref(false)
const showRejectDialog = ref(false)
const isEdit = ref(false)
const selectedUser = ref(null)
const rejectionReason = ref('')

// 폼 데이터
const userForm = ref({
  name: '',
  email: '',
  password: '',
  company_type: '',
  company_id: '',
  role: 'staff'
})

// 사용자 스토어
const userStore = useUserStore()

// 관리자 여부
const isAdmin = computed(() => userStore.user?.role === 'admin')

// 권한 체크
const hasPermission = (action) => {
  const role = userStore.user?.role
  if (!role) return false

  const permissions = {
    admin: ['create', 'view', 'edit', 'delete', 'approve', 'reject'],
    manager: ['view', 'edit', 'delete', 'approve', 'reject'],
    staff: ['view']
  }

  return permissions[role]?.includes(action) || false
}

// 업체구분 텍스트
const companyTypeTexts = {
  transporter: '운반업체',
  processor: '처리업체'
}

// 업체구분 텍스트 가져오기
const getCompanyTypeText = (type) => {
  return companyTypeTexts[type] || type
}

// 사용자 수정 가능 여부
const canEditUser = (user) => {
  if (isAdmin.value) return true
  if (userStore.user?.role === 'manager') {
    return user.company_id === userStore.user?.company_id
  }
  return false
}

// 사용자 삭제 가능 여부
const canDeleteUser = (user) => {
  if (isAdmin.value) return true
  if (userStore.user?.role === 'manager') {
    return user.company_id === userStore.user?.company_id && user.role !== 'manager'
  }
  return false
}

// 상태 클래스
const statusClasses = {
  pending: 'status-pending',
  active: 'status-active',
  inactive: 'status-inactive',
  rejected: 'status-rejected'
}

// 상태 텍스트
const statusTexts = {
  pending: '승인 대기',
  active: '활성',
  inactive: '비활성',
  rejected: '거절'
}

// 권한 텍스트
const roleTexts = {
  admin: '관리자',
  manager: '매니저',
  staff: '일반직원'
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

// 권한 텍스트 가져오기
const getRoleText = (role) => {
  return roleTexts[role] || role
}

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 사용자 목록 로드
const loadUsers = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        company_type: companyTypeFilter.value,
        status: statusFilter.value
      }
      const data = isAdmin.value
        ? await adminUserService.getUsers(params)
        : await userService.getUsers(params)
      users.value = data.users
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 업체 목록 로드
const loadCompanies = async () => {
  if (!isAdmin.value) return

  try {
    await withLoading(async () => {
      const data = await adminUserService.getCompanies()
      companies.value = data.companies
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadUsers()
}

// 사용자 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  userForm.value = {
    name: '',
    email: '',
    password: '',
    company_type: '',
    company_id: '',
    role: 'staff'
  }
  showDialog.value = true
}

// 사용자 수정 다이얼로그 열기
const editUser = (user) => {
  isEdit.value = true
  selectedUser.value = user
  userForm.value = {
    ...user,
    password: '' // 비밀번호는 수정 시 필수가 아님
  }
  showDialog.value = true
}

// 사용자 상세 보기
const viewUser = async (user) => {
  try {
    await withLoading(async () => {
      const data = isAdmin.value
        ? await adminUserService.getUser(user.id)
        : await userService.getUser(user.id)
      selectedUser.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 사용자 삭제 확인
const confirmDelete = (user) => {
  selectedUser.value = user
  showDeleteConfirm.value = true
}

// 사용자 삭제
const deleteUser = async () => {
  try {
    await withLoading(async () => {
      if (isAdmin.value) {
        await adminUserService.deleteUser(selectedUser.value.id)
      } else {
        await userService.deleteUser(selectedUser.value.id)
      }
      showDeleteConfirm.value = false
      loadUsers()
    })
  } catch (error) {
    showError(error)
  }
}

// 사용자 승인
const approveUser = async (user) => {
  try {
    await withLoading(async () => {
      await userService.approveUser(user.id)
      loadUsers()
    })
  } catch (error) {
    showError(error)
  }
}

// 사용자 거절 다이얼로그 열기
const rejectUser = (user) => {
  selectedUser.value = user
  rejectionReason.value = ''
  showRejectDialog.value = true
}

// 사용자 거절
const submitRejection = async () => {
  try {
    await withLoading(async () => {
      await userService.rejectUser(selectedUser.value.id, rejectionReason.value)
      showRejectDialog.value = false
      loadUsers()
    })
  } catch (error) {
    showError(error)
  }
}

// 사용자 저장
const submitUser = async () => {
  try {
    await withLoading(async () => {
      if (isEdit.value) {
        if (isAdmin.value) {
          await adminUserService.updateUser(selectedUser.value.id, userForm.value)
        } else {
          await userService.updateUser(selectedUser.value.id, userForm.value)
        }
      } else {
        await adminUserService.createUser(userForm.value)
      }

      showDialog.value = false
      loadUsers()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedUser.value = null
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedUser.value = null
}

onMounted(() => {
  loadUsers()
  if (isAdmin.value) {
    loadCompanies()
  }
})
</script>

<style scoped>
.user-management {
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

.user-list {
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

.status-active {
  background-color: #4a90e2;
  color: white;
}

.status-inactive {
  background-color: #999;
  color: white;
}

.status-rejected {
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

.approve-btn {
  background-color: #7ed321;
  color: white;
}

.reject-btn {
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

.user-detail {
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