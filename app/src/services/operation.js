import { api } from '@/utils/api'
import { usePlatform } from '@/composables/usePlatform'

const { isWeb, isApp } = usePlatform()

// 플랫폼별 API 엔드포인트 설정
const getApiEndpoint = (path) => {
  const baseUrl = isWeb ? '/api/web' : '/api/app'
  return `${baseUrl}${path}`
}

// 운영 상태 정의
export const OPERATION_STATUS = {
  SCHEDULED: { id: 'SCHEDULED', name: '예정' },
  IN_PROGRESS: { id: 'IN_PROGRESS', name: '진행중' },
  COMPLETED: { id: 'COMPLETED', name: '완료' },
  CANCELLED: { id: 'CANCELLED', name: '취소' }
}

export const operationService = {
  // 운영 일정 등록
  async createOperation(data) {
    try {
      // 필수 입력값 검증
      if (!data.facilityId || !data.date || !data.startTime || !data.endTime) {
        throw new Error('필수 정보를 모두 입력해주세요.')
      }

      const response = await api.post(getApiEndpoint('/operation'), data)
      if (!response.data) {
        throw new Error('운영 일정 등록에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 운영 일정 목록 조회
  async getOperations(params = {}) {
    try {
      const response = await api.get(getApiEndpoint('/operation'), { params })
      if (!response.data) {
        throw new Error('운영 일정 목록을 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 운영 일정 상세 조회
  async getOperation(id) {
    try {
      const response = await api.get(getApiEndpoint(`/operation/${id}`))
      if (!response.data) {
        throw new Error('운영 일정 정보를 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 운영 일정 수정
  async updateOperation(id, data) {
    try {
      if (!data.facilityId || !data.date || !data.startTime || !data.endTime) {
        throw new Error('필수 정보를 모두 입력해주세요.')
      }

      const response = await api.put(getApiEndpoint(`/operation/${id}`), data)
      if (!response.data) {
        throw new Error('운영 일정 수정에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 운영 상태 업데이트
  async updateOperationStatus(id, status) {
    try {
      if (!Object.values(OPERATION_STATUS).some(s => s.id === status)) {
        throw new Error('유효하지 않은 상태입니다.')
      }

      const response = await api.put(getApiEndpoint(`/operation/${id}/status`), { status })
      if (!response.data) {
        throw new Error('상태 업데이트에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 운영 일정 삭제
  async deleteOperation(id) {
    try {
      const response = await api.delete(getApiEndpoint(`/operation/${id}`))
      if (!response.data) {
        throw new Error('운영 일정 삭제에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  }
} 