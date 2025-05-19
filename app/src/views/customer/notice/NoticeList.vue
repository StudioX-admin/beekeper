<template>
  <div class="notice_list">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn"><img src="../../../assets/images/icon_back.png" alt=""></RouterLink>
        <span class="title">공지사항</span>
      </div>
      <RouterLink to="/news" class="news_btn"><img src="../../../assets/images/icon_bell.png" alt=""></RouterLink>
    </div>

    <!-- 공지사항 목록 -->
    <div class="notice_list">
      <div v-if="notices.length === 0" class="empty_state">
        <p>등록된 공지사항이 없습니다.</p>
      </div>
      <div v-else class="notice_items">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="notice_item"
          @click="viewNotice(notice)"
        >
          <div class="notice_header">
            <span class="title">{{ notice.title }}</span>
            <span v-if="notice.is_important" class="important_badge">중요</span>
          </div>
          <div class="notice_content">
            <p class="preview">{{ notice.content }}</p>
            <div class="meta">
              <span class="date">{{ formatDate(notice.created_at) }}</span>
              <span class="views">조회 {{ notice.views }}</span>
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

    <!-- 공지사항 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>공지사항</h2>
        <div class="dialog_content">
          <div class="notice_detail_header">
            <h3>{{ selectedNotice.title }}</h3>
            <div class="meta">
              <span class="date">{{ formatDate(selectedNotice.created_at) }}</span>
              <span class="views">조회 {{ selectedNotice.views }}</span>
            </div>
          </div>
          <div class="notice_detail_content">
            <p>{{ selectedNotice.content }}</p>
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
import { noticeService } from '@/services/notice'

// 상태
const notices = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const showDetailDialog = ref(false)
const selectedNotice = ref(null)

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy.MM.dd', { locale: ko })
}

// 공지사항 목록 로드
const loadNotices = async () => {
  try {
    await withLoading(async () => {
      const data = await noticeService.getNotices({
        page: currentPage.value
      })
      notices.value = data.notices
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadNotices()
}

// 공지사항 상세 보기
const viewNotice = async (notice) => {
  try {
    await withLoading(async () => {
      const data = await noticeService.getNotice(notice.id)
      selectedNotice.value = data
      showDetailDialog.value = true
    })
  } catch (error) {
    showError(error)
  }
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedNotice.value = null
}

onMounted(() => {
  loadNotices()
})
</script>

<style scoped>
.notice_list {
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

.notice_items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice_item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
}

.notice_header {
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice_header .title {
  flex: 1;
  font-weight: 500;
  font-size: 16px;
}

.important_badge {
  padding: 4px 8px;
  background-color: #d0021b;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.notice_content {
  padding: 16px;
}

.notice_content .preview {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notice_content .meta {
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

.notice_detail_header {
  margin-bottom: 20px;
}

.notice_detail_header h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.notice_detail_header .meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 12px;
}

.notice_detail_content {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.dialog_actions {
  display: flex;
  justify-content: flex-end;
}

.dialog_actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
}

@media (max-width: 768px) {
  .dialog {
    margin: 20px;
  }
}
</style> 