import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useReservationStore = defineStore('reservation', () => {
  // State
  const reservations = ref([])
  const currentReservation = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function getTransporterReservations(params) {
    try {
      const response = await axios.get('/api/reservations/transporter', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function getProcessorReservations(params) {
    try {
      const response = await axios.get('/api/reservations/processor', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function getReservation(id) {
    try {
      const response = await axios.get(`/api/reservations/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function createReservation(data) {
    try {
      const response = await axios.post('/api/reservations', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function updateReservation(id, data) {
    try {
      const response = await axios.put(`/api/reservations/${id}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function deleteReservation(id) {
    try {
      await axios.delete(`/api/reservations/${id}`)
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function updateReservationStatus(id, status, reason) {
    try {
      const response = await axios.put(`/api/reservations/${id}/status`, {
        status,
        reason
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function completeReservation(id, data) {
    try {
      const response = await axios.put(`/api/reservations/${id}/complete`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  async function cancelReservation(id, reason) {
    try {
      const response = await axios.put(`/api/reservations/${id}/cancel`, { reason })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  }

  return {
    // State
    reservations,
    currentReservation,
    loading,
    error,
    // Actions
    getTransporterReservations,
    getProcessorReservations,
    getReservation,
    createReservation,
    updateReservation,
    deleteReservation,
    updateReservationStatus,
    completeReservation,
    cancelReservation
  }
}) 