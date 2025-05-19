import { api } from '@/utils/api'

export const treatmentService = {
  // 처리 목록 조회
  async getTreatments(params) {
    const response = await api.get('/treatments', { params })
    return response.data
  },

  // 처리 상세 조회
  async getTreatment(id) {
    const response = await api.get(`/treatments/${id}`)
    return response.data
  },

  // 처리 등록
  async createTreatment(data) {
    const response = await api.post('/treatments', data)
    return response.data
  },

  // 처리 수정
  async updateTreatment(id, data) {
    const response = await api.put(`/treatments/${id}`, data)
    return response.data
  },

  // 처리 삭제
  async deleteTreatment(id) {
    const response = await api.delete(`/treatments/${id}`)
    return response.data
  },

  // 처리 시작
  async startTreatment(id) {
    const response = await api.post(`/treatments/${id}/start`)
    return response.data
  },

  // 처리 완료
  async completeTreatment(id) {
    const response = await api.post(`/treatments/${id}/complete`)
    return response.data
  }
} 