import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// 간단한 인증 composable
export function useAuth() {
  const router = useRouter()
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (credentials) => {
    try {
      // 로그인 로직 (임시)
      console.log('Login attempt:', credentials)
      // 실제 API 호출은 나중에 구현
      user.value = { id: 1, name: 'Driver' }
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    router.push('/login')
  }

  const checkAuth = () => {
    // 토큰 확인 로직 (임시)
    const token = localStorage.getItem('token')
    if (token) {
      user.value = { id: 1, name: 'Driver' }
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth
  }
}
