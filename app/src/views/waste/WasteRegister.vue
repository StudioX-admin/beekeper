<template>
  <div class="waste-register">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/waste/list" class="back_btn">
          <img src="../../assets/images/icon_back.png" alt="">
        </RouterLink>
        <span class="title">폐기물 등록</span>
      </div>
    </div>

    <div class="register_form">
      <!-- 폐기물 종류 -->
      <div class="form_group">
        <label>폐기물 종류</label>
        <select v-model="form.type" required>
          <option value="">선택하세요</option>
          <option v-for="type in WASTE_TYPES" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>

      <!-- 수량 -->
      <div class="form_group">
        <label>수량</label>
        <div class="quantity_input">
          <input
            type="number"
            v-model="form.quantity"
            :placeholder="`수량을 입력하세요 (${selectedUnit})`"
            required
          />
          <span class="unit">{{ selectedUnit }}</span>
        </div>
      </div>

      <!-- 설명 -->
      <div class="form_group">
        <label>설명</label>
        <textarea
          v-model="form.description"
          placeholder="폐기물에 대한 설명을 입력하세요"
          rows="4"
        ></textarea>
      </div>

      <!-- 이미지 첨부 -->
      <div class="form_group">
        <label>이미지 첨부</label>
        <div class="image_upload">
          <div class="image_preview" v-if="previewImages.length > 0">
            <div v-for="(image, index) in previewImages" :key="index" class="preview_item">
              <img :src="image" alt="미리보기">
              <button class="remove_btn" @click="removeImage(index)">×</button>
            </div>
          </div>
          <label class="upload_btn" :class="{ 'disabled': previewImages.length >= 5 }">
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleImageUpload"
              :disabled="previewImages.length >= 5"
            >
            <span>이미지 첨부 (최대 5장)</span>
          </label>
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
import { wasteService, WASTE_TYPES } from '@/services/waste'

const router = useRouter()
const { showError } = useErrorHandler()
const { isLoading: isSubmitting, withLoading } = useLoading()

// 폼 데이터
const form = ref({
  type: '',
  quantity: '',
  description: '',
  images: []
})

// 이미지 미리보기
const previewImages = ref([])

// 선택된 폐기물 종류의 단위 계산
const selectedUnit = computed(() => {
  const selectedType = WASTE_TYPES[form.value.type]
  return selectedType ? selectedType.unit : ''
})

// 이미지 업로드 처리
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  
  // 최대 5장 제한
  if (previewImages.value.length + files.length > 5) {
    showError(new Error('최대 5장의 이미지만 첨부할 수 있습니다.'))
    return
  }

  // 파일 검증 및 미리보기 생성
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      showError(new Error('이미지 파일 크기는 5MB를 초과할 수 없습니다.'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      previewImages.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
    form.value.images.push(file)
  })
}

// 이미지 제거
const removeImage = (index) => {
  previewImages.value.splice(index, 1)
  form.value.images.splice(index, 1)
}

// 폼 제출
const submitForm = async () => {
  try {
    if (!form.value.type) {
      showError(new Error('폐기물 종류를 선택해주세요.'))
      return
    }

    if (!form.value.quantity) {
      showError(new Error('수량을 입력해주세요.'))
      return
    }

    await withLoading(async () => {
      await wasteService.createWaste(form.value)
      router.push('/waste/list')
    })
  } catch (error) {
    showError(error)
  }
}
</script>

<style scoped>
.waste-register {
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

.form_group select,
.form_group input,
.form_group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.quantity_input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity_input input {
  flex: 1;
}

.unit {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.image_upload {
  margin-top: 8px;
}

.image_preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.preview_item {
  position: relative;
  aspect-ratio: 1;
}

.preview_item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove_btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.upload_btn {
  display: inline-block;
  padding: 12px 24px;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

.upload_btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload_btn input {
  display: none;
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
  .waste-register {
    padding: 16px;
  }

  .register_form {
    padding: 16px 0;
  }

  .form_group select,
  .form_group input,
  .form_group textarea {
    font-size: 16px; /* iOS에서 자동 확대 방지 */
  }
}
</style> 