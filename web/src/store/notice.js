import { defineStore } from 'pinia'
import { api } from '@/api'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    notices: [],
    currentNotice: null,
    loading: false,
    error: null
  }),

  actions: {
    // 공지사항 목록 조회
    async getNotices(params) {
      try {
        const response = await api.get('/notices', { params })
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 공지사항 상세 조회
    async getNotice(id) {
      try {
        const response = await api.get(`/notices/${id}`)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 공지사항 생성 (관리자용)
    async createNotice(data) {
      try {
        const response = await api.post('/notices', data)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 공지사항 수정 (관리자용)
    async updateNotice(id, data) {
      try {
        const response = await api.put(`/notices/${id}`, data)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 공지사항 삭제 (관리자용)
    async deleteNotice(id) {
      try {
        await api.delete(`/notices/${id}`)
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 공지사항 게시 (관리자용)
    async publishNotice(id) {
      try {
        const response = await api.put(`/notices/${id}/publish`)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    // 공지사항 비게시 (관리자용)
    async unpublishNotice(id) {
      try {
        const response = await api.put(`/notices/${id}/unpublish`)
        return response.data
      } catch (error) {
        throw error.response?.data || error
      }
    }
  }
}) 