<template>
  <div class="reservation-detail">
    <div class="page-header">
      <h1>예약 상세</h1>
      <div class="actions">
        <el-button @click="goBack">목록으로</el-button>
        <el-button
          v-if="canEdit"
          type="primary"
          @click="showEditDialog"
        >
          수정
        </el-button>
        <el-button
          v-if="canDelete"
          type="danger"
          @click="deleteReservation"
        >
          삭제
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>예약 정보</span>
          <el-tag :type="getStatusType(reservation.status)">
            {{ getStatusText(reservation.status) }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="예약 번호">
          {{ reservation._id }}
        </el-descriptions-item>
        <el-descriptions-item label="예약일">
          {{ formatDate(reservation.scheduledDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="폐기물 종류">
          {{ reservation.wasteType }}
        </el-descriptions-item>
        <el-descriptions-item label="수량">
          {{ reservation.wasteAmount }} {{ reservation.unit }}
        </el-descriptions-item>
        <el-descriptions-item label="수거 주소">
          {{ reservation.pickupAddress }}
        </el-descriptions-item>
        <el-descriptions-item label="처리 주소">
          {{ reservation.processingAddress }}
        </el-descriptions-item>
        <el-descriptions-item label="수거 담당자">
          {{ reservation.pickupContact?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="수거 연락처">
          {{ reservation.pickupContact?.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="처리 담당자">
          {{ reservation.processingContact?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="처리 연락처">
          {{ reservation.processingContact?.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="비고" :span="2">
          {{ reservation.notes }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="timeline">
        <h3>처리 이력</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in reservation.activities"
            :key="index"
            :type="getActivityType(activity.type)"
            :timestamp="formatDate(activity.timestamp)"
          >
            {{ activity.description }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- 예약 수정 다이얼로그 -->
    <el-dialog
      v-model="dialogVisible"
      title="예약 수정"
      width="50%"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="폐기물 종류" prop="wasteType">
          <el-select v-model="form.wasteType" placeholder="폐기물 종류 선택">
            <el-option label="일반폐기물" value="일반폐기물" />
            <el-option label="사업장폐기물" value="사업장폐기물" />
            <el-option label="건설폐기물" value="건설폐기물" />
            <el-option label="특정폐기물" value="특정폐기물" />
          </el-select>
        </el-form-item>
        <el-form-item label="수량" prop="wasteAmount">
          <el-input-number
            v-model="form.wasteAmount"
            :min="0"
            :precision="2"
          />
        </el-form-item>
        <el-form-item label="단위" prop="unit">
          <el-select v-model="form.unit">
            <el-option label="kg" value="kg" />
            <el-option label="ton" value="ton" />
          </el-select>
        </el-form-item>
        <el-form-item label="예약일" prop="scheduledDate">
          <el-date-picker
            v-model="form.scheduledDate"
            type="datetime"
            placeholder="예약일 선택"
          />
        </el-form-item>
        <el-form-item label="수거 주소" prop="pickupAddress">
          <el-input v-model="form.pickupAddress" />
        </el-form-item>
        <el-form-item label="수거 연락처">
          <el-input-group>
            <el-input v-model="form.pickupContact.name" placeholder="담당자" />
            <el-input v-model="form.pickupContact.phone" placeholder="연락처" />
          </el-input-group>
        </el-form-item>
        <el-form-item label="처리 주소" prop="processingAddress">
          <el-input v-model="form.processingAddress" />
        </el-form-item>
        <el-form-item label="처리 연락처">
          <el-input-group>
            <el-input v-model="form.processingContact.name" placeholder="담당자" />
            <el-input v-model="form.processingContact.phone" placeholder="연락처" />
          </el-input-group>
        </el-form-item>
        <el-form-item label="비고">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">취소</el-button>
        <el-button type="primary" @click="submitForm">저장</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useReservationStore } from '@/stores/reservation'
import { formatDate } from '@/utils/date'

export default {
  name: 'ReservationDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const reservationStore = useReservationStore()

    const loading = ref(false)
    const reservation = ref({})
    const dialogVisible = ref(false)
    const formRef = ref(null)

    const form = ref({
      wasteType: '',
      wasteAmount: 0,
      unit: 'kg',
      scheduledDate: null,
      pickupAddress: '',
      pickupContact: {
        name: '',
        phone: ''
      },
      processingAddress: '',
      processingContact: {
        name: '',
        phone: ''
      },
      notes: ''
    })

    const rules = {
      wasteType: [{ required: true, message: '폐기물 종류를 선택하세요', trigger: 'change' }],
      wasteAmount: [{ required: true, message: '수량을 입력하세요', trigger: 'blur' }],
      unit: [{ required: true, message: '단위를 선택하세요', trigger: 'change' }],
      scheduledDate: [{ required: true, message: '예약일을 선택하세요', trigger: 'change' }],
      pickupAddress: [{ required: true, message: '수거 주소를 입력하세요', trigger: 'blur' }],
      processingAddress: [{ required: true, message: '처리 주소를 입력하세요', trigger: 'blur' }]
    }

    const canEdit = computed(() => {
      return reservation.value.status === 'pending'
    })

    const canDelete = computed(() => {
      return reservation.value.status === 'pending'
    })

    const loadReservation = async () => {
      loading.value = true
      try {
        const response = await reservationStore.getReservation(route.params.id)
        reservation.value = response
      } catch (error) {
        ElMessage.error('예약 정보를 불러오는데 실패했습니다.')
        router.push('/reservations')
      }
      loading.value = false
    }

    const showEditDialog = () => {
      form.value = { ...reservation.value }
      dialogVisible.value = true
    }

    const submitForm = async () => {
      if (!formRef.value) return

      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            await reservationStore.updateReservation(reservation.value._id, form.value)
            ElMessage.success('예약이 수정되었습니다.')
            dialogVisible.value = false
            loadReservation()
          } catch (error) {
            ElMessage.error(error.message || '예약 수정에 실패했습니다.')
          }
        }
      })
    }

    const deleteReservation = async () => {
      try {
        await ElMessageBox.confirm('이 예약을 삭제하시겠습니까?', '확인', {
          type: 'warning'
        })
        await reservationStore.deleteReservation(reservation.value._id)
        ElMessage.success('예약이 삭제되었습니다.')
        router.push('/reservations')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('예약 삭제에 실패했습니다.')
        }
      }
    }

    const goBack = () => {
      router.push('/reservations')
    }

    const getStatusType = (status) => {
      const types = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        completed: 'info',
        cancelled: 'info'
      }
      return types[status] || 'info'
    }

    const getStatusText = (status) => {
      const texts = {
        pending: '대기중',
        approved: '승인됨',
        rejected: '거절됨',
        completed: '완료됨',
        cancelled: '취소됨'
      }
      return texts[status] || status
    }

    const getActivityType = (type) => {
      const types = {
        created: 'primary',
        updated: 'info',
        approved: 'success',
        rejected: 'danger',
        completed: 'success',
        cancelled: 'warning'
      }
      return types[type] || 'info'
    }

    onMounted(() => {
      loadReservation()
    })

    return {
      loading,
      reservation,
      dialogVisible,
      formRef,
      form,
      rules,
      canEdit,
      canDelete,
      formatDate,
      showEditDialog,
      submitForm,
      deleteReservation,
      goBack,
      getStatusType,
      getStatusText,
      getActivityType
    }
  }
}
</script>

<style scoped>
.reservation-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline {
  margin-top: 30px;
}

.timeline h3 {
  margin-bottom: 20px;
}
</style> 
