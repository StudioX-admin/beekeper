<template>
  <div class="reservation-management">
    <div class="page-header">
      <h1>예약 관리</h1>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="수거업체명, 예약번호로 검색"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="pending">승인대기</option>
          <option value="approved">승인</option>
          <option value="rejected">반려</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소</option>
        </select>
      </div>
      <div class="filter-group">
        <input
          type="date"
          v-model="startDate"
          @change="handleSearch"
        />
        <span>~</span>
        <input
          type="date"
          v-model="endDate"
          @change="handleSearch"
        />
      </div>
    </div>

    <!-- 예약 목록 -->
    <div class="reservation-list">
      <table>
        <thead>
          <tr>
            <th>예약번호</th>
            <th>수거업체</th>
            <th>예약일시</th>
            <th>폐기물 종류</th>
            <th>수량</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in reservations" :key="reservation.id">
            <td>{{ reservation.reservation_number }}</td>
            <td>{{ reservation.transporter_name }}</td>
            <td>{{ formatDateTime(reservation.reservation_date) }}</td>
            <td>{{ reservation.waste_type }}</td>
            <td>{{ reservation.quantity }}톤</td>
            <td>
              <span :class="['status-badge', getStatusClass(reservation.status)]">
                {{ getStatusText(reservation.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewReservation(reservation)"
                >
                  상세
                </button>
                <button
                  v-if="hasPermission('edit') && reservation.status === 'pending'"
                  class="approve-btn"
                  @click="approveReservation(reservation)"
                >
                  승인
                </button>
                <button
                  v-if="hasPermission('edit') && reservation.status === 'pending'"
                  class="reject-btn"
                  @click="rejectReservation(reservation)"
                >
                  반려
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        이전
      </button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        다음
      </button>
    </div>

    <!-- 승인/반려 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isApproval ? '예약 승인' : '예약 반려' }}</h2>
        <form @submit.prevent="submitReservation">
          <div class="form-group">
            <label>비고</label>
            <textarea
              v-model="reservationForm.notes"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="dialog-actions">
            <button type="button" @click="closeDialog">취소</button>
            <button type="submit" :class="isApproval ? 'approve-btn' : 'reject-btn'">
              {{ isApproval ? '승인' : '반려' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <div
      v-if="snackbar"
      class="error-message"
      @click="snackbar = false"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useUserStore } from '@/stores/user'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { processorReservationService } from '@/services/reservation'

// 상태
const reservations = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const showDialog = ref(false)
const isApproval = ref(false)
const selectedReservation = ref(null)

// 폼 데이터
const reservationForm = ref({
  notes: ''
})

// 권한 체크
const userStore = useUserStore()
const hasPermission = (action) => {
  const role = userStore.user?.role
  if (!role) return false

  const permissions = {
    admin: ['view', 'edit'],
    manager: ['view', 'edit'],
    staff: ['view']
  }

  return permissions[role]?.includes(action) || false
}

// 상태 클래스
const statusClasses = {
  pending: 'status-pending',
  approved: 'status-approved',
  rejected: 'status-rejected',
  completed: 'status-completed',
  cancelled: 'status-cancelled'
}

// 상태 텍스트
const statusTexts = {
  pending: '승인대기',
  approved: '승인',
  rejected: '반려',
  completed: '완료',
  cancelled: '취소'
}

// 날짜 포맷
const formatDateTime = (date) => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: ko })
}

// 상태 클래스 가져오기
const getStatusClass = (status) => {
  return statusClasses[status] || ''
}

// 상태 텍스트 가져오기
const getStatusText = (status) => {
  return statusTexts[status] || status
}

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 예약 목록 로드
const loadReservations = async () => {
  try {
    await withLoading(async () => {
      const params = {
        page: currentPage.value,
        search: searchQuery.value,
        status: statusFilter.value,
        start_date: startDate.value,
        end_date: endDate.value
      }
      const data = await processorReservationService.getReservations(params)
      reservations.value = data.reservations
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 검색 처리
const handleSearch = () => {
  currentPage.value = 1
  loadReservations()
}

// 페이지 변경
const changePage = (page) => {
  currentPage.value = page
  loadReservations()
}

// 예약 상세 보기
const viewReservation = (reservation) => {
  // TODO: 예약 상세 페이지로 이동
  console.log('View reservation:', reservation)
}

// 예약 승인
const approveReservation = (reservation) => {
  isApproval.value = true
  selectedReservation.value = reservation
  reservationForm.value = { notes: '' }
  showDialog.value = true
}

// 예약 반려
const rejectReservation = (reservation) => {
  isApproval.value = false
  selectedReservation.value = reservation
  reservationForm.value = { notes: '' }
  showDialog.value = true
}

// 예약 상태 변경
const submitReservation = async () => {
  try {
    await withLoading(async () => {
      const status = isApproval.value ? 'approved' : 'rejected'
      await processorReservationService.updateReservationStatus(
        selectedReservation.value.id,
        status,
        reservationForm.value.notes
      )

      showDialog.value = false
      loadReservations()
    })
  } catch (error) {
    showError(error)
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  showDialog.value = false
  selectedReservation.value = null
}

onMounted(() => {
  loadReservations()
})
</script>

<style scoped>
.reservation-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-group {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.reservation-list {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-buttons button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.view-btn {
  background-color: #4a90e2;
  color: white;
}

.approve-btn {
  background-color: #4caf50;
  color: white;
}

.reject-btn {
  background-color: #f44336;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.dialog-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-actions button:first-child {
  background-color: #f5f5f5;
}

.error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  background-color: #d0021b;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
</style> 