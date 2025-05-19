<template>
  <div class="notice-board">
    <div class="page-header">
      <h1>공지사항</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        공지사항 등록
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
        <select v-model="categoryFilter" @change="handleSearch">
          <option value="">전체 카테고리</option>
          <option value="general">일반</option>
          <option value="maintenance">시스템 점검</option>
          <option value="update">업데이트</option>
        </select>
      </div>
    </div>

    <!-- 공지사항 목록 -->
    <div class="notice-list">
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>카테고리</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="notice in notices" :key="notice.id">
            <td>{{ notice.id }}</td>
            <td>{{ getCategoryText(notice.category) }}</td>
            <td>{{ notice.title }}</td>
            <td>{{ notice.author }}</td>
            <td>{{ formatDate(notice.created_at) }}</td>
            <td>{{ notice.views }}</td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewNotice(notice)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit')"
                  class="edit-btn"
                  @click="editNotice(notice)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete')"
                  class="delete-btn"
                  @click="confirmDelete(notice)"
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

    <!-- 공지사항 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '공지사항 수정' : '공지사항 등록' }}</h2>
        <form @submit.prevent="submitNotice">
          <div class="form-group">
            <label>카테고리</label>
            <select v-model="noticeForm.category" required>
              <option value="general">일반</option>
              <option value="maintenance">시스템 점검</option>
              <option value="update">업데이트</option>
            </select>
          </div>
          <div class="form-group">
            <label>제목</label>
            <input
              type="text"
              v-model="noticeForm.title"
              required
            />
          </div>
          <div class="form-group">
            <label>내용</label>
            <textarea
              v-model="noticeForm.content"
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

    <!-- 삭제 확인 다이얼로그 -->
    <div v-if="showDeleteConfirm" class="dialog-overlay">
      <div class="dialog">
        <h2>공지사항 삭제</h2>
        <p>정말로 이 공지사항을 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteNotice">삭제</button>
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
import { noticeService } from '@/services/notice'

// 상태
const notices = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const categoryFilter = ref('')
const showDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedNotice = ref(null)

// 폼 데이터
const noticeForm = ref({
  category: 'general',
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
    admin: ['create', 'view', 'edit', 'delete'],
    manager: ['view']
  }

  return permissions[role]?.includes(action) || false
}

// 카테고리 텍스트
const categoryTexts = {
  general: '일반',
  maintenance: '시스템 점검',
  update: '업데이트'
}

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd', { locale: ko })
}

// 카테고리 텍스트 가져오기
const getCategoryText = (category) => {
  return categoryTexts[category] || category
}

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 공지사항 목록 로드
const loadNotices = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        category: categoryFilter.value
      }
      const data = await noticeService.getNotices(params)
      notices.value = data.notices
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadNotices()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadNotices()
}

// 공지사항 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  noticeForm.value = {
    category: 'general',
    title: '',
    content: '',
    files: []
  }
  showDialog.value = true
}

// 공지사항 수정 다이얼로그 열기
const editNotice = (notice) => {
  isEdit.value = true
  selectedNotice.value = notice
  noticeForm.value = {
    ...notice,
    files: []
  }
  showDialog.value = true
}

// 공지사항 상세 보기
const viewNotice = (notice) => {
  // TODO: 공지사항 상세 페이지로 이동
  console.log('View notice:', notice)
}

// 공지사항 삭제 확인
const confirmDelete = (notice) => {
  selectedNotice.value = notice
  showDeleteConfirm.value = true
}

// 공지사항 삭제
const deleteNotice = async () => {
  try {
    await withLoading(async () => {
      await noticeService.deleteNotice(selectedNotice.value.id)
      showDeleteConfirm.value = false
      loadNotices()
    })
  } catch (error) {
    showError(error)
  }
}

// 파일 변경 처리
const handleFileChange = (event) => {
  noticeForm.value.files = Array.from(event.target.files)
}

// 공지사항 저장
const submitNotice = async () => {
  try {
    await withLoading(async () => {
      const formData = new FormData()
      formData.append('category', noticeForm.value.category)
      formData.append('title', noticeForm.value.title)
      formData.append('content', noticeForm.value.content)
      noticeForm.value.files.forEach(file => {
        formData.append('files', file)
      })

      if (isEdit.value) {
        await noticeService.updateNotice(selectedNotice.value.id, formData)
      } else {
        await noticeService.createNotice(formData)
      }

      showDialog.value = false
      loadNotices()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedNotice.value = null
}

onMounted(() => {
  loadNotices()
})
</script>

<style scoped>
.notice-board {
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

.notice-list {
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