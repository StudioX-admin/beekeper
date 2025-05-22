import Vue from 'vue'
import Vuex from 'vuex'
import api from '../api'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

// 모듈 가져오기
import auth from './modules/auth'
import wasteRequests from './reservation'
import vehicles from './modules/vehicles'
import drivers from './modules/drivers'

export default new Vuex.Store({
  modules: {
    auth,
    wasteRequests,
    vehicles,
    drivers
  },
  state: {
    loading: false,
    error: null,
    systemNotifications: []
  },
  getters: {
    isLoading: state => state.loading,
    error: state => state.error,
    systemNotifications: state => state.systemNotifications
  },
  mutations: {
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    },
    ADD_NOTIFICATION(state, notification) {
      state.systemNotifications.push({
        ...notification,
        id: Date.now(),
        read: false
      })
    },
    MARK_NOTIFICATION_READ(state, id) {
      const index = state.systemNotifications.findIndex(n => n.id === id)
      if (index !== -1) {
        state.systemNotifications[index].read = true
      }
    },
    CLEAR_NOTIFICATIONS(state) {
      state.systemNotifications = []
    }
  },
  actions: {
    setLoading({ commit }, status) {
      commit('SET_LOADING', status)
    },
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    },
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    },
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
    },
    markNotificationRead({ commit }, id) {
      commit('MARK_NOTIFICATION_READ', id)
    },
    clearNotifications({ commit }) {
      commit('CLEAR_NOTIFICATIONS')
    }
  },
  plugins: [
    createPersistedState({
      key: 'beekeper-admin',
      paths: ['auth.token', 'auth.user', 'systemNotifications']
    })
  ]
})
