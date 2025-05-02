<template>
  <div class="page-container dashboard-page">
    <!-- 헤더 -->
    <div class="dashboard-header">
      <h1 class="page-title">수거 작업</h1>
      <div class="user-info">{{ user.name }}님</div>
    </div>
    
    <!-- 상태 요약 -->
    <div class="status-summary">
      <div class="status-card">
        <div class="status-value">{{ activeRequests.length }}</div>
        <div class="status-label">할 일</div>
      </div>
      <div class="status-card">
        <div class="status-value">{{ dashboardData?.stats?.completedToday || 0 }}</div>
        <div class="status-label">오늘 완료</div>
      </div>
      <div class="status-card">
        <div class="status-value">{{ vehicleInfo }}</div>
        <div class="status-label">배정 차량</div>
      </div>
    </div>
    
    <!-- 할 일 목록 -->
    <h2 class="section-title">오늘의 할 일</h2>
    
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>데이터를 불러오는 중...</p>
    </div>
    
    <div v-else-if="activeRequests.length === 0" class="empty-state">
      <p>배정된 작업이 없습니다.</p>
    </div>
    
    <div v-else class="request-list">
      <div v-for="request in activeRequests" :key="request._id" class="request-card" @click="viewRequestDetail(request._id)">
        <div class="request-header">
          <span class="request-id">{{ request.requestId }}</span>
          <span class="status-badge" :class="request.status">
            {{ $formatStatus(request.status) }}
          </span>
        </div>
        
        <div class="request-address">
          {{ request.address }}
        </div>
        
        <div class="request-details">
          <div class="detail-row">
            <span class="detail-label">폐기물:</span>
            <span class="detail-value">{{ $formatWasteType(request.wasteType) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">수량:</span>
            <span class="detail-value">{{ request.quantity }}kg</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button 
            v-if="request.status === 'assigned'"
            @click.stop="updateStatus(request._id, 'in-progress')" 
            class="btn btn-primary btn-sm"
          >
            수거 시작
          </button>
          <button 
            v-if="request.status === 'in-progress'"
            @click.stop="updateStatus(request._id, 'completed')" 
            class="btn btn-secondary btn-sm"
          >
            수거 완료
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters(['user', 'activeRequests', 'dashboardData', 'loading']),
    vehicleInfo() {
      if (!this.dashboardData || !this.dashboardData.vehicle) {
        return '미배정'
      }
      return this.dashboardData.vehicle.vehicleId
    }
  },
  async created() {
    try {
      // 대시보드 데이터 로드
      await this.fetchDriverDashboard()
      
      // 활성 요청 목록 로드
      await this.fetchActiveRequests()
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    }
  },
  methods: {
    ...mapActions(['fetchDriverDashboard', 'fetchActiveRequests', 'updateRequestStatus']),
    
    viewRequestDetail(id) {
      this.$router.push({ name: 'RequestDetail', params: { id } })
    },
    
    async updateStatus(id, status) {
      try {
        // 상태 업데이트
        await this.updateRequestStatus({ id, status })
        
        // 완료로 변경한 경우 축하 메시지 표시
        if (status === 'completed') {
          alert('수거 작업이 완료되었습니다!')
        }
      } catch (error) {
        console.error('상태 업데이트 실패:', error)
      }
    }
  }
}
</script>

<style scoped>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  font-size: 16px;
  font-weight: 500;
  color: #666;
}

.status-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.status-card {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 6px;
}

.status-card:first-child {
  margin-left: 0;
}

.status-card:last-child {
  margin-right: 0;
}

.status-value {
  font-size: a24px;
  font-weight: 700;
  color: #4caf50;
  margin-bottom: 8px;
}

.status-label {
  font-size: 14px;
  color: #666;
}

.request-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.request-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.request-id {
  font-weight: 600;
  color: #333;
}

.request-address {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.request-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  margin-bottom: 4px;
}

.detail-label {
  width: 80px;
  color: #666;
}

.detail-value {
  flex: 1;
  color: #333;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}
</style>
