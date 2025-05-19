<template>
  <div class="reservation-list">
    <div class="page-header">
      <h1>폐기물 처리 예약</h1>
      <el-button type="primary" @click="showCreateDialog">새 예약</el-button>
    </div>

    <!-- 필터 -->
    <div class="filters">
      <el-form :inline="true" :model="filters">
        <el-form-item label="상태">
          <el-select v-model="filters.status" placeholder="상태 선택" clearable>
            <el-option label="대기중" value="pending" />
            <el-option label="승인됨" value="approved" />
            <el-option label="거절됨" value="rejected" />
            <el-option label="완료됨" value="completed" />
            <el-option label="취소됨" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadReservations">검색</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 예약 목록 -->
    <el-table
      v-loading="loading"
      :data="reservations"
      style="width: 100%"
    >
      <el-table-column prop="wasteType" label="폐기물 종류" width="120" />
      <el-table-column label="수량" width="120">
        <template #default="{ row }">
          {{ row.wasteAmount }} {{ row.unit }}
        </template>
      </el-table-column>
      <el-table-column prop="scheduledDate" label="예약일" width="180">
        <template #default="{ row }">
          {{ formatDate(row.scheduledDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="pickupAddress" label="수거 주소" />
      <el-table-column prop="processingAddress" label="처리 주소" />
      <el-table-column prop="status" label="상태" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="작업" width="150">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              size="small"
              @click="viewReservation(row)"
            >
              상세
            </el-button>
            <el-button
              v-if="canEdit(row)"
              size="small"
              type="primary"
              @click="editReservation(row)"
            >
              수정
            </el-button>
            <el-button
              v-if="canDelete(row)"
              size="small"
              type="danger"
              @click="deleteReservation(row)"
            >
              삭제
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 예약 생성/수정 다이얼로그 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '예약 수정' : '새 예약'"
      width="50%"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="처리업체" prop="processorId">
          <el-select
            v-model="form.processorId"
            placeholder="처리업체 선택"
            :disabled="isEdit"
          >
            <el-option
              v-for="processor in processors"
              :key="processor._id"
              :label="processor.company.name"
              :value="processor._id"
            />
          </el-select>
        </el-form-item>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useReservationStore } from '@/store/reservation'
import { useUserStore } from '@/store/user'
import { formatDate } from '@/utils/date'

export default {
  name: 'ReservationList',
  setup() {
    const router = useRouter()
    const reservationStore = useReservationStore()
    const userStore = useUserStore()

    const loading = ref(false)
    const reservations = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const filters = ref({
      status: ''
    })
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref(null)
    const processors = ref([])

    const form = ref({
      processorId: '',
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
      processorId: [{ required: true, message: '처리업체를 선택하세요', trigger: 'change' }],
      wasteType: [{ required: true, message: '폐기물 종류를 선택하세요', trigger: 'change' }],
      wasteAmount: [{ required: true, message: '수량을 입력하세요', trigger: 'blur' }],
      unit: [{ required: true, message: '단위를 선택하세요', trigger: 'change' }],
      scheduledDate: [{ required: true, message: '예약일을 선택하세요', trigger: 'change' }],
      pickupAddress: [{ required: true, message: '수거 주소를 입력하세요', trigger: 'blur' }],
      processingAddress: [{ required: true, message: '처리 주소를 입력하세요', trigger: 'blur' }]
    }

    const loadReservations = async () => {
      loading.value = true
      try {
        const response = await reservationStore.getTransporterReservations({
          page: currentPage.value,
          limit: pageSize.value,
          status: filters.value.status
        })
        reservations.value = response.reservations
        total.value = response.total
      } catch (error) {
        ElMessage.error('예약 목록을 불러오는데 실패했습니다.')
      }
      loading.value = false
    }

    const loadProcessors = async () => {
      try {
        const response = await userStore.getProcessors()
        processors.value = response
      } catch (error) {
        ElMessage.error('처리업체 목록을 불러오는데 실패했습니다.')
      }
    }

    const showCreateDialog = () => {
      isEdit.value = false
      form.value = {
        processorId: '',
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
      }
      dialogVisible.value = true
    }

    const editReservation = (row) => {
      isEdit.value = true
      form.value = { ...row }
      dialogVisible.value = true
    }

    const submitForm = async () => {
      if (!formRef.value) return

      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            if (isEdit.value) {
              await reservationStore.updateReservation(form.value._id, form.value)
              ElMessage.success('예약이 수정되었습니다.')
            } else {
              await reservationStore.createReservation(form.value)
              ElMessage.success('예약이 생성되었습니다.')
            }
            dialogVisible.value = false
            loadReservations()
          } catch (error) {
            ElMessage.error(error.message || '예약 저장에 실패했습니다.')
          }
        }
      })
    }

    const deleteReservation = async (row) => {
      try {
        await ElMessageBox.confirm('이 예약을 삭제하시겠습니까?', '확인', {
          type: 'warning'
        })
        await reservationStore.deleteReservation(row._id)
        ElMessage.success('예약이 삭제되었습니다.')
        loadReservations()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('예약 삭제에 실패했습니다.')
        }
      }
    }

    const viewReservation = (row) => {
      router.push(`/reservations/${row._id}`)
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      loadReservations()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadReservations()
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

    const canEdit = (row) => {
      return row.status === 'pending'
    }

    const canDelete = (row) => {
      return row.status === 'pending'
    }

    onMounted(() => {
      loadReservations()
      loadProcessors()
    })

    return {
      loading,
      reservations,
      total,
      currentPage,
      pageSize,
      filters,
      dialogVisible,
      isEdit,
      formRef,
      form,
      rules,
      processors,
      formatDate,
      loadReservations,
      showCreateDialog,
      editReservation,
      submitForm,
      deleteReservation,
      viewReservation,
      handleSizeChange,
      handleCurrentChange,
      getStatusType,
      getStatusText,
      canEdit,
      canDelete
    }
  }
}
</script>

<style scoped>
.reservation-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 