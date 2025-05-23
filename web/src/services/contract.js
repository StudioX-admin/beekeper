import api from '@/utils/api'

// 수거업체 계약 서비스
export const transporterContractService = {
  // 계약 목록 조회
  getContracts: async (params) => {
    const response = await api.get('/transporter/contracts', { params })
    return response.data
  },

  // 계약 상세 조회
  getContract: async (id) => {
    const response = await api.get(`/transporter/contracts/${id}`)
    return response.data
  },

  // 계약 생성
  createContract: async (formData) => {
    const response = await api.post('/transporter/contracts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 계약 수정
  updateContract: async (id, formData) => {
    const response = await api.put(`/transporter/contracts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 계약 삭제
  deleteContract: async (id) => {
    const response = await api.delete(`/transporter/contracts/${id}`)
    return response.data
  },

  // 처리업체 목록 조회
  getProcessors: async () => {
    const response = await api.get('/transporter/processors')
    return response.data
  }
}

// 처리업체 계약 서비스
export const processorContractService = {
  // 계약 목록 조회
  getContracts: async (params) => {
    const response = await api.get('/processor/contracts', { params })
    return response.data
  },

  // 계약 상세 조회
  getContract: async (id) => {
    const response = await api.get(`/processor/contracts/${id}`)
    return response.data
  },

  // 계약 생성
  createContract: async (formData) => {
    const response = await api.post('/processor/contracts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 계약 수정
  updateContract: async (id, formData) => {
    const response = await api.put(`/processor/contracts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 계약 삭제
  deleteContract: async (id) => {
    const response = await api.delete(`/processor/contracts/${id}`)
    return response.data
  },

  // 계약 상태 변경 (승인/반려)
  updateContractStatus: async (id, action, notes) => {
    const response = await api.put(`/processor/contracts/${id}/status`, {
      action,
      notes
    })
    return response.data
  },

  // 수거업체 목록 조회
  getTransporters: async () => {
    const response = await api.get('/processor/transporters')
    return response.data
  }
}

// 관리자 계약 서비스
export const adminContractService = {
  // 계약 목록 조회
  getContracts: async (params) => {
    const response = await api.get('/admin/contracts', { params })
    return response.data
  },

  // 계약 상세 조회
  getContract: async (id) => {
    const response = await api.get(`/admin/contracts/${id}`)
    return response.data
  },

  // 계약 생성
  createContract: async (formData) => {
    const response = await api.post('/admin/contracts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 계약 수정
  updateContract: async (id, formData) => {
    const response = await api.put(`/admin/contracts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 계약 삭제
  deleteContract: async (id) => {
    const response = await api.delete(`/admin/contracts/${id}`)
    return response.data
  },

  // 계약 상태 변경 (승인/반려)
  updateContractStatus: async (id, action, notes) => {
    const response = await api.put(`/admin/contracts/${id}/status`, {
      action,
      notes
    })
    return response.data
  },

  // 회사 목록 조회
  getCompanies: async (type) => {
    const response = await api.get(`/admin/companies`, { params: { type } })
    return response.data
  }
} 
