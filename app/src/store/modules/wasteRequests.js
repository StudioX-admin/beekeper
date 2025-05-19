export default {
  namespaced: true,
  state: {
    requests: [],
    currentRequest: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_REQUESTS(state, requests) {
      state.requests = requests
    },
    SET_CURRENT_REQUEST(state, request) {
      state.currentRequest = request
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchRequests({ commit }) {
      commit('SET_LOADING', true)
      try {
        // API 호출 구현
        commit('SET_REQUESTS', [])
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    getRequests: state => state.requests,
    getCurrentRequest: state => state.currentRequest,
    isLoading: state => state.loading,
    getError: state => state.error
  }
} 