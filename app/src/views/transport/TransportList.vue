<template>
  <div class="transport_list">
    <div class="sub_top_title">
      <div>
        <RouterLink to="/home" class="back_btn"><img src="../../assets/images/icon_back.png" alt=""></RouterLink>
        <span class="title">운행관리</span>
      </div>
      <RouterLink to="/news" class="news_btn"><img src="../../assets/images/icon_bell.png" alt=""></RouterLink>
    </div>

    <!-- 날짜 선택 -->
    <div class="date_selector">
      <button @click="changeDate(-1)">이전</button>
      <span>{{ formatDate(selectedDate) }}</span>
      <button @click="changeDate(1)">다음</button>
    </div>

    <!-- 운행 목록 -->
    <div class="transport_list">
      <div v-if="transports.length === 0" class="empty_state">
        <p>해당 날짜의 운행 일정이 없습니다.</p>
      </div>
      <div v-else class="transport_items">
        <div v-for="transport in transports" :key="transport.id" class="transport_item">
          <div class="transport_header">
            <span class="time">{{ formatTime(transport.scheduled_time) }}</span>
            <span :class="['status_badge', getStatusClass(transport.status)]">
              {{ transport.status }}
            </span>
          </div>
          <div class="transport_content">
            <div class="info_row">
              <span class="label">처리장</span>
              <span class="value">{{ transport.facility_name }}</span>
            </div>
            <div class="info_row">
              <span class="label">폐기물</span>
              <span class="value">{{ transport.waste_name }}</span>
            </div>
            <div class="info_row">
              <span class="label">수량</span>
              <span class="value">{{ transport.quantity }}톤</span>
            </div>
          </div>
          <div class="transport_actions">
            <button
              v-if="transport.status === '대기중'"
              class="start_btn"
              @click="startTransport(transport)"
            >
              운행시작
            </button>
            <button
              v-if="transport.status === '운행중'"
              class="complete_btn"
              @click="completeTransport(transport)"
            >
              운행완료
            </button>
            <button
              class="detail_btn"
              @click="viewTransportDetail(transport)"
            >
              상세보기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 운행 상세 다이얼로그 -->
    <div v-if="showDetailDialog" class="dialog_overlay">
      <div class="dialog">
        <h2>운행 상세</h2>
        <div class="dialog_content">
          <div class="detail_group">
            <label>처리장</label>
            <span>{{ selectedTransport.facility_name }}</span>
          </div>
          <div class="detail_group">
            <label>폐기물</label>
            <span>{{ selectedTransport.waste_name }}</span>
          </div>
          <div class="detail_group">
            <label>수량</label>
            <span>{{ selectedTransport.quantity }}톤</span>
          </div>
          <div class="detail_group">
            <label>예약시간</label>
            <span>{{ formatDateTime(selectedTransport.scheduled_time) }}</span>
          </div>
          <div class="detail_group">
            <label>상태</label>
            <span :class="['status_badge', getStatusClass(selectedTransport.status)]">
              {{ selectedTransport.status }}
            </span>
          </div>
          <div class="detail_group">
            <label>비고</label>
            <span>{{ selectedTransport.notes || '-' }}</span>
          </div>
        </div>
        <div class="dialog_actions">
          <button @click="closeDetailDialog">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { format, addDays } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'
import { transportService } from '@/services/transport'

// 상태
const transports = ref([])
const selectedDate = ref(new Date())
const showDetailDialog = ref(false)
const selectedTransport = ref(null)

// 에러 처리
const { snackbar, errorMessage, showError } = useErrorHandler()

// 로딩 상태
const { isLoading, withLoading } = useLoading()

// 상태 클래스
const getStatusClass = (status) => {
  const classes = {
    '대기중': 'status_pending',
    '운행중': 'status_active',
    '완료': 'status_completed',
    '취소': 'status_cancelled'
  }
  return classes[status] || ''
}

// 날짜 포맷
const formatDate = (date) => {
  return format(date, 'yyyy년 MM월 dd일', { locale: ko })
}

// 시간 포맷
const formatTime = (date) => {
  return format(new Date(date), 'HH:mm', { locale: ko })
}

// 날짜시간 포맷
const formatDateTime = (date) => {
  return format(new Date(date), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
}

// 날짜 변경
const changeDate = (days) => {
  selectedDate.value = addDays(selectedDate.value, days)
  loadTransports()
}

// 운행 목록 로드
const loadTransports = async () => {
  try {
    await withLoading(async () => {
      const data = await transportService.getTransports({
        date: format(selectedDate.value, 'yyyy-MM-dd')
      })
      transports.value = data.transports
    })
  } catch (error) {
    showError(error)
  }
}

// 운행 시작
const startTransport = async (transport) => {
  try {
    await withLoading(async () => {
      await transportService.startTransport(transport.id)
      loadTransports()
    })
  } catch (error) {
    showError(error)
  }
}

// 운행 완료
const completeTransport = async (transport) => {
  try {
    await withLoading(async () => {
      await transportService.completeTransport(transport.id)
      loadTransports()
    })
  } catch (error) {
    showError(error)
  }
}

// 운행 상세 보기
const viewTransportDetail = (transport) => {
  selectedTransport.value = transport
  showDetailDialog.value = true
}

// 상세 다이얼로그 닫기
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedTransport.value = null
}

onMounted(() => {
  loadTransports()
})
</script>

<style scoped>
.transport_list {
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

.sub_top_title .back_btn,
.sub_top_title .news_btn {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sub_top_title .back_btn > img,
.sub_top_title .news_btn > img {
  width: 100%;
}

.date_selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
  padding: 0 16px;
}

.date_selector button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.date_selector span {
  font-weight: 500;
}

.empty_state {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.transport_items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transport_item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.transport_header {
  padding: 12px 16px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transport_header .time {
  font-weight: 600;
}

.status_badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status_pending {
  background-color: #f5a623;
  color: white;
}

.status_active {
  background-color: #7ed321;
  color: white;
}

.status_completed {
  background-color: #4a90e2;
  color: white;
}

.status_cancelled {
  background-color: #d0021b;
  color: white;
}

.transport_content {
  padding: 16px;
}

.info_row {
  display: flex;
  margin-bottom: 8px;
}

.info_row:last-child {
  margin-bottom: 0;
}

.info_row .label {
  width: 80px;
  color: #666;
}

.info_row .value {
  flex: 1;
  font-weight: 500;
}

.transport_actions {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;
}

.transport_actions button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.start_btn {
  background-color: #7ed321;
  color: white;
}

.complete_btn {
  background-color: #4a90e2;
  color: white;
}

.detail_btn {
  background-color: #f5f5f5;
  color: #333;
}

.dialog_overlay {
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

.dialog h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog_content {
  margin-bottom: 20px;
}

.detail_group {
  margin-bottom: 16px;
}

.detail_group:last-child {
  margin-bottom: 0;
}

.detail_group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.detail_group span {
  display: block;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.dialog_actions {
  display: flex;
  justify-content: flex-end;
}

.dialog_actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
}

@media (max-width: 768px) {
  .transport_actions {
    flex-direction: column;
  }
  
  .dialog {
    margin: 20px;
  }
}
</style> 