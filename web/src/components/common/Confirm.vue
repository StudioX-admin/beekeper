<!-- web/src/components/common/Confirm.vue -->
<template>
  <Modal 
    :show="show" 
    :title="title" 
    size="small" 
    :close-on-outside-click="false"
    @close="onCancel"
  >
    <div class="confirm-content">
      <div v-if="icon" class="confirm-icon" :class="iconClass">
        <i :class="icon"></i>
      </div>
      <p v-if="message" class="confirm-message">{{ message }}</p>
      <slot></slot>
    </div>
    
    <template #footer>
      <button 
        v-if="showCancelButton" 
        class="btn btn-outline" 
        @click="onCancel"
      >
        {{ cancelButtonText }}
      </button>
      <button 
        class="btn" 
        :class="confirmButtonClass" 
        @click="onConfirm"
      >
        {{ confirmButtonText }}
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from './Modal.vue';

export default {
  name: 'Confirm',
  components: {
    Modal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: '확인'
    },
    message: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'danger', 'warning', 'success', 'info'].includes(value)
    },
    confirmButtonText: {
      type: String,
      default: '확인'
    },
    cancelButtonText: {
      type: String,
      default: '취소'
    },
    showCancelButton: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    iconClass() {
      return {
        'icon-primary': this.type === 'primary',
        'icon-danger': this.type === 'danger',
        'icon-warning': this.type === 'warning',
        'icon-success': this.type === 'success',
        'icon-info': this.type === 'info'
      };
    },
    confirmButtonClass() {
      return {
        'btn-primary': this.type === 'primary',
        'btn-danger': this.type === 'danger',
        'btn-warning': this.type === 'warning',
        'btn-success': this.type === 'success',
        'btn-info': this.type === 'info'
      };
    }
  },
  methods: {
    onConfirm() {
      this.$emit('confirm');
    },
    onCancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style scoped>
.confirm-content {
  text-align: center;
  padding: 0.5rem 0;
}

.confirm-icon {
  margin-bottom: 1.5rem;
  font-size: 3rem;
}

.icon-primary {
  color: var(--primary-color);
}

.icon-danger {
  color: var(--danger-color);
}

.icon-warning {
  color: var(--warning-color);
}

.icon-success {
  color: var(--success-color);
}

.icon-info {
  color: var(--info-color);
}

.confirm-message {
  font-size: var(--text-base);
  margin-bottom: 1rem;
  color: var(--text-primary);
}
</style>
