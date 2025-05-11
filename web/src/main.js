import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './assets/css/main.css'

// axios 기본 설정
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'https://beekeper-d0e3.onrender.com/api';

// Vue 애플리케이션 생성
const app = createApp(App)

// 라우터 사용
app.use(router)

// 앱 마운트
app.mount('#app')
