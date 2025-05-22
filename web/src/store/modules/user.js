import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/services/user'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const currentUser = ref(null)
  const totalUsers = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // 사용자 목록 조회
  const fetchUsers = async (params) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getUsers(params)
      users.value = response.users
      totalUsers.value = response.total
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 상세 조회
  const fetchUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.getUser(id)
      currentUser.value = response
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 생성
  const createUser = async (userData) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.createUser(userData)
      users.value.push(response)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 수정
  const updateUser = async (id, userData) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.updateUser(id, userData)
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = response
      }
      if (currentUser.value?.id === id) {
        currentUser.value = response
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 삭제
  const deleteUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      await userService.deleteUser(id)
      users.value = users.value.filter(user => user.id !== id)
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 승인
  const approveUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.approveUser(id)
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = response
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 거절
  const rejectUser = async (id, reason) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.rejectUser(id, reason)
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = response
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 상태 변경
  const updateUserStatus = async (id, status) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.updateUserStatus(id, status)
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = response
      }
      if (currentUser.value?.id === id) {
        currentUser.value = response
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 비밀번호 변경
  const changePassword = async (id, passwordData) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.changePassword(id, passwordData)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 사용자 권한 변경
  const updateUserRole = async (id, role) => {
    loading.value = true
    error.value = null
    try {
      const response = await userService.updateUserRole(id, role)
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = response
      }
      if (currentUser.value?.id === id) {
        currentUser.value = response
      }
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    currentUser,
    totalUsers,
    loading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
    updateUserStatus,
    changePassword,
    updateUserRole
  }
})
