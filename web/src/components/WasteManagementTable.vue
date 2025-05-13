<!-- web/src/components/WasteManagementTable.vue -->
<template>
  <div class="table-container">
    <div class="table-header">
      <div class="search-filters">
        <div class="form-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="검색어 입력" 
            v-model="searchQuery"
            @input="onSearch"
          >
        </div>
        <div class="form-group">
          <select class="form-select" v-model="statusFilter" @change="onFilterChange">
            <option value="">모든 상태</option>
            <option value="pending">대기중</option>
            <option value="assigned">배정됨</option>
            <option value="in_progress">진행중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소됨</option>
          </select>
        </div>
        <div class="form-group">
          <input 
            type="date" 
            class="form-control" 
            v-model="dateFilter"
            @change="onFilterChange"
          >
        </div>
      </div>
      <div class="table-actions">
        <button class="btn btn-primary btn-icon" @click="$emit('add-new')">
          <i class="fas fa-plus"></i> 새 요청 추가
        </button>
        <button class="btn btn-outline btn-icon" @click="refreshData">
          <i class="fas fa-sync-alt"></i> 새로고침
        </button>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table waste-management-table">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.value" @click="sortBy(header.value)" :class="{ sortable: header.sortable }">
              {{ header.text }}
              <i v-if="header.sortable" :class="getSortIcon(header.value)" class="sort-icon"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index" @click="viewItem(item)">
            <td>{{ item.requestId }}</td>
            <td>{{ item.wasteType }}</td>
            <td>
              <span class="status-badge" :class="getStatusClass(item.status)">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td>{{ formatDate(item.scheduledDate) }}</td>
            <td>{{ item.scheduledTime }}</td>
            <td>{{ item.requesterName }}</td>
            <td>{{ item.address }}</td>
            <td>{{ item.driverId ? item.driverId.name : '-' }}</td>
            <td class="actions">
              <button class="btn btn-sm btn-info" @click.stop="viewItem(item)" title="상세 보기">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-secondary" @click.stop="editItem(item)" title="수정">
                <i class="fas fa-edit"></i>
              </button>
              <button v-if="canDelete(item)" class="btn btn-sm btn-danger" @click.stop="deleteItem(item)" title="삭제">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td :colspan="headers.length" class="no-data">
              <div class="no-data-content">
                <i class="fas fa-inbox"></i>
                <p>데이터가 없습니다</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="table-footer">
      <div class="pagination-info">
        전체 {{ totalItems }}개 중 {{ startIndex + 1 }}-{{ endIndex }} 표시
      </div>
      <div class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <template v-for="page in visiblePageNumbers">
          <button
            v-if="page !== '...'"
            :key="page"
            class="pagination-btn"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <span v-else :key="'ellipsis-' + page" class="pagination-ellipsis">...</span>
        </template>
        <button 
          class="pagination-btn" 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="items-per-page">
        <select class="form-select form-select-sm" v-model="itemsPerPage" @change="onItemsPerPageChange">
          <option value="10">10개씩</option>
          <option value="25">25개씩</option>
          <option value="50">50개씩</option>
          <option value="100">100개씩</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WasteManagementTable',
  props: {
    headers: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      dateFilter: '',
      sortBy: '',
      sortDesc: false
    }
  },
  computed: {
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      return Math.min(this.startIndex + this.itemsPerPage, this.totalItems);
    },
    visiblePageNumbers() {
      const pages = [];
      
      if (this.totalPages <= 7) {
        // 전체 페이지가 7개 이하면 모든 페이지 번호 표시
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 전체 페이지가 7개 초과면 일부만 표시하고 ...으로 생략
        pages.push(1);
        
        if (this.currentPage > 3) {
          pages.push('...');
        }
        
        // 현재 페이지 주변 페이지
        const start = Math.max(2, this.currentPage - 1);
        const end = Math.min(this.totalPages - 1, this.currentPage + 1);
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        if (this.currentPage < this.totalPages - 2) {
          pages.push('...');
        }
        
        pages.push(this.totalPages);
      }
      
      return pages;
    }
  },
  methods: {
    getStatusClass(status) {
      const statusMap = {
        'pending': 'status-pending',
        'assigned': 'status-pending',
        'in_progress': 'status-processing',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
      };
      return statusMap[status] || '';
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '대기중',
        'assigned': '배정됨',
        'in_progress': '진행중',
        'completed': '완료',
        'cancelled': '취소됨'
      };
      return statusMap[status] || status;
    },
    formatDate(date) {
      if (!date) return '-';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    viewItem(item) {
      this.$emit('view-item', item);
    },
    editItem(item) {
      this.$emit('edit-item', item);
    },
    deleteItem(item) {
      this.$emit('delete-item', item);
    },
    canDelete(item) {
      // 진행 중이거나 완료된 항목은 삭제 불가
      return !['in_progress', 'completed'].includes(item.status);
    },
    onSearch() {
      // 디바운스 처리를 위해 타이머 설정
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.$emit('search', this.searchQuery);
      }, 300);
    },
    onFilterChange() {
      this.$emit('filter', {
        status: this.statusFilter,
        date: this.dateFilter
      });
    },
    sortBy(column) {
      // 정렬 기능
      if (this.sortBy === column) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = column;
        this.sortDesc = false;
      }
      
      this.$emit('sort', {
        sortBy: this.sortBy,
        sortDesc: this.sortDesc
      });
    },
    getSortIcon(column) {
      if (this.sortBy !== column) {
        return 'fas fa-sort';
      }
      return this.sortDesc ? 'fas fa-sort-down' : 'fas fa-sort-up';
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.$emit('page-change', page);
    },
    onItemsPerPageChange() {
      this.$emit('items-per-page-change', this.itemsPerPage);
    },
    refreshData() {
      this.$emit('refresh');
    }
  }
}
</script>

