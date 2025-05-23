// web/src/main.js에 스타일 임포트 추가
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'  // 수정된 경로
import router from './router'
import axios from 'axios'

// 전역 스타일 임포트
import './assets/css/variables.css'
import './assets/css/theme.css'
import './assets/css/fonts.css'
import './assets/css/global.css'
import './assets/css/responsive.css'
import './assets/css/animations.css'
import './assets/css/main.css'

// 전역 컴포넌트 등록
import Modal from './components/common/Modal.vue'
import Confirm from './components/common/Confirm.vue'
import Toast from './components/common/Toast.vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'

// Create app instance
const app = createApp(App)

// Create Pinia instance
const pinia = createPinia()

// Configure axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Use plugins
app.use(pinia)
app.use(router)

// 토스트 플러그인 생성
const ToastPlugin = {
  install(app) {
    // 전역 토스트 인스턴스 생성
    const ToastConstructor = app.component(Toast.name)
    const toast = new ToastConstructor()
    toast.$mount()
    document.body.appendChild(toast.$el)
    
    // 전역 메서드 추가
    app.config.globalProperties.$toast = {
      show(options) {
        return toast.addToast(options)
      },
      success(message, title, duration) {
        return toast.addToast({
          type: 'success',
          message,
          title,
          duration
        })
      },
      error(message, title, duration) {
        return toast.addToast({
          type: 'error',
          message,
          title,
          duration
        })
      },
      warning(message, title, duration) {
        return toast.addToast({
          type: 'warning',
          message,
          title,
          duration
        })
      },
      info(message, title, duration) {
        return toast.addToast({
          type: 'info',
          message,
          title,
          duration
        })
      }
    }
  }
}

app.use(ToastPlugin)

// Mount app
app.component('Modal', Modal)
app.component('Confirm', Confirm)
app.component('Toast', Toast)
app.component('Header', Header)
app.component('Sidebar', Sidebar)
app.mount('#app')
