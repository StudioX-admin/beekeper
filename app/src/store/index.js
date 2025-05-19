// app/src/store/index.js
import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import drivers from '@/store/modules/drivers'
import vehicles from '@/store/modules/vehicles'
import wasteRequests from '@/store/modules/wasteRequests'
import api from '@/api'

export default createStore({
  modules: {
    drivers,
    vehicles,
    wasteRequests
  },
  plugins: [
    createPersistedState({
      paths: ['drivers', 'vehicles', 'wasteRequests']
    })
  ],
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    tasks: [],
    selectedDate: new Date().toISOString().split('T')[0],
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
    SET_TASKS(state, tasks) {
      state.tasks = tasks;
    },
    SET_SELECTED_DATE(state, date) {
      state.selectedDate = date;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    UPDATE_TASK_STATUS(state, { taskId, status }) {
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = status;
      }
    }
  },
  actions: {
    // 인증 관련 액션
    async login({ commit }, credentials) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.auth.login(credentials);
        
        // 기사 권한 확인
        if (response.data.user.role !== 'driver') {
          throw new Error('기사 계정이 아닙니다.');
        }
        
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
    
    // 작업 관련 액션
    async fetchTasks({ commit, state }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await api.driver.getTasks({ date: state.selectedDate });
        commit('SET_TASKS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async startTask({ commit }, taskId) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        await api.driver.startTask(taskId);
        commit('UPDATE_TASK_STATUS', { taskId, status: '진행중' });
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async completeTask({ commit }, taskId) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        await api.driver.completeTask(taskId);
        commit('UPDATE_TASK_STATUS', { taskId, status: '완료' });
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async uploadTaskPhotos({ commit }, { taskId, photos }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const formData = new FormData();
        photos.forEach((photo, index) => {
          formData.append('photos', photo);
        });
        
        const response = await api.driver.uploadTaskPhotos(taskId, formData);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.response ? error.response.data.message : error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    
    // 날짜 변경 액션
    setSelectedDate({ commit, dispatch }, date) {
      commit('SET_SELECTED_DATE', date);
      return dispatch('fetchTasks');
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    tasksByStatus: state => status => {
      if (!status) return state.tasks;
      return state.tasks.filter(task => task.status === status);
    },
    pendingTasks: state => state.tasks.filter(task => task.status === '대기중'),
    inProgressTasks: state => state.tasks.filter(task => task.status === '진행중'),
    completedTasks: state => state.tasks.filter(task => task.status === '완료')
  }
})
