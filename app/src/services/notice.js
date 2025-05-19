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
  }
} 