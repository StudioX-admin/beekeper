// web/src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    wasteRequests: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0
    },
    users: [],
    vehicles: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    },
    SET_WASTE_REQUESTS(state, { wasteRequests, pagination }) {
      state.wasteRequests = wasteRequests;
      state.pagination = pagination;
    },
    SET_USERS(state, users) {
      state.users = users;
    },
    SET_VEHICLES(state, vehicles) {
      state.vehicles = vehicles;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    // 인증 관련 액션
    async login({ commit }, credentials) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.auth.login(credentials);
        commit('SET_USER', response.data.user);
        commit('SET_TOKEN', response.data.token);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async logout({ commit }) {
      try {
        await api.auth.logout();
      } finally {
        commit('SET_USER', null);
        commit('SET_TOKEN', null);
      }
    },
    
    // 폐기물 요청 관련 액션
    async fetchWasteRequests({ commit }, params) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.wasteRequests.getAll(params);
        commit('SET_WASTE_REQUESTS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async createWasteRequest({ commit }, data) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.wasteRequests.create(data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async updateWasteRequest({ commit }, { id, data }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.wasteRequests.update(id, data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async deleteWasteRequest({ commit }, id) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.wasteRequests.delete(id);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // 사용자 관련 액션
    async fetchUsers({ commit }, params) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.users.getAll(params);
        commit('SET_USERS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // 차량 관련 액션
    async fetchVehicles({ commit }, params) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.vehicles.getAll(params);
        commit('SET_VEHICLES', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    isAdmin: state => state.user && state.user.role === 'admin',
    isDriver: state => state.user && state.user.role === 'driver'
  }
})
