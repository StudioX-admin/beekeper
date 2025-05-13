<!-- web/src/components/common/Modal.vue -->
<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click="closeOnOutsideClick && $emit('close')">
      <div class="modal-container" :class="[size, { 'scrollable': scrollable }]" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button v-if="showCloseButton" class="modal-close-button" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body" :class="{ 'has-footer': $slots.footer }">
          <slot></slot>
        </div>
        
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large', 'xl', 'full'].includes(value)
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    closeOnOutsideClick: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
        this.addEscapeListener();
      } else {
        document.body.style.overflow = '';
        this.removeEscapeListener();
      }
    }
  },
  mounted() {
    if (this.show) {
      document.body.style.overflow = 'hidden';
      this.addEscapeListener();
    }
  },
  beforeUnmount() {
    document.body.style.overflow = '';
    this.removeEscapeListener();
  },
  methods: {
    addEscapeListener() {
      document.addEventListener('keydown', this.handleEscKey);
    },
    removeEscapeListener() {
      document.removeEventListener('keydown', this.handleEscKey);
    },
    handleEscKey(e) {
      if (e.key === 'Escape' && this.show) {
        this.$emit('close');
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.modal-container.small {
  width: 400px;
}

.modal-container.medium {
  width: 600px;
}

.modal-container.large {
  width: 800px;
}

.modal-container.xl {
  width: 1000px;
}

.modal-container.full {
  width: 95vw;
  height: 95vh;
}

.modal-container.scrollable .modal-body {
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.modal-close-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-xl);
  color: var(--text-tertiary);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast) var(--easing-default);
}

.modal-close-button:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-body.has-footer {
  border-bottom: 1px solid var(--border-color);
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* 모달 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal) var(--easing-default);
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: 
    opacity var(--transition-normal) var(--easing-default),
    transform var(--transition-normal) var(--easing-default);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 576px) {
  .modal-container.small,
  .modal-container.medium,
  .modal-container.large,
  .modal-container.xl {
    width: 100%;
  }
}
</style>
