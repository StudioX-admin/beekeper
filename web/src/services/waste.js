import { api } from '@/utils/api'

// 폐기물 서비스
export const wasteService = {
  // 폐기물 목록 조회
  async getWastes(params) {
    const response = await api.get('/wastes', { params })
    return response.data
  },

  // 폐기물 상세 조회
  async getWaste(id) {
    const response = await api.get(`/wastes/${id}`)
    return response.data
  },

  // 폐기물 등록
  async createWaste(data) {
    const response = await api.post('/wastes', data)
    return response.data
  },

  // 폐기물 수정
  async updateWaste(id, data) {
    const response = await api.put(`/wastes/${id}`, data)
    return response.data
  },

  // 폐기물 삭제
  async deleteWaste(id) {
    const response = await api.delete(`/wastes/${id}`)
    return response.data
  }
} 