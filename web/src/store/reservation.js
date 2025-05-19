import { defineStore } from 'pinia'
import { api } from '@/api'

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: [],
    currentReservation: null,
    loading: false,
    error: null
  }),

  actions: {
    // 운송업체의 예약 목록 조회
    async getTransporterReservations(params) {
      try {
        const response = await api.get('/reservations/transporter', { params })
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 처리업체의 예약 목록 조회
    async getProcessorReservations(params) {
      try {
        const response = await api.get('/reservations/processor', { params })
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 예약 상세 조회
    async getReservation(id) {
      try {
        const response = await api.get(`/reservations/${id}`)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 예약 생성
    async createReservation(data) {
      try {
        const response = await api.post('/reservations', data)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 예약 수정
    async updateReservation(id, data) {
      try {
        const response = await api.put(`/reservations/${id}`, data)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 예약 삭제
    async deleteReservation(id) {
      try {
        await api.delete(`/reservations/${id}`)
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 예약 상태 업데이트 (처리업체용)
    async updateReservationStatus(id, status, reason) {
      try {
        const response = await api.put(`/reservations/${id}/status`, {
          status,
          reason
        })
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 예약 완료 처리 (처리업체용)
    async completeReservation(id, data) {
      try {
        const response = await api.put(`/reservations/${id}/complete`, data)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 예약 취소
    async cancelReservation(id, reason) {
      try {
        const response = await api.put(`/reservations/${id}/cancel`, { reason })
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    }
  }
}) 