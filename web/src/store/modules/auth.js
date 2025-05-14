import api from '@/api'
import router from '@/router'

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  loginError: null
}

const getters = {
  isAuthenticated: state => !!state.token,
  currentUser: state => state.user,
  loginError: state => state.loginError,
  isAdmin: state => state.user && state.user.role === 'admin'
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  SET_USER(state, user) {
    state.user = user
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },
  SET_LOGIN_ERROR(state, error) {
    state.loginError = error
  }
}

const actions = {
  async login({ commit, dispatch }, credentials) {
    commit('SET_LOGIN_ERROR', null)
    dispatch('setLoading', true, { root: true })
    
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, user } = response.data
      
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      
      // 리다이렉트 확인
      const redirectPath = router.currentRoute.query.redirect || '/'
      router.push(redirectPath)
      
      return response
    } catch (error) {
      const errorMessage = error.response && error.response.data.message
        ? error.response.data.message
        : '로그인 중 오류가 발생했습니다.'
      
      commit('SET_LOGIN_ERROR', errorMessage)
      dispatch('setError', errorMessage, { root: true })
      throw error
    } finally {
      dispatch('setLoading', false, { root: true })
    }
  },
  
  logout({ commit }) {
    commit('SET_TOKEN', null)
    commit('SET_USER', null)
    router.push('/login')
  },
  
  async refreshToken({ commit, state }) {
    if (!state.token) return
    
    try {
      const response = await api.post('/auth/refresh-token', {
        token: state.token
      })
      
      commit('SET_TOKEN', response.data.token)
      return response.data.token
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
      router.push('/login')
    }
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
