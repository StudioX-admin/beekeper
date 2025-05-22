import { ref } from 'vue'

export function useErrorHandler() {
  const snackbar = ref(false)
  const errorMessage = ref('')

  const showError = (error) => {
    errorMessage.value = error.response?.data?.message || error.message || '오류가 발생했습니다.'
    snackbar.value = true

    // 3초 후 자동으로 닫기
    setTimeout(() => {
      snackbar.value = false
    }, 3000)
  }

  return {
    snackbar,
    errorMessage,
    showError
  }
} 
