<template>
  <div>
    <v-app-bar color="primary" dark app>
      <v-app-bar-title>내 프로필</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="refreshData">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <!-- 로딩 표시 -->
        <v-skeleton-loader
          v-if="loading"
          type="card-heading, list-item-avatar-three-line, card-heading, list-item-three-line"
          class="my-4"
        ></v-skeleton-loader>
        
        <template v-else>
          <!-- 프로필 정보 -->
          <v-card outlined class="mb-4">
            <v-card-text class="pb-0">
              <div class="d-flex flex-column align-center">
                <v-avatar size="100" color="primary lighten-1" class="mb-3">
                  <v-img
                    v-if="user && user.profileImage"
                    :src="user.profileImage"
                    alt="프로필 이미지"
                  ></v-img>
                  <span v-else class="white--text text-h4">
                    {{ getUserInitials }}
                  </span>
                </v-avatar>
                
                <div class="text-h5 font-weight-bold">
                  {{ user ? user.name : '사용자' }}
                </div>
                
                <div class="text-subtitle-1 grey--text">
                  {{ user ? user.email : '' }}
                </div>
                
                <v-btn
                  small
                  outlined
                  color="primary"
                  class="mt-3"
                  @click="openProfileImageDialog"
                >
                  <v-icon left small>mdi-camera</v-icon>
                  프로필 사진 변경
                </v-btn>
              </div>
            </v-card-text>
            
            <v-card-text>
              <v-divider class="mb-3 mt-3"></v-divider>
              
              <v-list>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-phone</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>연락처</v-list-item-title>
                    <v-list-item-subtitle>{{ user && user.phoneNumber ? user.phoneNumber : '등록된 연락처가 없습니다' }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon small @click="openPhoneDialog">
                      <v-icon small>mdi-pencil</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                
                <v-list-item v-if="vehicle">
                  <v-list-item-icon>
                    <v-icon>mdi-truck</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>배정 차량</v-list-item-title>
                    <v-list-item-subtitle>{{ vehicle.vehicleNumber }} ({{ vehicle.type }})</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-lock</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>비밀번호</v-list-item-title>
                    <v-list-item-subtitle>********</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon small @click="openPasswordDialog">
                      <v-icon small>mdi-pencil</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
          
          <!-- 작업 통계 -->
          <v-card outlined class="mb-4">
            <v-card-title>작업 통계</v-card-title>
            
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <v-card outlined class="text-center pa-3">
                    <div class="text-h4 font-weight-bold primary--text">
                      {{ stats.todayCompleted }}
                    </div>
                    <div class="text-caption">오늘 완료한 작업</div>
                  </v-card>
                </v-col>
                
                <v-col cols="6">
                  <v-card outlined class="text-center pa-3">
                    <div class="text-h4 font-weight-bold success--text">
                      {{ stats.weeklyCompleted }}
                    </div>
                    <div class="text-caption">이번 주 완료한 작업</div>
                  </v-card>
                </v-col>
                
                <v-col cols="6">
                  <v-card outlined class="text-center pa-3">
                    <div class="text-h4 font-weight-bold info--text">
                      {{ stats.pending }}
                    </div>
                    <div class="text-caption">진행중인 작업</div>
                  </v-card>
                </v-col>
                
                <v-col cols="6">
                  <v-card outlined class="text-center pa-3">
                    <div class="text-h4 font-weight-bold grey--text">
                      {{ stats.totalCompleted }}
                    </div>
                    <div class="text-caption">총 완료한 작업</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          
          <!-- 설정 -->
          <v-card outlined>
            <v-list>
              <v-list-item @click="toggleLocationTracking">
                <v-list-item-icon>
                  <v-icon>mdi-crosshairs-gps</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>위치 추적</v-list-item-title>
                  <v-list-item-subtitle>경로 안내 및 관리자 위치 확인</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-switch
                    v-model="locationTracking"
                    color="primary"
                  ></v-switch>
                </v-list-item-action>
              </v-list-item>
              
              <v-list-item @click="toggleNotifications">
                <v-list-item-icon>
                  <v-icon>mdi-bell</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>알림</v-list-item-title>
                  <v-list-item-subtitle>새 작업 및 중요 업데이트</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-switch
                    v-model="notifications"
                    color="primary"
                  ></v-switch>
                </v-list-item-action>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item @click="logout" class="mt-2">
                <v-list-item-icon>
                  <v-icon color="error">mdi-logout</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="error--text">로그아웃</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item class="text-center">
                <v-list-item-content>
                  <v-list-item-subtitle class="text-caption grey--text">
                    버전 1.0.0
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>
      </v-container>
    </v-main>
    
    <!-- 프로필 이미지 변경 다이얼로그 -->
    <v-dialog v-model="profileImageDialog" max-width="500">
      <v-card>
        <v-card-title>프로필 사진 변경</v-card-title>
        
        <v-card-text>
          <v-file-input
            v-model="profileImage"
            label="이미지 선택"
            prepend-icon="mdi-camera"
            accept="image/*"
            :rules="[v => !v || v.size < 5000000 || '이미지 크기는 5MB 이하여야 합니다']"
            show-size
            counter
          ></v-file-input>
          
          <div class="text-center my-3" v-if="profileImagePreview">
            <v-avatar size="150" color="grey lighten-2">
              <v-img :src="profileImagePreview"></v-img>
            </v-avatar>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="profileImageDialog = false">취소</v-btn>
          <v-btn
            color="primary"
            :disabled="!profileImage"
            :loading="uploadingImage"
            @click="updateProfileImage"
          >
            변경
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 연락처 변경 다이얼로그 -->
    <v-dialog v-model="phoneDialog" max-width="500">
      <v-card>
        <v-card-title>연락처 변경</v-card-title>
        
        <v-card-text>
          <v-form ref="phoneForm" v-model="phoneFormValid">
            <v-text-field
              v-model="phoneNumber"
              label="연락처"
              :rules="[v => !!v || '연락처를 입력해주세요']"
              hint="'-' 없이 숫자만 입력해주세요"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="phoneDialog = false">취소</v-btn>
          <v-btn
            color="primary"
            :disabled="!phoneFormValid"
            :loading="updatingPhone"
            @click="updatePhone"
          >
            변경
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 비밀번호 변경 다이얼로그 -->
    <v-dialog v-model="passwordDialog" max-width="500">
      <v-card>
        <v-card-title>비밀번호 변경</v-card-title>
        
        <v-card-text>
          <v-form ref="passwordForm" v-model="passwordFormValid">
            <v-text-field
              v-model="currentPassword"
              label="현재 비밀번호"
              type="password"
              :rules="[v => !!v || '현재 비밀번호를 입력해주세요']"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="newPassword"
              label="새 비밀번호"
              type="password"
              :rules="[
                v => !!v || '새 비밀번호를 입력해주세요',
                v => v.length >= 6 || '비밀번호는 최소 6자 이상이어야 합니다'
              ]"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="confirmPassword"
              label="비밀번호 확인"
              type="password"
              :rules="[
                v => !!v || '비밀번호를 다시 입력해주세요',
                v => v === newPassword || '비밀번호가 일치하지 않습니다'
              ]"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="error" @click="passwordDialog = false">취소</v-btn>
          <v-btn
            color="primary"
            :disabled="!passwordFormValid"
            :loading="updatingPassword"
            @click="updatePassword"
          >
            변경
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 하단 네비게이션 -->
    <bottom-navigation></bottom-navigation>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import BottomNavigation from '@/components/BottomNavigation'

