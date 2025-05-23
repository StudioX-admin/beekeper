import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useVehicleStore = defineStore('vehicle', () => {
  // State
  const vehicles = ref([])
  const selectedVehicle = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchVehicles() {
    loading.value = true
    try {
      const response = await axios.get('/api/vehicles')
      vehicles.value = response.data
    } catch (error) {
      error.value = error.message
    } finally {
      loading.value = false
    }
  }

  async function fetchVehicleById(id) {
    loading.value = true
    try {
      const response = await axios.get(`/api/vehicles/${id}`)
      selectedVehicle.value = response.data
    } catch (error) {
      error.value = error.message
    } finally {
      loading.value = false
    }
  }

  async function createVehicle(data) {
    try {
      const response = await axios.post('/api/vehicles', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function updateVehicle(id, data) {
    try {
      const response = await axios.put(`/api/vehicles/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function deleteVehicle(id) {
    try {
      await axios.delete(`/api/vehicles/${id}`)
    } catch (error) {
      throw error.response?.data || error
    }
  }

  return {
    // State
    vehicles,
    selectedVehicle,
    loading,
    error,
    // Actions
    fetchVehicles,
    fetchVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
}) 