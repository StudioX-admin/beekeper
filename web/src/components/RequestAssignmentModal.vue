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
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRequestStore } from '@/stores/request'

// Store
const userStore = useUserStore()
const requestStore = useRequestStore()

// State
const selectedDriver = ref(null)
const selectedVehicle = ref(null)
const loading = ref(false)

// Computed
const drivers = computed(() => userStore.getUsersByRole('driver'))
const vehicles = computed(() => requestStore.availableVehicles)

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
  
  setup(props, { emit }) {
    // Methods
    const assignRequest = async () => {
      if (!selectedDriver.value || !selectedVehicle.value) {
        return
      }

      try {
        loading.value = true
        await requestStore.assignRequest({
          requestId: props.request._id,
          driverId: selectedDriver.value,
          vehicleId: selectedVehicle.value
        })
        emit('assigned')
      } catch (error) {
        console.error('Assignment error:', error)
      } finally {
        loading.value = false
      }
    }

    // Lifecycle hooks
    onMounted(async () => {
      await userStore.fetchUsers({ role: 'driver' })
      await requestStore.fetchAvailableVehicles()
    })

    return {
      selectedDriver,
      selectedVehicle,
      loading,
      availableDrivers: drivers,
      availableVehicles: vehicles,
      assignRequest
    }
  },
  
  methods: {
    getInitials(name) {
      if (!name) return '?'
      
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
    },
    
    updateSelectedVehicle() {
      if (!selectedDriver.value) {
        selectedVehicle.value = null
        return
      }
      
      // 기사에게 배정된 차량이 있으면 자동 선택
      if (selectedDriver.value.vehicleId) {
        const assignedVehicle = vehicles.value.find(v => 
          v._id === selectedDriver.value.vehicleId && v.status === 'active'
        )
        
        if (assignedVehicle) {
          selectedVehicle.value = assignedVehicle
        }
      } else {
        selectedVehicle.value = null
      }
    }
  }
}
</script>
