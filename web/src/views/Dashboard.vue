<!-- web/src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <h1 class="page-title">대시보드</h1>
    
    <div class="stats-cards">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index">
        <div class="stat-icon" :class="stat.color">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <h2 class="stat-value">{{ stat.value }}</h2>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-grid">
      <div class="grid-item chart-container">
        <h3 class="section-title">월별 폐기물 수거량</h3>
        <canvas ref="monthlyChart"></canvas>
      </div>
      
      <div class="grid-item">
        <h3 class="section-title">최근 수거 요청</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>폐기물 종류</th>
              <th>상태</th>
              <th>요청 일자</th>
              <th>조치</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(request, index) in recentRequests" :key="index">
              <td>{{ request.id }}</td>
              <td>{{ request.type }}</td>
              <td>
                <span :class="getStatusClass(request.status)">
                  {{ request.status }}
                </span>
              </td>
              <td>{{ formatDate(request.date) }}</td>
              <td>
                <button class="btn-view" @click="viewRequest(request.id)">보기</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="grid-item">
        <h3 class="section-title">오늘의 기사 일정</h3>
        <div class="driver-schedule" v-for="(driver, index) in driverSchedule" :key="index">
          <div class="driver-info">
            <div class="driver-avatar">
              <img :src="driver.avatar" :alt="driver.name">
            </div>
            <div class="driver-details">
              <h4>{{ driver.name }}</h4>
              <p>{{ driver.vehicle }}</p>
            </div>
          </div>
          <div class="schedule-timeline">
            <div class="timeline-item" v-for="(task, taskIndex) in driver.tasks" :key="taskIndex">
              <div class="time">{{ task.time }}</div>
              <div class="task-info">
                <div class="location">{{ task.location }}</div>
                <div class="waste-type">{{ task.type }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js'

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: [
        { label: '총 수거 요청', value: '132', icon: 'fas fa-trash', color: 'blue' },
        { label: '진행중', value: '28', icon: 'fas fa-spinner', color: 'orange' },
        { label: '오늘 완료', value: '15', icon: 'fas fa-check-circle', color: 'green' },
        { label: '기사 수', value: '8', icon: 'fas fa-users', color: 'purple' }
      ],
      recentRequests: [
        { id: 'WR-1245', type: '일반 폐기물', status: '대기중', date: '2025-05-12' },
        { id: 'WR-1244', type: '재활용 폐기물', status: '진행중', date: '2025-05-12' },
        { id: 'WR-1243', type: '대형 폐기물', status: '완료', date: '2025-05-11' },
        { id: 'WR-1242', type: '음식물 폐기물', status: '완료', date: '2025-05-11' },
        { id: 'WR-1241', type: '일반 폐기물', status: '취소됨', date: '2025-05-10' }
      ],
      driverSchedule: [
        {
          name: '홍길동',
          avatar: require('@/assets/images/avatar1.png'),
          vehicle: '서울 가 1234 (1톤 트럭)',
          tasks: [
            { time: '09:00', location: '서울시 강남구 테헤란로 123', type: '일반 폐기물' },
            { time: '11:30', location: '서울시 강남구 역삼동 456', type: '재활용 폐기물' },
            { time: '14:00', location: '서울시 서초구 서초동 789', type: '대형 폐기물' }
          ]
        },
        {
          name: '김철수',
          avatar: require('@/assets/images/avatar2.png'),
          vehicle: '서울 나 5678 (2.5톤 트럭)',
          tasks: [
            { time: '10:00', location: '서울시 송파구 잠실동 123', type: '일반 폐기물' },
            { time: '13:00', location: '서울시 강동구 천호동 456', type: '재활용 폐기물' }
          ]
        }
      ]
    }
  },
  mounted() {
    this.renderChart()
  },
  methods: {
    renderChart() {
      const ctx = this.$refs.monthlyChart.getContext('2d')
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['1월', '2월', '3월', '4월', '5월'],
          datasets: [
            {
              label: '일반 폐기물',
              backgroundColor: '#4caf50',
              data: [65, 59, 80, 81, 56]
            },
            {
              label: '재활용 폐기물',
              backgroundColor: '#2196f3',
              data: [45, 39, 60, 71, 46]
            },
            {
              label: '대형 폐기물',
              backgroundColor: '#ff9800',
              data: [30, 25, 40, 35, 30]
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      })
    },
    getStatusClass(status) {
      return {
        '대기중': 'status-pending',
        '진행중': 'status-processing',
        '완료': 'status-completed',
        '취소됨': 'status-cancelled'
      }[status] || ''
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    viewRequest(id) {
      this.$router.push({ name: 'waste-requests', params: { id } })
    }
  }
}
</script>

<style scoped>
/* 퍼블리싱 소스의 대시보드 스타일 적용 */
.dashboard {
  padding-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 20px;
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 24px;
  color: #fff;
}

.stat-icon.blue {
  background-color: #2196f3;
}

.stat-icon.orange {
  background-color: #ff9800;
}

.stat-icon.green {
  background-color: #4caf50;
}

.stat-icon.purple {
  background-color: #9c27b0;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin: 5px 0 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.grid-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 20px;
}

.grid-item:first-child {
  grid-column: span 2;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.chart-container {
  height: 300px;
  position: relative;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f5f5f5;
  padding: 12px 15px;
  text-align: left;
  font-weight: 500;
  border-bottom: 2px solid #ddd;
}

.data-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}

.status-pending {
  color: #ff9800;
  font-weight: 500;
}

.status-processing {
  color: #2196f3;
  font-weight: 500;
}

.status-completed {
  color: #4caf50;
  font-weight: 500;
}

.status-cancelled {
  color: #f44336;
  font-weight: 500;
}

.btn-view {
  padding: 5px 10px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.driver-schedule {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.driver-schedule:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.driver-info {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.driver-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.driver-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.driver-details h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.driver-details p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #666;
}

.schedule-timeline {
  margin-left: 65px;
}

.timeline-item {
  display: flex;
  margin-bottom: 10px;
  position: relative;
}

.timeline-item:before {
  content: '';
  position: absolute;
  left: 32px;
  top: 22px;
  bottom: -15px;
  width: 2px;
  background-color: #eee;
}

.timeline-item:last-child:before {
  display: none;
}

.time {
  width: 70px;
  font-weight: 500;
  color: #2196f3;
}

.task-info {
  flex: 1;
  background-color: #f5f7f9;
  padding: 10px 15px;
  border-radius: 6px;
}

.location {
  font-weight: 500;
  margin-bottom: 5px;
}

.waste-type {
  font-size: 14px;
  color: #666;
}

@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .grid-item:first-child {
    grid-column: span 1;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
