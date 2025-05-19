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
        <div class="metric-title">오늘의 예약</div>
        <div class="metric-value">{{ todayReservations }}</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">이번 주 예약</div>
        <div class="metric-value">{{ weeklyReservations }}</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">활성 차량</div>
        <div class="metric-value">{{ activeVehicles }}</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">활성 운전자</div>
        <div class="metric-value">{{ activeDrivers }}</div>
      </div>
    </div>

    <!-- 최근 예약 -->
    <div class="dashboard-content">
      <div class="recent-reservations">
        <h2>최근 예약</h2>
        <table>
          <thead>
            <tr>
              <th>예약번호</th>
              <th>처리업체</th>
              <th>수거일시</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reservation in recentReservations" :key="reservation.id">
              <td>{{ reservation.id }}</td>
              <td>{{ reservation.processor_name }}</td>
              <td>{{ formatDateTime(reservation.pickup_date) }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(reservation.status)]">
                  {{ getStatusText(reservation.status) }}
                </span>
              </td>
              <td>
                <button
                  class="detail-btn"
                  @click="$router.push(`/transporter/reservations/${reservation.id}`)"
                >
                  상세보기
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 일정 -->
      <div class="today-schedules">
        <h2>오늘의 일정</h2>
        <div class="timeline">
          <div
            v-for="schedule in todaySchedules"
            :key="schedule.id"
            class="timeline-item"
          >
            <div class="timeline-time">{{ schedule.time }}</div>
            <div class="timeline-content">
              <div class="timeline-title">{{ schedule.title }}</div>
              <div class="timeline-location">{{ schedule.location }}</div>
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
import { transporterDashboardService } from '@/services/dashboard'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'

// 상태
const todayReservations = ref(0)
const weeklyReservations = ref(0)
const activeVehicles = ref(0)
const activeDrivers = ref(0)
const recentReservations = ref([])
const todaySchedules = ref([])

// 상태별 클래스
const statusClasses = {
  requested: 'status-requested',
  approved: 'status-approved',
  rejected: 'status-rejected',
  cancelled: 'status-cancelled',
  in_progress: 'status-in-progress',
  completed: 'status-completed'
}

// 상태별 텍스트
const statusTexts = {
  requested: '예약신청',
  approved: '예약승인',
  rejected: '예약반려',
  cancelled: '예약취소',
  in_progress: '운반중',
  completed: '완료'
}

// 날짜 포맷
const formatDateTime = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko })
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

// 데이터 로드
const loadDashboardData = async () => {
  try {
    await withLoading(async () => {
      // 주요 지표 로드
      const metrics = await transporterDashboardService.getMetrics()
      todayReservations.value = metrics.todayReservations
      weeklyReservations.value = metrics.weeklyReservations
      activeVehicles.value = metrics.activeVehicles
      activeDrivers.value = metrics.activeDrivers

      // 최근 예약 로드
      recentReservations.value = await transporterDashboardService.getRecentReservations()

      // 오늘의 일정 로드
      todaySchedules.value = await transporterDashboardService.getTodaySchedules()
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

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
}
</style> 