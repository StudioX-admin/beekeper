<!-- app/src/views/TaskDetail.vue -->
<template>
  <div class="task-detail-page">
    <div class="back-button" @click="goBack">
      <i class="fas fa-arrow-left"></i>
    </div>
    
    <div v-if="task" class="task-container">
      <div class="task-header">
        <div class="task-id">작업 #{{ task.id }}</div>
        <div class="task-status" :class="getStatusClass(task.status)">
          {{ task.status }}
        </div>
      </div>
      
      <div class="task-section">
        <h3 class="section-title">기본 정보</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">작업 일시</div>
            <div class="info-value">{{ task.date }} {{ task.time }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">폐기물 종류</div>
            <div class="info-value">{{ task.wasteType }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">예상 무게</div>
            <div class="info-value">{{ task.weight }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">요청자</div>
            <div class="info-value">{{ task.requester }}</div>
          </div>
        </div>
      </div>
      
      <div class="task-section">
        <h3 class="section-title">수거 장소</h3>
        <div class="address-box">
          <div class="address">{{ task.address }}</div>
          <button class="btn-navigate" @click="navigate(task.address)">
            <i class="fas fa-map-marker-alt"></i> 길찾기
          </button>
        </div>
        <div class="location-map">
          <!-- 지도 이미지 또는 지도 컴포넌트 -->
          <img src="@/assets/images/map-placeholder.png" alt="지도">
        </div>
      </div>
      
      <div class="task-section">
        <h3 class="section-title">특이사항</h3>
        <div class="notes-box">
          {{ task.notes || '특이사항이 없습니다.' }}
        </div>
      </div>
      
      <div class="task-section" v-if="task.status !== '완료'">
        <h3 class="section-title">증빙 사진</h3>
        <div class="photo-upload">
          <div 
            class="photo-item add-photo" 
            @click="openPhotoSelector"
          >
            <i class="fas fa-plus"></i>
            <span>사진 추가</span>
          </div>
          <div 
            v-for="(photo, index) in photos" 
            :key="index"
            class="photo-item"
          >
            <img :src="photo" alt="증빙 사진">
            <button class="btn-remove-photo" @click="removePhoto(index)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="task-actions">
        <button 
          v-if="task.status === '대기중'"
          class="btn-start" 
          @click="startTask"
        >
          수거 시작
        </button>
        <button 
          v-if="task.status === '진행중'"
          class="btn-complete" 
          @click="completeTask"
          :disabled="photos.length === 0"
        >
          수거 완료
        </button>
        <button 
          v-if="task.status === '진행중'"
          class="btn-issue" 
          @click="reportIssue"
        >
          문제 보고
        </button>
      </div>
    </div>
    
    <div v-else class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>작업 정보를 불러오는 중...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskDetail',
  data() {
    return {
      task: null,
      photos: []
    }
  },
  created() {
    // 실제 구현에서는 API 호출로 대체
    this.fetchTaskDetail()
  },
  methods: {
    fetchTaskDetail() {
      // 더미 데이터로 대체
      const taskId = parseInt(this.$route.params.id)
      
      setTimeout(() => {
        this.task = {
          id: taskId,
          time: '09:00',
          status: '대기중',
          address: '서울시 강남구 테헤란로 123',
          wasteType: '일반 폐기물',
          weight: '약 100kg',
          requester: '(주)에이비씨',
          date: '2025-05-13',
          notes: '건물 뒤편 주차장 쪽에 폐기물이 있습니다. 경비실에 먼저 방문해주세요.'
        }
      }, 500)
    },
    goBack() {
      this.$router.go(-1)
    },
    getStatusClass(status) {
      return {
        '대기중': 'status-pending',
        '진행중': 'status-processing',
        '완료': 'status-completed',
        '취소됨': 'status-cancelled'
      }[status] || ''
    },
    navigate(address) {
      // 네이버 지도나 카카오 지도 등의 외부 맵 앱 호출
      const encodedAddress = encodeURIComponent(address)
      window.open(`https://map.naver.com/v5/search/${encodedAddress}`, '_blank')
    },
    openPhotoSelector() {
      // 실제 구현에서는 카메라 또는 갤러리 접근
      // 여기서는 더미 이미지 추가로 시뮬레이션
      this.photos.push(require('@/assets/images/waste-photo-sample.jpg'))
    },
    removePhoto(index) {
      this.photos.splice(index, 1)
    },
    startTask() {
      // 실제 구현에서는 API 호출로 대체
      this.task.status = '진행중'
    },
    completeTask() {
      // 실제 구현에서는 API 호출로 대체
      this.task.status = '완료'
      this.$router.push({ name: 'tasks' })
    },
    reportIssue() {
      // 실제 구현에서는 문제 보고 폼 표시
      alert('문제 보고 기능이 구현될 예정입니다.')
    }
  }
}
</script>

<style scoped>
/* 퍼블리싱 소스의 태스크 상세 페이지 스타일 적용 */
.task-detail-page {
  padding: 15px;
  padding-bottom: 70px;
  position: relative;
}

.back-button {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.task-container {
  margin-top: 20px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-id {
  font-size: 18px;
  font-weight: 600;
}

.task-status {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
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

.task-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 15px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 15px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
}

.address-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.address {
  font-size: 15px;
  font-weight: 500;
}

.btn-navigate {
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
}

.location-map {
  width: 100%;
  height: 200px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.location-map img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notes-box {
  background-color: #f5f7f9;
  border-radius: 4px;
  padding: 15px;
  font-size: 15px;
  line-height: 1.5;
}

.photo-upload {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.photo-item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.add-photo {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.add-photo i {
  font-size: 24px;
  color: #2196f3;
  margin-bottom: 5px;
}

.add-photo span {
  font-size: 14px;
  color: #666;
}

.btn-remove-photo {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0,0,0,0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.btn-start,
.btn-complete,
.btn-issue {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
}

.btn-start {
  background-color: #2196f3;
  color: white;
}

.btn-complete {
  background-color: #4caf50;
  color: white;
}

.btn-complete:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
}

.btn-issue {
  background-color: #f5f5f5;
  color: #333;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #9e9e9e;
  text-align: center;
}

.loading i {
  font-size: 36px;
  margin-bottom: 15px;
}

.loading p {
  font-size: 16px;
}
</style>
