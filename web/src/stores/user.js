import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role)
  const userName = computed(() => user.value?.name)

  // Actions
  async function login(credentials) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.post('/api/auth/login', credentials)
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '로그인 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await axios.post('/api/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  async function fetchUserProfile() {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get('/api/auth/profile')
      user.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '사용자 정보를 가져오는 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(profileData) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.put('/api/auth/profile', profileData)
      user.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '프로필 업데이트 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    userName,
    // Actions
    login,
    logout,
    fetchUserProfile,
    updateProfile
  }
})