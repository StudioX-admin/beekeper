<template>
  <div class="facility-register">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/facility/list" class="back_btn">
          <img src="../../assets/images/icon_back.png" alt="">
        </RouterLink>
        <span class="title">시설 등록</span>
      </div>
    </div>

    <div class="register_form">
      <!-- 시설명 -->
      <div class="form_group">
        <label>시설명</label>
        <input
          type="text"
          v-model="form.name"
          placeholder="시설명을 입력하세요"
          required
        />
      </div>

      <!-- 주소 -->
      <div class="form_group">
        <label>주소</label>
        <input
          type="text"
          v-model="form.address"
          placeholder="주소를 입력하세요"
          required
        />
      </div>

      <!-- 운영 시간 -->
      <div class="form_group">
        <label>운영 시간</label>
        <div class="time_inputs">
          <div class="time_input">
            <label>시작 시간</label>
            <input
              type="time"
              v-model="form.startTime"
              required
            />
          </div>
          <div class="time_input">
            <label>종료 시간</label>
            <input
              type="time"
              v-model="form.endTime"
              required
            />
          </div>
        </div>
      </div>

      <!-- 등록 버튼 -->
      <div class="form_actions">
        <button class="submit_btn" @click="submitForm" :disabled="isSubmitting">
          {{ isSubmitting ? '등록 중...' : '등록하기' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { facilityService } from '@/services/facility'

const router = useRouter()
const { showError } = useErrorHandler()
const { isLoading: isSubmitting, withLoading } = useLoading()

// 폼 데이터
const form = ref({
  name: '',
  address: '',
  startTime: '',
  endTime: ''
})

// 운영 시간 계산
const operatingHours = computed(() => {
  if (!form.value.startTime || !form.value.endTime) return ''
  return `${form.value.startTime} - ${form.value.endTime}`
})

// 폼 제출
const submitForm = async () => {
  try {
    if (!form.value.name) {
      showError(new Error('시설명을 입력해주세요.'))
      return
    }

    if (!form.value.address) {
      showError(new Error('주소를 입력해주세요.'))
      return
    }

    if (!form.value.startTime || !form.value.endTime) {
      showError(new Error('운영 시간을 입력해주세요.'))
      return
    }

    await withLoading(async () => {
      const data = {
        name: form.value.name,
        address: form.value.address,
        operatingHours: operatingHours.value
      }
      await facilityService.createFacility(data)
      router.push('/facility/list')
    })
  } catch (error) {
    showError(error)
  }
}
</script>

<style scoped>
.facility-register {
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

.register_form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}

.form_group {
  margin-bottom: 24px;
}

.form_group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form_group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.time_inputs {
  display: flex;
  gap: 16px;
}

.time_input {
  flex: 1;
}

.time_input label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.time_input input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form_actions {
  margin-top: 32px;
}

.submit_btn {
  width: 100%;
  height: 48px;
  background-color: #FED15E;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.submit_btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .facility-register {
    padding: 16px;
  }

  .register_form {
    padding: 16px 0;
  }

  .form_group input,
  .time_input input {
    font-size: 16px; /* iOS에서 자동 확대 방지 */
  }
}
</style> 