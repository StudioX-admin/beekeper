import { ref } from 'vue'

export function useLoading() {
  const isLoading = ref(false)

  const withLoading = async (promise) => {
    isLoading.value = true
    try {
      const result = await promise
      return result
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    withLoading
  }
} 