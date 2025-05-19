import { api } from '@/utils/api'

// 폐기물 수거 서비스
export const collectionService = {
  // 수거 목록 조회
  async getCollections(params) {
    const response = await api.get('/collections', { params })
    return response.data
  },

  // 수거 상세 조회
  async getCollection(id) {
    const response = await api.get(`/collections/${id}`)
    return response.data
  },

  // 수거 등록
  async createCollection(data) {
    const response = await api.post('/collections', data)
    return response.data
  },

  // 수거 수정
  async updateCollection(id, data) {
    const response = await api.put(`/collections/${id}`, data)
    return response.data
  },

  // 수거 삭제
  async deleteCollection(id) {
    const response = await api.delete(`/collections/${id}`)
    return response.data
  },

  // 수거 시작
  async startCollection(id) {
    const response = await api.post(`/collections/${id}/start`)
    return response.data
  },

  // 수거 완료
  async completeCollection(id) {
    const response = await api.post(`/collections/${id}/complete`)
    return response.data
  }
} 