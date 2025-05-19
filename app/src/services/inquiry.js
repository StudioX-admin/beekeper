import { api } from '@/utils/api'

export const inquiryService = {
  // 문의사항 목록 조회
  async getInquiries(params) {
    const response = await api.get('/inquiries', { params })
    return response.data
  },

  // 문의사항 상세 조회
  async getInquiry(id) {
    const response = await api.get(`/inquiries/${id}`)
    return response.data
  },

  // 문의사항 등록
  async createInquiry(data) {
    const response = await api.post('/inquiries', data)
    return response.data
  }
} 