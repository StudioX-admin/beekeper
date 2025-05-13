<!-- app/src/components/layout/HeaderBar.vue -->
<template>
  <header class="header">
    <button v-if="showBackButton" class="header-back-button" @click="goBack">
      <i class="fas fa-arrow-left"></i>
    </button>
    <div class="header-title">
      <img v-if="!showBackButton" src="@/assets/images/logo-small.png" alt="로고" class="header-logo">
      <h1>{{ title }}</h1>
    </div>
    <div class="header-actions">
      <button v-if="showRefreshButton" class="header-action-button" @click="refresh">
        <i class="fas fa-sync-alt"></i>
      </button>
      <button v-if="showNotificationsButton" class="header-action-button" @click="openNotifications">
        <i class="fas fa-bell"></i>
        <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'HeaderBar',
  props: {
    title: {
      type: String,
      default: '스마트폐기물 운송'
    },
    showBackButton: {
      type: Boolean,
      default: false
    },
    showRefreshButton: {
      type: Boolean,
      default: true
    },
    showNotificationsButton: {
      type: Boolean,
      default: true
    },
    notificationCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    refresh() {
      this.$emit('refresh');
    },
    openNotifications() {
      this.$emit('open-notifications');
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  height: var(--header-height);
  background-color: var(--primary-color);
  color: var(--text-light);
  padding: 0 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow);
}

.header-back-button {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: var(--text-lg);
  padding: 0.5rem;
  margin-right: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-logo {
  height: 30px;
  margin-right: 0.75rem;
}

.header-title h1 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-action-button {
  position: relative;
  background: none;
  border: none;
  color: var(--text-light);
  font-size: var(--text-lg);
  padding: 0.5rem;
  margin-left: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background-color: var(--danger-color);
  color: white;
  font-size: 10px;
  font-weight: var(--font-bold);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
