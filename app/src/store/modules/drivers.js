export default {
  namespaced: true,
  state: {
    drivers: [],
    currentDriver: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_DRIVERS(state, drivers) {
      state.drivers = drivers
    },
    SET_CURRENT_DRIVER(state, driver) {
      state.currentDriver = driver
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchDrivers({ commit }) {
      commit('SET_LOADING', true)
      try {
        // API 호출 구현
        commit('SET_DRIVERS', [])
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    getDrivers: state => state.drivers,
    getCurrentDriver: state => state.currentDriver,
    isLoading: state => state.loading,
    getError: state => state.error
  }
} 