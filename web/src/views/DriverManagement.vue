<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card outlined>
            <v-card-title>
              기사 관리
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="검색"
                single-line
                hide-details
                class="mx-4"
                @input="debouncedSearch"
              ></v-text-field>
              <v-btn color="primary" @click="openAddDialog">
                <v-icon left>mdi-plus</v-icon>
                기사 추가
              </v-btn>
            </v-card-title>
            
            <v-data-table
              :headers="headers"
              :items="drivers"
              :options.sync="options"
              :server-items-length="totalDrivers"
              :loading="loading"
              class="elevation-0"
            >
              <template v-slot:item.profileImage="{ item }">
                <v-avatar size="36">
                  <v-img
                    v-if="item.profileImage"
                    :src="item.profileImage"
                    alt="프로필 이미지"
                  ></v-img>
                  <v-icon v-else color="primary lighten-1">mdi-account</v-icon>
                </v-avatar>
              </template>
              
              <template v-slot:item.vehicleId="{ item }">
                {{ getVehicleNumber(item.vehicleId) }}
              </template>
              
              <template v-slot:item.active="{ item }">
                <v-chip
                  :color="item.active ? 'success' : 'grey'"
                  small
                  text-color="white"
                >
                  {{ item.active ? '활성' : '비활성' }}
                </v-chip>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  color="primary"
                  @click="openEditDialog(item)"
                >
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
                
                <v-btn
                  icon
                  small
                  :color="item.active ? 'error' : 'success'"
                  @click="toggleDriverStatus(item)"
                >
                  <v-icon small>{{ item.active ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
                </v-btn>
                
                <v-btn
                  icon
                  small
                  color="primary"
                  @click="resetPassword(item)"
                >
                  <v-icon small>mdi-lock-reset</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- 기사 추가/수정 다이얼로그 -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>{{ isEditing ? '기사 정보 수정' : '새 기사 등록' }}</v-card-title>
        
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.name"
                    label="이름"
                    :rules="[v => !!v || '이름을 입력해주세요']"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.phoneNumber"
                    label="연락처"
                    :rules="[v => !!v || '연락처를 입력해주세요']"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" v-if="!isEditing">
                  <v-text-field
                    v-model="editedItem.email"
                    label="이메일"
                    type="email"
                    :rules="[
                      v => !!v || '이메일을 입력해주세요',
                      v => /.+@.+\..+/.test(v) || '유효한 이메일을 입력해주세요'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" v-if="!isEditing">
                  <v-text-field
                    v-model="editedItem.password"
                    label="비밀번호"
                    type="password"
                    :rules="[
                      v => !!v || '비밀번호를 입력해주세요',
                      v => v.length >= 6 || '비밀번호는 최소 6자 이상이어야 합니다'
                    ]"
                    required
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-select
                    v-model="editedItem.vehicleId"
                    :items="availableVehicles"
                    item-text="vehicleNumber"
                    item-value="_id"
                    label="배정 차량"
                    clearable
                  ></v-select>
                </v-col>
                
                <v-col cols="12">
                  <v-switch
                    v-model="editedItem.active"
                    label="활성 상태"
                    color="success"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeDialog">취소</v-btn>
          <v-btn color="primary" :disabled="!valid" @click="saveDriver">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- 비밀번호 재설정 다이얼로그 -->
    <v-dialog v-model="passwordDialog" max-width="500px">
      <v-card>
        <v-card-title>비밀번호 재설정</v-card-title>
        
        <v-card-text>
          <v-form ref="passwordForm" v-model="passwordValid">
            <v-text-field
              v-model="newPassword"
              label="새 비밀번호"
              type="password"
              :rules="[
                v => !!v || '비밀번호를 입력해주세요',
                v => v.length >= 6 || '비밀번호는 최소 6자 이상이어야 합니다'
              ]"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="confirmPassword"
              label="비밀번호 확인"
              type="password"
              :rules="[
                v => !!v || '비밀번호를 다시 입력해주세요',
                v => v === newPassword || '비밀번호가 일치하지 않습니다'
              ]"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="passwordDialog = false">취소</v-btn>
          <v-btn color="primary" :disabled="!passwordValid" @click="updatePassword">변경</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { debounce } from 'lodash'

// Store
const userStore = useUserStore()
const authStore = useAuthStore()

// State
const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const error = ref(null)

// Computed
const drivers = computed(() => userStore.getUsersByRole('driver'))
const totalPages = computed(() => userStore.totalPages)
const currentPage = computed(() => userStore.currentPage)
const userRole = computed(() => authStore.userRole)

