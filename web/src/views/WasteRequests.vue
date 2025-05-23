<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card outlined>
            <v-card-title>
              폐기물 수거 요청 관리
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="openNewRequestDialog">
                <v-icon left>mdi-plus</v-icon>
                새 요청
              </v-btn>
            </v-card-title>
            
            <v-tabs v-model="activeTab" background-color="transparent" grow>
              <v-tab v-for="tab in tabs" :key="tab.value">
                {{ tab.text }}
                <v-badge
                  v-if="tab.count > 0"
                  :content="tab.count"
                  color="primary"
                  offset-x="10"
                  offset-y="-8"
                ></v-badge>
              </v-tab>
            </v-tabs>
            
            <v-card-text>
              <v-row class="mb-3">
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="search"
                    label="검색"
                    prepend-icon="mdi-magnify"
                    clearable
                    @input="debouncedSearch"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="wasteTypeFilter"
                    :items="wasteTypeOptions"
                    label="폐기물 유형"
                    multiple
                    chips
                    clearable
                    @change="fetchRequests"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="4">
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
              
              <!-- 요청 목록 -->
              <request-list
                :requests="filteredRequests"
                :loading="loading"
                @refresh="fetchRequests"
              ></request-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 새 요청 다이얼로그 -->
    <v-dialog v-model="newRequestDialog" max-width="800px">
      <v-card>
        <v-card-title>새 폐기물 수거 요청</v-card-title>
        
        <v-card-text>
          <v-form ref="requestForm" v-model="formValid">
            <v-container>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newRequest.customer.name"
                    label="고객명"
                    :rules="[v => !!v || '고객명을 입력해주세요']"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="newRequest.customer.contact"
                    label="연락처"
                    :rules="[v => !!v || '연락처를 입력해주세요']"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-text-field
                    v-model="newRequest.customer.address"
                    label="수거 주소"
                    :rules="[v => !!v || '주소를 입력해주세요']"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-select
                    v-model="newRequest.wasteType"
                    :items="wasteTypeOptions"
                    label="폐기물 유형"
                    :rules="[v => !!v || '폐기물 유형을 선택해주세요']"
                    required
                  ></v-select>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="newRequest.wasteAmount"
                    label="예상 무게 (kg)"
                    type="number"
                    :rules="[
                      v => !!v || '예상 무게를 입력해주세요',
                      v => v > 0 || '무게는 0보다 커야 합니다'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-menu
                    ref="scheduledDateMenu"
                    v-model="scheduledDateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="formattedScheduledDate"
                        label="예약 날짜"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        :rules="[v => !!v || '예약 날짜를 선택해주세요']"
                        required
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="newRequest.scheduledDate"
                      no-title
                      scrollable
                      @input="scheduledDateMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-menu
                    ref="scheduledTimeMenu"
                    v-model="scheduledTimeMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="scheduledTime"
                        label="예약 시간"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                        :rules="[v => !!v || '예약 시간을 선택해주세요']"
                        required
                      ></v-text-field>
                    </template>
                    <v-time-picker
                      v-model="scheduledTime"
                      format="24hr"
                      @click:minute="scheduledTimeMenu = false"
                    ></v-time-picker>
                  </v-menu>
                </v-col>
                
                <v-col cols="12">
                  <v-textarea
                    v-model="newRequest.notes"
                    label="참고 사항"
                    rows="3"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="newRequestDialog = false">취소</v-btn>
          <v-btn color="primary" :disabled="!formValid" @click="createRequest">등록</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRequestStore } from '@/stores/request'
import { useAuthStore } from '@/stores/auth'
import { debounce } from 'lodash'
import RequestList from '@/components/RequestList'

// Store
const requestStore = useRequestStore()
const authStore = useAuthStore()

// State
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const loading = ref(false)
const error = ref(null)

// Computed
const requests = computed(() => requestStore.requests)
const totalPages = computed(() => requestStore.totalPages)
const currentPage = computed(() => requestStore.currentPage)
const userRole = computed(() => authStore.userRole)

