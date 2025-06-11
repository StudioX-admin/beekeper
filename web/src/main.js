import { createApp } from 'vue'
import App from './components/App.vue'
import router from './router'
import store from './store'

// 전역 스타일 임포트
import './assets/css/variables.css'
import './assets/css/theme.css'
import './assets/css/fonts.css'
import './assets/css/global.css'
import './assets/css/responsive.css'
import './assets/css/animations.css'
import './assets/css/main.css'

// 컴포넌트 임포트
import Modal from './components/common/Modal.vue'
import Confirm from './components/common/Confirm.vue'
import Toast from './components/common/Toast.vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'

// 앱 생성
const app = createApp(App)

// 전역 컴포넌트 등록
app.component('Modal', Modal)
app.component('Confirm', Confirm)
app.component('Toast', Toast)
app.component('Header', Header)
app.component('Sidebar', Sidebar)

// 토스트 플러그인
const ToastPlugin = {
  install(app) {
    // Vue 3 방식으로 수정 필요
    app.config.globalProperties.$toast = {
      success: (message) => console.log('Success:', message),
      error: (message) => console.log('Error:', message),
      warning: (message) => console.log('Warning:', message),
      info: (message) => console.log('Info:', message)
    }
  }
}

app.use(ToastPlugin)
app.use(store)
app.use(router)

app.mount('#app')
