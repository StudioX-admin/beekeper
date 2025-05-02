<template>
  <div class="request-card" :class="request.status" @click="handleClick">
    <div class="request-header">
      <span class="request-id">{{ request.requestId }}</span>
      <span class="status-badge" :class="request.status">
        {{ formatStatus(request.status) }}
      </span>
    </div>
    
    <div class="request-address">
      <span class="address-icon">📍</span>
      {{ request.address }}
    </div>
    
    <div class="request-details">
      <div class="detail-row">
        <span class="detail-label">폐기물:</span>
        <span class="detail-value">{{ formatWasteType(request.wasteType) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">수량:</span>
        <span class="detail-value">{{ request.quantity }}kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">요청일:</span>
        <span class="detail-value">{{ formatDate(request.requestDate) }}</span>
      </div>
    </div>
    
    <div class="request-actions">
      <button 
        v-if="request.status === 'assigned'"
        @click.stop="updateStatus('in-progress')" 
        class="btn btn-primary btn-sm"
      >
        수거 시작
      </button>
      <button 
        v-if="request.status === 'in-progress'"
        @click.stop="updateStatus('completed')" 
        class="btn btn-secondary btn-sm"
      >
        수거 완료
      </button>
      <button 
        v-if="showDetailsButton"
        @click.stop="viewDetails" 
        class="btn btn-outline btn-sm"
      >
        상세보기
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestCard',
  
  props: {
    request: {
      type: Object,
      required: true
    },
    showDetailsButton: {
      type: Boolean,
      default: true
    }
  },
  
  methods: {
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
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    updateStatus(newStatus) {
      this.$emit('update-status', { requestId: this.request._id, status: newStatus })
    },
    
    viewDetails() {
      this.$emit('view-details', this.request._id)
    },
    
    handleClick() {
      this.$emit('click', this.request)
    }
  }
}
</script>

<style scoped>
.request-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
}

.request-card.in-progress {
  border-left: 4px solid #4caf50;
}

.request-card.assigned {
  border-left: 4px solid #2196f3;
}

.request-card.completed {
  border-left: 4px solid #8bc34a;
  opacity: 0.8;
}

.request-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.request-id {
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff8e1;
  color: #ff8f00;
}

.status-badge.assigned {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.in-progress {
  background-color: #e8f5e9;
  color: #43a047;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.request-address {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
  display: flex;
  align-items: flex-start;
}

.address-icon {
  margin-right: 6px;
  flex-shrink: 0;
}

.request-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  margin-bottom: 6px;
}

.detail-label {
  width: 80px;
  color: #666;
  font-size: 14px;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

.request-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 14px;
}
</style>
