<template>
  <div class="notifications">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn"><img src="../../assets/images/icon_back.png" alt=""></RouterLink>
        <span class="title">알림</span>
      </div>
    </div>

    <!-- 알림 목록 -->
    <div class="notification_list">
      <div v-if="notifications.length === 0" class="empty_state">
        <p>새로운 알림이 없습니다.</p>
      </div>
      <div v-else class="notification_items">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification_item"
          :class="{ unread: !notification.is_read }"
          @click="viewNotification(notification)"
        >
          <div class="notification_icon">
            <img :src="getNotificationIcon(notification.type)" :alt="notification.type">
          </div>
          <div class="notification_content">
            <p class="message">{{ notification.message }}</p>
            <span class="date">{{ formatDate(notification.created_at) }}</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { notificationService } from '@/services/notification'

// 상태
const notifications = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 알림 아이콘
const getNotificationIcon = (type) => {
  const icons = {
    'waste': '../../assets/images/icon_waste.png',
    'transport': '../../assets/images/icon_transport.png',
    'inquiry': '../../assets/images/icon_inquiry.png',
    'system': '../../assets/images/icon_system.png'
  }
  return icons[type] || icons.system
}

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy.MM.dd HH:mm', { locale: ko })
}

// 알림 목록 로드
const loadNotifications = async () => {
  try {
    await withLoading(async () => {
      const data = await notificationService.getNotifications({
        page: currentPage.value
      })
      notifications.value = data.notifications
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadNotifications()
}

// 알림 상세 보기
const viewNotification = async (notification) => {
  try {
    await withLoading(async () => {
      await notificationService.markAsRead(notification.id)
      notification.is_read = true
      
      // 알림 타입에 따른 페이지 이동
      switch (notification.type) {
        case 'waste':
          // 폐기물 상세 페이지로 이동
          break
        case 'transport':
          // 운행 상세 페이지로 이동
          break
        case 'inquiry':
          // 문의사항 상세 페이지로 이동
          break
        default:
          // 시스템 알림은 이동하지 않음
          break
      }
    })
  } catch (error) {
    showError(error)
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notifications {
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

.sub_top_title .back_btn {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub_top_title .back_btn > img {
  width: 100%;
}

.empty_state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.notification_items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification_item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  gap: 12px;
  cursor: pointer;
}

.notification_item.unread {
  background-color: #f8f9fa;
}

.notification_icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification_icon > img {
  width: 24px;
  height: 24px;
}

.notification_content {
  flex: 1;
}

.notification_content .message {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.notification_content .date {
  font-size: 12px;
  color: #999;
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

@media (max-width: 768px) {
  .notification_item {
    padding: 12px;
  }
}
</style> 