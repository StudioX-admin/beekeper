<template>
  <div class="reservation-management">
    <div class="page-header">
      <h1>예약 관리</h1>
      <button
        v-if="hasPermission('create')"
        class="create-btn"
        @click="openCreateDialog"
      >
        예약 신청
      </button>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="처리업체명, 예약번호로 검색"
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
            <th>처리업체</th>
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
            <td>{{ reservation.processor_name }}</td>
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
                  class="edit-btn"
                  @click="editReservation(reservation)"
                >
                  수정
                </button>
                <button
                  v-if="hasPermission('delete') && reservation.status === 'pending'"
                  class="delete-btn"
                  @click="confirmDelete(reservation)"
                >
                  삭제
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

    <!-- 예약 등록/수정 다이얼로그 -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ isEdit ? '예약 수정' : '예약 신청' }}</h2>
        <form @submit.prevent="submitReservation">
          <div class="form-group">
            <label>처리업체</label>
            <select v-model="reservationForm.processor_id" required>
              <option v-for="processor in processors" :key="processor.id" :value="processor.id">
                {{ processor.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>예약일시</label>
            <input
              type="datetime-local"
              v-model="reservationForm.reservation_date"
              required
            />
          </div>
          <div class="form-group">
            <label>폐기물 종류</label>
            <select v-model="reservationForm.waste_type" required>
              <option value="general">일반폐기물</option>
              <option value="construction">건설폐기물</option>
              <option value="industrial">산업폐기물</option>
            </select>
          </div>
          <div class="form-group">
            <label>수량 (톤)</label>
            <input
              type="number"
              v-model="reservationForm.quantity"
              required
              min="0"
              step="0.1"
            />
          </div>
          <div class="form-group">
            <label>비고</label>
            <textarea
              v-model="reservationForm.notes"
              rows="3"
            ></textarea>
          </div>
          <div class="dialog-actions">
            <button type="button" @click="closeDialog">취소</button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 삭제 확인 다이얼로그 -->
    <div v-if="showDeleteConfirm" class="dialog-overlay">
      <div class="dialog">
        <h2>예약 삭제</h2>
        <p>정말로 이 예약을 삭제하시겠습니까?</p>
        <div class="dialog-actions">
          <button @click="showDeleteConfirm = false">취소</button>
          <button class="delete-btn" @click="deleteReservation">삭제</button>
        </div>
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
import { transporterReservationService } from '@/services/reservation'

// 상태
const reservations = ref([])
const processors = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const showDialog = ref(false)
const showDeleteConfirm = ref(false)
const isEdit = ref(false)
const selectedReservation = ref(null)

// 폼 데이터
const reservationForm = ref({
  processor_id: '',
  reservation_date: '',
  waste_type: '',
  quantity: '',
  notes: ''
})

// 권한 체크
const userStore = useUserStore()
const hasPermission = (action) => {
  const role = userStore.user?.role
  if (!role) return false

  const permissions = {
    admin: ['create', 'view', 'edit', 'delete'],
    manager: ['create', 'view', 'edit', 'delete'],
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
      const data = await transporterReservationService.getReservations(params)
      reservations.value = data.reservations
      totalPages.value = data.totalPages
    })
  } catch (error) {
    showError(error)
  }
}

// 처리업체 목록 로드
const loadProcessors = async () => {
  try {
    await withLoading(async () => {
      const data = await transporterReservationService.getProcessors()
      processors.value = data.processors
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

// 예약 등록 다이얼로그 열기
const openCreateDialog = () => {
  isEdit.value = false
  reservationForm.value = {
    processor_id: '',
    reservation_date: '',
    waste_type: '',
    quantity: '',
    notes: ''
  }
  showDialog.value = true
}

// 예약 수정 다이얼로그 열기
const editReservation = (reservation) => {
  isEdit.value = true
  selectedReservation.value = reservation
  reservationForm.value = { ...reservation }
  showDialog.value = true
}

// 예약 상세 보기
const viewReservation = (reservation) => {
  // TODO: 예약 상세 페이지로 이동
  console.log('View reservation:', reservation)
}

// 예약 삭제 확인
const confirmDelete = (reservation) => {
  selectedReservation.value = reservation
  showDeleteConfirm.value = true
}

// 예약 삭제
const deleteReservation = async () => {
  try {
    await withLoading(async () => {
      await transporterReservationService.deleteReservation(selectedReservation.value.id)
      showDeleteConfirm.value = false
      loadReservations()
    })
  } catch (error) {
    showError(error)
  }
}

// 예약 저장
const submitReservation = async () => {
  try {
    await withLoading(async () => {
      if (isEdit.value) {
        await transporterReservationService.updateReservation(selectedReservation.value.id, reservationForm.value)
      } else {
        await transporterReservationService.createReservation(reservationForm.value)
      }

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
  loadProcessors()
})
</script>

<style scoped>
// ... existing styles ...
</style> 