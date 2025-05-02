<template>
  <div class="page-container request-detail-page">
    <!-- 헤더 -->
    <div class="detail-header">
      <button @click="goBack" class="back-button">
        ← 뒤로
      </button>
      <h1 class="page-title">수거 요청 상세</h1>
    </div>
    
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>데이터를 불러오는 중...</p>
    </div>
    
    <div v-else-if="!request" class="empty-state">
      <p>요청 정보를 찾을 수 없습니다.</p>
    </div>
    
    <div v-else class="request-detail-content">
      <!-- 상태 정보 -->
      <div class="status-card" :class="request.status">
        <div class="status-label">현재 상태</div>
        <div class="status-value">{{ $formatStatus(request.status) }}</div>
      </div>
      
      <!-- 기본 정보 -->
      <div class="detail-card">
        <div class="card-header">기본 정보</div>
        
        <div class="info-row">
          <div class="info-label">요청 ID</div>
          <div class="info-value">{{ request.requestId }}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">주소</div>
          <div class="info-value">{{ request.address }}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">폐기물 종류</div>
          <div class="info-value">{{ $formatWasteType(request.wasteType) }}</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">수량</div>
          <div class="info-value">{{ request.quantity }}kg</div>
        </div>
        
        <div class="info-row">
          <div class="info-label">요청일</div>
          <div class="info-value">{{ $formatDate(request.requestDate) }}</div>
        </div>
        
        <div v-if="request.note" class="info-row">
          <div class="info-label">비고</div>
          <div class="info-value">{{ request.note }}</div>
        </div>
      </div>
      
      <!-- 사진 섹션 -->
      <div class="detail-card">
        <div class="card-header">
          사진
          <button v-if="canAddPhoto" @click="showPhotoUpload = true" class="add-photo-btn">
            + 사진 추가
          </button>
        </div>
        
        <div v-if="!request.photos || request.photos.length === 0" class="empty-photos">
          <p>등록된 사진이 없습니다.</p>
        </div>
        
        <div v-else class="photo-grid">
          <div 
            v-for="(photo, index) in request.photos" 
            :key="index" 
            class="photo-item"
            @click="openPhoto(photo)"
          >
            <img :src="photo" :alt="`사진 ${index + 1}`" />
          </div>
        </div>
      </div>
      
      <!-- 작업 버튼 -->
      <div v-if="showActionButtons" class="action-buttons">
        <button 
          v-if="request.status === 'assigned'"
          @click="updateStatus('in-progress')" 
          class="btn btn-primary"
        >
          수거 시작
        </button>
        <button 
          v-if="request.status === 'in-progress'"
          @click="updateStatus('completed')" 
          class="btn btn-secondary"
        >
          수거 완료
        </button>
      </div>
    </div>
    
    <!-- 사진 업로드 모달 -->
    <div v-if="showPhotoUpload" class="modal-overlay" @click="showPhotoUpload = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>사진 추가</h3>
          <button @click="showPhotoUpload = false" class="close-button">×</button>
        </div>
        
        <div class="photo-upload-area">
          <input 
            type="file" 
            ref="photoInput"
            accept="image/*"
            @change="handlePhotoUpload"
            class="photo-input"
          />
          
          <div v-if="previewPhoto" class="photo-preview">
            <img :src="previewPhoto" alt="미리보기" />
          </div>
          
          <div v-else class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <p>사진을 선택하세요</p>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="showPhotoUpload = false" class="btn btn-outline">취소</button>
          <button 
            @click="uploadPhoto" 
            class="btn btn-primary"
            :disabled="!previewPhoto || uploadingPhoto"
          >
            {{ uploadingPhoto ? '업로드 중...' : '업로드' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 사진 확대 보기 모달 -->
    <div v-if="enlargedPhoto" class="modal-overlay" @click="enlargedPhoto = null">
      <div class="photo-viewer" @click.stop>
        <button @click="enlargedPhoto = null" class="close-button">×</button>
        <img :src="enlargedPhoto" alt="확대 보기" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'RequestDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      request: null,
      showPhotoUpload: false,
      previewPhoto: null,
      uploadingPhoto: false,
      enlargedPhoto: null
    }
  },
  computed: {
    ...mapGetters(['loading']),
    canAddPhoto() {
      return this.request && this.request.status === 'in-progress'
    },
    showActionButtons() {
      return this.request && 
        (this.request.status === 'assigned' || this.request.status === 'in-progress')
    }
  },
  async created() {
    try {
      await this.loadRequestDetail()
    } catch (error) {
      console.error('요청 상세 정보 로드 실패:', error)
    }
  },
  methods: {
    ...mapActions(['fetchRequestDetail', 'updateRequestStatus']),
    
    async loadRequestDetail() {
      const data = await this.fetchRequestDetail(this.id)
      this.request = data
    },
    
    goBack() {
      this.$router.back()
    },
    
    async updateStatus(status) {
      try {
        await this.updateRequestStatus({ id: this.id, status })
        
        // 상세 정보 다시 로드
        await this.loadRequestDetail()
        
        // 완료로 변경한 경우 축하 메시지 표시
        if (status === 'completed') {
          alert('수거 작업이 완료되었습니다!')
          this.$router.push({ name: 'Dashboard' })
        }
      } catch (error) {
        console.error('상태 업데이트 실패:', error)
      }
    },
    
    handlePhotoUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // 파일 크기 5MB 제한
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.')
        return
      }
      
      // 이미지 미리보기 생성
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewPhoto = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    async uploadPhoto() {
      if (!this.previewPhoto) return
      
      try {
        this.uploadingPhoto = true
        
        // 기존 사진 배열에 새 사진 추가
        const photos = [...(this.request.photos || []), this.previewPhoto]
        
        // 사진 업데이트 API 호출
        await this.updateRequestStatus({
          id: this.id,
          photos
        })
        
        // 상세 정보 다시 로드
        await this.loadRequestDetail()
        
        // 모달 닫기 및 상태 초기화
        this.showPhotoUpload = false
        this.previewPhoto = null
        
        // 성공 메시지
        alert('사진이 업로드되었습니다.')
      } catch (error) {
        console.error('사진 업로드 실패:', error)
        alert('사진 업로드 중 오류가 발생했습니다.')
      } finally {
        this.uploadingPhoto = false
      }
    },
    
    openPhoto(photo) {
      this.enlargedPhoto = photo
    }
  }
}
</script>

