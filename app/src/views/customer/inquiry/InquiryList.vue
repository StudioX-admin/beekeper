<template>
  <div class="inquiry_list">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn"><img src="../../../assets/images/icon_back.png" alt=""></RouterLink>
        <span class="title">1:1 문의사항</span>
      </div>
      <RouterLink to="/news" class="news_btn"><img src="../../../assets/images/icon_bell.png" alt=""></RouterLink>
    </div>

    <!-- 문의사항 목록 -->
    <div class="inquiry_list">
      <div v-if="inquiries.length === 0" class="empty_state">
        <p>등록된 문의사항이 없습니다.</p>
      </div>
      <div v-else class="inquiry_items">
        <div
          v-for="inquiry in inquiries"
          :key="inquiry.id"
          class="inquiry_item"
          @click="viewInquiry(inquiry)"
        >
          <div class="inquiry_header">
            <span class="title">{{ inquiry.title }}</span>
            <span :class="['status_badge', getStatusClass(inquiry.status)]">
              {{ inquiry.status }}
            </span>
          </div>
          <div class="inquiry_content">
            <p class="preview">{{ inquiry.content }}</p>
            <div class="meta">
              <span class="date">{{ formatDate(inquiry.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
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

    <!-- 문의사항 등록 버튼 -->
    <div class="add_button_wrap">
      <button class="add_button" @click="showCreateDialog = true">
        <img src="../../../assets/images/icon_plus.png" alt="">
        문의하기
      </button>
    </div>

    <!-- 문의사항 등록 다이얼로그 -->
    <div v-if="showCreateDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>문의하기</h2>
        <div class="dialog_content">
          <div class="form_group">
            <label>제목</label>
            <input
              type="text"
              v-model="inquiryForm.title"
              placeholder="제목을 입력하세요"
            />
          </div>
          <div class="form_group">
            <label>내용</label>
            <textarea
              v-model="inquiryForm.content"
              placeholder="문의 내용을 입력하세요"
              rows="5"
            ></textarea>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeDialog">취소</button>
          <button @click="submitInquiry" class="submit_btn">등록</button>
        </div>
      </div>
    </div>

    <!-- 문의사항 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>문의사항</h2>
        <div class="dialog_content">
          <div class="inquiry_detail_header">
            <h3>{{ selectedInquiry.title }}</h3>
            <div class="meta">
              <span class="date">{{ formatDate(selectedInquiry.created_at) }}</span>
              <span :class="['status_badge', getStatusClass(selectedInquiry.status)]">
                {{ selectedInquiry.status }}
              </span>
            </div>
          </div>
          <div class="inquiry_detail_content">
            <p>{{ selectedInquiry.content }}</p>
          </div>
          <div v-if="selectedInquiry.answer" class="inquiry_answer">
            <h4>답변</h4>
            <p>{{ selectedInquiry.answer }}</p>
            <span class="answer_date">{{ formatDate(selectedInquiry.answered_at) }}</span>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeDetailDialog">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { inquiryService } from '@/services/inquiry'

// 상태
const inquiries = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const selectedInquiry = ref(null)
const inquiryForm = ref({
  title: '',
  content: ''
})

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 상태 클래스
const getStatusClass = (status) => {
  const classes = {
    '답변대기': 'status_pending',
    '답변완료': 'status_completed'
  }
  return classes[status] || ''
}

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy.MM.dd', { locale: ko })
}

// 문의사항 목록 로드
const loadInquiries = async () => {
  try {
    await withLoading(async () => {
      const data = await inquiryService.getInquiries({
        page: currentPage.value
      })
      inquiries.value = data.inquiries
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadInquiries()
}

// 문의사항 상세 보기
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

// 다이얼로그 닫기
const closeDialog = () => {
  showCreateDialog.value = false
  inquiryForm.value = {
    title: '',
    content: ''
  }
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedInquiry.value = null
}

// 문의사항 등록
const submitInquiry = async () => {
  try {
    await withLoading(async () => {
      await inquiryService.createInquiry(inquiryForm.value)
      closeDialog()
      loadInquiries()
    })
  } catch (error) {
    showError(error)
  }
}

onMounted(() => {
  loadInquiries()
})
</script>

<style scoped>
.inquiry_list {
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
.sub_top_title .news_btn {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub_top_title .back_btn > img,
.sub_top_title .news_btn > img {
  width: 100%;
}

.empty_state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.inquiry_items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inquiry_item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
}

.inquiry_header {
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.inquiry_header .title {
  flex: 1;
  font-weight: 500;
  font-size: 16px;
}

.status_badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status_pending {
  background-color: #f5a623;
  color: white;
}

.status_completed {
  background-color: #7ed321;
  color: white;
}

.inquiry_content {
  padding: 16px;
}

.inquiry_content .preview {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.inquiry_content .meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 12px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
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

.add_button_wrap {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

.add_button {
  height: 48px;
  padding: 0 16px;
  border-radius: 4px;
  background-color: #FED15E;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 600;
}

.add_button > img {
  width: 20px;
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

.form_group {
  margin-bottom: 16px;
}

.form_group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form_group input,
.form_group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form_group textarea {
  resize: vertical;
}

.inquiry_detail_header {
  margin-bottom: 20px;
}

.inquiry_detail_header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.inquiry_detail_header .meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #999;
  font-size: 12px;
}

.inquiry_detail_content {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.inquiry_answer {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.inquiry_answer h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
}

.inquiry_answer p {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.inquiry_answer .answer_date {
  color: #999;
  font-size: 12px;
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

.submit_btn {
  background-color: #FED15E;
  color: #000;
  font-weight: 600;
}

@media (max-width: 768px) {
  .dialog {
    margin: 20px;
  }
}
</style> 