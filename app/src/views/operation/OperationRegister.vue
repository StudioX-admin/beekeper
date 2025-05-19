<template>
  <div class="operation-register">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/operation/list" class="back_btn">
          <img src="../../assets/images/icon_back.png" alt="">
        </RouterLink>
        <span class="title">운영 일정 등록</span>
      </div>
    </div>

    <div class="register_form">
      <!-- 시설 선택 -->
      <div class="form_group">
        <label>시설</label>
        <select v-model="form.facilityId" required>
          <option value="">시설을 선택하세요</option>
          <option v-for="facility in facilities" :key="facility.id" :value="facility.id">
            {{ facility.name }}
          </option>
        </select>
      </div>

      <!-- 날짜 -->
      <div class="form_group">
        <label>날짜</label>
        <input
          type="date"
          v-model="form.date"
          :min="minDate"
          required
        />
      </div>

      <!-- 시간 -->
      <div class="form_group">
        <label>시간</label>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { operationService } from '@/services/operation'
import { facilityService } from '@/services/facility'

const router = useRouter()
const { showError } = useErrorHandler()
const { isLoading: isSubmitting, withLoading } = useLoading()

// 상태
const facilities = ref([])

// 폼 데이터
const form = ref({
  facilityId: '',
  date: '',
  startTime: '',
  endTime: ''
})

// 최소 날짜 (오늘)
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// 시설 목록 로드
const loadFacilities = async () => {
  try {
    const response = await facilityService.getFacilities()
    facilities.value = response.items
  } catch (error) {
    showError(error)
  }
}

// 폼 제출
const submitForm = async () => {
  try {
    if (!form.value.facilityId) {
      showError(new Error('시설을 선택해주세요.'))
      return
    }

    if (!form.value.date) {
      showError(new Error('날짜를 선택해주세요.'))
      return
    }

    if (!form.value.startTime || !form.value.endTime) {
      showError(new Error('운영 시간을 입력해주세요.'))
      return
    }

    await withLoading(async () => {
      await operationService.createOperation(form.value)
      router.push('/operation/list')
    })
  } catch (error) {
    showError(error)
  }
}

onMounted(() => {
  loadFacilities()
})
</script>

<style scoped>
.operation-register {
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

.form_group input,
.form_group select {
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
  .operation-register {
    padding: 16px;
  }

  .register_form {
    padding: 16px 0;
  }

  .form_group input,
  .form_group select,
  .time_input input {
    font-size: 16px; /* iOS에서 자동 확대 방지 */
  }
}
</style> 