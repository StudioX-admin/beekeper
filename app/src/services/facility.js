import { api } from '@/utils/api'
import { usePlatform } from '@/composables/usePlatform'

const { isWeb, isApp } = usePlatform()

// 플랫폼별 API 엔드포인트 설정
const getApiEndpoint = (path) => {
  const baseUrl = isWeb ? '/api/web' : '/api/app'
  return `${baseUrl}${path}`
}

// 시설 상태 정의
export const FACILITY_STATUS = {
  ACTIVE: { id: 'ACTIVE', name: '운영중' },
  INACTIVE: { id: 'INACTIVE', name: '운영중지' },
  MAINTENANCE: { id: 'MAINTENANCE', name: '점검중' }
}

export const facilityService = {
  // 시설 등록
  async createFacility(data) {
    try {
      // 필수 입력값 검증
      if (!data.name || !data.address || !data.operatingHours) {
        throw new Error('필수 정보를 모두 입력해주세요.')
      }

      const response = await api.post(getApiEndpoint('/facility'), data)
      if (!response.data) {
        throw new Error('시설 등록에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 시설 목록 조회
  async getFacilities(params = {}) {
    try {
      const response = await api.get(getApiEndpoint('/facility'), { params })
      if (!response.data) {
        throw new Error('시설 목록을 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 시설 상세 조회
  async getFacility(id) {
    try {
      const response = await api.get(getApiEndpoint(`/facility/${id}`))
      if (!response.data) {
        throw new Error('시설 정보를 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 시설 정보 수정
  async updateFacility(id, data) {
    try {
      if (!data.name || !data.address || !data.operatingHours) {
        throw new Error('필수 정보를 모두 입력해주세요.')
      }

      const response = await api.put(getApiEndpoint(`/facility/${id}`), data)
      if (!response.data) {
        throw new Error('시설 정보 수정에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 시설 상태 업데이트
  async updateFacilityStatus(id, status) {
    try {
      if (!Object.values(FACILITY_STATUS).some(s => s.id === status)) {
        throw new Error('유효하지 않은 상태입니다.')
      }

      const response = await api.put(getApiEndpoint(`/facility/${id}/status`), { status })
      if (!response.data) {
        throw new Error('상태 업데이트에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 시설 삭제
  async deleteFacility(id) {
    try {
      const response = await api.delete(getApiEndpoint(`/facility/${id}`))
      if (!response.data) {
        throw new Error('시설 삭제에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  }
} 