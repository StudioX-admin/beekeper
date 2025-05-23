import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useDriverStore = defineStore('driver', () => {
  // State
  const drivers = ref([])
  const selectedDriver = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchDrivers() {
    loading.value = true
    try {
      const response = await axios.get('/api/drivers')
      drivers.value = response.data
    } catch (error) {
      error.value = error.message
    } finally {
      loading.value = false
    }
  }

  async function fetchDriverById(id) {
    loading.value = true
    try {
      const response = await axios.get(`/api/drivers/${id}`)
      selectedDriver.value = response.data
    } catch (error) {
      error.value = error.message
    } finally {
      loading.value = false
    }
  }

  async function createDriver(data) {
    try {
      const response = await axios.post('/api/drivers', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function updateDriver(id, data) {
    try {
      const response = await axios.put(`/api/drivers/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function deleteDriver(id) {
    try {
      await axios.delete(`/api/drivers/${id}`)
    } catch (error) {
      throw error.response?.data || error
    }
  }

  return {
    // State
    drivers,
    selectedDriver,
    loading,
    error,
    // Actions
    fetchDrivers,
    fetchDriverById,
    createDriver,
    updateDriver,
    deleteDriver
  }
}) 