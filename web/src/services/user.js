import api from './api'

// 공통 사용자 서비스
export const userService = {
  // 사용자 목록 조회
  async getUsers(params) {
    const response = await api.get('/users', { params })
    return response.data
  },

  // 사용자 상세 조회
  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  // 사용자 생성
  async createUser(userData) {
    const response = await api.post('/users', userData)
    return response.data
  },

  // 사용자 수정
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData)
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
      },

  // 사용자 상태 변경
  async updateUserStatus(id, status) {
    const response = await api.put(`/users/${id}/status`, { status })
    return response.data
  },

  // 사용자 비밀번호 변경
  async changePassword(id, passwordData) {
    const response = await api.put(`/users/${id}/password`, passwordData)
    return response.data
  },

  // 사용자 권한 변경
  async updateUserRole(id, role) {
    const response = await api.put(`/users/${id}/role`, { role })
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