<style scoped>
.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  margin-right: 12px;
}

.status-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-card.assigned {
  border-left: 4px solid #2196f3;
}

.status-card.in-progress {
  border-left: 4px solid #4caf50;
}

.status-card.completed {
  border-left: 4px solid #8bc34a;
}

.status-label {
  font-size: 14px;
  color: #666;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.detail-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-row {
  display: flex;
  margin-bottom: 12px;
}

.info-label {
  width: 100px;
  color: #666;
  font-size: 14px;
}

.info-value {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.empty-photos {
  text-align: center;
  padding: 20px 0;
  color: #999;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.photo-item {
  width: 100%;
  padding-top: 100%; /* 1:1 비율 유지 */
  position: relative;
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

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-buttons .btn {
  flex: 1;
}

.add-photo-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #4caf50;
  cursor: pointer;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
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
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.photo-upload-area {
  margin-bottom: 20px;
}

.photo-input {
  margin-bottom: 16px;
}

.upload-placeholder {
  background-color: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.photo-preview {
  text-align: center;
  margin-top: 16px;
}

.photo-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 사진 확대보기 */
.photo-viewer {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.photo-viewer img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.photo-viewer .close-button {
  position: absolute;
  top: -40px;
  right: 0;
  color: white;
  font-size: 28px;
}
</style>
