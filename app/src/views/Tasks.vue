<!-- app/src/views/Tasks.vue -->
<template>
  <div class="tasks-page">
    <div class="date-selector">
      <button class="date-nav-btn" @click="prevDay">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="current-date">
        {{ formattedCurrentDate }}
      </div>
      <button class="date-nav-btn" @click="nextDay">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
    
    <div class="task-cards">
      <div 
        v-for="(task, index) in filteredTasks" 
        :key="index"
        class="task-card"
        :class="{ 'completed': task.status === '완료' }"
        @click="viewTaskDetail(task.id)"
      >
        <div class="task-header">
          <span class="task-time">{{ task.time }}</span>
          <span class="task-status" :class="getStatusClass(task.status)">
            {{ task.status }}
          </span>
        </div>
        
        <div class="task-address">
          {{ task.address }}
        </div>
        
        <div class="task-info">
          <div class="info-item">
            <i class="fas fa-trash"></i>
            <span>{{ task.wasteType }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-weight"></i>
            <span>{{ task.weight }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-user"></i>
            <span>{{ task.requester }}</span>
          </div>
        </div>
        
        <div class="task-actions">
          <button 
            v-if="task.status === '대기중'"
            class="btn-start" 
            @click.stop="startTask(task.id)"
          >
            수거 시작
          </button>
          <button 
            v-if="task.status === '진행중'"
            class="btn-complete" 
            @click.stop="completeTask(task.id)"
          >
            수거 완료
          </button>
          <button 
            class="btn-navigate" 
            @click.stop="navigate(task.address)"
          >
            길찾기
          </button>
        </div>
      </div>
      
      <div v-if="filteredTasks.length === 0" class="no-tasks">
        <i class="fas fa-clipboard-check"></i>
        <p>해당 날짜에 예정된 작업이 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tasks',
  data() {
    return {
      currentDate: new Date(),
      tasks: [
        {
          id: 1,
          time: '09:00',
          status: '완료',
          address: '서울시 강남구 테헤란로 123',
          wasteType: '일반 폐기물',
          weight: '약 100kg',
          requester: '(주)에이비씨',
          date: '2025-05-12'
        },
        {
          id: 2,
          time: '11:30',
          status: '진행중',
          address: '서울시 강남구 역삼동 456',
          wasteType: '재활용 폐기물',
          weight: '약 50kg',
          requester: '홍길동',
          date: '2025-05-13'
        },
        {
          id: 3,
          time: '14:00',
          status: '대기중',
          address: '서울시 서초구 서초동 789',
          wasteType: '대형 폐기물',
          weight: '약 200kg',
          requester: '(주)가나다',
          date: '2025-05-13'
        },
        {
          id: 4,
          time: '16:30',
          status: '대기중',
          address: '서울시 송파구 잠실동 123',
          wasteType: '음식물 폐기물',
          weight: '약 80kg',
          requester: '김철수',
          date: '2025-05-14'
        }
      ]
    }
  },
  computed: {
    formattedCurrentDate() {
      const year = this.currentDate.getFullYear()
      const month = String(this.currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(this.currentDate.getDate()).padStart(2, '0')
      
      const weekDays = ['일', '월', '화', '수', '목', '금', '토']
      const weekDay = weekDays[this.currentDate.getDay()]
      
      return `${year}년 ${month}월 ${day}일 (${weekDay})`
    },
    filteredTasks() {
      const dateString = this.formatDateString(this.currentDate)
      return this.tasks.filter(task => task.date === dateString)
    }
  },
  methods: {
    formatDateString(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    prevDay() {
      const newDate = new Date(this.currentDate)
      newDate.setDate(newDate.getDate() - 1)
      this.currentDate = newDate
    },
    nextDay() {
      const newDate = new Date(this.currentDate)
      newDate.setDate(newDate.getDate() + 1)
      this.currentDate = newDate
    },
    getStatusClass(status) {
      return {
        '대기중': 'status-pending',
        '진행중': 'status-processing',
        '완료': 'status-completed',
        '취소됨': 'status-cancelled'
      }[status] || ''
    },
    viewTaskDetail(id) {
      this.$router.push({ name: 'task-detail', params: { id } })
    },
    startTask(id) {
      // 실제 구현에서는 API 호출로 대체
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        task.status = '진행중'
      }
    },
    completeTask(id) {
      // 실제 구현에서는 API 호출로 대체
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        task.status = '완료'
      }
    },
    navigate(address) {
      // 네이버 지도나 카카오 지도 등의 외부 맵 앱 호출
      const encodedAddress = encodeURIComponent(address)
      window.open(`https://map.naver.com/v5/search/${encodedAddress}`, '_blank')
    }
  }
}
</script>

<style scoped>
/* 퍼블리싱 소스의 모바일 태스크 스타일 적용 */
.tasks-page {
  padding: 15px;
  padding-bottom: 70px; /* 네비게이션 바 높이 고려 */
}

.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.date-nav-btn {
  background: none;
  border: none;
  color: #2196f3;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
}

.current-date {
  font-size: 16px;
  font-weight: 500;
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.task-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 15px;
  position: relative;
  overflow: hidden;
}

.task-card.completed {
  opacity: 0.8;
}

.task-card.completed::after {
  content: '완료';
  position: absolute;
  top: 10px;
  right: -35px;
  background-color: #4caf50;
  color: white;
  padding: 5px 40px;
  transform: rotate(45deg);
  font-size: 12px;
  font-weight: 500;
}

.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.task-time {
  font-weight: 600;
  font-size: 16px;
}

.task-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-processing {
  background-color: #e3f2fd;
  color: #2196f3;
}

.status-completed {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-cancelled {
  background-color: #ffebee;
  color: #f44336;
}

.task-address {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 12px;
}

.task-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  margin-right: 15px;
}

.info-item i {
  margin-right: 5px;
  color: #2196f3;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.btn-start,
.btn-complete,
.btn-navigate {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  flex: 1;
}

.btn-start {
  background-color: #2196f3;
  color: white;
}

.btn-complete {
  background-color: #4caf50;
  color: white;
}

.btn-navigate {
  background-color: #f5f5f5;
  color: #333;
}

.no-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9e9e9e;
  text-align: center;
}

.no-tasks i {
  font-size: 48px;
  margin-bottom: 15px;
}

.no-tasks p {
  font-size: 16px;
}
</style>
