<!-- web/src/components/common/Modal.vue -->
<template>
  <transition name="modal">
    <div v-if="visible" class="modal-overlay" @click="closeOnBackdrop && close()">
      <div class="modal-container" :class="[size, { 'scrollable': scrollable }]" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button v-if="showCloseButton" class="modal-close-button" @click="close">
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
    visible: {
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
    closeOnBackdrop: {
      type: Boolean,
      default: true
    },
    showCloseButton: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', this.handleEscKey);
      } else {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.handleEscKey);
      }
    }
  },
  mounted() {
    if (this.visible) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', this.handleEscKey);
    }
  },
  beforeDestroy() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.handleEscKey);
  },
  methods: {
    close() {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    handleEscKey(e) {
      if (e.key === 'Escape' && this.visible) {
        this.close();
      }
    }
  }
}
</script>

<style scoped>
/* 기존 스타일 유지 */
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

/* 나머지 스타일 유지... */

/* 애니메이션 수정 */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container, .modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter, .modal-leave-to {
  opacity: 0;
}

.modal-enter .modal-container, .modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}
</style>
