<!-- app/src/components/TaskCard.vue -->
<template>
  <div 
    class="task-card" 
    :class="{ 'completed': task.status === '완료' }" 
    @click="$emit('click', task.id)"
  >
    <div class="task-header">
      <div class="task-time">
        <i class="far fa-clock"></i>
        <span>{{ task.time }}</span>
      </div>
      <div class="task-status" :class="getStatusClass">
        {{ task.status }}
      </div>
    </div>
    
    <div class="task-body">
      <div class="task-address">
        <i class="fas fa-map-marker-alt"></i>
        <span>{{ task.address }}</span>
      </div>
      
      <div class="task-details">
        <div class="detail-item">
          <i class="fas fa-trash"></i>
          <span>{{ task.wasteType }}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-weight"></i>
          <span>{{ task.weight }}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-user"></i>
          <span>{{ task.requester }}</span>
        </div>
      </div>
    </div>
    
    <div class="task-actions">
      <button 
        v-if="task.status === '대기중'" 
        class="btn-action btn-start" 
        @click.stop="$emit('start', task.id)"
      >
        <i class="fas fa-play"></i>
        <span>수거 시작</span>
      </button>
      <button 
        v-if="task.status === '진행중'" 
        class="btn-action btn-complete" 
        @click.stop="$emit('complete', task.id)"
      >
        <i class="fas fa-check"></i>
        <span>수거 완료</span>
      </button>
      <button 
        class="btn-action btn-navigate" 
        @click.stop="$emit('navigate', task.address)"
      >
        <i class="fas fa-directions"></i>
        <span>길찾기</span>
      </button>
    </div>
    
    <div v-if="task.status === '완료'" class="completed-ribbon">
      <span>완료</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  computed: {
    getStatusClass() {
      const statusClasses = {
        '대기중': 'status-pending',
        '진행중': 'status-processing',
        '완료': 'status-completed',
        '취소됨': 'status-cancelled'
      };
      
      return statusClasses[this.task.status] || '';
    }
  }
}
</script>

<style scoped>
.task-card {
  position: relative;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-bottom: 1rem;
  overflow: hidden;
}

.task-card.completed {
  opacity: 0.8;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.task-time {
  display: flex;
  align-items: center;
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  color: var(--text-primary);
}

.task-time i {
  margin-right: 0.5rem;
  color: var(--primary-color);
}

.task-status {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: 9999px;
}

.status-pending {
  background-color: #fff3c7;
  color: #92400e;
}

.status-processing {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}

.task-body {
  padding: 1rem;
}

.task-address {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.task-address i {
  margin-right: 0.5rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.task-address span {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.task-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-right: 0.75rem;
}

.detail-item i {
  margin-right: 0.5rem;
  color: var(--secondary-color);
  width: 1rem;
  text-align: center;
}

.task-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast) var(--easing-default);
}

.btn-action i {
  margin-right: 0.5rem;
}

.btn-start {
  background-color: var(--secondary-color);
  color: var(--text-light);
}

.btn-start:hover {
  background-color: #2563eb;
}

.btn-complete {
  background-color: var(--success-color);
  color: var(--text-light);
}

.btn-complete:hover {
  background-color: #0ca678;
}

.btn-navigate {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-navigate:hover {
  background-color: var(--border-color);
}

.completed-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  overflow: hidden;
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.completed-ribbon span {
  position: absolute;
  top: 20px;
  right: -25px;
  display: block;
  width: 120px;
  padding: 5px 0;
  background-color: var(--success-color);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-align: center;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
