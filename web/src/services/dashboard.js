import api from '@/utils/api'

// 수거업체 대시보드 서비스
export const transporterDashboardService = {
  // 주요 지표 조회
  async getMetrics() {
    const response = await api.get('/api/transporter/dashboard/metrics')
    return response.data
  },

  // 최근 예약 조회
  async getRecentReservations() {
    const response = await api.get('/api/transporter/dashboard/recent-reservations')
    return response.data
  },

  // 오늘의 일정 조회
  async getTodaySchedules() {
    const response = await api.get('/api/transporter/dashboard/today-schedules')
    return response.data
  }
}

// 처리업체 대시보드 서비스
export const processorDashboardService = {
  // 주요 지표 조회
  async getMetrics() {
    const response = await api.get('/api/processor/dashboard/metrics')
    return response.data
  },

  // 최근 예약 조회
  async getRecentReservations() {
    const response = await api.get('/api/processor/dashboard/recent-reservations')
    return response.data
  },

  // 시설 상태 조회
  async getFacilities() {
    const response = await api.get('/api/processor/dashboard/facilities')
    return response.data
  }
}

// 관리자 대시보드 서비스
export const adminDashboardService = {
  // 주요 지표 조회
  async getMetrics() {
    const response = await api.get('/api/admin/dashboard/metrics')
    return response.data
  },

  // 최근 활동 조회
  async getRecentActivities() {
    const response = await api.get('/api/admin/dashboard/recent-activities')
    return response.data
  },

  // 시스템 상태 조회
  async getSystemStatus() {
    const response = await api.get('/api/admin/dashboard/system-status')
    return response.data
  }
}

// 대시보드 서비스
export const dashboardService = {
  // 대시보드 데이터 조회
  async getDashboardData(period) {
    const response = await utilsApi.get('/dashboard', {
      params: { period }
    })
    return response.data
  }
} 
