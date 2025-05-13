// web/src/main.js에 스타일 임포트 추가
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 전역 스타일 임포트
import './assets/css/variables.css'
import './assets/css/theme.css'
import './assets/css/fonts.css'
import './assets/css/global.css'
import './assets/css/responsive.css'
import './assets/css/animations.css'

// 전역 컴포넌트 등록
import Modal from './components/common/Modal.vue'
import Confirm from './components/common/Confirm.vue'
import Toast from './components/common/Toast.vue'

Vue.component('Modal', Modal)
Vue.component('Confirm', Confirm)
Vue.component('Toast', Toast)

// 토스트 플러그인 생성
const ToastPlugin = {
  install(Vue) {
    // 전역 토스트 인스턴스 생성
    const ToastConstructor = Vue.extend(Toast)
    const toast = new ToastConstructor()
    toast.$mount()
    document.body.appendChild(toast.$el)
    
    // 전역 메서드 추가
    Vue.prototype.$toast = {
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

Vue.use(ToastPlugin)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
