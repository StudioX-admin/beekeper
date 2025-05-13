<!-- web/src/components/common/Toast.vue -->
<template>
  <transition-group name="toast" tag="div" class="toast-container">
    <div 
      v-for="toast in toasts" 
      :key="toast.id" 
      class="toast-item" 
      :class="toast.type"
    >
      <div class="toast-icon">
        <i :class="getIconClass(toast.type)"></i>
      </div>
      <div class="toast-content">
        <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
      <button class="toast-close" @click="removeToast(toast.id)">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </transition-group>
</template>

<script>
export default {
  name: 'Toast',
  data() {
    return {
      toasts: [],
      counter: 0
    };
  },
  methods: {
    addToast(toast) {
      const id = this.counter++;
      const toastWithDefaults = {
        id,
        type: 'info',
        duration: 5000,
        ...toast
      };
      
      this.toasts.push(toastWithDefaults);
      
      if (toastWithDefaults.duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, toastWithDefaults.duration);
      }
      
      return id;
    },
    removeToast(id) {
      const index = this.toasts.findIndex(toast => toast.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    },
    getIconClass(type) {
      switch (type) {
        case 'success':
          return 'fas fa-check-circle';
        case 'error':
        case 'danger':
          return 'fas fa-exclamation-circle';
        case 'warning':
          return 'fas fa-exclamation-triangle';
        case 'info':
        default:
          return 'fas fa-info-circle';
      }
    }
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 360px;
  width: calc(100% - 2rem);
}

.toast-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  border-left: 4px solid;
}

.toast-item.success {
  border-left-color: var(--success-color);
}

.toast-item.error,
.toast-item.danger {
  border-left-color: var(--danger-color);
}

.toast-item.warning {
  border-left-color: var(--warning-color);
}

.toast-item.info {
  border-left-color: var(--info-color);
}

.toast-icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
  font-size: var(--text-xl);
}

.toast-item.success .toast-icon {
  color: var(--success-color);
}

.toast-item.error .toast-icon,
.toast-item.danger .toast-icon {
  color: var(--danger-color);
}

.toast-item.warning .toast-icon {
  color: var(--warning-color);
}

.toast-item.info .toast-icon {
  color: var(--info-color);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: var(--font-medium);
  margin-bottom: 0.25rem;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.toast-message {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  word-wrap: break-word;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: var(--text-sm);
  padding: 0.25rem;
  margin-left: 0.5rem;
}

.toast-close:hover {
  color: var(--text-primary);
}

/* 애니메이션 */
.toast-enter-active,
.toast-leave-active {
  transition: 
    all var(--transition-normal) var(--easing-default);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
