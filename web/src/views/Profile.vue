<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>내 정보</h1>
    </div>
    
    <div class="profile-content">
      <div class="profile-section">
        <h2>기본 정보</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>이름</label>
            <span>{{ user.name }}</span>
          </div>
          <div class="info-item">
            <label>이메일</label>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item">
            <label>연락처</label>
            <span>{{ user.phone }}</span>
          </div>
          <div class="info-item">
            <label>역할</label>
            <span>{{ userRole }}</span>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2>비밀번호 변경</h2>
        <form @submit.prevent="changePassword" class="password-form">
          <div class="form-group">
            <label for="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              required
            />
          </div>
          <div class="form-group">
            <label for="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              v-model="passwordForm.newPassword"
              required
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              required
            />
          </div>
          <button type="submit" class="btn-primary">비밀번호 변경</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    const user = computed(() => authStore.user)
    
    const userRole = computed(() => {
      const roles = {
        platform_admin: '관리자',
        transporter: '수거업체',
        processor: '처리업체'
      }
      return roles[user.value?.role] || user.value?.role
    })

    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const changePassword = async () => {
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.')
        return
      }

      try {
        await authStore.changePassword({
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        })
        alert('비밀번호가 변경되었습니다.')
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      } catch (error) {
        alert(error.message || '비밀번호 변경에 실패했습니다.')
      }
    }

    return {
      user,
      userRole,
      passwordForm,
      changePassword
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  font-size: 1.8rem;
  color: var(--text-primary);
}

.profile-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  font-size: 1.4rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.info-item span {
  font-size: 1.1rem;
  color: var(--text-primary);
}

.password-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-color-dark);
}
</style>
