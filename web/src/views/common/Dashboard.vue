<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>대시보드</h1>
      <div class="date-filter">
        <select v-model="period" @change="loadDashboardData">
          <option value="today">오늘</option>
          <option value="week">이번 주</option>
          <option value="month">이번 달</option>
          <option value="year">올해</option>
        </select>
      </div>
    </div>

    <!-- 주요 지표 -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">
          <i class="fas fa-trash"></i>
        </div>
        <div class="metric-content">
          <h3>총 폐기물</h3>
          <div class="metric-value">{{ formatNumber(metrics.totalWaste) }}톤</div>
          <div class="metric-trend" :class="getTrendClass(metrics.wasteTrend)">
            {{ formatTrend(metrics.wasteTrend) }}
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="fas fa-truck"></i>
        </div>
        <div class="metric-content">
          <h3>수거 완료</h3>
          <div class="metric-value">{{ formatNumber(metrics.collectedWaste) }}톤</div>
          <div class="metric-trend" :class="getTrendClass(metrics.collectionTrend)">
            {{ formatTrend(metrics.collectionTrend) }}
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="fas fa-recycle"></i>
        </div>
        <div class="metric-content">
          <h3>처리 완료</h3>
          <div class="metric-value">{{ formatNumber(metrics.treatedWaste) }}톤</div>
          <div class="metric-trend" :class="getTrendClass(metrics.treatmentTrend)">
            {{ formatTrend(metrics.treatmentTrend) }}
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="metric-content">
          <h3>대기 중</h3>
          <div class="metric-value">{{ formatNumber(metrics.pendingWaste) }}톤</div>
          <div class="metric-trend" :class="getTrendClass(metrics.pendingTrend)">
            {{ formatTrend(metrics.pendingTrend) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 차트 섹션 -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3>폐기물 유형별 현황</h3>
        <div class="chart-container">
          <canvas ref="wasteTypeChart"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <h3>일별 처리량 추이</h3>
        <div class="chart-container">
          <canvas ref="dailyTrendChart"></canvas>
        </div>
      </div>
    </div>

    <!-- 최근 활동 -->
    <div class="recent-activities">
      <h3>최근 활동</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="getActivityIconClass(activity.type)">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-info">
              <span>{{ activity.user }}</span>
              <span>{{ formatDate(activity.created_at) }}</span>
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
import Chart from 'chart.js/auto'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { dashboardService } from '@/services/dashboard'

// 상태
const period = ref('month')
const metrics = ref({
  totalWaste: 0,
  collectedWaste: 0,
  treatedWaste: 0,
  pendingWaste: 0,
  wasteTrend: 0,
  collectionTrend: 0,
  treatmentTrend: 0,
  pendingTrend: 0
})
const recentActivities = ref([])
let wasteTypeChart = null
let dailyTrendChart = null

// 차트 참조
const wasteTypeChartRef = ref(null)
const dailyTrendChartRef = ref(null)

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 숫자 포맷
const formatNumber = (number) => {
  return new Intl.NumberFormat('ko-KR').format(number)
}

// 트렌드 포맷
const formatTrend = (trend) => {
  const sign = trend > 0 ? '+' : ''
  return `${sign}${trend}%`
}

// 트렌드 클래스
const getTrendClass = (trend) => {
  if (trend > 0) return 'trend-up'
  if (trend < 0) return 'trend-down'
  return 'trend-neutral'
}

// 활동 아이콘
const getActivityIcon = (type) => {
  const icons = {
    waste: 'fas fa-trash',
    collection: 'fas fa-truck',
    treatment: 'fas fa-recycle',
    user: 'fas fa-user'
  }
  return icons[type] || 'fas fa-info-circle'
}

// 활동 아이콘 클래스
const getActivityIconClass = (type) => {
  const classes = {
    waste: 'activity-waste',
    collection: 'activity-collection',
    treatment: 'activity-treatment',
    user: 'activity-user'
  }
  return classes[type] || 'activity-default'
}

// 날짜 포맷
const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko })
}

// 대시보드 데이터 로드
const loadDashboardData = async () => {
  try {
    await withLoading(async () => {
      const data = await dashboardService.getDashboardData(period.value)
      metrics.value = data.metrics
      recentActivities.value = data.activities
      updateCharts(data.charts)
    })
  } catch (error) {
    showError(error)
  }
}

// 차트 업데이트
const updateCharts = (chartData) => {
  // 폐기물 유형 차트
  if (wasteTypeChart) {
    wasteTypeChart.destroy()
  }
  wasteTypeChart = new Chart(wasteTypeChartRef.value, {
    type: 'doughnut',
    data: {
      labels: chartData.wasteTypes.labels,
      datasets: [{
        data: chartData.wasteTypes.data,
        backgroundColor: ['#4a90e2', '#f5a623', '#7ed321', '#d0021b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })

  // 일별 추이 차트
  if (dailyTrendChart) {
    dailyTrendChart.destroy()
  }
  dailyTrendChart = new Chart(dailyTrendChartRef.value, {
    type: 'line',
    data: {
      labels: chartData.dailyTrend.labels,
      datasets: [{
        label: '처리량',
        data: chartData.dailyTrend.data,
        borderColor: '#4a90e2',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

onMounted(() => {
  loadDashboardData()
})

onUnmounted(() => {
  if (wasteTypeChart) {
    wasteTypeChart.destroy()
  }
  if (dailyTrendChart) {
    dailyTrendChart.destroy()
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-filter select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.metric-icon i {
  font-size: 24px;
  color: #4a90e2;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.metric-trend {
  font-size: 14px;
}

.trend-up {
  color: #7ed321;
}

.trend-down {
  color: #d0021b;
}

.trend-neutral {
  color: #666;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.chart-container {
  height: 300px;
}

.recent-activities {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recent-activities h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.activity-icon i {
  font-size: 16px;
  color: white;
}

.activity-waste {
  background-color: #4a90e2;
}

.activity-collection {
  background-color: #f5a623;
}

.activity-treatment {
  background-color: #7ed321;
}

.activity-user {
  background-color: #9013fe;
}

.activity-default {
  background-color: #666;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
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