<template>
  <div class="notices-page">
    <div class="page-header">
      <h1>공지사항 관리</h1>
      <v-btn color="primary" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        새 공지사항
      </v-btn>
    </div>

    <v-card class="mt-4">
      <v-card-text>
        <div class="d-flex align-center mb-4">
          <v-select
            v-model="filters.type"
            :items="noticeTypes"
            label="공지 유형"
            class="mr-4"
            style="max-width: 200px"
            clearable
          ></v-select>
          <v-select
            v-model="filters.status"
            :items="noticeStatuses"
            label="상태"
            class="mr-4"
            style="max-width: 200px"
            clearable
          ></v-select>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="filters.search"
            label="검색"
            prepend-inner-icon="mdi-magnify"
            style="max-width: 300px"
            clearable
          ></v-text-field>
        </div>

        <v-data-table
          :headers="headers"
          :items="notices"
          :loading="loading"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.type="{ item }">
            <v-chip
              :color="getNoticeTypeColor(item.type)"
              small
              text-color="white"
            >
              {{ getNoticeTypeLabel(item.type) }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.status === 'published' ? 'success' : 'grey'"
              small
              text-color="white"
            >
              {{ item.status === 'published' ? '게시중' : '임시저장' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              small
              class="mr-2"
              @click="viewNotice(item)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              icon
              small
              class="mr-2"
              @click="editNotice(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              small
              class="mr-2"
              :color="item.status === 'published' ? 'warning' : 'success'"
              @click="toggleNoticeStatus(item)"
            >
              <v-icon>
                {{ item.status === 'published' ? 'mdi-eye-off' : 'mdi-eye' }}
              </v-icon>
            </v-btn>
            <v-btn
              icon
              small
              color="error"
              @click="confirmDelete(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- 공지사항 작성/수정 다이얼로그 -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEdit ? '공지사항 수정' : '새 공지사항' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.type"
                  :items="noticeTypes"
                  label="공지 유형"
                  :rules="[v => !!v || '공지 유형을 선택해주세요']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.targetRoles"
                  :items="targetRoles"
                  label="대상 사용자"
                  multiple
                  chips
                  :rules="[v => v.length > 0 || '대상 사용자를 선택해주세요']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.title"
                  label="제목"
                  :rules="[v => !!v || '제목을 입력해주세요']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.content"
                  label="내용"
                  :rules="[v => !!v || '내용을 입력해주세요']"
                  required
                  rows="10"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="form.attachments"
                  label="첨부파일"
                  multiple
                  prepend-icon="mdi-paperclip"
                  :rules="[
                    v => !v || v.length <= 5 || '최대 5개까지 첨부 가능합니다'
                  ]"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="dialog = false"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!valid"
            @click="saveNotice"
          >
            {{ isEdit ? '수정' : '등록' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 공지사항 상세 보기 다이얼로그 -->
    <v-dialog v-model="viewDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ selectedNotice?.title }}</span>
          <v-spacer></v-spacer>
          <v-chip
            :color="getNoticeTypeColor(selectedNotice?.type)"
            class="mr-2"
          >
            {{ getNoticeTypeLabel(selectedNotice?.type) }}
          </v-chip>
          <v-chip
            :color="selectedNotice?.status === 'published' ? 'success' : 'grey'"
          >
            {{ selectedNotice?.status === 'published' ? '게시중' : '임시저장' }}
          </v-chip>
        </v-card-title>

        <v-card-text>
          <div class="notice-meta mb-4">
            <div class="d-flex align-center">
              <v-icon small class="mr-1">mdi-account</v-icon>
              <span class="mr-4">{{ selectedNotice?.author?.name }}</span>
              <v-icon small class="mr-1">mdi-calendar</v-icon>
              <span class="mr-4">{{ formatDate(selectedNotice?.createdAt) }}</span>
              <v-icon small class="mr-1">mdi-eye</v-icon>
              <span>{{ selectedNotice?.views }}회 조회</span>
            </div>
          </div>

          <div class="notice-content">
            {{ selectedNotice?.content }}
          </div>

          <div v-if="selectedNotice?.attachments?.length" class="mt-4">
            <h3>첨부파일</h3>
            <v-list>
              <v-list-item
                v-for="file in selectedNotice.attachments"
                :key="file._id"
                @click="downloadFile(file)"
              >
                <v-list-item-icon>
                  <v-icon>mdi-file</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ file.originalName }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon>
                    <v-icon>mdi-download</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="viewDialog = false"
          >
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">공지사항 삭제</v-card-title>
        <v-card-text>
          정말로 이 공지사항을 삭제하시겠습니까?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="deleteDialog = false"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            text
            @click="deleteNotice"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useNoticeStore } from '@/store/notice'

export default {
  name: 'AdminNotices',

  data() {
    return {
      loading: false,
      dialog: false,
      viewDialog: false,
      deleteDialog: false,
      valid: false,
      isEdit: false,
      selectedNotice: null,
      noticeToDelete: null,
      filters: {
        type: null,
        status: null,
        search: ''
      },
      form: {
        type: '',
        title: '',
        content: '',
        targetRoles: [],
        attachments: []
      },
      headers: [
        { text: '유형', value: 'type', width: '100px' },
        { text: '제목', value: 'title' },
        { text: '작성자', value: 'author.name', width: '120px' },
        { text: '작성일', value: 'createdAt', width: '120px' },
        { text: '조회수', value: 'views', width: '100px' },
        { text: '상태', value: 'status', width: '100px' },
        { text: '관리', value: 'actions', width: '200px', sortable: false }
      ],
      noticeTypes: [
        { text: '일반', value: 'general' },
        { text: '시스템', value: 'system' },
        { text: '이벤트', value: 'event' }
      ],
      noticeStatuses: [
        { text: '게시중', value: 'published' },
        { text: '임시저장', value: 'draft' }
      ],
      targetRoles: [
        { text: '전체', value: 'all' },
        { text: '수거업체', value: 'transporter' },
        { text: '처리업체', value: 'processor' }
      ]
    }
  },

  computed: {
    ...mapState(useNoticeStore, ['notices'])
  },

  watch: {
    filters: {
      handler() {
        this.loadNotices()
      },
      deep: true
    }
  },

  created() {
    this.loadNotices()
  },

  methods: {
    ...mapActions(useNoticeStore, [
      'fetchNotices',
      'createNotice',
      'updateNotice',
      'deleteNotice',
      'toggleNoticeStatus'
    ]),

    async loadNotices() {
      this.loading = true
      try {
        await this.fetchNotices(this.filters)
      } catch (error) {
        console.error('Failed to load notices:', error)
        this.$toast.error('공지사항을 불러오는데 실패했습니다')
      } finally {
        this.loading = false
      }
    },

    getNoticeTypeLabel(type) {
      const found = this.noticeTypes.find(t => t.value === type)
      return found ? found.text : type
    },

    getNoticeTypeColor(type) {
      const colors = {
        general: 'primary',
        system: 'info',
        event: 'success'
      }
      return colors[type] || 'grey'
    },

    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    },

    openCreateDialog() {
      this.isEdit = false
      this.form = {
        type: '',
        title: '',
        content: '',
        targetRoles: [],
        attachments: []
      }
      this.dialog = true
    },

    editNotice(notice) {
      this.isEdit = true
      this.selectedNotice = notice
      this.form = {
        type: notice.type,
        title: notice.title,
        content: notice.content,
        targetRoles: notice.targetRoles,
        attachments: []
      }
      this.dialog = true
    },

    viewNotice(notice) {
      this.selectedNotice = notice
      this.viewDialog = true
    },

    async saveNotice() {
      if (!this.$refs.form.validate()) return

      try {
        if (this.isEdit) {
          await this.updateNotice({
            id: this.selectedNotice._id,
            ...this.form
          })
          this.$toast.success('공지사항이 수정되었습니다')
        } else {
          await this.createNotice(this.form)
          this.$toast.success('공지사항이 등록되었습니다')
        }
        this.dialog = false
        this.loadNotices()
      } catch (error) {
        console.error('Failed to save notice:', error)
        this.$toast.error('공지사항 저장에 실패했습니다')
      }
    },

    confirmDelete(notice) {
      this.noticeToDelete = notice
      this.deleteDialog = true
    },

    async deleteNotice() {
      if (!this.noticeToDelete) return

      try {
        await this.deleteNotice(this.noticeToDelete._id)
        this.$toast.success('공지사항이 삭제되었습니다')
        this.deleteDialog = false
        this.loadNotices()
      } catch (error) {
        console.error('Failed to delete notice:', error)
        this.$toast.error('공지사항 삭제에 실패했습니다')
      }
    },

    async toggleNoticeStatus(notice) {
      try {
        await this.toggleNoticeStatus(notice._id)
        this.$toast.success(
          `공지사항이 ${notice.status === 'published' ? '임시저장' : '게시'} 상태로 변경되었습니다`
        )
        this.loadNotices()
      } catch (error) {
        console.error('Failed to toggle notice status:', error)
        this.$toast.error('공지사항 상태 변경에 실패했습니다')
      }
    },

    downloadFile(file) {
      // 파일 다운로드 로직 구현
      window.open(file.url, '_blank')
    }
  }
}
</script>

<style scoped>
.notices-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notice-meta {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
}

.notice-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style> 