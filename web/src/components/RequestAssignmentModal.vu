<template>
  <v-dialog
    :value="visible"
    @input="$emit('close')"
    max-width="500px"
    persistent
  >
    <v-card>
      <v-card-title>기사 배정</v-card-title>
      
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <p class="mb-2">
                <strong>요청 ID:</strong> {{ request.requestId }}
              </p>
              <p class="mb-2">
                <strong>고객명:</strong> {{ request.customer.name }}
              </p>
              <p class="mb-4">
                <strong>주소:</strong> {{ request.customer.address }}
              </p>
            </v-col>
            
            <v-col cols="12">
              <v-select
                v-model="selectedDriver"
                :items="availableDrivers"
                item-text="name"
                item-value="_id"
                label="기사 선택"
                :rules="[v => !!v || '기사를 선택해주세요']"
                :loading="loadingDrivers"
                :disabled="loadingDrivers"
                return-object
                required
                @change="updateSelectedVehicle"
              >
                <template v-slot:selection="{ item }">
                  <span>{{ item.name }}</span>
                  <span v-if="item.phoneNumber" class="ml-1 text-caption">
                    ({{ item.phoneNumber }})
                  </span>
                </template>
                <template v-slot:item="{ item }">
                  <v-list-item-avatar v-if="item.profileImage">
                    <v-img :src="item.profileImage"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-avatar v-else color="primary lighten-1">
                    <span class="white--text">{{ getInitials(item.name) }}</span>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle v-if="item.phoneNumber">
                      {{ item.phoneNumber }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-select>
            </v-col>
            
            <v-col cols="12">
              <v-select
                v-model="selectedVehicle"
                :items="availableVehicles"
                item-text="vehicleNumber"
                item-value="_id"
                label="차량 선택"
                :rules="[v => !!v || '차량을 선택해주세요']"
                :loading="loadingVehicles"
                :disabled="loadingVehicles || !selectedDriver"
                return-object
                required
              >
                <template v-slot:selection="{ item }">
                  <span>{{ item.vehicleNumber }}</span>
                  <span class="ml-1 text-caption">
                    ({{ item.type }})
                  </span>
                </template>
                <template v-slot:item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.vehicleNumber }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ item.type }} - {{ item.capacity }}kg
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="error" @click="$emit('close')">취소</v-btn>
        <v-btn
          color="primary"
          :disabled="!isFormValid || loading"
          :loading="loading"
          @click="assignDriver"
        >
          배정
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'RequestAssignmentModal',
  
  props: {
    request: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  
  data: () => ({
    selectedDriver: null,
    selectedVehicle: null,
    loading: false,
    loadingDrivers: false,
    loadingVehicles: false
  }),
  
  computed: {
    ...mapState({
      drivers: state => state.drivers.items,
      vehicles: state => state.vehicles.items
    }),
    
    availableDrivers() {
      return this.drivers.filter(driver => driver.active)
    },
    
    availableVehicles() {
      return this.vehicles.filter(vehicle => 
        vehicle.status === 'active' && 
        (!this.selectedDriver || !this.selectedDriver.vehicleId || 
         this.selectedDriver.vehicleId === vehicle._id)
      )
    },
    
    isFormValid() {
      return this.selectedDriver && this.selectedVehicle
    }
  },
  
  watch: {
    visible(val) {
      if (val) {
        this.resetForm()
        this.fetchData()
      }
    }
  },
  
  methods: {
    resetForm() {
      this.selectedDriver = null
      this.selectedVehicle = null
      this.loading = false
    },
    
    async fetchData() {
      this.loadingDrivers = true
      this.loadingVehicles = true
      
      try {
        // 기사 목록 로드
        await this.$store.dispatch('drivers/fetchDrivers', {
          limit: 100,
          active: true
        })
        
        // 차량 목록 로드
        await this.$store.dispatch('vehicles/fetchVehicles', {
          limit: 100,
          status: 'active'
        })
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '데이터를 불러오는데 실패했습니다',
          type: 'error'
        })
      } finally {
        this.loadingDrivers = false
        this.loadingVehicles = false
      }
    },
    
    getInitials(name) {
      if (!name) return '?'
      
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
    },
    
    updateSelectedVehicle() {
      if (!this.selectedDriver) {
        this.selectedVehicle = null
        return
      }
      
      // 기사에게 배정된 차량이 있으면 자동 선택
      if (this.selectedDriver.vehicleId) {
        const assignedVehicle = this.vehicles.find(v => 
          v._id === this.selectedDriver.vehicleId && v.status === 'active'
        )
        
        if (assignedVehicle) {
          this.selectedVehicle = assignedVehicle
        }
      } else {
        this.selectedVehicle = null
      }
    },
    
    async assignDriver() {
      if (!this.isFormValid) return
      
      this.loading = true
      
      try {
        // 요청에 기사 및 차량 배정
        await this.$store.dispatch('wasteRequests/assignDriver', {
          requestId: this.request._id,
          driverId: this.selectedDriver._id,
          vehicleId: this.selectedVehicle._id
        })
        
        this.$emit('assigned')
      } catch (err) {
        console.error('기사 배정 실패:', err)
        
        this.$store.commit('notification/setNotification', {
          message: '기사 배정에 실패했습니다: ' + (err.response?.data?.message || err.message),
          type: 'error'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
