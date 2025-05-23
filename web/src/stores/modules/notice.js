import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useNoticeStore = defineStore('notice', () => {
  // State
  const notices = ref([])
  const currentNotice = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function getNotices(params) {
    try {
      const response = await axios.get('/api/notices', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function getNotice(id) {
    try {
      const response = await axios.get(`/api/notices/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function createNotice(data) {
    try {
      const response = await axios.post('/api/notices', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function updateNotice(id, data) {
    try {
      const response = await axios.put(`/api/notices/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function deleteNotice(id) {
    try {
      await axios.delete(`/api/notices/${id}`)
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function publishNotice(id) {
    try {
      const response = await axios.put(`/api/notices/${id}/publish`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function unpublishNotice(id) {
    try {
      const response = await axios.put(`/api/notices/${id}/unpublish`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  return {
    // State
    notices,
    currentNotice,
    loading,
    error,
    // Actions
    getNotices,
    getNotice,
    createNotice,
    updateNotice,
    deleteNotice,
    publishNotice,
    unpublishNotice
  }
}) 