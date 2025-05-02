<template>
  <div class="page-container completed-page">
    <h1 class="page-title">완료된 수거</h1>
    
    <div class="filter-bar">
      <div class="date-filter">
        <select v-model="dateFilter" class="filter-select">
          <option value="all">전체 기간</option>
          <option value="today">오늘</option>
          <option value="week">이번 주</option>
          <option value="month">이번 달</option>
        </select>
      </div>
      
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="주소 또는 ID 검색" 
          class="search-input"
        />
      </div>
    </div>
    
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>데이터를 불러오는 중...</p>
    </div>
    
    <div v-else-if="filteredRequests.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>완료된 수거 요청이 없습니다.</p>
    </div>
    
    <div v-else class="completed-list">
      <RequestCard 
        v-for="request in filteredRequests" 
        :key="request._id" 
        :request="request"
        @view-details="viewRequestDetails"
      />
    </div>
    
    <!-- 상세 정보 모달 -->
    <div v-if="selectedRequest" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>수거 요청 상세</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="request-status">
            <span class="status-badge" :class="selectedRequest.status">
              {{ formatStatus(selectedRequest.status) }}
            </span>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">요청 ID</div>
            <div class="detail-value">{{ selectedRequest.requestId }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">주소</div>
            <div class="detail-value">{{ selectedRequest.address }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">폐기물 종류</div>
            <div class="detail-value">{{ formatWasteType(selectedRequest.wasteType) }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">수량</div>
            <div class="detail-value">{{ selectedRequest.quantity }}kg</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">요청일</div>
            <div class="detail-value">{{ formatDate(selectedRequest.requestDate) }}</div>
          </div>
          
          <div class="detail-item">
            <div class="detail-label">완료일</div>
            <div class="detail-value">{{ formatDate(selectedRequest.completedAt) }}</div>
          </div>
          
          <div class="detail-item" v-if="selectedRequest.note">
            <div class="detail-label">메모</div>
            <div class="detail-value">{{ selectedRequest.note }}</div>
          </div>
          
          <!-- 사진 섹션 -->
          <div class="photos-section" v-if="selectedRequest.photos && selectedRequest.photos.length > 0">
            <h4>사진</h4>
            <div class="photos-grid">
              <div 
                v-for="(photo, index) in selectedRequest.photos" 
                :key="index" 
                class="photo-item"
                @click="viewPhoto(photo)"
              >
                <img :src="photo" alt="수거 사진" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 사진 확대보기 모달 -->
    <div v-if="enlargedPhoto" class="photo-modal" @click="enlargedPhoto = null">
      <img :src="enlargedPhoto" alt="확대 보기" class="enlarged-photo" />
      <button @click="enlargedPhoto = null" class="close-photo">&times;</button>
    </div>
  </div>
</template>

<script>
import RequestCard from '@/components/RequestCard.vue'

export default {
  name: 'Completed',
  
  components: {
    RequestCard
  },
  
  data() {
    return {
      completedRequests: [],
      loading: true,
      selectedRequest: null,
      dateFilter: 'all',
      searchQuery: '',
      enlargedPhoto: null
    }
  },
  
  computed: {
    filteredRequests() {
      let requests = [...this.completedRequests]
      
      // 날짜 필터링
      if (this.dateFilter !== 'all') {
        const now = new Date()
        let compareDate
        
        if (this.dateFilter === 'today') {
          compareDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        } else if (this.dateFilter === 'week') {
          // 이번 주 (일요일부터 시작)
          const day = now.getDay() // 0 = 일요일, 6 = 토요일
          compareDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
        } else if (this.dateFilter === 'month') {
          // 이번 달
          compareDate = new Date(now.getFullYear(), now.getMonth(), 1)
        }
        
        requests = requests.filter(request => {
          const completedDate = new Date(request.completedAt)
          return completedDate >= compareDate
        })
      }
      
      // 검색어 필터링
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        requests = requests.filter(request => 
          request.address.toLowerCase().includes(query) || 
          request.requestId.toLowerCase().includes(query)
        )
      }
      
      // 날짜 순으로 정렬 (최근 완료된 순)
      return requests.sort((a, b) => {
        return new Date(b.completedAt) - new Date(a.completedAt)
      })
    }
  },
  
  created() {
    this.fetchCompletedRequests()
  },
  
  methods: {
    async fetchCompletedRequests() {
      try {
        this.loading = true
        
        const response = await fetch('/api/waste-requests?status=completed', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('완료된 요청을 불러오는데 실패했습니다.')
        }
        
        const data = await response.json()
        this.completedRequests = data.requests || []
      } catch (error) {
        console.error('완료된 요청 로드 오류:', error)
        alert(error.message)
      } finally {
        this.loading = false
      }
    },
    
    viewRequestDetails(requestId) {
      const request = this.completedRequests.find(r => r._id === requestId)
      if (request) {
        this.selectedRequest = request
      }
    },
    
    closeModal() {
      this.selectedRequest = null
    },
    
    viewPhoto(photo) {
      this.enlargedPhoto = photo
    },
    
    formatStatus(status) {
      const statusMap = {
        'pending': '대기 중',
        'assigned': '배정됨',
        'in-progress': '수거 중',
        'completed': '완료됨',
        'cancelled': '취소됨'
      }
      return statusMap[status] || status
    },
    
    formatWasteType(type) {
      const typeMap = {
        'general': '일반 폐기물',
        'construction': '건설 폐기물',
        'food': '음식물 폐기물',
        'recyclable': '재활용 폐기물',
        'hazardous': '위험 폐기물'
      }
      return typeMap[type] || type
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
    }
  }
}
</script>

<style scoped>
.completed-page {
  padding-bottom: 80px;
}

.filter-bar {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.filter-select,
.search-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
}

.filter-select {
  min-width: 120px;
}

.search-input {
  flex: 1;
}

.completed-list {
  margin-bottom: 20px;
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
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

.request-status {
  margin-bottom: 20px;
  text-align: center;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  color: #333;
}

.photos-section {
  margin-top: 20px;
}

.photos-section h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #333;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.photo-item {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 비율 유지 */
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
}

.photo-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 사진 확대보기 모달 */
.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.enlarged-photo {
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
}

.close-photo {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
}
</style>
