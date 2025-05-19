import { api } from '@/utils/api'

// 수거업체 차량 서비스
export const transporterVehicleService = {
  // 차량 목록 조회
  getVehicles: async (params) => {
    const response = await api.get('/transporter/vehicles', { params })
    return response.data
  },

  // 차량 상세 조회
  getVehicle: async (id) => {
    const response = await api.get(`/transporter/vehicles/${id}`)
    return response.data
  },

  // 차량 생성
  createVehicle: async (data) => {
    const response = await api.post('/transporter/vehicles', data)
    return response.data
  },

  // 차량 수정
  updateVehicle: async (id, data) => {
    const response = await api.put(`/transporter/vehicles/${id}`, data)
    return response.data
  },

  // 차량 삭제
  deleteVehicle: async (id) => {
    const response = await api.delete(`/transporter/vehicles/${id}`)
    return response.data
  }
}

// 처리업체 차량 서비스
export const processorVehicleService = {
  // 차량 목록 조회
  getVehicles: async (params) => {
    const response = await api.get('/processor/vehicles', { params })
    return response.data
  },

  // 차량 상세 조회
  getVehicle: async (id) => {
    const response = await api.get(`/processor/vehicles/${id}`)
    return response.data
  },

  // 차량 생성
  createVehicle: async (data) => {
    const response = await api.post('/processor/vehicles', data)
    return response.data
  },

  // 차량 수정
  updateVehicle: async (id, data) => {
    const response = await api.put(`/processor/vehicles/${id}`, data)
    return response.data
  },

  // 차량 삭제
  deleteVehicle: async (id) => {
    const response = await api.delete(`/processor/vehicles/${id}`)
    return response.data
  }
}

// 관리자 차량 서비스
export const adminVehicleService = {
  // 차량 목록 조회
  getVehicles: async (params) => {
    const response = await api.get('/admin/vehicles', { params })
    return response.data
  },

  // 차량 상세 조회
  getVehicle: async (id) => {
    const response = await api.get(`/admin/vehicles/${id}`)
    return response.data
  },

  // 차량 생성
  createVehicle: async (data) => {
    const response = await api.post('/admin/vehicles', data)
    return response.data
  },

  // 차량 수정
  updateVehicle: async (id, data) => {
    const response = await api.put(`/admin/vehicles/${id}`, data)
    return response.data
  },

  // 차량 삭제
  deleteVehicle: async (id) => {
    const response = await api.delete(`/admin/vehicles/${id}`)
    return response.data
  }
}

export const vehicleService = {
  // 차량 목록 조회
  async getVehicles(params) {
    const response = await api.get('/vehicles', { params })
    return response.data
  },

  // 차량 상세 조회
  async getVehicle(id) {
    const response = await api.get(`/vehicles/${id}`)
    return response.data
  },

  // 차량 등록
  async createVehicle(data) {
    const response = await api.post('/vehicles', data)
    return response.data
  },

  // 차량 수정
  async updateVehicle(id, data) {
    const response = await api.put(`/vehicles/${id}`, data)
    return response.data
  },

  // 차량 삭제
  async deleteVehicle(id) {
    const response = await api.delete(`/vehicles/${id}`)
    return response.data
  }
} 