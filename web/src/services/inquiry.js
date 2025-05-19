import { api } from '@/utils/api'

export const inquiryService = {
  // 문의 목록 조회
  async getInquiries(params) {
    const response = await api.get('/inquiries', { params })
    return response.data
  },

  // 문의 상세 조회
  async getInquiry(id) {
    const response = await api.get(`/inquiries/${id}`)
    return response.data
  },

  // 문의 등록
  async createInquiry(data) {
    const response = await api.post('/inquiries', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 문의 수정
  async updateInquiry(id, data) {
    const response = await api.put(`/inquiries/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 문의 삭제
  async deleteInquiry(id) {
    const response = await api.delete(`/inquiries/${id}`)
    return response.data
  },

  // 문의 답변
  async answerInquiry(id, data) {
    const response = await api.post(`/inquiries/${id}/answer`, data)
    return response.data
  }
} 