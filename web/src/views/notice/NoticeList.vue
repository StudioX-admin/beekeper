<template>
  <div class="notice-list">
    <div class="page-header">
      <h1>공지사항</h1>
    </div>

    <!-- 필터 -->
    <div class="filters">
      <el-form :inline="true" :model="filters">
        <el-form-item label="유형">
          <el-select v-model="filters.type" placeholder="유형 선택" clearable>
            <el-option label="일반" value="general" />
            <el-option label="시스템" value="system" />
            <el-option label="이벤트" value="event" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadNotices">검색</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 공지사항 목록 -->
    <el-table
      v-loading="loading"
      :data="notices"
      style="width: 100%"
    >
      <el-table-column prop="type" label="유형" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.type)">
            {{ getTypeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="제목" />
      <el-table-column prop="author" label="작성자" width="120" />
      <el-table-column prop="createdAt" label="작성일" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="views" label="조회수" width="100" />
      <el-table-column label="작업" width="100">
        <template #default="{ row }">
          <el-button
            size="small"
            @click="viewNotice(row)"
          >
            상세
          </el-button>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useNoticeStore } from '@/stores/modules/notice'
import { formatDate } from '@/utils/date'

export default {
  name: 'NoticeList',
  setup() {
    const router = useRouter()
    const noticeStore = useNoticeStore()

    const loading = ref(false)
    const notices = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const filters = ref({
      type: ''
    })

    const loadNotices = async () => {
      loading.value = true
      try {
        const response = await noticeStore.getNotices({
          page: currentPage.value,
          limit: pageSize.value,
          type: filters.value.type
        })
        notices.value = response.notices
        total.value = response.total
      } catch (error) {
        ElMessage.error('공지사항 목록을 불러오는데 실패했습니다.')
      }
      loading.value = false
    }

    const viewNotice = (row) => {
      router.push(`/notices/${row._id}`)
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      loadNotices()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadNotices()
    }

    const getTypeTag = (type) => {
      const tags = {
        general: '',
        system: 'warning',
        event: 'success'
      }
      return tags[type] || ''
    }

    const getTypeText = (type) => {
      const texts = {
        general: '일반',
        system: '시스템',
        event: '이벤트'
      }
      return texts[type] || type
    }

    onMounted(() => {
      loadNotices()
    })

    return {
      loading,
      notices,
      total,
      currentPage,
      pageSize,
      filters,
      formatDate,
      loadNotices,
      viewNotice,
      handleSizeChange,
      handleCurrentChange,
      getTypeTag,
      getTypeText
    }
  }
}
</script>

<style scoped>
.notice-list {
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
