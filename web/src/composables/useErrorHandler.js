import { ref } from 'vue'

export function useErrorHandler() {
  const snackbar = ref(false)
  const errorMessage = ref('')

  const showError = (error) => {
    console.error(error)
    errorMessage.value = error.response?.data?.message || '오류가 발생했습니다.'
    snackbar.value = true
  }

  return {
    snackbar,
    errorMessage,
    showError
  }
} 