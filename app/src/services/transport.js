import { api } from '@/utils/api'

export const transportService = {
  // 운행 일정 조회
  async getTransports(params) {
    const response = await api.get('/transports', { params })
    return response.data
  },

  // 운행 상세 조회
  async getTransport(id) {
    const response = await api.get(`/transports/${id}`)
    return response.data
  },

  // 운행 등록
  async createTransport(data) {
    const response = await api.post('/transports', data)
    return response.data
  },

  // 운행 수정
  async updateTransport(id, data) {
    const response = await api.put(`/transports/${id}`, data)
    return response.data
  },

  // 운행 삭제
  async deleteTransport(id) {
    const response = await api.delete(`/transports/${id}`)
    return response.data
  },

  // 운행 시작
  async startTransport(id) {
    const response = await api.post(`/transports/${id}/start`)
    return response.data
  },

  // 운행 완료
  async completeTransport(id) {
    const response = await api.post(`/transports/${id}/complete`)
    return response.data
  }
} 