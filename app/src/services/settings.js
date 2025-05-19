import { api } from '@/utils/api'
import { usePlatform } from '@/composables/usePlatform'

const { isWeb, isApp } = usePlatform()

// 플랫폼별 API 엔드포인트 설정
const getApiEndpoint = (path) => {
  const baseUrl = isWeb ? '/api/web' : '/api/app'
  return `${baseUrl}${path}`
}

export const settingsService = {
  // 설정 정보 조회
  async getSettings() {
    try {
      const response = await api.get(getApiEndpoint('/settings'))
      if (!response.data) {
        throw new Error('설정 정보를 불러올 수 없습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 프로필 업데이트
  async updateProfile(data) {
    try {
      if (!data.name || !data.email || !data.phone) {
        throw new Error('필수 정보를 모두 입력해주세요.')
      }

      // 전화번호 형식 검증
      const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/
      if (!phoneRegex.test(data.phone)) {
        throw new Error('올바른 전화번호 형식이 아닙니다.')
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        throw new Error('올바른 이메일 형식이 아닙니다.')
      }

      const response = await api.put(getApiEndpoint('/settings/profile'), data)
      if (!response.data) {
        throw new Error('프로필 업데이트에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 비밀번호 변경
  async updatePassword(data) {
    try {
      if (!data.currentPassword || !data.newPassword) {
        throw new Error('현재 비밀번호와 새 비밀번호를 입력해주세요.')
      }

      // 비밀번호 유효성 검사
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
      if (!passwordRegex.test(data.newPassword)) {
        throw new Error('비밀번호는 8자 이상이며, 영문/숫자/특수문자를 포함해야 합니다.')
      }

      const response = await api.put(getApiEndpoint('/settings/password'), data)
      if (!response.data) {
        throw new Error('비밀번호 변경에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 알림 설정 업데이트
  async updateNotificationSettings(data) {
    try {
      if (typeof data.pushNotification !== 'boolean' || typeof data.emailNotification !== 'boolean') {
        throw new Error('알림 설정이 올바르지 않습니다.')
      }

      // App에서만 푸시 알림 설정 가능
      if (isWeb && data.pushNotification) {
        throw new Error('웹에서는 푸시 알림을 사용할 수 없습니다.')
      }

      const response = await api.put(getApiEndpoint('/settings/notifications'), data)
      if (!response.data) {
        throw new Error('알림 설정 업데이트에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  },

  // 로그아웃
  async logout() {
    try {
      const response = await api.post(getApiEndpoint('/auth/logout'))
      if (!response.data) {
        throw new Error('로그아웃에 실패했습니다.')
      }
      return response.data
    } catch (error) {
      throw error
    }
  }
} 