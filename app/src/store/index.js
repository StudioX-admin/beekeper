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
    activeRequests: [],
    completedRequests: [],
    dashboardData: null,
    loading: false,
    error: null
  },
  getters: {
    isAuthenticated: state => !!state.token,
    user: state => state.user,
    activeRequests: state => state.activeRequests,
    completedRequests: state => state.completedRequests,
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
    setActiveRequests(state, requests) {
      state.activeRequests = requests
    },
    setCompletedRequests(state, requests) {
      state.completedRequests = requests
    },
    updateRequest(state, updatedRequest) {
      // 활성 요청 목록에서 업데이트
      const activeIndex = state.activeRequests.findIndex(req => req._id === updatedRequest._id)
      if (activeIndex !== -1) {
        if (updatedRequest.status === 'completed') {
          // 완료된 경우 활성 목록에서 제거하고 완료 목록에 추가
          state.activeRequests.splice(activeIndex, 1)
          state.completedRequests.unshift(updatedRequest)
        } else {
          // 상태만 업데이트
          state.activeRequests.splice(activeIndex, 1, updatedRequest)
        }
      }
      
      // 완료 목록에서도 업데이트 확인
      const completedIndex = state.completedRequests.findIndex(req => req._id === updatedRequest._id)
      if (completedIndex !== -1) {
        state.completedRequests.splice(completedIndex, 1, updatedRequest)
      }
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
        
        // 기사 역할 확인
        if (user.role !== 'driver') {
          throw new Error('이 앱은 수거 기사 전용입니다.')
        }
        
        dispatch('setAuth', { token, user })
        
        return user
      } catch (error) {
        commit('setError', error.response?.data?.message || error.message || '로그인 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    // 요청 관련 액션
    async fetchActiveRequests({ commit }) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        // 배정된 요청과 진행 중인 요청 조회
        const response = await api.get('/waste-requests', { 
          params: { status: ['assigned', 'in-progress'].join(',') }
        })
        
        commit('setActiveRequests', response.data.requests || response.data)
        
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '요청 목록을 불러오는 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    async fetchCompletedRequests({ commit }) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        // 완료된 요청 조회
        const response = await api.get('/waste-requests', { 
          params: { status: 'completed' }
        })
        
        commit('setCompletedRequests', response.data.requests || response.data)
        
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '완료된 요청 목록을 불러오는 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    async fetchRequestDetail({ commit }, id) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.get(`/waste-requests/${id}`)
        
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '요청 상세 정보를 불러오는 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    async updateRequestStatus({ commit }, { id, status, photos }) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const updateData = { status }
        if (photos) updateData.photos = photos
        
        const response = await api.put(`/waste-requests/${id}`, updateData)
        
        commit('updateRequest', response.data.request)
        
        return response.data.request
      } catch (error) {
        commit('setError', error.response?.data?.message || '요청 상태 업데이트 중 오류가 발생했습니다.')
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    
    // 대시보드 관련 액션
    async fetchDriverDashboard({ commit }) {
      try {
        commit('setLoading', true)
        commit('clearError')
        
        const response = await api.get('/dashboard/driver')
        
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
