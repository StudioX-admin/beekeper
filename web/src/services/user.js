import { api } from '@/utils/api'

// 공통 사용자 서비스
export const userService = {
  // 사용자 목록 조회 (소속 기업별)
  async getUsers(params) {
    const response = await api.get('/users', { params })
    return response.data
  },

  // 사용자 상세 조회
  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // 사용자 수정
  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  // 사용자 삭제
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  // 사용자 승인
  async approveUser(id) {
    const response = await api.post(`/users/${id}/approve`)
    return response.data
  },

  // 사용자 거절
  async rejectUser(id, reason) {
    const response = await api.post(`/users/${id}/reject`, { reason })
    return response.data
  }
}

// 관리자 사용자 서비스
export const adminUserService = {
  // 사용자 목록 조회 (전체)
  async getUsers(params) {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  // 사용자 상세 조회
  async getUser(id) {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  // 사용자 등록
  async createUser(data) {
    const response = await api.post('/admin/users', data)
    return response.data
  },

  // 사용자 수정
  async updateUser(id, data) {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },

  // 사용자 삭제
  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  // 업체 목록 조회
  async getCompanies() {
    const response = await api.get('/admin/companies')
    return response.data
  }
} 