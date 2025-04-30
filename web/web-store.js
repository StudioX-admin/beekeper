import { createStore } from 'vuex'
import axios from 'axios'

const apiUrl = process.env.VUE_APP_API_URL || 'http://localhost:5000/api'

// API 인스턴스 생성
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

export default createStore({
  state: {
    token: null,
    user: null,
    wasteRequests: [],
    vehicles: [],
    drivers: [],
    dashboardData: null,
    loading: false,
    error: null
  },
  getters: {
    isAuthenticated: state => !!state.token,
    isAdmin: state => state.user?.role === 'admin',
    user: state => state.user,
    token: state => state.token,
    wasteRequests: state => state.wasteRequests,
    vehicles: state => state.vehicles,
    drivers: state => state.drivers,
    dashboardData: state => state.dashboardData,
    loading: state => state.loading,
    error: state => state.error
  },
  mutations: {
    setAuth(state, { token, user }) {
      state.token = token
      state.user = user
    },
    clearAuth(state) {
      state.token = null
      state.user = null
    },
    setWasteRequests(state, wasteRequests) {
      state.wasteRequests = wasteRequests
    },
    addWasteRequest(state, wasteRequest) {
      state.wasteRequests.unshift(wasteRequest)
    },
    updateWasteRequest(state, updatedRequest) {
      const index = state.wasteRequests.findIndex(req => req._id === updatedRequest._id)
      if (index !== -1) {
        state.wasteRequests.splice(index, 1, updatedRequest)
      }
    },
    setVehicles(state, vehicles) {
      state.vehicles = vehicles
    },
    setDrivers(state, drivers) {
      state.drivers = drivers
    },
    setDashboardData(state, data) {
      state.dashboardData = data
    },
    setLoading(state, loading) {
      state.loading = loading
    },
    setError(state, error) {
      state.error = error
    },
    clearError(state) {
      state.error = null
    }
  },
  actions: {
    // 인증 관련 액션
    setAuth({ commit }, { token, user }) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      commit('setAuth', { token, user })
    },
    logout({ commit }) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      commit('clearAuth')
    },
    async login({ dispatch, commit }, credentials) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.post('/auth/login', credentials)
        const { token, user } = response.data
        
        dispatch('setAuth', { token, user })
        
        return user
      } catch (error) {
        commit('setError', error.response?.data?.message || '로그인 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    async register({ commit }, userData) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        await api.post('/auth/register', userData)
      } catch (error) {
        commit('setError', error.response?.data?.message || '회원가입 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    // 폐기물 요청 관련 액션
    async fetchWasteRequests({ commit }, params = {}) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.get('/waste-requests', { params })
        commit('setWasteRequests', response.data.requests || response.data)
        
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '요청 목록을 불러오는 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    async fetchWasteRequest({ commit }, id) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.get(`/waste-requests/${id}`)
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '요청 정보를 불러오는 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    async createWasteRequest({ commit }, requestData) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.post('/waste-requests', requestData)
        commit('addWasteRequest', response.data.request)
        
        return response.data.request
      } catch (error) {
        commit('setError', error.response?.data?.message || '요청 생성 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    async updateWasteRequest({ commit }, { id, updateData }) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.put(`/waste-requests/${id}`, updateData)
        commit('updateWasteRequest', response.data.request)
        
        return response.data.request
      } catch (error) {
        commit('setError', error.response?.data?.message || '요청 업데이트 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    async deleteWasteRequest({ commit }, id) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        await api.delete(`/waste-requests/${id}`)
      } catch (error) {
        commit('setError', error.response?.data?.message || '요청 삭제 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    // 차량 관련 액션
    async fetchVehicles({ commit }, params = {}) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.get('/vehicles', { params })
        commit('setVehicles', response.data)
        
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '차량 목록을 불러오는 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    // 기사 관련 액션
    async fetchDrivers({ commit }) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.get('/auth/users', { params: { role: 'driver' } })
        commit('setDrivers', response.data)
        
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '기사 목록을 불러오는 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    // 대시보드 관련 액션
    async fetchDashboardData({ commit }) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.get('/dashboard')
        commit('setDashboardData', response.data)
        
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '대시보드 데이터를 불러오는 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    }
  }
})
