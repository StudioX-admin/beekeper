import { api } from '@/utils/api'

export const noticeService = {
  // 공지사항 목록 조회
  async getNotices(params) {
    const response = await api.get('/notices', { params })
    return response.data
  },

  // 공지사항 상세 조회
  async getNotice(id) {
    const response = await api.get(`/notices/${id}`)
    return response.data
  },

  // 공지사항 등록
  async createNotice(data) {
    const response = await api.post('/notices', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 공지사항 수정
  async updateNotice(id, data) {
    const response = await api.put(`/notices/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 공지사항 삭제
  async deleteNotice(id) {
    const response = await api.delete(`/notices/${id}`)
    return response.data
  }
} 