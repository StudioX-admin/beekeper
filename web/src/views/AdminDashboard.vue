<template>
  <div class="admin-dashboard">
    <h1 class="page-title">관리자 대시보드</h1>
    
    <div class="dashboard-grid">
      <!-- 상태 요약 섹션 -->
      <div class="dashboard-section status-section">
        <div class="section-header">
          <h2 class="section-title">폐기물 요청 현황</h2>
          <router-link to="/waste-requests" class="view-all-link">모두 보기</router-link>
        </div>
        
        <div class="status-cards">
          <div class="status-card pending">
            <div class="status-icon">🕒</div>
            <div class="status-value">{{ dashboardData?.requestStats?.pending || 0 }}</div>
            <div class="status-label">대기 중</div>
          </div>
          
          <div class="status-card assigned">
            <div class="status-icon">📋</div>
            <div class="status-value">{{ dashboardData?.requestStats?.assigned || 0 }}</div>
            <div class="status-label">배정됨</div>
          </div>
          
          <div class="status-card in-progress">
            <div class="status-icon">🚚</div>
            <div class="status-value">{{ dashboardData?.requestStats?.inProgress || 0 }}</div>
            <div class="status-label">수거 중</div>
          </div>
          
          <div class="status-card completed">
            <div class="status-icon">✅</div>
            <div class="status-value">{{ dashboardData?.requestStats?.completed || 0 }}</div>
            <div class="status-label">완료됨</div>
          </div>
        </div>
      </div>
      
      <!-- 차량 현황 섹션 -->
      <div class="dashboard-section vehicle-section">
        <div class="section-header">
          <h2 class="section-title">차량 현황</h2>
          <router-link to="/vehicles" class="view-all-link">모두 보기</router-link>
        </div>
        
        <div class="status-cards">
          <div class="status-card available">
            <div class="status-icon">🟢</div>
            <div class="status-value">{{ dashboardData?.vehicleStats?.available || 0 }}</div>
            <div class="status-label">사용 가능</div>
          </div>
          
          <div class="status-card in-use">
            <div class="status-icon">🔄</div>
            <div class="status-value">{{ dashboardData?.vehicleStats?.inUse || 0 }}</div>
            <div class="status-label">운행 중</div>
          </div>
          
          <div class="status-card maintenance">
            <div class="status-icon">🔧</div>
            <div class="status-value">{{ dashboardData?.vehicleStats?.maintenance || 0 }}</div>
            <div class="status-label">정비 중</div>
          </div>
          
          <div class="status-card total">
            <div class="status-icon">🚛</div>
            <div class="status-value">{{ dashboardData?.vehicleStats?.total || 0 }}</div>
            <div class="status-label">전체 차량</div>
          </div>
        </div>
      </div>
      
      <!-- 최근 요청 섹션 -->
      <div class="dashboard-section recent-section">
        <div class="section-header">
          <h2 class="section-title">최근 요청</h2>
        </div>
        
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
        
        <div v-else-if="!dashboardData?.recentRequests?.length" class="empty-state">
          <p>최근 요청이 없습니다.</p>
        </div>
        
        <div v-else class="recent-requests">
          <div v-for="request in dashboardData.recentRequests" :key="request._id" class="request-item">
            <div class="request-header">
              <span class="request-id">{{ request.requestId }}</span>
              <span class="request-status" :class="request.status">
                {{ $formatStatus(request.status) }}
              </span>
            </div>
            
            <div class="request-address">
              {{ request.address }}
            </div>
            
            <div class="request-info">
              <div class="info-row">
                <span class="info-label">폐기물 유형:</span>
                <span class="info-value">{{ $formatWasteType(request.wasteType) }}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">수량:</span>
                <span class="info-value">{{ request.quantity }}kg</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">요청일:</span>
                <span class="info-value">{{ $formatDate(request.requestDate) }}</span>
              </div>
            </div>
            
            <router-link :to="`/waste-requests/${request._id}`" class="view-details-btn">
              상세보기
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- 차트 섹션 -->
      <div class="dashboard-section chart-section">
        <div class="section-header">
          <h2 class="section-title">일별 완료 현황</h2>
        </div>
        
        <div v-if="loading" class="loading-indicator">
          <div class="spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
        
        <div v-else-if="!dailyCompletedData.labels.length" class="empty-state">
          <p>완료된 요청 데이터가 없습니다.</p>
        </div>
        
        <div v-else class="chart-container">
          <canvas ref="completionChart"></canvas>
        </div>
      </div>
      
      <!-- 빠른 작업 섹션 -->
      <div class="dashboard-section actions-section">
        <div class="section-header">
          <h2 class="section-title">빠른 작업</h2>
        </div>
        
        <div class="action-buttons">
          <router-link to="/waste-requests/create" class="action-button">
            <div class="action-icon">➕</div>
            <span class="action-text">새 수거 요청</span>
          </router-link>
          
          <router-link to="/vehicles" class="action-button">
            <div class="action-icon">🚚</div>
            <span class="action-text">차량 관리</span>
          </router-link>
          
          <router-link to="/drivers" class="action-button">
            <div class="action-icon">👨‍💼</div>
            <span class="action-text">기사 관리</span>
          </router-link>
          
          <router-link to="/waste-requests" class="action-button">
            <div class="action-icon">📋</div>
            <span class="action-text">요청 목록</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Chart from 'chart.js/auto'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      chart: null
    }
  },
  computed: {
    ...mapGetters(['dashboardData', 'loading']),
    dailyCompletedData() {
      if (!this.dashboardData || !this.dashboardData.dailyCompletedRequests) {
        return { labels: [], data: [] }
      }
      
      const daily = this.dashboardData.dailyCompletedRequests
      return {
        labels: daily.map(item => {
          const date = new Date(item._id)
          return `${date.getMonth() + 1}/${date.getDate()}`
        }),
        data: daily.map(item => item.count)
      }
    }
  },
  async created() {
    try {
      await this.fetchDashboardData()
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error)
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.dailyCompletedData.labels.length > 0) {
        this.createChart()
      }
    })
  },
  updated() {
    this.$nextTick(() => {
      if (this.dailyCompletedData.labels.length > 0 && !this.chart) {
        this.createChart()
      }
    })
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    ...mapActions(['fetchDashboardData']),
    createChart() {
      const ctx = this.$refs.completionChart.getContext('2d')
      
      if (this.chart) {
        this.chart.destroy()
      }
      
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.dailyCompletedData.labels,
          datasets: [{
            label: '완료된 수거 요청',
            data: this.dailyCompletedData.data,
            backgroundColor: 'rgba(76, 175, 80, 0.6)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.dashboard-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.view-all-link {
  font-size: 14px;
  color: #4caf50;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

/* 상태 카드 스타일 */
.status-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.status-card {
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  background-color: #f9f9f9;
}

.status-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.status-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
}

.status-label {
  font-size: 12px;
  color: #666;
}

.status-card.pending {
  background-color: #fff8e1;
}

.status-card.pending .status-value {
  color: #ff8f00;
}

.status-card.assigned {
  background-color: #e3f2fd;
}

.status-card.assigned .status-value {
  color: #1976d2;
}

.status-card.in-progress {
  background-color: #e8f5e9;
}

.status-card.in-progress .status-value {
  color: #43a047;
}

.status-card.completed {
  background-color: #e8f5e9;
}

.status-card.completed .status-value {
  color: #2e7d32;
}

.status-card.available {
  background-color: #e8f5e9;
}

.status-card.available .status-value {
  color: #43a047;
}

.status-card.in-use {
  background-color: #e3f2fd;
}

.status-card.in-use .status-value {
  color: #1976d2;
}

.status-card.maintenance {
  background-color: #fff8e1;
}

.status-card.maintenance .status-value {
  color: #ff8f00;
}

.status-card.total {
  background-color: #f5f5f5;
}

.status-card.total .status-value {
  color: #333;
}

/* 최근 요청 스타일 */
.recent-section {
  grid-column: 1;
  grid-row: 2 / 4;
}

.recent-requests {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.request-item {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 15px;
  position: relative;
}

.request-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.request-id {
  font-weight: 600;
  color: #333;
}

.request-status {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
}

.request-status.pending {
  background-color: #fff8e1;
  color: #ff8f00;
}

.request-status.assigned {
  background-color: #e3f2fd;
  color: #1976d2;
}

.request-status.in-progress {
  background-color: #e8f5e9;
  color: #43a047;
}

.request-status.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.request-address {
  font-weight: 500;
  margin-bottom: 10px;
  color: #333;
}

.request-info {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  font-size: 14px;
  margin-bottom: 5px;
}

.info-label {
  width: 100px;
  color: #666;
}

.view-details-btn {
  position: absolute;
  bottom: 15px;
  right: 15px;
  padding: 5px 10px;
  font-size: 12px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  text-decoration: none;
}

.view-details-btn:hover {
  background-color: #f5f5f5;
}

/* 차트 섹션 스타일 */
.chart-section {
  grid-column: 2;
  grid-row: 2;
}

.chart-container {
  height: 250px;
}

/* 빠른 작업 섹션 스타일 */
.actions-section {
  grid-column: 2;
  grid-row: 3;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #f1f1f1;
}

.action-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.action-text {
  font-size: 14px;
}

/* 로딩 인디케이터 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #999;
}

/* 반응형 스타일 */
@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .status-section,
  .vehicle-section,
  .recent-section,
  .chart-section,
  .actions-section {
    grid-column: 1;
  }
  
  .status-section {
    grid-row: 1;
  }
  
  .vehicle-section {
    grid-row: 2;
  }
  
  .recent-section {
    grid-row: 3;
  }
  
  .chart-section {
    grid-row: 4;
  }
  
  .actions-section {
    grid-row: 5;
  }
}

@media (max-width: 768px) {
  .status-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
