<template>
  <div>
    <v-card-title>작업 상태 업데이트</v-card-title>
    
    <v-card-text>
      <v-stepper
        v-model="currentStep"
        vertical
      >
        <v-stepper-step
          step="1"
          :complete="currentStatus !== 'requested'"
          editable
        >
          요청 접수됨
          <small>고객이 폐기물 수거를 요청했습니다</small>
        </v-stepper-step>
        
        <v-stepper-content step="1">
          <div class="text-center">
            <v-btn
              color="primary"
              @click="currentStep = 2"
              :disabled="currentStatus !== 'requested'"
            >
              작업 시작
            </v-btn>
          </div>
        </v-stepper-content>
        
        <v-stepper-step
          step="2"
          :complete="currentStatus === 'assigned' || currentStatus === 'in_progress' || currentStatus === 'completed'"
          editable
        >
          기사 배정됨
          <small>{{ currentStatus === 'assigned' ? '기사님에게 작업이 배정되었습니다' : '기사님이 작업을 시작했습니다' }}</small>
        </v-stepper-step>
        
        <v-stepper-content step="2">
          <div class="text-center">
            <v-btn
              color="primary"
              @click="startWork"
              :disabled="currentStatus !== 'assigned'"
            >
              <v-icon left>mdi-truck-delivery</v-icon>
              작업 시작
            </v-btn>
          </div>
        </v-stepper-content>
        
        <v-stepper-step
          step="3"
          :complete="currentStatus === 'in_progress' || currentStatus === 'completed'"
          editable
        >
          작업 진행 중
          <small>현장에 도착하여 작업을 진행 중입니다</small>
        </v-stepper-step>
        
        <v-stepper-content step="3">
          <v-row>
            <v-col cols="12">
              <v-btn
                block
                color="success"
                @click="completeWork"
                :disabled="currentStatus !== 'in_progress' || photosRequired && !hasSufficientPhotos"
              >
                <v-icon left>mdi-check-circle</v-icon>
                작업 완료
              </v-btn>
              
              <div v-if="photosRequired && !hasSufficientPhotos" class="text-caption text-center mt-2 red--text">
                작업 완료를 위해 최소 1장의 사진이 필요합니다
              </div>
            </v-col>
            
            <v-col cols="12" class="mt-3">
              <v-expansion-panels flat>
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    문제 보고
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-textarea
                      v-model="issueReport"
                      label="작업 중 발생한 문제를 보고해주세요"
                      rows="3"
                      outlined
                      hide-details
                    ></v-textarea>
                    
                    <v-btn
                      color="warning"
                      class="mt-3"
                      :disabled="!issueReport"
                      @click="reportIssue"
                    >
                      <v-icon left>mdi-alert</v-icon>
                      문제 보고
                    </v-btn>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-stepper-content>
        
        <v-stepper-step
          step="4"
          :complete="currentStatus === 'completed'"
        >
          작업 완료
          <small>폐기물 수거 작업이 완료되었습니다</small>
        </v-stepper-step>
        
        <v-stepper-content step="4">
          <div class="text-center py-4">
            <v-icon color="success" size="64">mdi-check-circle</v-icon>
            <div class="text-h6 mt-2">작업이 완료되었습니다</div>
          </div>
        </v-stepper-content>
      </v-stepper>
    </v-card-text>
  </div>
</template>

<script>
export default {
  name: 'StatusUpdater',
  
  props: {
    currentStatus: {
      type: String,
      required: true,
      validator: value => ['requested', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(value)
    },
    photosRequired: {
      type: Boolean,
      default: true
    },
    hasSufficientPhotos: {
      type: Boolean,
      default: false
    }
  },
  
  data: () => ({
    currentStep: 1,
    issueReport: ''
  }),
  
  watch: {
    currentStatus: {
      immediate: true,
      handler(status) {
        // 상태에 따라 스텝 설정
        switch (status) {
          case 'requested':
            this.currentStep = 1
            break
          case 'assigned':
            this.currentStep = 2
            break
          case 'in_progress':
            this.currentStep = 3
            break
          case 'completed':
            this.currentStep = 4
            break
          default:
            this.currentStep = 1
        }
      }
    }
  },
  
  methods: {
    startWork() {
      // 작업 시작 상태로 업데이트
      this.$emit('update', 'in_progress')
    },
    
    completeWork() {
      // 작업 완료 상태로 업데이트
      if (this.photosRequired && !this.hasSufficientPhotos) {
        this.$store.commit('notification/setNotification', {
          message: '작업 완료를 위해 최소 1장의 사진이 필요합니다',
          type: 'warning'
        })
        return
      }
      
      this.$emit('update', 'completed')
    },
    
    reportIssue() {
      if (!this.issueReport) return
      
      // 이슈 보고 이벤트 발생
      this.$emit('report-issue', this.issueReport)
      
      // 알림 표시
      this.$store.commit('notification/setNotification', {
        message: '문제가 성공적으로 보고되었습니다',
        type: 'info'
      })
      
      // 입력 초기화
      this.issueReport = ''
    }
  }
}
</script>