export default {
  name: 'Profile',
  
  components: {
    BottomNavigation
  },
  
  data: () => ({
    loading: false,
    stats: {
      todayCompleted: 0,
      weeklyCompleted: 0,
      pending: 0,
      totalCompleted: 0
    },
    
    // 설정 값
    locationTracking: true,
    notifications: true,
    
    // 프로필 이미지 변경
    profileImageDialog: false,
    profileImage: null,
    profileImagePreview: null,
    uploadingImage: false,
    
    // 연락처 변경
    phoneDialog: false,
    phoneNumber: '',
    phoneFormValid: false,
    updatingPhone: false,
    
    // 비밀번호 변경
    passwordDialog: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    passwordFormValid: false,
    updatingPassword: false
  }),
  
  computed: {
    ...mapState({
      user: state => state.auth.user,
      requests: state => state.requests.items
    }),
    
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated'
    }),
    
    getUserInitials() {
      if (!this.user || !this.user.name) return '?'
      
      return this.user.name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
    },
    
    vehicle() {
      if (!this.user || !this.user.vehicleId) return null
      
      // 실제 구현에서는 vehicleId를 사용하여 차량 정보 조회
      // 예시 데이터 반환
      return {
        vehicleNumber: '서울83바1234',
        type: '중형 트럭'
      }
    }
  },
  
  watch: {
    profileImage(file) {
      if (!file) {
        this.profileImagePreview = null
        return
      }
      
      // 이미지 미리보기 생성
      const reader = new FileReader()
      reader.onload = e => {
        this.profileImagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    user(newUser) {
      if (newUser && newUser.phoneNumber) {
        this.phoneNumber = newUser.phoneNumber
      }
    }
  },
  
  created() {
    this.refreshData()
  },
  
  methods: {
    refreshData() {
      this.loading = true
      
      // 사용자 정보 로드
      this.$store.dispatch('auth/checkAuth')
        .then(() => {
          // 요청 목록 로드
          return this.$store.dispatch('requests/fetchDriverRequests')
        })
        .then(() => {
          // 통계 계산
          this.calculateStats()
          this.loading = false
        })
        .catch(err => {
          console.error('데이터 로드 실패:', err)
          this.loading = false
          
          this.$store.commit('notification/setNotification', {
            message: '데이터를 불러오는데 실패했습니다',
            type: 'error'
          })
        })
    },
    
    calculateStats() {
      // 날짜 범위 설정
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 7)
      
      // 통계 계산
      this.stats = {
        // 오늘 완료한 작업
        todayCompleted: this.requests.filter(req => 
          req.status === 'completed' && 
          new Date(req.updatedAt) >= today && 
          new Date(req.updatedAt) < tomorrow
        ).length,
        
        // 이번 주 완료한 작업
        weeklyCompleted: this.requests.filter(req => 
          req.status === 'completed' && 
          new Date(req.updatedAt) >= startOfWeek && 
          new Date(req.updatedAt) < endOfWeek
        ).length,
        
        // 진행중인 작업
        pending: this.requests.filter(req => 
          req.status === 'assigned' || req.status === 'in_progress'
        ).length,
        
        // 총 완료한 작업
        totalCompleted: this.requests.filter(req => 
          req.status === 'completed'
        ).length
      }
    },
    
    openProfileImageDialog() {
      this.profileImage = null
      this.profileImagePreview = null
      this.profileImageDialog = true
    },
    
    openPhoneDialog() {
      this.phoneNumber = this.user ? this.user.phoneNumber || '' : ''
      this.phoneDialog = true
    },
    
    openPasswordDialog() {
      this.currentPassword = ''
      this.newPassword = ''
      this.confirmPassword = ''
      this.passwordDialog = true
    },
    
    async updateProfileImage() {
      if (!this.profileImage) return
      
      this.uploadingImage = true
      
      try {
        // 프로필 이미지 업로드 API 호출 (예시)
        // const formData = new FormData()
        // formData.append('profileImage', this.profileImage)
        // 
        // const response = await this.$axios.post('/api/users/profile-image', formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data'
        //   }
        // })
        
        // 성공 처리
        this.$store.commit('notification/setNotification', {
          message: '프로필 사진이 변경되었습니다',
          type: 'success'
        })
        
        this.profileImageDialog = false
        this.refreshData()
      } catch (err) {
        console.error('프로필 이미지 업로드 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '프로필 사진 변경에 실패했습니다',
          type: 'error'
        })
      } finally {
        this.uploadingImage = false
      }
    },
    
    async updatePhone() {
      if (!this.$refs.phoneForm.validate()) return
      
      this.updatingPhone = true
      
      try {
        // 연락처 업데이트 API 호출 (예시)
        // await this.$store.dispatch('auth/updateProfile', {
        //   phoneNumber: this.phoneNumber
        // })
        
        // 성공 처리
        this.$store.commit('notification/setNotification', {
          message: '연락처가 변경되었습니다',
          type: 'success'
        })
        
        this.phoneDialog = false
        this.refreshData()
      } catch (err) {
        console.error('연락처 업데이트 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '연락처 변경에 실패했습니다',
          type: 'error'
        })
      } finally {
        this.updatingPhone = false
      }
    },
    
    async updatePassword() {
      if (!this.$refs.passwordForm.validate()) return
      
      this.updatingPassword = true
      
      try {
        // 비밀번호 변경 API 호출 (예시)
        // await this.$store.dispatch('auth/updatePassword', {
        //   currentPassword: this.currentPassword,
        //   newPassword: this.newPassword
        // })
        
        // 성공 처리
        this.$store.commit('notification/setNotification', {
          message: '비밀번호가 변경되었습니다',
          type: 'success'
        })
        
        this.passwordDialog = false
      } catch (err) {
        console.error('비밀번호 변경 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '비밀번호 변경에 실패했습니다: ' + (err.response?.data?.message || err.message),
          type: 'error'
        })
      } finally {
        this.updatingPassword = false
      }
    },
    
    toggleLocationTracking() {
      // 위치 추적 설정 변경
      if (this.locationTracking) {
        this.$store.dispatch('location/startTracking')
      } else {
        this.$store.dispatch('location/stopTracking')
      }
      
      this.$store.commit('notification/setNotification', {
        message: `위치 추적이 ${this.locationTracking ? '활성화' : '비활성화'}되었습니다`,
        type: 'info'
      })
    },
    
    toggleNotifications() {
      // 알림 설정 변경
      this.$store.commit('notification/setNotification', {
        message: `알림이 ${this.notifications ? '활성화' : '비활성화'}되었습니다`,
        type: 'info'
      })
    },
    
    logout() {
      this.$store.dispatch('auth/logout')
      this.$router.push('/login')
    }
  }
}
</script>
