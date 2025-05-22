const state = {
  drivers: [],
  selectedDriver: null,
  loading: false,
  error: null
}

const mutations = {
  SET_DRIVERS(state, drivers) {
    state.drivers = drivers
  },
  SET_SELECTED_DRIVER(state, driver) {
    state.selectedDriver = driver
  },
  SET_LOADING(state, status) {
    state.loading = status
  },
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  async fetchDrivers({ commit }) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get('/drivers')
      commit('SET_DRIVERS', response.data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  async fetchDriverById({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const response = await api.get(`/drivers/${id}`)
      commit('SET_SELECTED_DRIVER', response.data)
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
