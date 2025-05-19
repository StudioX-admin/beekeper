<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>대시보드</h1>
      <button
        class="refresh-btn"
        :class="{ 'is-loading': isLoading }"
        @click="loadDashboardData"
      >
        새로고침
      </button>
    </div>

    <!-- 주요 지표 -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">전체 회원</div>
        <div class="metric-value">{{ totalUsers }}</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">수거업체</div>
        <div class="metric-value">{{ transporterCount }}</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">처리업체</div>
        <div class="metric-value">{{ processorCount }}</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">오늘의 예약</div>
        <div class="metric-value">{{ todayReservations }}</div>
      </div>
    </div>

    <!-- 최근 활동 -->
    <div class="dashboard-content">
      <div class="recent-activities">
        <h2>최근 활동</h2>
        <table>
          <thead>
            <tr>
              <th>일시</th>
              <th>활동</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in recentActivities" :key="activity.id">
              <td>{{ formatDateTime(activity.created_at) }}</td>
              <td>{{ activity.description }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(activity.status)]">
                  {{ getStatusText(activity.status) }}
                </span>
              </td>
              <td>
                <button
                  class="detail-btn"
                  @click="handleActivityAction(activity)"
                >
                  상세보기
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 시스템 상태 -->
      <div class="system-status">
        <h2>시스템 상태</h2>
        <div class="status-list">
          <div
            v-for="status in systemStatus"
            :key="status.id"
            class="status-item"
          >
            <div class="status-name">{{ status.name }}</div>
            <div class="status-value">
              <span :class="['status-badge', getSystemStatusClass(status.status)]">
                {{ getSystemStatusText(status.status) }}
              </span>
            </div>
          </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { adminDashboardService } from '@/services/dashboard'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'

// 상태
const totalUsers = ref(0)
const transporterCount = ref(0)
const processorCount = ref(0)
const todayReservations = ref(0)
const recentActivities = ref([])
const systemStatus = ref([])

// 상태별 클래스
const statusClasses = {
  pending: 'status-pending',
  processing: 'status-processing',
  completed: 'status-completed',
  failed: 'status-failed'
}

// 시스템 상태별 클래스
const systemStatusClasses = {
  normal: 'status-normal',
  warning: 'status-warning',
  error: 'status-error'
}

// 상태별 텍스트
const statusTexts = {
  pending: '대기중',
  processing: '처리중',
  completed: '완료',
  failed: '실패'
}

// 시스템 상태별 텍스트
const systemStatusTexts = {
  normal: '정상',
  warning: '주의',
  error: '오류'
}

// 날짜 포맷
const formatDateTime = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko })
}

// 상태 클래스 가져오기
const getStatusClass = (status) => {
  return statusClasses[status] || ''
}

// 시스템 상태 클래스 가져오기
const getSystemStatusClass = (status) => {
  return systemStatusClasses[status] || ''
}

// 상태 텍스트 가져오기
const getStatusText = (status) => {
  return statusTexts[status] || status
}

// 시스템 상태 텍스트 가져오기
const getSystemStatusText = (status) => {
  return systemStatusTexts[status] || status
}

// 활동 액션 처리
const handleActivityAction = (activity) => {
  // TODO: 활동 유형에 따른 상세 페이지 이동
  console.log('Activity action:', activity)
}

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 데이터 로드
const loadDashboardData = async () => {
  try {
    await withLoading(async () => {
      // 주요 지표 로드
      const metrics = await adminDashboardService.getMetrics()
      totalUsers.value = metrics.totalUsers
      transporterCount.value = metrics.transporterCount
      processorCount.value = metrics.processorCount
      todayReservations.value = metrics.todayReservations

      // 최근 활동 로드
      recentActivities.value = await adminDashboardService.getRecentActivities()

      // 시스템 상태 로드
      systemStatus.value = await adminDashboardService.getSystemStatus()
    })
  } catch (error) {
    showError(error)
  }
}

// 자동 새로고침 (5분마다)
const REFRESH_INTERVAL = 5 * 60 * 1000
let refreshTimer = null

onMounted(() => {
  loadDashboardData()
  refreshTimer = setInterval(loadDashboardData, REFRESH_INTERVAL)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
/* 기존 CSS 파일의 스타일을 사용하므로 여기서는 최소한의 스타일만 정의 */
.dashboard-container {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style> 