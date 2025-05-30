<template>
  <div class="inquiry-edit">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/customer/inquiry" class="back_btn">
          <img src="../../assets/images/icon_back.png" alt="">
        </RouterLink>
        <span class="title">문의 수정</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="edit_form">
      <div class="form_group">
        <label for="title">제목</label>
        <input
          type="text"
          id="title"
          v-model="formData.title"
          placeholder="제목을 입력하세요"
          required
        >
      </div>

      <div class="form_group">
        <label for="content">내용</label>
        <textarea
          id="content"
          v-model="formData.content"
          placeholder="문의 내용을 입력하세요"
          rows="10"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        class="submit_btn"
        :disabled="isLoading"
      >
        {{ isLoading ? '수정 중...' : '수정하기' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { customerService } from '@/services/customer'

const router = useRouter()
const route = useRoute()
const { showError } = useErrorHandler()
const { isLoading, withLoading } = useLoading()

// 폼 데이터
const formData = ref({
  title: '',
  content: ''
})

// 문의 상세 정보 로드
const loadInquiry = async () => {
  try {
    await withLoading(async () => {
      const inquiry = await customerService.getInquiry(route.params.id)
      formData.value = {
        title: inquiry.title,
        content: inquiry.content
      }
    })
  } catch (error) {
    showError(error)
  }
}

// 폼 제출
const handleSubmit = async () => {
  try {
    await withLoading(async () => {
      await customerService.updateInquiry(route.params.id, formData.value)
      router.push('/customer/inquiry')
    })
  } catch (error) {
    showError(error)
  }
}

onMounted(() => {
  loadInquiry()
})
</script>

<style scoped>
.inquiry-edit {
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

.edit_form {
  margin-top: 20px;
}

.form_group {
  margin-bottom: 20px;
}

.form_group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form_group input[type="text"],
.form_group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form_group textarea {
  resize: vertical;
  min-height: 200px;
}

.submit_btn {
  width: 100%;
  padding: 16px;
  background-color: #FED15E;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.submit_btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .inquiry-edit {
    padding: 16px;
  }

  .form_group input[type="text"],
  .form_group textarea {
    font-size: 16px; /* iOS에서 자동 확대 방지 */
  }
}
</style> 