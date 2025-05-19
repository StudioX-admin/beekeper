import { api } from '@/utils/api'
import { usePlatform } from '@/composables/usePlatform'

const { isWeb, isApp } = usePlatform()

// 플랫폼별 API 엔드포인트 설정
const getApiEndpoint = (path) => {
  const baseUrl = isWeb ? '/api/web' : '/api/app'
  return `${baseUrl}${path}`
}

// 공지사항 상태 정의
export const NOTICE_STATUS = {
  ACTIVE: { id: 'ACTIVE', name: '활성' },
  INACTIVE: { id: 'INACTIVE', name: '비활성' }
}

// 문의 상태 정의
export const INQUIRY_STATUS = {
  PENDING: { id: 'PENDING', name: '대기중' },
  IN_PROGRESS: { id: 'IN_PROGRESS', name: '처리중' },
  COMPLETED: { id: 'COMPLETED', name: '완료' }
}

export const customerService = {
  // 공지사항 목록 조회
  async getNotices(params = {}) {
    try {
      const response = await api.get(getApiEndpoint('/notice'), { params })
      if (!response.data) {
        throw new Error('공지사항 목록을 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 공지사항 상세 조회
  async getNotice(id) {
    try {
      const response = await api.get(getApiEndpoint(`/notice/${id}`))
      if (!response.data) {
        throw new Error('공지사항을 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 공지사항 등록
  async createNotice(data) {
    try {
      if (!data.title || !data.content) {
        throw new Error('제목과 내용을 모두 입력해주세요.')
      }

      const response = await api.post(getApiEndpoint('/notice'), data)
      if (!response.data) {
        throw new Error('공지사항 등록에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 공지사항 수정
  async updateNotice(id, data) {
    try {
      if (!data.title || !data.content) {
        throw new Error('제목과 내용을 모두 입력해주세요.')
      }

      const response = await api.put(getApiEndpoint(`/notice/${id}`), data)
      if (!response.data) {
        throw new Error('공지사항 수정에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 공지사항 삭제
  async deleteNotice(id) {
    try {
      const response = await api.delete(getApiEndpoint(`/notice/${id}`))
      if (!response.data) {
        throw new Error('공지사항 삭제에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 문의 목록 조회
  async getInquiries(params = {}) {
    try {
      const response = await api.get(getApiEndpoint('/inquiry'), { params })
      if (!response.data) {
        throw new Error('문의 목록을 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 문의 상세 조회
  async getInquiry(id) {
    try {
      const response = await api.get(getApiEndpoint(`/inquiry/${id}`))
      if (!response.data) {
        throw new Error('문의를 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 문의 등록
  async createInquiry(data) {
    try {
      if (!data.title || !data.content) {
        throw new Error('제목과 내용을 모두 입력해주세요.')
      }

      const response = await api.post(getApiEndpoint('/inquiry'), data)
      if (!response.data) {
        throw new Error('문의 등록에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 문의 수정
  async updateInquiry(id, data) {
    try {
      if (!data.title || !data.content) {
        throw new Error('제목과 내용을 모두 입력해주세요.')
      }

      const response = await api.put(getApiEndpoint(`/inquiry/${id}`), data)
      if (!response.data) {
        throw new Error('문의 수정에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 문의 삭제
  async deleteInquiry(id) {
    try {
      const response = await api.delete(getApiEndpoint(`/inquiry/${id}`))
      if (!response.data) {
        throw new Error('문의 삭제에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 문의 답변 등록
  async answerInquiry(id, data) {
    try {
      if (!data.answer) {
        throw new Error('답변 내용을 입력해주세요.')
      }

      const response = await api.post(getApiEndpoint(`/inquiry/${id}/answer`), data)
      if (!response.data) {
        throw new Error('답변 등록에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 문의 상태 업데이트
  async updateInquiryStatus(id, status) {
    try {
      if (!Object.values(INQUIRY_STATUS).some(s => s.id === status)) {
        throw new Error('유효하지 않은 상태입니다.')
      }

      const response = await api.put(getApiEndpoint(`/inquiry/${id}/status`), { status })
      if (!response.data) {
        throw new Error('상태 업데이트에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  }
} 