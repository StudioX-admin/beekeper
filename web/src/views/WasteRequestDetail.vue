<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <!-- 상단 네비게이션 -->
          <v-card flat class="mb-4">
            <v-card-text>
              <v-btn text color="primary" to="/waste-requests">
                <v-icon left>mdi-arrow-left</v-icon>
                요청 목록으로 돌아가기
              </v-btn>
            </v-card-text>
          </v-card>
          
          <!-- 로딩 표시 -->
          <v-skeleton-loader
            v-if="loading"
            type="card, card-heading, list-item-three-line, image"
            class="my-4"
          ></v-skeleton-loader>
          
          <!-- 오류 표시 -->
          <v-alert
            v-else-if="error"
            type="error"
            outlined
            class="my-4"
          >
            {{ error }}
            <template v-slot:append>
              <v-btn
                text
                small
                color="error"
                @click="fetchRequestDetails"
              >
                다시 시도
              </v-btn>
            </template>
          </v-alert>
          
          <template v-else-if="request">
            <!-- 요청 헤더 -->
            <v-card outlined class="mb-4">
              <v-card-title class="d-flex justify-space-between">
                <div>
                  <span class="text-h5">요청 #{{ request.requestId }}</span>
                  <v-chip
                    :color="getStatusColor(request.status)"
                    text-color="white"
                    class="ml-2"
                  >
                    {{ getStatusText(request.status) }}
                  </v-chip>
                </div>
                
                <div>
                  <v-btn
                    v-if="request.status === 'requested'"
                    color="primary"
                    class="mr-2"
                    @click="openAssignDialog"
                  >
                    <v-icon left>mdi-account-check</v-icon>
                    기사 배정
                  </v-btn>
                  
                  <v-btn
                    v-if="['requested', 'assigned'].includes(request.status)"
                    color="error"
                    @click="confirmCancel"
                  >
                    <v-icon left>mdi-cancel</v-icon>
                    취소
                  </v-btn>
                </div>
              </v-card-title>
              
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-calendar</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>예약 날짜</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(request.scheduledDate) }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-calendar-clock</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>요청일</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(request.createdAt) }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item v-if="request.assignedDriver">
                      <v-list-item-icon>
                        <v-icon>mdi-account-hard-hat</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>배정 기사</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ getDriverName(request.assignedDriver) }}
                          ({{ getVehicleNumber(request.assignedVehicle) }})
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-account</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>고객명</v-list-item-title>
                        <v-list-item-subtitle>{{ request.customer.name }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-phone</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>연락처</v-list-item-title>
                        <v-list-item-subtitle>{{ request.customer.contact }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn
                          icon
                          small
                          :href="`tel:${request.customer.contact}`"
                        >
                          <v-icon color="primary">mdi-phone</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                    
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-map-marker</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>수거 주소</v-list-item-title>
                        <v-list-item-subtitle>{{ request.customer.address }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- 요청 상세 정보 -->
            <v-row>
              <v-col cols="12" md="6">
                <v-card outlined height="100%">
                  <v-card-title>폐기물 정보</v-card-title>
                  <v-card-text>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-recycle</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>폐기물 유형</v-list-item-title>
                        <v-list-item-subtitle>{{ getWasteTypeText(request.wasteType) }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-weight</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>예상 무게</v-list-item-title>
                        <v-list-item-subtitle>{{ request.wasteAmount }}kg</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item v-if="request.notes">
                      <v-list-item-icon>
                        <v-icon>mdi-note-text</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>참고 사항</v-list-item-title>
                        <v-list-item-subtitle>{{ request.notes }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card outlined height="100%">
                  <v-card-title>위치 정보</v-card-title>
                  <v-card-text>
                    <div id="map" style="height: 300px;"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- 진행 상황 및 사진 -->
            <v-card outlined class="mt-4" v-if="request.status !== 'requested'">
              <v-card-title>진행 상황</v-card-title>
              <v-card-text>
                <v-timeline dense>
                  <v-timeline-item
                    color="primary"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.createdAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">요청 생성</h3>
                      <p class="text-caption">
                        {{ request.customer.name }}님이 {{ getWasteTypeText(request.wasteType) }} 수거를 요청했습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                  
                  <v-timeline-item
                    v-if="request.status !== 'requested'"
                    color="blue"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.updatedAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">기사 배정</h3>
                      <p class="text-caption">
                        {{ getDriverName(request.assignedDriver) }} 기사에게 배정되었습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                  
                  <v-timeline-item
                    v-if="request.status === 'in_progress' || request.status === 'completed'"
                    color="orange"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.updatedAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">작업 시작</h3>
                      <p class="text-caption">
                        기사가 수거 작업을 시작했습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                  
                  <v-timeline-item
                    v-if="request.status === 'completed'"
                    color="success"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.updatedAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">작업 완료</h3>
                      <p class="text-caption">
                        폐기물 수거가 완료되었습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                  
                  <v-timeline-item
                    v-if="request.status === 'cancelled'"
                    color="error"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.updatedAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">요청 취소</h3>
                      <p class="text-caption">
                        요청이 취소되었습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
            
            <!-- 완료 사진 -->
            <v-card outlined class="mt-4" v-if="request.status === 'completed' && request.completionPhotos && request.completionPhotos.length > 0">
              <v-card-title>완료 사진</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="(photo, index) in request.completionPhotos"
                    :key="index"
                    cols="12"
                    sm="6"
                    md="4"
                    lg="3"
                  >
                    <v-card outlined>
                      <v-img
                        :src="photo.url"
                        aspect-ratio="1"
                        class="grey lighten-2"
                        @click="openPhotoDialog(photo.url)"
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
                      <v-card-text class="text-caption text-center">
                        {{ formatDate(photo.uploadedAt) }}
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 기사 배정 다이얼로그 -->
    <request-assignment-modal
      v-if="request"
      :request="request"
      :visible="assignDialog"
      @close="assignDialog = false"
      @assigned="handleAssigned"
    ></request-assignment-modal>
    
    <!-- 취소 확인 다이얼로그 -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card>
        <v-card-title>요청 취소</v-card-title>
        <v-card-text>
          <p>정말로 이 요청을 취소하시겠습니까?</p>
          <p class="text-caption">이 작업은 되돌릴 수 없습니다.</p>
          
          <v-textarea
            v-model="cancelReason"
            label="취소 사유"
            rows="3"
            placeholder="취소 사유를 입력해주세요..."
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="cancelDialog = false">취소</v-btn>
          <v-btn color="error" @click="cancelRequest">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 사진 확대 다이얼로그 -->
    <v-dialog v-model="photoDialog" max-width="800">
      <v-card>
        <v-img
          :src="selectedPhoto"
          max-height="80vh"
          contain
        ></v-img>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn icon @click="photoDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import L from 'leaflet'
import RequestAssignmentModal from '@/components/RequestAssignmentModal'

export default {
  name: 'WasteRequestDetail',
  
  components: {
    RequestAssignmentModal
  },
  
  props: {
    id: {
      type: String,
      required: true
    }
  },
  
  data: () => ({
    map: null,
    marker: null,
    assignDialog: false,
    cancelDialog: false,
    cancelReason: '',
    photoDialog: false,
    selectedPhoto: ''
  }),
  
  computed: {
    ...mapState({
      request: state => state.wasteRequests.currentRequest,
      loading: state => state.wasteRequests.loading,
      error: state => state.wasteRequests.error,
      drivers: state => state.drivers.items,
      vehicles: state => state.vehicles.items
    })
  },
  
  created() {
    this.fetchRequestDetails()
  },
  
  mounted() {
    this.initMap()
  },
  
  updated() {
    this.updateMap()
  },
  
  beforeDestroy() {
    if (this.map) {
      this.map.remove()
    }
  },
  
  methods: {
    fetchRequestDetails() {
      this.$store.dispatch('wasteRequests/fetchRequestById', this.id)
    },
    
    initMap() {
      if (!this.$el.querySelector('#map')) return
      
      // 지도 초기화
      this.map = L.map('map', {
        center: [37.5665, 126.9780], // 서울 좌표
        zoom: 12,
        zoomControl: false
      })
      
      // 타일 레이어 추가
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map)
      
      // 줌 컨트롤 위치 변경
      L.control.zoom({
        position: 'topright'
      }).addTo(this.map)
      
      this.updateMap()
    },
    
    updateMap() {
      if (!this.map || !this.request || !this.request.location || !this.request.location.coordinates) return
      
      const [lng, lat] = this.request.location.coordinates
      
      // 이전 마커 제거
      if (this.marker) {
        this.marker.remove()
      }
      
      // 새 마커 추가
      this.marker = L.marker([lat, lng]).addTo(this.map)
      
      // 지도 중심 설정
      this.map.setView([lat, lng], 15)
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getStatusColor(status) {
      const colors = {
        requested: 'grey',
        assigned: 'info',
        in_progress: 'warning',
        completed: 'success',
        cancelled: 'error'
      }
      
      return colors[status] || 'grey'
    },
    
    getStatusText(status) {
      const texts = {
        requested: '요청됨',
        assigned: '배정됨',
        in_progress: '진행중',
        completed: '완료됨',
        cancelled: '취소됨'
      }
      
      return texts[status] || '알 수 없음'
    },
    
    getWasteTypeText(type) {
      const types = {
        general: '일반 폐기물',
        recycle: '재활용',
        food: '음식물',
        construction: '건설 폐기물',
        hazardous: '위험 폐기물'
      }
      
      return types[type] || '알 수 없음'
    },
    
    getDriverName(driverId) {
      if (!driverId) return '미배정'
      
      const driver = this.drivers.find(d => d._id === driverId)
      return driver ? driver.name : '알 수 없음'
    },
    
    getVehicleNumber(vehicleId) {
      if (!vehicleId) return ''
      
      const vehicle = this.vehicles.find(v => v._id === vehicleId)
      return vehicle ? vehicle.vehicleNumber : ''
    },
    
    openAssignDialog() {
      this.assignDialog = true
    },
    
    handleAssigned() {
      this.assignDialog = false
      this.fetchRequestDetails()
      
      this.$store.commit('notification/setNotification', {
        message: '기사 배정이 완료되었습니다',
        type: 'success'
      })
    },
    
    confirmCancel() {
      this.cancelReason = ''
      this.cancelDialog = true
    },
    
    async cancelRequest() {
      try {
        await this.$store.dispatch('wasteRequests/updateRequest', {
          id: this.id,
          data: {
            status: 'cancelled',
            notes: this.request.notes + `\n\n취소 사유: ${this.cancelReason}`
          }
        })
        
        this.$store.commit('notification/setNotification', {
          message: '요청이 취소되었습니다',
          type: 'success'
        })
        
        this.cancelDialog = false
        this.fetchRequestDetails()
      } catch (err) {
        console.error('요청 취소 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '오류가 발생했습니다: ' + (err.response?.data?.message || err.message),
          type: 'error'
        })
      }
    },
    
    openPhotoDialog(photoUrl) {
      this.selectedPhoto = photoUrl
      this.photoDialog = true
    }
  },
  
  watch: {
    id() {
      this.fetchRequestDetails()
    }
  }
}
</script>

<style scoped>
#map {
  width: 100%;
  height: 300px;
  border-radius: 4px;
}

.v-timeline-item__body {
  max-width: 100%;
}
</style>
