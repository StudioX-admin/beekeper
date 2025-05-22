<template>
  <div class="contract-management">
    <div class="page-header">
      <h1>계약 관리</h1>
    </div>

    <!-- 검색 필터 -->
    <div class="search-filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="계약번호로 검색"
          @input="handleSearch"
        />
      </div>
      <div class="filter-group">
        <select v-model="statusFilter" @change="handleSearch">
          <option value="">전체 상태</option>
          <option value="active">활성</option>
          <option value="pending">승인대기</option>
          <option value="expired">만료</option>
          <option value="terminated">해지</option>
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

    <!-- 계약 목록 -->
    <div class="contract-list">
      <table>
        <thead>
          <tr>
            <th>계약번호</th>
            <th>업체명</th>
            <th>계약기간</th>
            <th>계약금액</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contracts" :key="contract.id">
            <td>{{ contract.contract_number }}</td>
            <td>{{ contract.company_name }}</td>
            <td>{{ formatDate(contract.start_date) }} ~ {{ formatDate(contract.end_date) }}</td>
            <td>{{ formatCurrency(contract.amount) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(contract.status)]">
                {{ getStatusText(contract.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  v-if="hasPermission('view')"
                  class="view-btn"
                  @click="viewContract(contract)"
                >
                  상세
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
import { ref, onMounted, computed } from 'vue'
import { useContractStore } from '@/stores/contract'
import { useUserStore } from '@/stores/user'
import { format } from 'date-fns'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLoading } from '@/composables/useLoading'

// Store
const contractStore = useContractStore()
const userStore = useUserStore()

// State
const searchQuery = ref('')
const statusFilter = ref('')
const startDate = ref('')
const endDate = ref('')

// Computed
const contracts = computed(() => contractStore.contracts)
const currentPage = computed(() => contractStore.currentPage)
const totalPages = computed(() => contractStore.totalPages)
const loading = computed(() => contractStore.loading)
const error = computed(() => contractStore.error)

// Methods
const hasPermission = (action) => {
  const role = userStore.userRole
  const permissions = {
    admin: ['create', 'view', 'edit', 'delete'],
    manager: ['view', 'edit'],
    staff: ['view']
  }
  return permissions[role]?.includes(action) || false
}

const formatDate = (date) => {
  return format(new Date(date), 'yyyy-MM-dd')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

const getStatusClass = (status) => {
  const classes = {
    active: 'status-active',
    pending: 'status-pending',
    expired: 'status-expired',
    terminated: 'status-terminated'
  }
  return classes[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    active: '활성',
    pending: '승인대기',
    expired: '만료',
    terminated: '해지'
  }
  return texts[status] || status
}

const handleSearch = async () => {
  const params = {
    query: searchQuery.value,
    type: 'processor',
    status: statusFilter.value,
    startDate: startDate.value,
    endDate: endDate.value,
    page: currentPage.value
  }
  await contractStore.fetchContracts(params)
}

const changePage = async (page) => {
  const params = {
    query: searchQuery.value,
    type: 'processor',
    status: statusFilter.value,
    startDate: startDate.value,
    endDate: endDate.value,
    page
  }
  await contractStore.fetchContracts(params)
}

const viewContract = (contract) => {
  // TODO: 계약 상세 페이지로 이동
  console.log('View contract:', contract)
}

// Lifecycle hooks
onMounted(async () => {
  await handleSearch()
})

// Error handling
const { snackbar, errorMessage, showError } = useErrorHandler()

// Loading state
const { isLoading, withLoading } = useLoading()
</script>

<style scoped>
.contract-management {
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

.date-range {
  display: flex;
  gap: 10px;
  align-items: center;
}

.contract-list {
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
