import { api } from '@/utils/api'

// 폐기물 이력 서비스
export const historyService = {
  // 이력 목록 조회
  async getHistories(params) {
    const response = await api.get('/histories', { params })
    return response.data
  },

  // 이력 상세 조회
  async getHistory(id) {
    const response = await api.get(`/histories/${id}`)
    return response.data
  }
} 