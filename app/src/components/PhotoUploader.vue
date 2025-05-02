<template>
  <div class="photo-uploader">
    <div class="upload-area" @click="triggerFileInput">
      <input 
        type="file"
        ref="fileInput"
        accept="image/*"
        @change="handleFileChange"
        class="file-input"
      />
      <div class="upload-placeholder" v-if="!previewUrl">
        <span class="upload-icon">📷</span>
        <p class="upload-text">사진을 촬영하거나 업로드하세요</p>
      </div>
      <div class="preview-container" v-else>
        <img :src="previewUrl" alt="미리보기" class="preview-image" />
        <button @click.stop="clearImage" class="clear-btn">×</button>
      </div>
    </div>
    
    <div class="upload-actions" v-if="previewUrl">
      <button @click="uploadPhoto" class="btn btn-primary" :disabled="uploading">
        {{ uploading ? '업로드 중...' : '사진 업로드' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoUploader',
  
  props: {
    requestId: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      file: null,
      previewUrl: null,
      uploading: false
    }
  },
  
  methods: {
    triggerFileInput() {
      if (!this.uploading) {
        this.$refs.fileInput.click()
      }
    },
    
    handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.$emit('error', '파일 크기는 5MB 이하여야 합니다.')
        return
      }
      
      this.file = file
      this.createPreview()
    },
    
    createPreview() {
      if (!this.file) return
      
      const reader = new FileReader()
      reader.onload = () => {
        this.previewUrl = reader.result
      }
      reader.readAsDataURL(this.file)
    },
    
    clearImage(event) {
      event.preventDefault()
      this.file = null
      this.previewUrl = null
      this.$refs.fileInput.value = ''
    },
    
    async uploadPhoto() {
      if (!this.file || !this.previewUrl) return
      
      this.uploading = true
      
      try {
        // 기존 요청 데이터 가져오기
        const response = await fetch(`/api/waste-requests/${this.requestId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('요청 정보를 가져오는데 실패했습니다.')
        }
        
        const requestData = await response.json()
        
        // 기존 사진 배열에 새 사진 추가
        const photos = [...(requestData.photos || []), this.previewUrl]
        
        // 요청 업데이트
        const updateResponse = await fetch(`/api/waste-requests/${this.requestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ photos })
        })
        
        if (!updateResponse.ok) {
          throw new Error('사진 업로드에 실패했습니다.')
        }
        
        // 업데이트 성공 이벤트 발생
        this.$emit('uploaded', this.previewUrl)
        
        // 폼 초기화
        this.file = null
        this.previewUrl = null
        this.$refs.fileInput.value = ''
      } catch (error) {
        this.$emit('error', error.message)
      } finally {
        this.uploading = false
      }
    }
  }
}
</script>

<style scoped>
.photo-uploader {
  margin-bottom: 20px;
}

.upload-area {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  background-color: #f9f9f9;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.upload-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 14px;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.clear-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
}

.upload-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
