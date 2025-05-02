<template>
  <div class="photo-uploader">
    <p class="text-subtitle-1 mb-2">
      완료 사진 ({{ photos.length }}/5)
    </p>
    
    <v-row>
      <!-- 업로드된 사진 -->
      <v-col
        v-for="(photo, index) in photos"
        :key="index"
        cols="6"
        sm="4"
        class="pa-2"
      >
        <v-card outlined class="photo-card">
          <v-img
            :src="photo.url"
            aspect-ratio="1"
            class="grey lighten-2"
            @click="previewPhoto(photo.url)"
          >
            <template v-slot:placeholder>
              <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular
                  indeterminate
                  color="grey lighten-5"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>
          
          <v-btn
            absolute
            fab
            x-small
            color="error"
            class="photo-delete-btn"
            @click="removePhoto(index)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card>
      </v-col>
      
      <!-- 사진 추가 버튼 -->
      <v-col
        v-if="photos.length < 5"
        cols="6"
        sm="4"
        class="pa-2"
      >
        <v-card
          outlined
          class="photo-card d-flex align-center justify-center"
          height="100%"
          @click="triggerFileInput"
        >
          <div class="text-center">
            <v-icon size="36" color="primary">mdi-camera</v-icon>
            <div class="mt-1 text-caption">사진 추가</div>
          </div>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 파일 인풋 (숨김) -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    >
    
    <!-- 사진 미리보기 다이얼로그 -->
    <v-dialog v-model="previewDialog" max-width="90vw">
      <v-card>
        <v-img
          :src="previewUrl"
          max-height="80vh"
          contain
        ></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn icon @click="previewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'PhotoUploader',
  
  props: {
    photos: {
      type: Array,
      default: () => []
    }
  },
  
  data: () => ({
    previewDialog: false,
    previewUrl: '',
    uploadingPhoto: false
  }),
  
  methods: {
    triggerFileInput() {
      // 최대 5장까지만 업로드 가능
      if (this.photos.length >= 5) {
        this.$store.commit('notification/setNotification', {
          message: '최대 5장까지만 업로드할 수 있습니다',
          type: 'warning'
        })
        return
      }
      
      this.$refs.fileInput.click()
    },
    
    async handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // 파일 유효성 검사
      if (!file.type.match('image.*')) {
        this.$store.commit('notification/setNotification', {
          message: '이미지 파일만 업로드할 수 있습니다',
          type: 'error'
        })
        return
      }
      
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.$store.commit('notification/setNotification', {
          message: '이미지 크기는 5MB 이하여야 합니다',
          type: 'error'
        })
        return
      }
      
      // 파일 업로드 처리
      this.uploadingPhoto = true
      
try {
        // 이미지 최적화 (리사이징)
        const optimizedFile = await this.optimizeImage(file)
        
        // 이미지 업로드 이벤트 발생
        this.$emit('add', optimizedFile)
      } catch (err) {
        console.error('이미지 업로드 처리 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '이미지 처리 중 오류가 발생했습니다',
          type: 'error'
        })
      } finally {
        this.uploadingPhoto = false
        
        // 파일 인풋 초기화
        this.$refs.fileInput.value = ''
      }
    },
    
    removePhoto(index) {
      this.$emit('remove', index)
    },
    
    previewPhoto(url) {
      this.previewUrl = url
      this.previewDialog = true
    },
    
    // 이미지 최적화 함수
    optimizeImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = event => {
          const img = new Image()
          
          img.onload = () => {
            // 최대 크기 설정 (1080px)
            const MAX_WIDTH = 1080
            const MAX_HEIGHT = 1080
            
            let width = img.width
            let height = img.height
            
            // 이미지 리사이징
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width
                width = MAX_WIDTH
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height
                height = MAX_HEIGHT
              }
            }
            
            // 캔버스 생성
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            
            // 이미지 그리기
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)
            
            // 이미지 품질 설정 (JPEG 형식, 80% 품질)
            canvas.toBlob(blob => {
              // Blob에 파일 이름 추가
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
              })
              
              resolve(optimizedFile)
            }, 'image/jpeg', 0.8)
          }
          
          img.onerror = err => {
            reject(err)
          }
          
          img.src = event.target.result
        }
        
        reader.onerror = err => {
          reject(err)
        }
        
        reader.readAsDataURL(file)
      })
    }
  }
}
</script>

<style scoped>
.photo-card {
  position: relative;
  height: 100%;
  transition: transform 0.2s;
}

.photo-card:hover {
  transform: scale(1.02);
}

.photo-delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 1;
}
</style>
