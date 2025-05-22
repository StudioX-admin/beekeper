import { ref } from 'vue'

export function useLoading() {
  const isLoading = ref(false)

  const withLoading = async (fn) => {
    isLoading.value = true
    try {
      await fn()
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    withLoading
  }
} 
