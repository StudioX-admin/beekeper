<template>
  <div>
    <v-app-bar color="primary" dark app>
      <v-app-bar-title>완료된 작업</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="refreshData">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <!-- 날짜 필터 -->
        <v-row class="mb-3">
          <v-col cols="12">
            <v-menu
              ref="dateMenu"
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="dateRangeText"
                  label="날짜 범위"
                  prepend-icon="mdi-calendar"
                  readonly
                  clearable
                  outlined
                  dense
                  hide-details
                  v-bind="attrs"
                  v-on="on"
                  @click:clear="clearDateRange"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateRange"
                range
                no-title
                scrollable
                @input="updateDateRange"
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        
        <!-- 로딩 표시 -->
        <v-skeleton-loader
          v-if="loading && !completedRequests.length"
          type="list-item-avatar-three-line, list-item-avatar-three-line"
          class="my-4"
        ></v-skeleton-loader>
        
        <!-- 데이터 없음 표시 -->
        <v-card
          v-else-if="!completedRequests.length"
          outlined
          class="text-center py-8 my-4"
        >
          <v-icon
            size="64"
            color="grey lighten-1"
          >
            mdi-clipboard-check
          </v-icon>
          <div class="text-h6 grey--text text--darken-1 mt-2">
            완료된 작업이 없습니다
          </div>
          <div class="text-body-2 grey--text mt-1">
            선택한 기간에 완료된 작업이 없습니다
          </div>
        </v-card>
        
        <!-- 완료된 요청 목록 -->
        <template v-else>
          <div class="text-subtitle-1 font-weight-bold mb-2">
            총 {{ completedRequests.length }}개의 완료된 작업
          </div>
          
          <v-card
            v-for="request in completedRequests"
            :key="request._id"
            outlined
            class="mb-3"
            @click="goToRequestDetail(request._id)"
          >
            <v-card-text class="pa-3">
              <div class="d-flex">
                <v-avatar
                  color="success"
                  size="56"
                  class="mr-3"
                >
                  <v-icon dark>mdi-check-circle</v-icon>
                </v-avatar>
                
                <div class="flex-grow-1">
                  <div class="d-flex align-center">
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ request.customer.name }}
                    </div>
                    <v-spacer></v-spacer>
                    <div class="text-caption">
                      {{ formatDate(request.updatedAt) }}
                    </div>
                  </div>
                  
                  <div class="text-caption mb-2">
                    {{ request.customer.address }}
                  </div>
                  
                  <div class="d-flex align-center">
                    <v-chip
                      x-small
                      :color="getWasteTypeColor(request.wasteType)"
                      text-color="white"
                      class="mr-2"
                    >
                      {{ getWasteTypeText(request.wasteType) }}
                    </v-chip>
                    
                    <div class="text-caption">
                      {{ request.wasteAmount }}kg
                    </div>
                    
                    <v-spacer></v-spacer>
                    
                    <div class="text-caption">
                      요청 #{{ request.requestId }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
            
            <!-- 사진 미리보기 -->
            <div v-if="request.completionPhotos && request.completionPhotos.length > 0">
              <v-divider></v-divider>
              <v-row class="ma-0 pa-1">
                <v-col
                  v-for="(photo, index) in request.completionPhotos.slice(0, 4)"
                  :key="index"
                  cols="3"
                  class="pa-1"
                >
                  <v-img
                    :src="photo.url"
                    aspect-ratio="1"
                    class="rounded-lg"
                    height="60"
                  ></v-img>
                </v-col>
                
                <v-col
                  v-if="request.completionPhotos.length > 4"
                  cols="3"
                  class="pa-1 position-relative"
                >
                  <v-img
                    :src="request.completionPhotos[4].url"
                    aspect-ratio="1"
                    class="rounded-lg"
                    height="60"
                  >
                    <div
                      class="fill-height d-flex align-center justify-center rounded-lg"
                      style="background-color: rgba(0, 0, 0, 0.6);"
                    >
                      <span class="white--text">+{{ request.completionPhotos.length - 4 }}</span>
                    </div>
                  </v-img>
                </v-col>
              </v-row>
            </div>
          </v-card>
        </template>
      </v-container>
    </v-main>
    
    <!-- 하단 네비게이션 -->
    <bottom-navigation></bottom-navigation>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BottomNavigation from '@/components/BottomNavigation'

export default {
  name: 'CompletedRequests',
  
  components: {
    BottomNavigation
  },
  
  data: () => ({
    dateRange: [],
    dateMenu: false
  }),
  
  computed: {
    ...mapState({
      requests: state => state.requests.items,
      loading: state => state.requests.loading
    }),
    
    completedRequests() {
      // 완료된 요청만 필터링
      let filtered = this.requests.filter(request => request.status === 'completed')
      
      // 날짜 범위 필터링
      if (this.dateRange && this.dateRange.length === 2) {
        const startDate = new Date(this.dateRange[0])
        startDate.setHours(0, 0, 0, 0)
        
        const endDate = new Date(this.dateRange[1])
        endDate.setHours(23, 59, 59, 999)
        
        filtered = filtered.filter(request => {
          const completedDate = new Date(request.updatedAt)
          return completedDate >= startDate && completedDate <= endDate
        })
      }
      
      // 날짜 기준 내림차순 정렬
      return filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    },
    
    dateRangeText() {
      if (!this.dateRange || this.dateRange.length === 0) return ''
      
      if (this.dateRange.length === 1) {
        return this.formatDate(this.dateRange[0])
      }
      
      return `${this.formatDate(this.dateRange[0])} ~ ${this.formatDate(this.dateRange[1])}`
    }
  },
  
  created() {
    this.fetchData()
  },
  
  methods: {
    fetchData() {
      this.$store.dispatch('requests/fetchDriverRequests')
    },
    
    refreshData() {
      this.fetchData()
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
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
    
    getWasteTypeColor(type) {
      const colors = {
        general: 'blue',
        recycle: 'green',
        food: 'orange',
        construction: 'brown',
        hazardous: 'red'
      }
      
      return colors[type] || 'grey'
    },
    
    clearDateRange() {
      this.dateRange = []
    },
    
    updateDateRange() {
      this.dateMenu = false
    },
    
    goToRequestDetail(id) {
      this.$router.push(`/requests/${id}`)
    }
  }
}
</script>

<style scoped>
.position-relative {
  position: relative;
}
</style>
