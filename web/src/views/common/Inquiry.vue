<template>
  <div class="inquiry">
    <div class="page-header">
      <h1>1:1 문의</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        문의하기
      </button>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="제목, 내용으로 검색"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="pending">답변 대기</option>
          <option value="answered">답변 완료</option>
        </select>
      </div>
    </div>

    <!-- 문의 목록 -->
    <div class="inquiry-list">
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inquiry in inquiries" :key="inquiry.id">
            <td>{{ inquiry.id }}</td>
            <td>{{ inquiry.title }}</td>
            <td>{{ inquiry.author }}</td>
            <td>{{ formatDate(inquiry.created_at) }}</td>
            <td>
              <span :class="['status', inquiry.status]">
                {{ getStatusText(inquiry.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewInquiry(inquiry)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit') && inquiry.status === 'pending'"
                  class="edit-btn"
                  @click="editInquiry(inquiry)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete') && inquiry.status === 'pending'"
                  class="delete-btn"
                  @click="confirmDelete(inquiry)"
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

    <!-- 문의 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '문의 수정' : '문의하기' }}</h2>
        <form @submit.prevent="submitInquiry">
          <div class="form-group">
            <label>제목</label>
            <input
              type="text"
              v-model="inquiryForm.title"
              required
            />
          </div>
          <div class="form-group">
            <label>내용</label>
            <textarea
              v-model="inquiryForm.content"
              rows="10"
              required
            ></textarea>
          </div>
          <div class="form-group">
            <label>첨부파일</label>
            <input
              type="file"
              @change="handleFileChange"
              multiple
            />
          </div>
          <div class="dialog-actions">
            <button type="button" @click="closeDialog">취소</button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 문의 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog-overlay">
      <div class="dialog detail-dialog">
        <h2>문의 상세</h2>
        <div class="inquiry-detail">
          <div class="detail-header">
            <h3>{{ selectedInquiry.title }}</h3>
            <div class="detail-info">
              <span>작성자: {{ selectedInquiry.author }}</span>
              <span>작성일: {{ formatDate(selectedInquiry.created_at) }}</span>
              <span :class="['status', selectedInquiry.status]">
                {{ getStatusText(selectedInquiry.status) }}
              </span>
            </div>
          </div>
          <div class="detail-content">
            {{ selectedInquiry.content }}
          </div>
          <div v-if="selectedInquiry.files?.length" class="detail-files">
            <h4>첨부파일</h4>
            <ul>
              <li v-for="file in selectedInquiry.files" :key="file.id">
                <a :href="file.url" target="_blank">{{ file.name }}</a>
              </li>
            </ul>
          </div>
          <div v-if="selectedInquiry.answer" class="detail-answer">
            <h4>답변</h4>
            <div class="answer-content">
              {{ selectedInquiry.answer }}
            </div>
            <div class="answer-info">
              <span>답변일: {{ formatDate(selectedInquiry.answered_at) }}</span>
            </div>
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
        <h2>문의 삭제</h2>
        <p>정말로 이 문의를 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteInquiry">삭제</button>
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
import { inquiryService } from '@/services/inquiry'

// 상태
const inquiries = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const showDialog = ref(false)
const showDetailDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedInquiry = ref(null)

// 폼 데이터
const inquiryForm = ref({
  title: '',
  content: '',
  files: []
})

// 권한 체크
const userStore = useUserStore()
const hasPermission = (action) => {
  const role = userStore.user?.role
  if (!role) return false

  const permissions = {
    admin: ['create', 'view', 'edit', 'delete', 'answer'],
    manager: ['create', 'view'],
    staff: ['create', 'view']
  }

  return permissions[role]?.includes(action) || false
}

// 상태 텍스트
const statusTexts = {
  pending: '답변 대기',
  answered: '답변 완료'
}

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd', { locale: ko })
}

// 상태 텍스트 가져오기
const getStatusText = (status) => {
  return statusTexts[status] || status
}

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 문의 목록 로드
const loadInquiries = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
      const data = await inquiryService.getInquiries(params)
      inquiries.value = data.inquiries
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadInquiries()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadInquiries()
}

// 문의 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  inquiryForm.value = {
    title: '',
    content: '',
    files: []
  }
  showDialog.value = true
}

// 문의 수정 다이얼로그 열기
const editInquiry = (inquiry) => {
  isEdit.value = true
  selectedInquiry.value = inquiry
  inquiryForm.value = {
    ...inquiry,
    files: []
  }
  showDialog.value = true
}

// 문의 상세 보기
const viewInquiry = async (inquiry) => {
  try {
    await withLoading(async () => {
      const data = await inquiryService.getInquiry(inquiry.id)
      selectedInquiry.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 문의 삭제 확인
const confirmDelete = (inquiry) => {
  selectedInquiry.value = inquiry
  showDeleteConfirm.value = true
}

// 문의 삭제
const deleteInquiry = async () => {
  try {
    await withLoading(async () => {
      await inquiryService.deleteInquiry(selectedInquiry.value.id)
      showDeleteConfirm.value = false
      loadInquiries()
    })
  } catch (error) {
    showError(error)
  }
}

// 파일 변경 처리
const handleFileChange = (event) => {
  inquiryForm.value.files = Array.from(event.target.files)
}

// 문의 저장
const submitInquiry = async () => {
  try {
    await withLoading(async () => {
      const formData = new FormData()
      formData.append('title', inquiryForm.value.title)
      formData.append('content', inquiryForm.value.content)
      inquiryForm.value.files.forEach(file => {
        formData.append('files', file)
      })

      if (isEdit.value) {
        await inquiryService.updateInquiry(selectedInquiry.value.id, formData)
      } else {
        await inquiryService.createInquiry(formData)
      }

      showDialog.value = false
      loadInquiries()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedInquiry.value = null
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedInquiry.value = null
}

onMounted(() => {
  loadInquiries()
})
</script>

<style scoped>
.inquiry {
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

.inquiry-list {
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

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status.pending {
  background-color: #f5a623;
  color: white;
}

.status.answered {
  background-color: #4a90e2;
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

.inquiry-detail {
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
  white-space: pre-wrap;
}

.detail-files {
  margin-bottom: 20px;
}

.detail-files h4 {
  margin: 0 0 10px 0;
}

.detail-files ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-files li {
  margin-bottom: 5px;
}

.detail-files a {
  color: #4a90e2;
  text-decoration: none;
}

.detail-answer {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
}

.detail-answer h4 {
  margin: 0 0 10px 0;
}

.answer-content {
  margin-bottom: 10px;
  white-space: pre-wrap;
}

.answer-info {
  color: #666;
  font-size: 0.9em;
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