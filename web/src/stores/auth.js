import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)

  // Actions
  async function login(credentials) {
    try {
      const response = await axios.post('/api/auth/login', credentials)
      token.value = response.data.token
      user.value = response.data.user
      
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      
      return response.data
    } catch (error) {
      throw error
    }
  }

  async function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  async function checkAuth() {
    if (!token.value) return false
    
    try {
      const response = await axios.get('/api/auth/me')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    // State
    token,
    user,
    // Getters
    isAuthenticated,
    userRole,
    // Actions
    login,
    logout,
    checkAuth
  }
}) 