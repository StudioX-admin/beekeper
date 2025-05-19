export default {
  namespaced: true,
  state: {
    vehicles: [],
    currentVehicle: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_VEHICLES(state, vehicles) {
      state.vehicles = vehicles
    },
    SET_CURRENT_VEHICLE(state, vehicle) {
      state.currentVehicle = vehicle
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchVehicles({ commit }) {
      commit('SET_LOADING', true)
      try {
        // API 호출 구현
        commit('SET_VEHICLES', [])
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  getters: {
    getVehicles: state => state.vehicles,
    getCurrentVehicle: state => state.currentVehicle,
    isLoading: state => state.loading,
    getError: state => state.error
  }
} 