// Methods
const handleSearch = async () => {
  try {
    loading.value = true
    const params = {
      query: searchQuery.value,
      status: statusFilter.value,
      role: 'driver',
      page: currentPage.value
    }
    await userStore.fetchUsers(params)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const changePage = async (page) => {
  try {
    loading.value = true
    const params = {
      query: searchQuery.value,
      status: statusFilter.value,
      role: 'driver',
      page
    }
    await userStore.fetchUsers(params)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  await handleSearch()
})

export default {
  name: 'DriverManagement',
  
  data: () => ({
    search: '',
    options: {
      page: 1,
      itemsPerPage: 10,
      sortBy: ['name'],
      sortDesc: [false]
    },
    headers: [
      { text: '프로필', value: 'profileImage', sortable: false },
      { text: '이름', value: 'name' },
      { text: '이메일', value: 'email' },
      { text: '연락처', value: 'phoneNumber' },
      { text: '배정 차량', value: 'vehicleId' },
      { text: '상태', value: 'active' },
      { text: '관리', value: 'actions', sortable: false }
    ],
    dialog: false,
    passwordDialog: false,
    valid: false,
    passwordValid: false,
    isEditing: false,
    editedItem: {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      vehicleId: null,
      active: true
    },
    defaultItem: {
      name: '',
      email: '',
      password: '',
      phoneNumber: '',
      vehicleId: null,
      active: true
    },
    resetPasswordDriverId: null,
    newPassword: '',
    confirmPassword: ''
  }),
  
  computed: {
    drivers() {
      return userStore.getUsersByRole('driver')
    },
    totalPages() {
      return userStore.totalPages
    },
    currentPage() {
      return userStore.currentPage
    },
    userRole() {
      return authStore.userRole
    },
    availableVehicles() {
      return this.vehicles.filter(vehicle => vehicle.status === 'active')
    }
  },
  
  created() {
    this.debouncedSearch = debounce(() => {
      this.options.page = 1
      this.fetchDrivers()
    }, 500)
    
    this.fetchDrivers()
    this.fetchVehicles()
  },
  
  methods: {
    fetchDrivers() {
      const { page, itemsPerPage, sortBy, sortDesc } = this.options
      
      const params = {
        page,
        limit: itemsPerPage,
        search: this.search,
        sortBy: sortBy.length > 0 ? sortBy[0] : 'name',
        sortDesc: sortDesc.length > 0 ? sortDesc[0] : false
      }
      
      this.$store.dispatch('drivers/fetchDrivers', params)
    },
    
    fetchVehicles() {
      this.$store.dispatch('vehicles/fetchVehicles', {
        limit: 100,
        status: 'active'
      })
    },
    
    getVehicleNumber(vehicleId) {
      if (!vehicleId) return '배정 없음'
      
      const vehicle = this.vehicles.find(v => v._id === vehicleId)
      return vehicle ? vehicle.vehicleNumber : '알 수 없음'
    },
    
    openAddDialog() {
      this.isEditing = false
      this.editedItem = { ...this.defaultItem }
      this.dialog = true
    },
    
    openEditDialog(item) {
      this.isEditing = true
      this.editedItem = { ...item }
      this.dialog = true
    },
    
    closeDialog() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem }
        this.$refs.form.reset()
      })
    },
    
    async saveDriver() {
      if (!this.$refs.form.validate()) return
      
      try {
        if (this.isEditing) {
          await this.$store.dispatch('drivers/updateDriver', {
            id: this.editedItem._id,
            data: this.editedItem
          })
          
          this.$store.commit('notification/setNotification', {
            message: '기사 정보가 업데이트되었습니다',
            type: 'success'
          })
        } else {
          await this.$store.dispatch('drivers/createDriver', {
            ...this.editedItem,
            role: 'driver'
          })
          
          this.$store.commit('notification/setNotification', {
            message: '새 기사가 등록되었습니다',
            type: 'success'
          })
        }
        
        this.closeDialog()
        this.fetchDrivers()
      } catch (err) {
        console.error('기사 저장 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '오류가 발생했습니다: ' + (err.response?.data?.message || err.message),
          type: 'error'
        })
      }
    },
    
    async toggleDriverStatus(item) {
      try {
        await this.$store.dispatch('drivers/updateDriver', {
          id: item._id,
          data: { active: !item.active }
        })
        
        this.$store.commit('notification/setNotification', {
          message: `기사가 ${item.active ? '비활성화' : '활성화'}되었습니다`,
          type: 'success'
        })
        
        this.fetchDrivers()
      } catch (err) {
        console.error('기사 상태 변경 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '오류가 발생했습니다: ' + (err.response?.data?.message || err.message),
          type: 'error'
        })
      }
    },
    
    resetPassword(item) {
      this.resetPasswordDriverId = item._id
      this.newPassword = ''
      this.confirmPassword = ''
      this.passwordDialog = true
    },
    
    async updatePassword() {
      if (!this.$refs.passwordForm.validate()) return
      
      try {
        await this.$store.dispatch('drivers/resetPassword', {
          id: this.resetPasswordDriverId,
          password: this.newPassword
        })
        
        this.$store.commit('notification/setNotification', {
          message: '비밀번호가 재설정되었습니다',
          type: 'success'
        })
        
        this.passwordDialog = false
      } catch (err) {
        console.error('비밀번호 재설정 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '오류가 발생했습니다: ' + (err.response?.data?.message || err.message),
          type: 'error'
        })
      }
    }
  },
  
  watch: {
    options: {
      handler() {
        this.fetchDrivers()
      },
      deep: true
    },
    
    dialog(val) {
      if (!val) {
        this.closeDialog()
      }
    }
  }
}
</script>
