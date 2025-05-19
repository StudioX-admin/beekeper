import { api } from '@/utils/api'

// 처리업체 시설 서비스
export const processorFacilityService = {
  // 시설 목록 조회
  async getFacilities(params) {
    const response = await api.get('/processor/facilities', { params })
    return response.data
  },

  // 시설 상세 조회
  async getFacility(id) {
    const response = await api.get(`/processor/facilities/${id}`)
    return response.data
  },

  // 시설 등록
  async createFacility(data) {
    const response = await api.post('/processor/facilities', data)
    return response.data
  },

  // 시설 수정
  async updateFacility(id, data) {
    const response = await api.put(`/processor/facilities/${id}`, data)
    return response.data
  },

  // 시설 삭제
  async deleteFacility(id) {
    const response = await api.delete(`/processor/facilities/${id}`)
    return response.data
  }
}

// 관리자 시설 서비스
export const adminFacilityService = {
  // 시설 목록 조회
  async getFacilities(params) {
    const response = await api.get('/admin/facilities', { params })
    return response.data
  },

  // 시설 상세 조회
  async getFacility(id) {
    const response = await api.get(`/admin/facilities/${id}`)
    return response.data
  },

  // 시설 등록
  async createFacility(data) {
    const response = await api.post('/admin/facilities', data)
    return response.data
  },

  // 시설 수정
  async updateFacility(id, data) {
    const response = await api.put(`/admin/facilities/${id}`, data)
    return response.data
  },

  // 시설 삭제
  async deleteFacility(id) {
    const response = await api.delete(`/admin/facilities/${id}`)
    return response.data
  },

  // 업체 목록 조회
  async getCompanies() {
    const response = await api.get('/admin/companies')
    return response.data
  }
}

export const facilityService = {
  // 시설 목록 조회
  async getFacilities(params) {
    const response = await api.get('/facilities', { params })
    return response.data
  },

  // 시설 상세 조회
  async getFacility(id) {
    const response = await api.get(`/facilities/${id}`)
    return response.data
  },

  // 시설 등록
  async createFacility(data) {
    const response = await api.post('/facilities', data)
    return response.data
  },

  // 시설 수정
  async updateFacility(id, data) {
    const response = await api.put(`/facilities/${id}`, data)
    return response.data
  },

  // 시설 삭제
  async deleteFacility(id) {
    const response = await api.delete(`/facilities/${id}`)
    return response.data
  }
} 