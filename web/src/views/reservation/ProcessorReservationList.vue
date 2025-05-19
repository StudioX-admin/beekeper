<template>
  <div class="processor-reservation-list">
    <div class="page-header">
      <h1>폐기물 처리 예약</h1>
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
      <el-table-column label="작업" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              size="small"
              @click="viewReservation(row)"
            >
              상세
            </el-button>
            <el-button
              v-if="canApprove(row)"
              size="small"
              type="success"
              @click="approveReservation(row)"
            >
              승인
            </el-button>
            <el-button
              v-if="canReject(row)"
              size="small"
              type="danger"
              @click="rejectReservation(row)"
            >
              거절
            </el-button>
            <el-button
              v-if="canComplete(row)"
              size="small"
              type="primary"
              @click="completeReservation(row)"
            >
              완료
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

    <!-- 승인/거절 다이얼로그 -->
    <el-dialog
      v-model="statusDialogVisible"
      :title="statusAction === 'approve' ? '예약 승인' : '예약 거절'"
      width="30%"
    >
      <el-form
        ref="statusFormRef"
        :model="statusForm"
        :rules="statusRules"
        label-width="80px"
      >
        <el-form-item label="사유" prop="reason">
          <el-input
            v-model="statusForm.reason"
            type="textarea"
            :rows="3"
            :placeholder="statusAction === 'approve' ? '승인 사유를 입력하세요' : '거절 사유를 입력하세요'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">취소</el-button>
        <el-button
          :type="statusAction === 'approve' ? 'success' : 'danger'"
          @click="submitStatusChange"
        >
          {{ statusAction === 'approve' ? '승인' : '거절' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 완료 처리 다이얼로그 -->
    <el-dialog
      v-model="completeDialogVisible"
      title="예약 완료"
      width="30%"
    >
      <el-form
        ref="completeFormRef"
        :model="completeForm"
        :rules="completeRules"
        label-width="120px"
      >
        <el-form-item label="처리 수량" prop="processedAmount">
          <el-input-number
            v-model="completeForm.processedAmount"
            :min="0"
            :precision="2"
          />
        </el-form-item>
        <el-form-item label="처리 방법" prop="processingMethod">
          <el-input
            v-model="completeForm.processingMethod"
            type="textarea"
            :rows="3"
            placeholder="처리 방법을 입력하세요"
          />
        </el-form-item>
        <el-form-item label="비고">
          <el-input
            v-model="completeForm.notes"
            type="textarea"
            :rows="3"
            placeholder="추가 사항을 입력하세요"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">취소</el-button>
        <el-button type="primary" @click="submitComplete">완료</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useReservationStore } from '@/store/reservation'
import { formatDate } from '@/utils/date'

export default {
  name: 'ProcessorReservationList',
  setup() {
    const router = useRouter()
    const reservationStore = useReservationStore()

    const loading = ref(false)
    const reservations = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const filters = ref({
      status: ''
    })

    // 상태 변경 관련
    const statusDialogVisible = ref(false)
    const statusAction = ref('')
    const currentReservationId = ref(null)
    const statusFormRef = ref(null)
    const statusForm = ref({
      reason: ''
    })
    const statusRules = {
      reason: [{ required: true, message: '사유를 입력하세요', trigger: 'blur' }]
    }

    // 완료 처리 관련
    const completeDialogVisible = ref(false)
    const completeFormRef = ref(null)
    const completeForm = ref({
      processedAmount: 0,
      processingMethod: '',
      notes: ''
    })
    const completeRules = {
      processedAmount: [{ required: true, message: '처리 수량을 입력하세요', trigger: 'blur' }],
      processingMethod: [{ required: true, message: '처리 방법을 입력하세요', trigger: 'blur' }]
    }

    const loadReservations = async () => {
      loading.value = true
      try {
        const response = await reservationStore.getProcessorReservations({
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

    const viewReservation = (row) => {
      router.push(`/reservations/${row._id}`)
    }

    const approveReservation = (row) => {
      statusAction.value = 'approve'
      currentReservationId.value = row._id
      statusForm.value.reason = ''
      statusDialogVisible.value = true
    }

    const rejectReservation = (row) => {
      statusAction.value = 'reject'
      currentReservationId.value = row._id
      statusForm.value.reason = ''
      statusDialogVisible.value = true
    }

    const completeReservation = (row) => {
      currentReservationId.value = row._id
      completeForm.value = {
        processedAmount: row.wasteAmount,
        processingMethod: '',
        notes: ''
      }
      completeDialogVisible.value = true
    }

    const submitStatusChange = async () => {
      if (!statusFormRef.value) return

      await statusFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const status = statusAction.value === 'approve' ? 'approved' : 'rejected'
            await reservationStore.updateReservationStatus(
              currentReservationId.value,
              status,
              statusForm.value.reason
            )
            ElMessage.success(`예약이 ${statusAction.value === 'approve' ? '승인' : '거절'}되었습니다.`)
            statusDialogVisible.value = false
            loadReservations()
          } catch (error) {
            ElMessage.error(error.message || '상태 변경에 실패했습니다.')
          }
        }
      })
    }

    const submitComplete = async () => {
      if (!completeFormRef.value) return

      await completeFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            await reservationStore.completeReservation(
              currentReservationId.value,
              completeForm.value
            )
            ElMessage.success('예약이 완료 처리되었습니다.')
            completeDialogVisible.value = false
            loadReservations()
          } catch (error) {
            ElMessage.error(error.message || '완료 처리에 실패했습니다.')
          }
        }
      })
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

    const canApprove = (row) => {
      return row.status === 'pending'
    }

    const canReject = (row) => {
      return row.status === 'pending'
    }

    const canComplete = (row) => {
      return row.status === 'approved'
    }

    onMounted(() => {
      loadReservations()
    })

    return {
      loading,
      reservations,
      total,
      currentPage,
      pageSize,
      filters,
      statusDialogVisible,
      statusAction,
      statusFormRef,
      statusForm,
      statusRules,
      completeDialogVisible,
      completeFormRef,
      completeForm,
      completeRules,
      formatDate,
      loadReservations,
      viewReservation,
      approveReservation,
      rejectReservation,
      completeReservation,
      submitStatusChange,
      submitComplete,
      handleSizeChange,
      handleCurrentChange,
      getStatusType,
      getStatusText,
      canApprove,
      canReject,
      canComplete
    }
  }
}
</script>

<style scoped>
.processor-reservation-list {
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