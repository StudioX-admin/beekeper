<template>
  <div class="notice-list">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn">
          <img src="../../assets/images/icon_back.png" alt="">
        </RouterLink>
        <span class="title">공지사항</span>
      </div>
      <RouterLink to="/customer/notice/register" class="add_btn" v-if="isAdmin">
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

    <!-- 공지사항 목록 -->
    <div class="notice_items" v-if="notices.length > 0">
      <div v-for="notice in notices" :key="notice.id" class="notice_item" @click="showDetail(notice)">
        <div class="notice_info">
          <div class="notice_title">
            <span class="important_badge" v-if="notice.isImportant">중요</span>
            {{ notice.title }}
          </div>
          <div class="notice_date">
            {{ formatDate(notice.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 빈 상태 -->
    <div class="empty_state" v-else>
      <img src="../../assets/images/empty_state.png" alt="">
      <p>등록된 공지사항이 없습니다.</p>
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
        <h2>공지사항</h2>
        <div class="dialog_content">
          <div class="notice_detail">
            <div class="notice_detail_title">
              <span class="important_badge" v-if="selectedNotice.isImportant">중요</span>
              {{ selectedNotice.title }}
            </div>
            <div class="notice_detail_date">
              {{ formatDate(selectedNotice.createdAt) }}
            </div>
            <div class="notice_detail_content">
              {{ selectedNotice.content }}
            </div>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeDetail">닫기</button>
          <template v-if="isAdmin">
            <button @click="editNotice" class="action_btn">수정</button>
            <button @click="deleteNotice" class="delete_btn">삭제</button>
          </template>
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
const notices = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const showDetailDialog = ref(false)
const selectedNotice = ref(null)

// 공지사항 목록 로드
const loadNotices = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value
      }
      const response = await customerService.getNotices(params)
      notices.value = response.items
      totalPages.value = response.totalPages
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

// 상세 정보 표시
const showDetail = (notice) => {
  selectedNotice.value = notice
  showDetailDialog.value = true
}

// 상세 정보 닫기
const closeDetail = () => {
  showDetailDialog.value = false
  selectedNotice.value = null
}

// 공지사항 수정
const editNotice = () => {
  router.push(`/customer/notice/edit/${selectedNotice.value.id}`)
}

// 공지사항 삭제
const deleteNotice = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await withLoading(async () => {
      await customerService.deleteNotice(selectedNotice.value.id)
      closeDetail()
      // 현재 페이지의 마지막 항목을 삭제한 경우 이전 페이지로 이동
      if (notices.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      loadNotices()
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

onMounted(() => {
  loadNotices()
})
</script>

<style scoped>
.notice-list {
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

.notice_items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice_item {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.notice_info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice_title {
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.important_badge {
  padding: 2px 6px;
  background-color: #FFEBEE;
  color: #D32F2F;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.notice_date {
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

.notice_detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice_detail_title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice_detail_date {
  font-size: 14px;
  color: #666;
}

.notice_detail_content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
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

@media (max-width: 768px) {
  .notice-list {
    padding: 16px;
  }

  .search_box input {
    font-size: 16px; /* iOS에서 자동 확대 방지 */
  }

  .dialog {
    margin: 16px;
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style> 