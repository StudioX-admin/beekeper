import api from './api'

// 수거업체 예약 서비스
export const transporterReservationService = {
  // 예약 목록 조회
  getReservations: async (params) => {
    const response = await api.get('/transporter/reservations', { params })
    return response.data
  },

  // 예약 상세 조회
  getReservation: async (id) => {
    const response = await api.get(`/transporter/reservations/${id}`)
    return response.data
  },

  // 예약 등록
  createReservation: async (data) => {
    const response = await api.post('/transporter/reservations', data)
    return response.data
  },

  // 예약 수정
  updateReservation: async (id, data) => {
    const response = await api.put(`/transporter/reservations/${id}`, data)
    return response.data
  },

  // 예약 삭제
  deleteReservation: async (id) => {
    const response = await api.delete(`/transporter/reservations/${id}`)
    return response.data
  },

  // 처리업체 목록 조회
  getProcessors: async () => {
    const response = await api.get('/transporter/processors')
    return response.data
  }
}

// 처리업체 예약 서비스
export const processorReservationService = {
  // 예약 목록 조회
  getReservations: async (params) => {
    const response = await api.get('/processor/reservations', { params })
    return response.data
  },

  // 예약 상세 조회
  getReservation: async (id) => {
    const response = await api.get(`/processor/reservations/${id}`)
    return response.data
  },

  // 예약 상태 변경 (승인/반려)
  updateReservationStatus: async (id, status, notes) => {
    const response = await api.put(`/processor/reservations/${id}/status`, {
      status,
      notes
    })
    return response.data
  }
} 