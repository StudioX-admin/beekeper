import { createStore } from 'vuex'

export default {
  namespaced: true,
  state: {
    profile: null,
    company: null
  },
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile
    },
    SET_COMPANY(state, company) {
      state.company = company
    }
  },
  actions: {
    setProfile({ commit }, profile) {
      commit('SET_PROFILE', profile)
    },
    setCompany({ commit }, company) {
      commit('SET_COMPANY', company)
    }
  },
  getters: {
    userProfile: state => state.profile,
    userCompany: state => state.company
  }
} 