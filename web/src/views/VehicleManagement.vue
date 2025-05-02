<template>
  <div class="vehicle-management">
    <h1 class="page-title">차량 관리</h1>
    
    <div class="actions-bar">
      <div class="filter-options">
        <select v-model="statusFilter" class="filter-select">
          <option value="">모든 상태</option>
          <option value="available">사용 가능</option>
          <option value="in-use">사용 중</option>
          <option value="maintenance">정비 중</option>
          <option value="out-of-service">사용 불가</option>
        </select>
      </div>
      
      <button @click="showAddVehicleModal = true" class="btn btn-primary">
        <span class="btn-icon">+</span> 새 차량 등록
      </button>
    </div>
    
    <!-- 차량 목록 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>차량 정보를 불러오는 중...</p>
    </div>
    
    <div v-else-if="vehicles.length === 0" class="empty-state">
      <div class="empty-icon">🚚</div>
      <p v-if="statusFilter">선택한 상태의 차량이 없습니다.</p>
      <p v-else>등록된 차량이 없습니다.</p>
      <button @click="showAddVehicleModal = true" class="btn btn-primary">차량 등록하기</button>
    </div>
    
    <div v-else class="vehicles-grid">
      <div v-for="vehicle in filteredVehicles" :key="vehicle._id" class="vehicle-card">
        <div class="vehicle-status" :class="vehicle.status">
          {{ getStatusText(vehicle.status) }}
        </div>
        
        <div class="vehicle-header">
          <h3 class="vehicle-id">{{ vehicle.vehicleId }}</h3>
          <div class="vehicle-type">{{ vehicle.type }}</div>
        </div>
        
        <div class="vehicle-info">
          <div class="info-row">
            <span class="info-label">용량:</span>
            <span class="info-value">{{ vehicle.capacity }}kg</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">할당 기사:</span>
            <span class="info-value">
              {{ vehicle.assignedTo ? vehicle.assignedTo.name : '미할당' }}
            </span>
          </div>
          
          <div v-if="vehicle.lastMaintenance" class="info-row">
            <span class="info-label">최근 정비:</span>
            <span class="info-value">{{ formatDate(vehicle.lastMaintenance) }}</span>
          </div>
        </div>
        
        <div class="vehicle-actions">
          <button @click="editVehicle(vehicle)" class="btn btn-outline">상세보기</button>
          <button 
            v-if="!vehicle.assignedTo && vehicle.status !== 'out-of-service'" 
            @click="assignDriver(vehicle)" 
            class="btn btn-secondary"
          >
            기사 배정
          </button>
        </div>
      </div>
    </div>
    
    <!-- 새 차량 추가 모달 -->
    <div v-if="showAddVehicleModal" class="modal-overlay" @click="showAddVehicleModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>새 차량 등록</h2>
          <button @click="showAddVehicleModal = false" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="vehicleId">차량 ID/번호</label>
            <input type="text" id="vehicleId" v-model="newVehicle.vehicleId" class="form-control" />
          </div>
          
          <div class="form-group">
            <label for="type">차량 유형</label>
            <input type="text" id="type" v-model="newVehicle.type" class="form-control" />
          </div>
          
          <div class="form-group">
            <label for="capacity">적재 용량 (kg)</label>
            <input type="number" id="capacity" v-model="newVehicle.capacity" class="form-control" min="0" />
          </div>
          
          <div class="form-group">
            <label for="manufacturer">제조사</label>
            <input type="text" id="manufacturer" v-model="newVehicle.manufacturer" class="form-control" />
          </div>
          
          <div class="form-group">
            <label for="model">모델</label>
            <input type="text" id="model" v-model="newVehicle.model" class="form-control" />
          </div>
          
          <div class="form-group">
            <label for="year">연식</label>
            <input type="number" id="year" v-model="newVehicle.year" class="form-control" />
          </div>
          
          <div class="form-group">
            <label for="registrationNumber">등록번호</label>
            <input type="text" id="registrationNumber" v-model="newVehicle.registrationNumber" class="form-control" />
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showAddVehicleModal = false" class="btn btn-outline">취소</button>
          <button @click="addVehicle" class="btn btn-primary" :disabled="!isVehicleFormValid">저장</button>
        </div>
      </div>
    </div>
    
    <!-- 차량 상세/수정 모달 -->
    <div v-if="selectedVehicle" class="modal-overlay" @click="selectedVehicle = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>차량 상세 정보</h2>
          <button @click="selectedVehicle = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">차량 ID:</span>
              <span class="detail-value">{{ selectedVehicle.vehicleId }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">차량 유형:</span>
              <span class="detail-value">{{ selectedVehicle.type }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">용량:</span>
              <span class="detail-value">{{ selectedVehicle.capacity }}kg</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">상태:</span>
              <div class="detail-value">
                <select v-model="selectedVehicle.status" class="form-control">
                  <option value="available">사용 가능</option>
                  <option value="in-use">사용 중</option>
                  <option value="maintenance">정비 중</option>
                  <option value="out-of-service">사용 불가</option>
                </select>
              </div>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">할당 기사:</span>
              <div class="detail-value">
                <div v-if="selectedVehicle.assignedTo">
                  {{ getDriverName(selectedVehicle.assignedTo) }}
                  <button @click="unassignDriver" class="btn-text">할당 해제</button>
                </div>
                <button v-else @click="assignDriver(selectedVehicle)" class="btn-text">기사 배정</button>
              </div>
            </div>
            
            <div class="detail-row" v-if="selectedVehicle.lastMaintenance">
              <span class="detail-label">최근 정비:</span>
              <span class="detail-value">{{ formatDate(selectedVehicle.lastMaintenance) }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">제조사:</span>
              <div class="detail-value">
                <input type="text" v-model="selectedVehicle.manufacturer" class="form-control" />
              </div>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">모델:</span>
              <div class="detail-value">
                <input type="text" v-model="selectedVehicle.model" class="form-control" />
              </div>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">연식:</span>
              <div class="detail-value">
                <input type="number" v-model="selectedVehicle.year" class="form-control" />
              </div>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">등록번호:</span>
              <div class="detail-value">
                <input type="text" v-model="selectedVehicle.registrationNumber" class="form-control" />
              </div>
            </div>
          </div>
          
          <!-- 정비 기록 섹션 -->
          <div class="maintenance-section" v-if="selectedVehicle.maintenanceHistory && selectedVehicle.maintenanceHistory.length > 0">
            <h3>정비 기록</h3>
            <div class="maintenance-list">
              <div v-for="(record, index) in selectedVehicle.maintenanceHistory" :key="index" class="maintenance-item">
                <div class="maintenance-date">{{ formatDate(record.date) }}</div>
                <div class="maintenance-desc">{{ record.description }}</div>
                <div class="maintenance-cost" v-if="record.cost">{{ record.cost.toLocaleString() }}원</div>
              </div>
            </div>
          </div>
          
          <!-- 새 정비 기록 추가 -->
          <div class="add-maintenance">
            <h3>정비 기록 추가</h3>
            <div class="form-group">
              <label for="maintenanceDate">정비일</label>
              <input type="date" id="maintenanceDate" v-model="newMaintenance.date" class="form-control" />
            </div>
            
            <div class="form-group">
              <label for="maintenanceDesc">설명</label>
              <textarea id="maintenanceDesc" v-model="newMaintenance.description" class="form-control"></textarea>
            </div>
            
            <div class="form-group">
              <label for="maintenanceCost">비용</label>
              <input type="number" id="maintenanceCost" v-model="newMaintenance.cost" class="form-control" min="0" />
            </div>
            
            <button @click="addMaintenanceRecord" class="btn btn-secondary" :disabled="!isMaintenanceFormValid">
              정비 기록 추가
            </button>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="deleteVehicle" class="btn btn-danger">삭제</button>
          <button @click="selectedVehicle = null" class="btn btn-outline">취소</button>
          <button @click="updateVehicle" class="btn btn-primary">저장</button>
        </div>
      </div>
    </div>
    
    <!-- 기사 배정 모달 -->
    <div v-if="showDriverAssignModal" class="modal-overlay" @click="showDriverAssignModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>기사 배정</h2>
          <button @click="showDriverAssignModal = false" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingDrivers" class="loading-container">
            <div class="spinner"></div>
            <p>기사 목록을 불러오는 중...</p>
          </div>
          
          <div v-else-if="availableDrivers.length === 0" class="empty-state">
            <p>배정 가능한 기사가 없습니다.</p>
          </div>
          
          <div v-else class="driver-list">
            <div v-for="driver in availableDrivers" :key="driver._id" class="driver-item" @click="selectDriver(driver)">
              <div class="driver-avatar">{{ driver.name[0] }}</div>
              <div class="driver-info">
                <div class="driver-name">{{ driver.name }}</div>
                <div class="driver-phone">{{ driver.phone || '연락처 없음' }}</div>
              </div>
              <div class="driver-select">
                <input type="radio" :checked="selectedDriverId === driver._id" @click="selectDriver(driver)" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showDriverAssignModal = false" class="btn btn-outline">취소</button>
          <button @click="confirmDriverAssignment" class="btn btn-primary" :disabled="!selectedDriverId">배정</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'VehicleManagement',
  
  data() {
    return {
      vehicles: [],
      loading: true,
      loadingDrivers: false,
      statusFilter: '',
      showAddVehicleModal: false,
      showDriverAssignModal: false,
      selectedVehicle: null,
      vehicleToAssign: null,
      selectedDriverId: null,
      availableDrivers: [],
      
      newVehicle: {
        vehicleId: '',
        type: '',
        capacity: 0,
        manufacturer: '',
        model: '',
        year: new Date().getFullYear(),
        registrationNumber: ''
      },
      
      newMaintenance: {
        date: new Date().toISOString().split('T')[0],
        description: '',
        cost: 0
      }
    }
  },
  
  computed: {
    filteredVehicles() {
      if (!this.statusFilter) {
        return this.vehicles
      }
      
      return this.vehicles.filter(vehicle => vehicle.status === this.statusFilter)
    },
    
    isVehicleFormValid() {
      return this.newVehicle.vehicleId.trim() !== '' && 
        this.newVehicle.type.trim() !== '' && 
        this.newVehicle.capacity > 0
    },
    
    isMaintenanceFormValid() {
      return this.newMaintenance.date !== '' && 
        this.newMaintenance.description.trim() !== ''
    }
  },
  
  created() {
    this.fetchVehicles()
  },
  
  methods: {
    ...mapActions(['fetchDrivers']),
    
    async fetchVehicles() {
      try {
        this.loading = true
        const response = await fetch('/api/vehicles', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('차량 목록을 불러오는데 실패했습니다.')
        }
        
        this.vehicles = await response.json()
      } catch (error) {
        console.error('차량 목록 로드 오류:', error)
        this.$root.$emit('show-toast', { type: 'error', message: error.message })
      } finally {
        this.loading = false
      }
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
        day: 'numeric'
      })
    },
    
    getDriverName(driverId) {
      const vehicle = this.vehicles.find(v => v.assignedTo && v.assignedTo._id === driverId)
      return vehicle?.assignedTo?.name || '알 수 없음'
    },
    
    editVehicle(vehicle) {
      this.selectedVehicle = { ...vehicle }
      
      // 객체 복사 시 참조 문제 방지
      if (vehicle.maintenanceHistory) {
        this.selectedVehicle.maintenanceHistory = [...vehicle.maintenanceHistory]
      } else {
        this.selectedVehicle.maintenanceHistory = []
      }
    },
    
    async addVehicle() {
      if (!this.isVehicleFormValid) return
      
      try {
        const response = await fetch('/api/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.newVehicle)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '차량 등록에 실패했습니다.')
        }
        
        const result = await response.json()
        this.vehicles.push(result.vehicle)
        
        this.showAddVehicleModal = false
        this.$root.$emit('show-toast', { type: 'success', message: '차량이 성공적으로 등록되었습니다.' })
        
        // 폼 초기화
        this.newVehicle = {
          vehicleId: '',
          type: '',
          capacity: 0,
          manufacturer: '',
          model: '',
          year: new Date().getFullYear(),
          registrationNumber: ''
        }
      } catch (error) {
        console.error('차량 등록 오류:', error)
        this.$root.$emit('show-toast', { type: 'error', message: error.message })
      }
    },
    
    async updateVehicle() {
      if (!this.selectedVehicle) return
      
      try {
        const response = await fetch(`/api/vehicles/${this.selectedVehicle._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            type: this.selectedVehicle.type,
            capacity: this.selectedVehicle.capacity,
            status: this.selectedVehicle.status,
            manufacturer: this.selectedVehicle.manufacturer,
            model: this.selectedVehicle.model,
            year: this.selectedVehicle.year,
            registrationNumber: this.selectedVehicle.registrationNumber
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '차량 정보 업데이트에 실패했습니다.')
        }
        
        const result = await response.json()
        
        // 목록에서 해당 차량 업데이트
        const index = this.vehicles.findIndex(v => v._id === this.selectedVehicle._id)
        if (index !== -1) {
          this.vehicles.splice(index, 1, result.vehicle)
        }
        
        this.selectedVehicle = null
        this.$root.$emit('show-toast', { type: 'success', message: '차량 정보가 업데이트되었습니다.' })
      } catch (error) {
        console.error('차량 정보 업데이트 오류:', error)
        this.$root.$emit('show-toast', { type: 'error', message: error.message })
      }
    },
    
    async deleteVehicle() {
      if (!this.selectedVehicle) return
      
      if (!confirm(`정말로 차량 ${this.selectedVehicle.vehicleId}를 삭제하시겠습니까?`)) {
        return
      }
      
      try {
        const response = await fetch(`/api/vehicles/${this.selectedVehicle._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '차량 삭제에 실패했습니다.')
        }
        
        // 목록에서 해당 차량 제거
        this.vehicles = this.vehicles.filter(v => v._id !== this.selectedVehicle._id)
        
        this.selectedVehicle = null
        this.$root.$emit('show-toast', { type: 'success', message: '차량이 삭제되었습니다.' })
      } catch (error) {
        console.error('차량 삭제 오류:', error)
        this.$root.$emit('show-toast', { type: 'error', message: error.message })
      }
    },
    
    async addMaintenanceRecord() {
      if (!this.isMaintenanceFormValid || !this.selectedVehicle) return
      
      try {
        const response = await fetch(`/api/vehicles/${this.selectedVehicle._id}/maintenance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            date: new Date(this.newMaintenance.date),
            description: this.newMaintenance.description,
            cost: this.newMaintenance.cost
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '정비 기록 추가에 실패했습니다.')
        }
        
        const result = await response.json()
        
        // 선택된 차량 정보 업데이트
        this.selectedVehicle = result.vehicle
        
        // 목록에서도 해당 차량 업데이트
        const index = this.vehicles.findIndex(v => v._id === this.selectedVehicle._id)
        if (index !== -1) {
          this.vehicles.splice(index, 1, result.vehicle)
        }
        
        // 폼 초기화
        this.newMaintenance = {
          date: new Date().toISOString().split('T')[0],
          description: '',
          cost: 0
        }
        
        this.$root.$emit('show-toast', { type: 'success', message: '정비 기록이 추가되었습니다.' })
      } catch (error) {
        console.error('정비 기록 추가 오류:', error)
        this.$root.$emit('show-toast', { type: 'error', message: error.message })
      }
    },
    
    async assignDriver(vehicle) {
      this.vehicleToAssign = vehicle
      this.selectedDriverId = null
      this.showDriverAssignModal = true
      
      try {
        this.loadingDrivers = true
        
        // 사용 가능한 기사 목록 가져오기 (이미 차량이 할당된 기사 제외)
        const response = await this.fetchDrivers()
        
        // 이미 차량이 할당된 기사 필터링
        const assignedDriverIds = this.vehicles
          .filter(v => v.assignedTo && v._id !== vehicle._id)
          .map(v => v.assignedTo._id)
        
        this.availableDrivers = response.filter(driver => 
          !assignedDriverIds.includes(driver._id)
        )
      } catch (error) {
        console.error('기사 목록 로드 오류:', error)
        this.$root.$emit('show-toast', { type: 'error', message: '기사 목록을 불러오는데 실패했습니다.' })
        this.showDriverAssignModal = false
      } finally {
        this.loadingDrivers = false
      }
    },
    
    selectDriver(driver) {
      this.selectedDriverId = driver._id
    },
    
    async confirmDriverAssignment() {
      if (!this.selectedDriverId || !this.vehicleToAssign) return
      
      try {
        const response = await fetch(`/api/vehicles/${this.vehicleToAssign._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            assignedTo: this.selectedDriverId
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '기사 배정에 실패했습니다.')
        }
        
        const result = await response.json()
        
        // 목록에서 해당 차량 업데이트
        const index = this.vehicles.findIndex(v => v._id === this.vehicleToAssign._id)
        if (index !== -1) {
          this.vehicles.splice(index, 1, result.vehicle)
        }
        
        // 선택된 차량이 있으면 업데이트
        if (this.selectedVehicle && this.selectedVehicle._id === this.vehicleToAssign._id) {
          this.selectedVehicle = result.vehicle
        }
        
        this.showDriverAssignModal = false
        this.selectedDriverId = null
        this.vehicleToAssign = null
        
        this.$root.$emit('show-toast', { type: 'success', message: '기사가 성공적으로 배정되었습니다.' })
      } catch (error) {
        console.error('기사 배정 오류:', error)
        this.$root.$emit('show-toast', { type: 'error', message: error.message })
      }
    },
    
    async unassignDriver() {
      if (!this.selectedVehicle || !this.selectedVehicle.assignedTo) return
      
      if (!confirm('정말로 이 차량의 기사 배정을 해제하시겠습니까?')) {
        return
      }
      
      try {
        const response = await fetch(`/api/vehicles/${this.selectedVehicle._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            assignedTo: null
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '기사 배정 해제에 실패했습니다.')
        }
        
        const result = await response.json()
        
        // 목록에서 해당 차량 업데이트
        const index = this.vehicles.findIndex(v => v._id === this.selectedVehicle._id)
        if (index !== -1) {
          this.vehicles.splice(index, 1, result.vehicle)
        }
        
        this.selectedVehicle = result.vehicle
        
        this.$root.$emit('show-toast', { type: 'success', message: '기사 배정이 해제되었습니다.' })
      } catch (error) {
        console.error('기사 배정 해제 오류:', error)
        this.$root.$emit('show-toast', { type: 'error', message: error.message })
      }
    }
  }
}
</script>

<style scoped>
.vehicle-management {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.btn-icon {
  margin-right: 5px;
}

.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.vehicle-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.vehicle-status {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  border-bottom-left-radius: 8px;
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

.vehicle-header {
  margin-bottom: 15px;
}

.vehicle-id {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 5px;
}

.vehicle-type {
  color: #666;
  font-size: 14px;
}

.vehicle-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-label {
  width: 100px;
  color: #777;
}

.info-value {
  flex: 1;
  font-weight: 500;
}

.vehicle-actions {
  display: flex;
  justify-content: space-between;
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #ccc;
}

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
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
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
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
}

.detail-label {
  width: 100px;
  color: #777;
}

.detail-value {
  flex: 1;
}

.btn-text {
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.btn-text:hover {
  text-decoration: underline;
}

.maintenance-section {
  margin-top: 25px;
  margin-bottom: 25px;
}

.maintenance-section h3,
.add-maintenance h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.maintenance-list {
  border-top: 1px solid #eee;
}

.maintenance-item {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
}

.maintenance-date {
  font-weight: 500;
  width: 150px;
}

.maintenance-desc {
  flex: 1;
}

.maintenance-cost {
  width: 120px;
  text-align: right;
  color: #f44336;
}

.add-maintenance {
  margin-top: 25px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.driver-list {
  max-height: 300px;
  overflow-y: auto;
}

.driver-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.driver-item:hover {
  background-color: #f5f5f5;
}

.driver-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 15px;
}

.driver-info {
  flex: 1;
}

.driver-name {
  font-weight: 500;
}

.driver-phone {
  font-size: 14px;
  color: #666;
}

.driver-select {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .vehicles-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .info-row,
  .detail-row {
    flex-direction: column;
  }
  
  .info-label,
  .detail-label {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .maintenance-item {
    flex-direction: column;
    gap: 5px;
  }
  
  .maintenance-date,
  .maintenance-cost {
    width: 100%;
  }
  
  .maintenance-cost {
    text-align: left;
  }
}
</style>
