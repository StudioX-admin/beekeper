import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useContractStore = defineStore('contract', () => {
  // State
  const contracts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalPages = ref(1)
  const currentPage = ref(1)
  const companies = ref([])

  // Getters
  const getContractById = computed(() => (id) => {
    return contracts.value.find(contract => contract.id === id)
  })

  // Actions
  async function fetchContracts(params = {}) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get('/api/contracts', { params })
      contracts.value = response.data.contracts
      totalPages.value = response.data.totalPages
      currentPage.value = response.data.currentPage
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '계약 목록을 가져오는 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCompanies(type) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.get('/api/companies', { params: { type } })
      companies.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '업체 목록을 가져오는 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createContract(contractData) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.post('/api/contracts', contractData)
      contracts.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '계약 생성 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateContract(id, contractData) {
    try {
      loading.value = true
      error.value = null
      const response = await axios.put(`/api/contracts/${id}`, contractData)
      const index = contracts.value.findIndex(c => c.id === id)
      if (index !== -1) {
        contracts.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || '계약 수정 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteContract(id) {
    try {
      loading.value = true
      error.value = null
      await axios.delete(`/api/contracts/${id}`)
      contracts.value = contracts.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || '계약 삭제 중 오류가 발생했습니다.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    contracts,
    loading,
    error,
    totalPages,
    currentPage,
    companies,
    // Getters
    getContractById,
    // Actions
    fetchContracts,
    fetchCompanies,
    createContract,
    updateContract,
    deleteContract
  }
}) 