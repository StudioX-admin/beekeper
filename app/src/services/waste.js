import { api } from '@/utils/api'
import { usePlatform } from '@/composables/usePlatform'

const { isWeb, isApp } = usePlatform()

// 플랫폼별 API 엔드포인트 설정
const getApiEndpoint = (path) => {
  const baseUrl = isWeb ? '/api/web' : '/api/app'
  return `${baseUrl}${path}`
}

// 폐기물 종류 및 단위 정의
export const WASTE_TYPES = {
  GENERAL: { id: 'GENERAL', name: '일반폐기물', unit: 'kg' },
  CONSTRUCTION: { id: 'CONSTRUCTION', name: '건설폐기물', unit: 'ton' },
  HAZARDOUS: { id: 'HAZARDOUS', name: '유해폐기물', unit: 'kg' },
  RECYCLABLE: { id: 'RECYCLABLE', name: '재활용폐기물', unit: 'kg' }
}

// 폐기물 상태 정의
export const WASTE_STATUS = {
  PENDING: { id: 'PENDING', name: '대기' },
  PROCESSING: { id: 'PROCESSING', name: '처리중' },
  COMPLETED: { id: 'COMPLETED', name: '완료' }
}

export const wasteService = {
  // 폐기물 등록
  async createWaste(data) {
    try {
      // 필수 입력값 검증
      if (!data.type || !data.quantity || !data.unit) {
        throw new Error('필수 정보를 모두 입력해주세요.')
      }

      // 이미지 파일 검증
      if (data.images && data.images.length > 0) {
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
        
        for (const image of data.images) {
          if (image.size > maxSize) {
            throw new Error('이미지 파일 크기는 5MB를 초과할 수 없습니다.')
          }
          if (!allowedTypes.includes(image.type)) {
            throw new Error('지원하지 않는 이미지 형식입니다.')
          }
        }
      }

      const formData = new FormData()
      formData.append('type', data.type)
      formData.append('quantity', data.quantity)
      formData.append('unit', data.unit)
      formData.append('description', data.description || '')
      
      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`image${index}`, image)
        })
      }

      const response = await api.post(getApiEndpoint('/waste'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (!response.data) {
        throw new Error('폐기물 등록에 실패했습니다.')
      }

      return response.data
    } catch (error) {
      throw error
    }
  },

  // 폐기물 목록 조회
  async getWastes(params = {}) {
    try {
      const response = await api.get(getApiEndpoint('/waste'), { params })
      if (!response.data) {
        throw new Error('폐기물 목록을 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 폐기물 상세 조회
  async getWaste(id) {
    try {
      const response = await api.get(getApiEndpoint(`/waste/${id}`))
      if (!response.data) {
        throw new Error('폐기물 정보를 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 폐기물 상태 업데이트
  async updateWasteStatus(id, status) {
    try {
      if (!Object.values(WASTE_STATUS).some(s => s.id === status)) {
        throw new Error('유효하지 않은 상태입니다.')
      }

      const response = await api.put(getApiEndpoint(`/waste/${id}/status`), { status })
      if (!response.data) {
        throw new Error('상태 업데이트에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 폐기물 삭제
  async deleteWaste(id) {
    try {
      const response = await api.delete(getApiEndpoint(`/waste/${id}`))
      if (!response.data) {
        throw new Error('폐기물 삭제에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  }
} 