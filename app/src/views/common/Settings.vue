<template>
  <div class="settings" :class="platformClass">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn"><img src="../../assets/images/icon_back.png" alt=""></RouterLink>
        <span class="title">설정</span>
      </div>
    </div>

    <!-- 설정 메뉴 -->
    <div class="settings_menu">
      <!-- 계정 정보 -->
      <div class="menu_section">
        <h3>계정 정보</h3>
        <div class="menu_items">
          <div class="menu_item" @click="showProfileDialog = true">
            <div class="menu_item_left">
              <img src="../../assets/images/icon_profile.png" alt="">
              <span>프로필</span>
            </div>
            <img src="../../assets/images/icon_arrow_right.png" alt="">
          </div>
          <div class="menu_item" @click="showPasswordDialog = true">
            <div class="menu_item_left">
              <img src="../../assets/images/icon_password.png" alt="">
              <span>비밀번호 변경</span>
            </div>
            <img src="../../assets/images/icon_arrow_right.png" alt="">
          </div>
        </div>
      </div>

      <!-- 알림 설정 -->
      <div class="menu_section">
        <h3>알림 설정</h3>
        <div class="menu_items">
          <div class="menu_item">
            <div class="menu_item_left">
              <img src="../../assets/images/icon_notification.png" alt="">
              <span>푸시 알림</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.pushNotification">
              <span class="slider"></span>
            </label>
          </div>
          <div class="menu_item">
            <div class="menu_item_left">
              <img src="../../assets/images/icon_email.png" alt="">
              <span>이메일 알림</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="settings.emailNotification">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 기타 -->
      <div class="menu_section">
        <h3>기타</h3>
        <div class="menu_items">
          <div class="menu_item" @click="showTermsDialog = true">
            <div class="menu_item_left">
              <img src="../../assets/images/icon_terms.png" alt="">
              <span>이용약관</span>
            </div>
            <img src="../../assets/images/icon_arrow_right.png" alt="">
          </div>
          <div class="menu_item" @click="showPrivacyDialog = true">
            <div class="menu_item_left">
              <img src="../../assets/images/icon_privacy.png" alt="">
              <span>개인정보처리방침</span>
            </div>
            <img src="../../assets/images/icon_arrow_right.png" alt="">
          </div>
          <div class="menu_item" @click="showVersionDialog = true">
            <div class="menu_item_left">
              <img src="../../assets/images/icon_version.png" alt="">
              <span>버전 정보</span>
            </div>
            <span class="version">v1.0.0</span>
          </div>
        </div>
      </div>

      <!-- 로그아웃 -->
      <div class="logout_section">
        <button class="logout_button" @click="logout">로그아웃</button>
      </div>
    </div>

    <!-- 프로필 수정 다이얼로그 -->
    <div v-if="showProfileDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>프로필 수정</h2>
        <div class="dialog_content">
          <div class="form_group">
            <label>이름</label>
            <input
              type="text"
              v-model="profileForm.name"
              placeholder="이름을 입력하세요"
            />
          </div>
          <div class="form_group">
            <label>이메일</label>
            <input
              type="email"
              v-model="profileForm.email"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div class="form_group">
            <label>전화번호</label>
            <input
              type="tel"
              v-model="profileForm.phone"
              placeholder="전화번호를 입력하세요"
            />
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeProfileDialog">취소</button>
          <button @click="updateProfile" class="submit_btn">저장</button>
        </div>
      </div>
    </div>

    <!-- 비밀번호 변경 다이얼로그 -->
    <div v-if="showPasswordDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>비밀번호 변경</h2>
        <div class="dialog_content">
          <div class="form_group">
            <label>현재 비밀번호</label>
            <input
              type="password"
              v-model="passwordForm.currentPassword"
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>
          <div class="form_group">
            <label>새 비밀번호</label>
            <input
              type="password"
              v-model="passwordForm.newPassword"
              placeholder="새 비밀번호를 입력하세요"
            />
          </div>
          <div class="form_group">
            <label>새 비밀번호 확인</label>
            <input
              type="password"
              v-model="passwordForm.confirmPassword"
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closePasswordDialog">취소</button>
          <button @click="updatePassword" class="submit_btn">변경</button>
        </div>
      </div>
    </div>

    <!-- 이용약관 다이얼로그 -->
    <div v-if="showTermsDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>이용약관</h2>
        <div class="dialog_content">
          <div class="terms_content">
            <p>제1조 (목적)</p>
            <p>이 약관은 비키퍼(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            <!-- 약관 내용 추가 -->
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeTermsDialog">닫기</button>
        </div>
      </div>
    </div>

    <!-- 개인정보처리방침 다이얼로그 -->
    <div v-if="showPrivacyDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>개인정보처리방침</h2>
        <div class="dialog_content">
          <div class="privacy_content">
            <p>1. 개인정보의 수집 및 이용 목적</p>
            <p>회사는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.</p>
            <!-- 개인정보처리방침 내용 추가 -->
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closePrivacyDialog">닫기</button>
        </div>
      </div>
    </div>

    <!-- 버전 정보 다이얼로그 -->
    <div v-if="showVersionDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>버전 정보</h2>
        <div class="dialog_content">
          <div class="version_info">
            <p>현재 버전: v1.0.0</p>
            <p>최신 버전: v1.0.0</p>
            <p>업데이트 일자: 2024.05.16</p>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeVersionDialog">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { settingsService } from '@/services/settings'
import { usePlatform } from '@/composables/usePlatform'

const router = useRouter()
const { isWeb, isApp } = usePlatform()

// 상태
const settings = ref({
  pushNotification: true,
  emailNotification: true
})

const profileForm = ref({
  name: '',
  email: '',
  phone: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 다이얼로그 상태
const showProfileDialog = ref(false)
const showPasswordDialog = ref(false)
const showTermsDialog = ref(false)
const showPrivacyDialog = ref(false)
const showVersionDialog = ref(false)

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 플랫폼별 스타일 계산
const platformClass = computed(() => ({
  'platform-web': isWeb,
  'platform-app': isApp
}))

// 설정 로드
const loadSettings = async () => {
  try {
    await withLoading(async () => {
      const data = await settingsService.getSettings()
      settings.value = data.settings
      profileForm.value = data.profile
    })
  } catch (error) {
    handleError(error)
  }
}

// 프로필 업데이트
const updateProfile = async () => {
  try {
    if (!profileForm.value.name || !profileForm.value.email || !profileForm.value.phone) {
      showError(new Error('필수 정보를 모두 입력해주세요.'))
      return
    }

    await withLoading(async () => {
      await settingsService.updateProfile(profileForm.value)
      closeProfileDialog()
      loadSettings()
    })
  } catch (error) {
    handleError(error)
  }
}

// 비밀번호 유효성 검사
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
  return regex.test(password)
}

// 에러 처리
const handleError = (error) => {
  if (error.response?.status === 401) {
    router.push('/login')
  } else {
    showError(error)
  }
}

// 알림 설정 변경 감지
watch(() => settings.value, async (newSettings) => {
  try {
    await updateNotificationSettings()
  } catch (error) {
    handleError(error)
  }
}, { deep: true })

// 비밀번호 변경
const updatePassword = async () => {
  try {
    if (!validatePassword(passwordForm.value.newPassword)) {
      showError(new Error('비밀번호는 8자 이상이며, 영문/숫자/특수문자를 포함해야 합니다.'))
      return
    }

    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      showError(new Error('새 비밀번호가 일치하지 않습니다.'))
      return
    }

    await withLoading(async () => {
      await settingsService.updatePassword({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
      closePasswordDialog()
    })
  } catch (error) {
    handleError(error)
  }
}

// 알림 설정 업데이트
const updateNotificationSettings = async () => {
  try {
    await withLoading(async () => {
      await settingsService.updateNotificationSettings(settings.value)
    })
  } catch (error) {
    handleError(error)
  }
}

// 로그아웃
const logout = async () => {
  try {
    await withLoading(async () => {
      await settingsService.logout()
      router.push('/login')
    })
  } catch (error) {
    handleError(error)
  }
}

// 다이얼로그 닫기
const closeProfileDialog = () => {
  showProfileDialog.value = false
  loadSettings()
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const closeTermsDialog = () => {
  showTermsDialog.value = false
}

const closePrivacyDialog = () => {
  showPrivacyDialog.value = false
}

const closeVersionDialog = () => {
  showVersionDialog.value = false
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings {
  padding: 20px;
}

.sub_top_title {
  padding: 14px 16px;
  border-bottom: 1px solid #F2F2F2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sub_top_title > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sub_top_title .title {
  font-weight: 600;
  font-size: 18px;
  line-height: 28px;
}

.sub_top_title .back_btn {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub_top_title .back_btn > img {
  width: 100%;
}

.menu_section {
  margin-bottom: 24px;
}

.menu_section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.menu_items {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.menu_item {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.menu_item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

.menu_item_left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu_item_left > img {
  width: 24px;
  height: 24px;
}

.menu_item_left > span {
  font-size: 14px;
}

.menu_item > img {
  width: 16px;
  height: 16px;
}

.version {
  font-size: 12px;
  color: #999;
}

/* 스위치 스타일 */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #FED15E;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.logout_section {
  margin-top: 40px;
}

.logout_button {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.dialog_overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.dialog h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog_content {
  margin-bottom: 20px;
}

.form_group {
  margin-bottom: 16px;
}

.form_group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form_group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px; /* iOS에서 자동 확대 방지 */
}

.terms_content,
.privacy_content,
.version_info {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.terms_content p,
.privacy_content p,
.version_info p {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.6;
}

.dialog_actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.dialog_actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit_btn {
  background-color: #FED15E;
  color: #000;
  font-weight: 600;
}

/* 로딩 스피너 */
.loading-spinner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FED15E;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 모바일 반응형 개선 */
@media (max-width: 768px) {
  .platform-web .settings {
    padding: 20px;
  }
  
  .dialog {
    margin: 16px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .form_group input {
    font-size: 16px; /* iOS에서 자동 확대 방지 */
  }
}
</style> 