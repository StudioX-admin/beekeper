import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// axios 기본 설정
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'https://beekeper-d0e3.onrender.com/api';

const app = createApp(App)
app.use(router)
app.mount('#app')

// CSS 스타일 임포트
import './assets/css/main.css'

const app = createApp(App)

// 전역 프로퍼티
app.config.globalProperties.$formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

app.config.globalProperties.$formatStatus = (status) => {
  const statusMap = {
    'pending': '대기 중',
    'assigned': '배정됨',
    'in-progress': '수거 중',
    'completed': '완료됨',
    'cancelled': '취소됨'
  }
  return statusMap[status] || status
}

app.config.globalProperties.$formatWasteType = (type) => {
  const typeMap = {
    'general': '일반 폐기물',
    'construction': '건설 폐기물',
    'food': '음식물 폐기물',
    'recyclable': '재활용 폐기물',
    'hazardous': '위험 폐기물'
  }
  return typeMap[type] || type
}

app.use(store).use(router).mount('#app')
