import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role)

  // 로그인
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token: newToken, user: userData } = response.data
      
      token.value = newToken
      user.value = userData
      
      localStorage.setItem('token', newToken)
      return userData
    } catch (error) {
      throw error
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  // 사용자 정보 조회
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      user.value = response.data
      return response.data
    } catch (error) {
      throw error
    }
  }

  // 토큰 갱신
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh')
      const { token: newToken } = response.data
      
      token.value = newToken
      localStorage.setItem('token', newToken)
      return newToken
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout,
    fetchUser,
    refreshToken
  }
})
