<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="requests"
      :loading="loading"
      :options.sync="options"
      :server-items-length="totalItems"
      :footer-props="{
        'items-per-page-options': [10, 25, 50]
      }"
      class="elevation-1"
      @click:row="handleRowClick"
    >
      <template v-slot:item.customer.name="{ item }">
        <div>
          <div>{{ item.customer.name }}</div>
          <div class="text-caption">{{ item.requestId }}</div>
        </div>
      </template>
      
      <template v-slot:item.customer.address="{ item }">
        <div class="address-cell">{{ item.customer.address }}</div>
      </template>
      
      <template v-slot:item.wasteType="{ item }">
        <v-chip
          small
          :color="getWasteTypeColor(item.wasteType)"
          text-color="white"
        >
          {{ getWasteTypeText(item.wasteType) }}
        </v-chip>
        <div class="text-caption mt-1">{{ item.wasteAmount }}kg</div>
      </template>
      
      <template v-slot:item.scheduledDate="{ item }">
        {{ formatDate(item.scheduledDate) }}
      </template>
      
      <template v-slot:item.status="{ item }">
        <v-chip
          small
          :color="getStatusColor(item.status)"
          text-color="white"
        >
          {{ getStatusText(item.status) }}
        </v-chip>
      </template>
      
      <template v-slot:item.assignedDriver="{ item }">
        <div v-if="item.assignedDriver">
          {{ getDriverName(item.assignedDriver) }}
        </div>
        <div v-else class="text-caption">미배정</div>
      </template>
      
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          small
          color="primary"
          @click.stop="viewRequest(item)"
          class="mr-1"
        >
          <v-icon small>mdi-eye</v-icon>
        </v-btn>
        
        <v-btn
          v-if="item.status === 'requested'"
          icon
          small
          color="success"
          @click.stop="assignRequest(item)"
        >
          <v-icon small>mdi-account-check</v-icon>
        </v-btn>
      </template>
      
      <template v-slot:no-data>
        <div class="text-center pa-5">
          <v-icon large color="grey lighten-1">mdi-clipboard-text</v-icon>
          <div class="text-h6 grey--text text--darken-1 mt-2">
            요청이 없습니다
          </div>
          <div class="text-body-2 grey--text mt-1">
            요청이 추가되면 여기에 표시됩니다
          </div>
        </div>
      </template>
    </v-data-table>
    
    <!-- 기사 배정 다이얼로그 -->
    <request-assignment-modal
      v-if="selectedRequest"
      :request="selectedRequest"
      :visible="assignDialog"
      @close="assignDialog = false"
      @assigned="handleAssigned"
    ></request-assignment-modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRequestStore } from '@/stores/request'
import { useAuthStore } from '@/stores/auth'
import RequestAssignmentModal from '@/components/RequestAssignmentModal';

// Store
const requestStore = useRequestStore()
const authStore = useAuthStore()

// State
const loading = ref(false)
const error = ref(null)

// Computed
const requests = computed(() => requestStore.requests)
const userRole = computed(() => authStore.userRole)

// Methods
const handleStatusChange = async (requestId, newStatus) => {
  try {
    loading.value = true
    await requestStore.updateRequestStatus(requestId, newStatus)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleAssign = async (requestId) => {
  try {
    loading.value = true
    await requestStore.assignRequest(requestId)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true
    await requestStore.fetchRequests()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

export default {
  name: 'RequestList',
  
  components: {
    RequestAssignmentModal
  },
  
  props: {
    totalItems: {
      type: Number,
      default: 0
    },
    showDriver: {
      type: Boolean,
      default: true
    }
  },
  
  data: () => ({
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ['scheduledDate'],
      sortDesc: [false]
    },
    assignDialog: false,
    selectedRequest: null
  }),
  
  computed: {
    headers() {
      const baseHeaders = [
        { text: '고객 정보', value: 'customer.name', width: '15%' },
        { text: '주소', value: 'customer.address', width: '25%' },
        { text: '폐기물 유형', value: 'wasteType', width: '12%' },
        { text: '예약일', value: 'scheduledDate', width: '15%' },
        { text: '상태', value: 'status', width: '10%' }
      ];
      
      // 기사 정보 컬럼 추가 (옵션)
      if (this.showDriver) {
        baseHeaders.push({ text: '배정 기사', value: 'assignedDriver', width: '13%' });
      }
      
      // 작업 컬럼 추가
      baseHeaders.push({ text: '작업', value: 'actions', width: '10%', sortable: false });
      
      return baseHeaders;
    }
  },
  
  watch: {
    options: {
      handler() {
        this.$emit('update:options', this.options);
      },
      deep: true
    }
  },
  
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getWasteTypeText(type) {
      const types = {
        general: '일반 폐기물',
        recycle: '재활용',
        food: '음식물',
        construction: '건설 폐기물',
        hazardous: '위험 폐기물'
      };
      
      return types[type] || '알 수 없음';
    },
    
    getWasteTypeColor(type) {
      const colors = {
        general: 'blue',
        recycle: 'green',
        food: 'orange',
        construction: 'brown',
        hazardous: 'red'
      };
      
      return colors[type] || 'grey';
    },
    
    getStatusColor(status) {
      const colors = {
        requested: 'grey',
        assigned: 'info',
        in_progress: 'warning',
        completed: 'success',
        cancelled: 'error'
      };
      
      return colors[status] || 'grey';
    },
    
    getStatusText(status) {
      const texts = {
        requested: '요청됨',
        assigned: '배정됨',
        in_progress: '진행중',
        completed: '완료됨',
        cancelled: '취소됨'
      };
      
      return texts[status] || '알 수 없음';
    },
    
    getDriverName(driverId) {
      if (!driverId) return '미배정';
      
      const driver = this.drivers.find(d => d._id === driverId);
      return driver ? driver.name : '알 수 없음';
    },
    
    handleRowClick(item) {
      this.viewRequest(item);
    },
    
    viewRequest(request) {
      this.$router.push(`/waste-requests/${request._id}`);
    },
    
    assignRequest(request) {
      this.selectedRequest = request;
      this.assignDialog = true;
    },
    
    handleAssigned() {
      this.assignDialog = false;
      this.$emit('refresh');
      
      this.$store.commit('notification/setNotification', {
        message: '기사 배정이 완료되었습니다',
        type: 'success'
      });
    }
  }
};
</script>

<style scoped>
.address-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 테이블 행 호버 효과 */
::v-deep .v-data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03) !important;
  cursor: pointer;
}
</style>
