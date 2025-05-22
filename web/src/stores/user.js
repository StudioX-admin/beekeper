import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const getUsersByRole = computed(() => (role) => {
    return users.value.filter(user => user.role === role)
  })

  // Actions
  async function fetchUsers(params = {}) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get('/api/users', { params })
      users.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '사용자 목록을 가져오는 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createUser(userData) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.post('/api/users', userData)
      users.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '사용자 생성 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id, userData) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.put(`/api/users/${id}`, userData)
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '사용자 수정 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id) {
    try {
      loading.value = true
      error.value = null
      await axios.delete(`/api/users/${id}`)
      users.value = users.value.filter(u => u.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || '사용자 삭제 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    users,
    loading,
    error,
    // Getters
    getUsersByRole,
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  }
})