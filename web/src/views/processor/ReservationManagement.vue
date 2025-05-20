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
/* 기존 스타일 */
.reservation-management {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: var(--text-primary);
}

.create-btn {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: var(--primary-color-dark);
}

.search-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group input,
.filter-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.reservation-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: var(--background-light);
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
}

.status-pending {
  background-color: var(--warning-light);
  color: var(--warning);
}

.status-approved {
  background-color: var(--success-light);
  color: var(--success);
}

.status-rejected {
  background-color: var(--error-light);
  color: var(--error);
}

.status-completed {
  background-color: var(--info-light);
  color: var(--info);
}

.status-cancelled {
  background-color: var(--gray-light);
  color: var(--gray);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-btn,
.edit-btn,
.delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn {
  background-color: var(--info-light);
  color: var(--info);
}

.edit-btn {
  background-color: var(--warning-light);
  color: var(--warning);
}

.delete-btn {
  background-color: var(--error-light);
  color: var(--error);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: white;
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
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.dialog h2 {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.dialog-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dialog-actions button:first-child {
  background-color: var(--gray-light);
  color: var(--text-primary);
}

.dialog-actions button:last-child {
  background-color: var(--primary-color);
  color: white;
}

.error-message {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--error);
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
}
</style> 