<style scoped>
.table-container {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.search-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  flex: 1;
}

.search-filters .form-group {
  margin-bottom: 0;
  min-width: 180px;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: 1rem;
}

.table-responsive {
  overflow-x: auto;
}

.waste-management-table {
  width: 100%;
  border-collapse: collapse;
}

.waste-management-table th {
  position: relative;
  background-color: var(--bg-tertiary);
  font-weight: var(--font-medium);
  text-align: left;
  padding: 0.75rem 1.5rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.waste-management-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.waste-management-table th.sortable:hover {
  background-color: var(--bg-secondary);
}

.sort-icon {
  margin-left: 0.25rem;
  font-size: 0.8em;
  color: var(--text-tertiary);
}

.waste-management-table td {
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.waste-management-table tbody tr {
  transition: background-color var(--transition-fast) var(--easing-default);
}

.waste-management-table tbody tr:hover {
  background-color: var(--bg-tertiary);
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  white-space: nowrap;
}

.no-data {
  padding: 3rem !important; /* 데이터 없을 때 여백 강제 적용 */
  text-align: center;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-data-content i {
  font-size: 2.5rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.no-data-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.table-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-right: 1rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  font-size: var(--text-sm);
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: 
    background-color var(--transition-fast) var(--easing-default),
    color var(--transition-fast) var(--easing-default),
    border-color var(--transition-fast) var(--easing-default);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: var(--primary-color);
  color: var(--text-light);
  border-color: var(--primary-color);
}

.pagination-btn:not(:disabled):hover {
  background-color: var(--bg-secondary);
}

.pagination-ellipsis {
  margin: 0 0.25rem;
  color: var(--text-secondary);
}

.items-per-page {
  margin-left: 1rem;
}

.items-per-page .form-select {
  width: auto;
  padding-right: 2rem;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filters {
    margin-bottom: 1rem;
  }
  
  .table-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination {
    order: -1;
    margin-bottom: 0.5rem;
  }
}
</style>
