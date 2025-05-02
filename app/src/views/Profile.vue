<template>
  <div class="page-container profile-page">
    <h1 class="page-title">내 프로필</h1>
    
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-avatar">{{ userInitial }}</div>
        <div class="profile-name">{{ user.name }}</div>
        <div class="profile-role">{{ getRoleText(user.role) }}</div>
      </div>
      
      <div class="profile-info">
        <div class="info-item">
          <div class="info-label">아이디</div>
          <div class="info-value">{{ user.username }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">연락처</div>
          <div class="info-value">{{ user.phone || '-' }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">이메일</div>
          <div class="info-value">{{ user.email || '-' }}</div>
        </div>
        
        <div class="info-item">
          <div class="info-label">마지막 로그인</div>
          <div class="info-value">{{ formatDate(user.lastLogin) }}</div>
        </div>
      </div>
    </div>
    
    <div class="vehicle-info" v-if="assignedVehicle">
      <h2 class="section-title">배정 차량 정보</h2>
      
      <div class="vehicle-card">
        <div class="vehicle-header">
          <div class="vehicle-id">{{ assignedVehicle.vehicleId }}</div>
          <div class="vehicle-status" :class="assignedVehicle.status">
            {{ getStatusText(assignedVehicle.status) }}
          </div>
        </div>
        
        <div class="vehicle-details">
          <div class="detail-item">
            <div class="detail-label">차량 유형</div>
            <div class="detail-value">{{ assignedVehicle.type }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">적재 용량</div>
            <div class="detail-value">{{ assignedVehicle.capacity }}kg</div>
          </div>
          
          <div class="detail-item" v-if="assignedVehicle.registrationNumber">
            <div class="detail-label">등록번호</div>
            <div class="detail-value">{{ assignedVehicle.registrationNumber }}</div>
          </div>
          
          <div class="detail-item" v-if="assignedVehicle.lastMaintenance">
            <div class="detail-label">최근 정비일</div>
            <div class="detail-value">{{ formatDate(assignedVehicle.lastMaintenance) }}</div>
          </div>
        </div>
        
        <button 
          @click="reportMaintenance" 
          class="btn btn-outline btn-block"
          v-if="assignedVehicle.status !== 'maintenance'"
        >
          정비 필요 보고
        </button>
      </div>
    </div>
    
    <div class="statistics-section">
      <h2 class="section-title">나의 활동</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ stats.completed || 0 }}</div>
          <div class="stat-label">완료한 수거</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ stats.pending || 0 }}</div>
          <div class="stat-label">배정된 수거</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ stats.inProgress || 0 }}</div>
          <div class="stat-label">진행 중</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ stats.todayCompleted || 0 }}</div>
          <div class="stat-label">오늘 완료</div>
        </div>
      </div>
    </div>
    
    <div class="action-buttons">
      <button @click="logout" class="btn btn-outline btn-block">로그아웃</button>
    </div>
    
    <!-- 정비 보고 모달 -->
    <div v-if="showMaintenanceModal" class="modal-overlay" @click="showMaintenanceModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>차량 정비 보고</h3>
          <button @click="showMaintenanceModal = false" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="maintenanceDesc">정비 필요 사유</label>
            <textarea 
              id="maintenanceDesc" 
              v-model="maintenanceDesc" 
              class="form-control"
              placeholder="정비가 필요한 이유를 상세히 설명해주세요"
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showMaintenanceModal = false" class="btn btn-outline">취소</button>
          <button @click="submitMaintenanceReport" class="btn btn-primary" :disabled="!maintenanceDesc.trim()">
            보고 제출
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Profile',
  
  data() {
    return {
      assignedVehicle: null,
      stats: {
        completed: 0,
        pending: 0,
        inProgress: 0,
        todayCompleted: 0
      },
      showMaintenanceModal: false,
      maintenanceDesc: ''
    }
  },
  
  computed: {
    ...mapGetters(['user']),
    
    userInitial() {
      return (this.user?.name || '?')[0].toUpperCase()
    }
  },
  
  async created() {
    await this.fetchAssignedVehicle()
    await this.fetchDriverStats()
  },
  
  methods: {
    ...mapActions(['logout']),
    
    getRoleText(role) {
      const roleMap = {
        'admin': '관리자',
        'driver': '기사',
        'staff': '직원'
      }
      return roleMap[role] || role
    },
    
    getStatusText(status) {
      const statusMap = {
        'available': '사용 가능',
        'in-use': '사용 중',
        'maintenance': '정비 중',
        'out-of-service': '사용 불가'
      }
      return statusMap[status] || status
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    async fetchAssignedVehicle() {
      try {
        const response = await fetch('/api/vehicles?assignedTo=' + this.user.id, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('차량 정보를 불러오는데 실패했습니다.')
        }
        
        const vehicles = await response.json()
        this.assignedVehicle = vehicles.length > 0 ? vehicles[0] : null
      } catch (error) {
        console.error('차량 정보 로드 오류:', error)
      }
    },
    
    async fetchDriverStats() {
      try {
        // 완료된 요청 수
        const completedResponse = await fetch('/api/waste-requests?status=completed', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (completedResponse.ok) {
          const completedData = await completedResponse.json()
          this.stats.completed = completedData.requests ? completedData.requests.length : 0
          
          // 오늘 완료한 요청 수 계산
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          this.stats.todayCompleted = completedData.requests ? 
            completedData.requests.filter(req => {
              const completedDate = new Date(req.completedAt)
              return completedDate >= today
            }).length : 0
        }
        
        // 배정된 요청 수
        const pendingResponse = await fetch('/api/waste-requests?status=assigned', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json()
          this.stats.pending = pendingData.requests ? pendingData.requests.length : 0
        }
        
        // 진행 중인 요청 수
        const inProgressResponse = await fetch('/api/waste-requests?status=in-progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (inProgressResponse.ok) {
          const inProgressData = await inProgressResponse.json()
          this.stats.inProgress = inProgressData.requests ? inProgressData.requests.length : 0
        }
      } catch (error) {
        console.error('통계 정보 로드 오류:', error)
      }
    },
    
    reportMaintenance() {
      this.showMaintenanceModal = true
      this.maintenanceDesc = ''
    },
    
    async submitMaintenanceReport() {
      if (!this.maintenanceDesc.trim() || !this.assignedVehicle) {
        return
      }
      
      try {
        // 차량 상태를 정비 중으로 변경
        const response = await fetch(`/api/vehicles/${this.assignedVehicle._id}/maintenance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            description: this.maintenanceDesc,
            date: new Date()
          })
        })
        
        if (!response.ok) {
          throw new Error('정비 보고를 제출하는데 실패했습니다.')
        }
        
        // 차량 상태를 정비 중으로 업데이트
        const updateResponse = await fetch(`/api/vehicles/${this.assignedVehicle._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            status: 'maintenance'
          })
        })
        
        if (!updateResponse.ok) {
          throw new Error('차량 상태 업데이트에 실패했습니다.')
        }
        
        // 성공적으로 제출된 경우
        alert('정비 보고가 성공적으로 제출되었습니다.')
        this.showMaintenanceModal = false
        
        // 차량 정보 다시 불러오기
        await this.fetchAssignedVehicle()
      } catch (error) {
        console.error('정비 보고 제출 오류:', error)
        alert(error.message)
      }
    },
    
    async handleLogout() {
      try {
        await this.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('로그아웃 오류:', error)
      }
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding-bottom: 80px;
}

.profile-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 500;
  margin-bottom: 16px;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.profile-role {
  font-size: 14px;
  color: #666;
  background-color: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
}

.profile-info {
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.info-item {
  margin-bottom: 12px;
}

.info-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.vehicle-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 24px;
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.vehicle-id {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.vehicle-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.vehicle-status.available {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.vehicle-status.in-use {
  background-color: #e3f2fd;
  color: #1976d2;
}

.vehicle-status.maintenance {
  background-color: #fff8e1;
  color: #f57c00;
}

.vehicle-status.out-of-service {
  background-color: #ffebee;
  color: #c62828;
}

.vehicle-details {
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.btn-block {
  width: 100%;
  margin-top: 16px;
}

.statistics-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  border-top: 1px solid #eee;
}
</style>
;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #4caf50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.action-buttons {
  margin-top: 32px;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px