// Methods
const handleSearch = async () => {
  try {
    loading.value = true
    const params = {
      query: searchQuery.value,
      status: statusFilter.value,
      date: dateFilter.value,
      page: currentPage.value
    }
    await requestStore.fetchRequests(params)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const changePage = async (page) => {
  try {
    loading.value = true
    const params = {
      query: searchQuery.value,
      status: statusFilter.value,
      date: dateFilter.value,
      page
    }
    await requestStore.fetchRequests(params)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  await handleSearch()
})

export default {
  name: 'WasteRequests',
  
  components: {
    RequestList
  },
  
  data: () => ({
    activeTab: 0,
    search: '',
    wasteTypeFilter: [],
    dateRange: [],
    dateMenu: false,
    newRequestDialog: false,
    formValid: false,
    newRequest: {
      customer: {
        name: '',
        contact: '',
        address: ''
      },
      wasteType: '',
      wasteAmount: 0,
      scheduledDate: new Date().toISOString().substr(0, 10),
      notes: '',
      location: {
        type: 'Point',
        coordinates: [126.9780, 37.5665] // 기본 좌표 (서울)
      }
    },
    scheduledDateMenu: false,
    scheduledTimeMenu: false,
    scheduledTime: '09:00',
    wasteTypeOptions: [
      { text: '일반 폐기물', value: 'general' },
      { text: '재활용', value: 'recycle' },
      { text: '음식물', value: 'food' },
      { text: '건설 폐기물', value: 'construction' },
      { text: '위험 폐기물', value: 'hazardous' }
    ]
  }),
  
  computed: {
    requests() {
      return requestStore.requests
    },
    totalPages() {
      return requestStore.totalPages
    },
    currentPage() {
      return requestStore.currentPage
    },
    userRole() {
      return authStore.userRole
    },
    tabs() {
      // 상태별 요청 수 계산
      const counts = {
        all: this.requests.length,
        requested: this.requests.filter(r => r.status === 'requested').length,
        assigned: this.requests.filter(r => r.status === 'assigned').length,
        in_progress: this.requests.filter(r => r.status === 'in_progress').length,
        completed: this.requests.filter(r => r.status === 'completed').length,
        cancelled: this.requests.filter(r => r.status === 'cancelled').length
      }
      
      return [
        { text: '모든 요청', value: 'all', count: counts.all },
        { text: '미배정', value: 'requested', count: counts.requested },
        { text: '배정됨', value: 'assigned', count: counts.assigned },
        { text: '진행 중', value: 'in_progress', count: counts.in_progress },
        { text: '완료됨', value: 'completed', count: counts.completed },
        { text: '취소됨', value: 'cancelled', count: counts.cancelled }
      ]
    },
    
    activeTabStatus() {
      return this.tabs[this.activeTab].value
    },
    
    filteredRequests() {
      let filtered = [...this.requests]
      
      // 탭 필터링
      if (this.activeTabStatus !== 'all') {
        filtered = filtered.filter(req => req.status === this.activeTabStatus)
      }
      
      // 검색 필터링
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        filtered = filtered.filter(req => 
          req.requestId.toLowerCase().includes(searchLower) ||
          req.customer.name.toLowerCase().includes(searchLower) ||
          req.customer.address.toLowerCase().includes(searchLower) ||
          req.customer.contact.toLowerCase().includes(searchLower)
        )
      }
      
      // 폐기물 유형 필터링
      if (this.wasteTypeFilter && this.wasteTypeFilter.length > 0) {
        filtered = filtered.filter(req => this.wasteTypeFilter.includes(req.wasteType))
      }
      
      // 날짜 범위 필터링
      if (this.dateRange && this.dateRange.length === 2) {
        const startDate = new Date(this.dateRange[0])
        startDate.setHours(0, 0, 0, 0)
        
        const endDate = new Date(this.dateRange[1])
        endDate.setHours(23, 59, 59, 999)
        
        filtered = filtered.filter(req => {
          const scheduledDate = new Date(req.scheduledDate)
          return scheduledDate >= startDate && scheduledDate <= endDate
        })
      }
      
      return filtered
    },
    
    dateRangeText() {
      if (!this.dateRange || this.dateRange.length === 0) return ''
      
      if (this.dateRange.length === 1) {
        return this.formatDate(this.dateRange[0])
      }
      
      return `${this.formatDate(this.dateRange[0])} ~ ${this.formatDate(this.dateRange[1])}`
    },
    
    formattedScheduledDate() {
      return this.formatDate(this.newRequest.scheduledDate)
    }
  },
  
  created() {
    this.debouncedSearch = debounce(() => {
      this.fetchRequests()
    }, 500)
    
    this.fetchRequests()
  },
  
  methods: {
    fetchRequests() {
      const params = {}
      
      if (this.search) {
        params.search = this.search
      }
      
      if (this.wasteTypeFilter && this.wasteTypeFilter.length > 0) {
        params.wasteType = this.wasteTypeFilter.join(',')
      }
      
      if (this.dateRange && this.dateRange.length === 2) {
        params.startDate = this.dateRange[0]
        params.endDate = this.dateRange[1]
      }
      
      this.$store.dispatch('wasteRequests/fetchRequests', params)
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
    },
    
    clearDateRange() {
      this.dateRange = []
      this.fetchRequests()
    },
    
    updateDateRange() {
      this.dateMenu = false
      this.fetchRequests()
    },
    
    openNewRequestDialog() {
      this.newRequest = {
        customer: {
          name: '',
          contact: '',
          address: ''
        },
        wasteType: '',
        wasteAmount: 0,
        scheduledDate: new Date().toISOString().substr(0, 10),
        notes: '',
        location: {
          type: 'Point',
          coordinates: [126.9780, 37.5665] // 기본 좌표 (서울)
        }
      }
      this.scheduledTime = '09:00'
      this.newRequestDialog = true
    },
    
    async createRequest() {
      if (!this.$refs.requestForm.validate()) return
      
      try {
        // 날짜와 시간 결합
        const [hours, minutes] = this.scheduledTime.split(':')
        const scheduledDateTime = new Date(this.newRequest.scheduledDate)
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        
        // 요청 생성
        await this.$store.dispatch('wasteRequests/createRequest', {
          ...this.newRequest,
          scheduledDate: scheduledDateTime.toISOString()
        })
        
        this.$store.commit('notification/setNotification', {
          message: '새 요청이 생성되었습니다',
          type: 'success'
        })
        
        this.newRequestDialog = false
        this.fetchRequests()
      } catch (err) {
        console.error('요청 생성 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '오류가 발생했습니다: ' + (err.response?.data?.message || err.message),
          type: 'error'
        })
      }
    }
  },
  
  watch: {
    activeTab() {
      this.fetchRequests()
    }
  }
}
</script>

<style scoped>
.v-badge__badge {
  font-size: 10px;
  height: 18px;
  min-width: 18px;
  padding: 0 4px;
}
</style>
