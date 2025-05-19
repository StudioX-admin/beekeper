import { api } from '@/utils/api'

// 기업 서비스
export const companyService = {
  // 기업 목록 조회
  async getCompanies(params) {
    const response = await api.get('/companies', { params })
    return response.data
  },

  // 기업 상세 조회
  async getCompany(id) {
    const response = await api.get(`/companies/${id}`)
    return response.data
  },

  // 기업 등록
  async createCompany(data) {
    const response = await api.post('/companies', data)
    return response.data
  },

  // 기업 수정
  async updateCompany(id, data) {
    const response = await api.put(`/companies/${id}`, data)
    return response.data
  },

  // 기업 삭제
  async deleteCompany(id) {
    const response = await api.delete(`/companies/${id}`)
    return response.data
  }
} 