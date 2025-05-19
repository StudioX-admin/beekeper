<template>
  <div class="inquiry-list">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn">
          <img src="../../assets/images/icon_back.png" alt="">
        </RouterLink>
        <span class="title">문의하기</span>
      </div>
      <RouterLink to="/customer/inquiry/register" class="add_btn">
        <img src="../../assets/images/icon_add.png" alt="">
      </RouterLink>
    </div>

    <!-- 검색 -->
    <div class="search_box">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="검색어를 입력하세요"
        @input="handleSearch"
      >
      <img src="../../assets/images/icon_search.png" alt="">
    </div>

    <!-- 상태 필터 -->
    <div class="filter_box">
      <select v-model="selectedStatus" @change="handleFilter">
        <option value="">전체</option>
        <option value="PENDING">답변 대기</option>
        <option value="IN_PROGRESS">답변 중</option>
        <option value="COMPLETED">답변 완료</option>
      </select>
    </div>

    <!-- 문의 목록 -->
    <div class="inquiry_items" v-if="inquiries.length > 0">
      <div v-for="inquiry in inquiries" :key="inquiry.id" class="inquiry_item" @click="showDetail(inquiry)">
        <div class="inquiry_info">
          <div class="inquiry_title">
            <span :class="['status_badge', inquiry.status.toLowerCase()]">
              {{ getStatusName(inquiry.status) }}
            </span>
            {{ inquiry.title }}
          </div>
          <div class="inquiry_date">
            {{ formatDate(inquiry.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div class="empty_state" v-else>
      <img src="../../assets/images/empty_state.png" alt="">
      <p>등록된 문의가 없습니다.</p>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page_btn"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        이전
      </button>
      <span class="page_info">{{ currentPage }} / {{ totalPages }}</span>
      <button
        class="page_btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        다음
      </button>
    </div>

    <!-- 상세 정보 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog_overlay" @click="closeDetail">
      <div class="dialog" @click.stop>
        <h2>문의 상세</h2>
        <div class="dialog_content">
          <div class="inquiry_detail">
            <div class="inquiry_detail_title">
              <span :class="['status_badge', selectedInquiry.status.toLowerCase()]">
                {{ getStatusName(selectedInquiry.status) }}
              </span>
              {{ selectedInquiry.title }}
            </div>
            <div class="inquiry_detail_date">
              {{ formatDate(selectedInquiry.createdAt) }}
            </div>
            <div class="inquiry_detail_content">
              {{ selectedInquiry.content }}
            </div>
            <div v-if="selectedInquiry.answer" class="inquiry_detail_answer">
              <h3>답변</h3>
              <p>{{ selectedInquiry.answer }}</p>
              <div class="answer_date">
                {{ formatDate(selectedInquiry.answeredAt) }}
              </div>
            </div>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeDetail">닫기</button>
          <template v-if="isAdmin && selectedInquiry.status !== 'COMPLETED'">
            <button @click="openAnswerDialog" class="action_btn">답변하기</button>
          </template>
          <template v-if="!isAdmin && selectedInquiry.status === 'PENDING'">
            <button @click="editInquiry" class="action_btn">수정</button>
            <button @click="deleteInquiry" class="delete_btn">삭제</button>
          </template>
        </div>
      </div>
    </div>

    <!-- 답변 다이얼로그 -->
    <div v-if="showAnswerDialog" class="dialog_overlay" @click="closeAnswerDialog">
      <div class="dialog" @click.stop>
        <h2>답변 작성</h2>
        <div class="dialog_content">
          <div class="answer_form">
            <textarea
              v-model="answerContent"
              placeholder="답변 내용을 입력하세요"
              rows="5"
              required
            ></textarea>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeAnswerDialog">취소</button>
          <button @click="submitAnswer" class="action_btn" :disabled="isLoading">
            {{ isLoading ? '답변 중...' : '답변하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { useAuth } from '@/composables/useAuth'
import { customerService } from '@/services/customer'

const router = useRouter()
const { showError } = useErrorHandler()
const { isLoading, withLoading } = useLoading()
const { user } = useAuth()

// 관리자 여부
const isAdmin = computed(() => user.value?.role === 'ADMIN')

// 상태
const inquiries = ref([])
const searchQuery = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const showDetailDialog = ref(false)
const selectedInquiry = ref(null)
const showAnswerDialog = ref(false)
const answerContent = ref('')

// 문의 목록 로드
const loadInquiries = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: selectedStatus.value
      }
      const response = await customerService.getInquiries(params)
      inquiries.value = response.items
      totalPages.value = response.totalPages
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

// 필터 처리
const handleFilter = () => {
  currentPage.value = 1
  loadInquiries()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadInquiries()
}

// 상세 정보 표시
const showDetail = (inquiry) => {
  selectedInquiry.value = inquiry
  showDetailDialog.value = true
}

// 상세 정보 닫기
const closeDetail = () => {
  showDetailDialog.value = false
  selectedInquiry.value = null
}

// 문의 수정
const editInquiry = () => {
  router.push(`/customer/inquiry/edit/${selectedInquiry.value.id}`)
}

// 문의 삭제
const deleteInquiry = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await withLoading(async () => {
      await customerService.deleteInquiry(selectedInquiry.value.id)
      closeDetail()
      loadInquiries()
    })
  } catch (error) {
    showError(error)
  }
}

// 답변 다이얼로그 표시
const openAnswerDialog = () => {
  answerContent.value = ''
  showAnswerDialog.value = true
}

// 답변 다이얼로그 닫기
const closeAnswerDialog = () => {
  showAnswerDialog.value = false
  answerContent.value = ''
}

// 답변 제출
const submitAnswer = async () => {
  if (!answerContent.value.trim()) {
    alert('답변 내용을 입력해주세요.')
    return
  }

  try {
    await withLoading(async () => {
      await customerService.answerInquiry(selectedInquiry.value.id, {
        answer: answerContent.value
      })
      closeAnswerDialog()
      closeDetail()
      loadInquiries()
    })
  } catch (error) {
    showError(error)
  }
}

// 유틸리티 함수
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusName = (status) => {
  const statusMap = {
    PENDING: '답변 대기',
    IN_PROGRESS: '답변 중',
    COMPLETED: '답변 완료'
  }
  return statusMap[status] || status
}

onMounted(() => {
  loadInquiries()
})
</script>

<style scoped>
.inquiry-list {
  padding: 20px;
}

.sub_top_title {
  padding: 14px 16px;
  border-bottom: 1px solid #F2F2F2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub_top_title > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub_top_title .title {
  font-weight: 600;
  font-size: 18px;
  line-height: 28px;
}

.sub_top_title .back_btn,
.sub_top_title .add_btn {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub_top_title .back_btn > img,
.sub_top_title .add_btn > img {
  width: 100%;
}

.search_box {
  position: relative;
  margin: 20px 0;
}

.search_box input {
  width: 100%;
  padding: 12px 40px 12px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search_box img {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
}

.filter_box {
  margin-bottom: 20px;
}

.filter_box select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
}

.inquiry_items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inquiry_item {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.inquiry_info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inquiry_title {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status_badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status_badge.pending {
  background-color: #FFF3E0;
  color: #E65100;
}

.status_badge.in_progress {
  background-color: #E3F2FD;
  color: #1565C0;
}

.status_badge.completed {
  background-color: #E8F5E9;
  color: #2E7D32;
}

.inquiry_date {
  font-size: 14px;
  color: #666;
}

.empty_state {
  text-align: center;
  padding: 40px 0;
}

.empty_state img {
  width: 120px;
  margin-bottom: 16px;
}

.empty_state p {
  color: #666;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page_btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.page_btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page_info {
  font-size: 14px;
  color: #666;
}

.dialog_overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.dialog h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog_content {
  margin-bottom: 20px;
}

.inquiry_detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inquiry_detail_title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.inquiry_detail_date {
  font-size: 14px;
  color: #666;
}

.inquiry_detail_content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.inquiry_detail_answer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.inquiry_detail_answer h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.inquiry_detail_answer p {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.answer_date {
  font-size: 12px;
  color: #666;
}

.dialog_actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog_actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action_btn {
  background-color: #FED15E;
  color: #000;
  font-weight: 600;
}

.delete_btn {
  background-color: #FFEBEE;
  color: #D32F2F;
  font-weight: 600;
}

.answer_form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
}

@media (max-width: 768px) {
  .inquiry-list {
    padding: 16px;
  }

  .search_box input,
  .filter_box select {
    font-size: 16px; /* iOS에서 자동 확대 방지 */
  }

  .dialog {
    margin: 16px;
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style> 