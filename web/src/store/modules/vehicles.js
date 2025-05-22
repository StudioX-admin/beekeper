const state = {
  vehicles: [],
  selectedVehicle: null,
  loading: false,
  error: null
}

const mutations = {
  SET_VEHICLES(state, vehicles) {
    state.vehicles = vehicles
  },
  SET_SELECTED_VEHICLE(state, vehicle) {
    state.selectedVehicle = vehicle
  },
  SET_LOADING(state, status) {
    state.loading = status
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async fetchVehicles({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get('/vehicles')
      commit('SET_VEHICLES', response.data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchVehicleById({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get(`/vehicles/${id}`)
      commit('SET_SELECTED_VEHICLE', response.data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
