<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <!-- 상단 네비게이션 -->
          <v-card flat class="mb-4">
            <v-card-text>
              <v-btn text color="primary" to="/waste-requests">
                <v-icon left>mdi-arrow-left</v-icon>
                요청 목록으로 돌아가기
              </v-btn>
            </v-card-text>
          </v-card>
          
          <!-- 로딩 표시 -->
          <v-skeleton-loader
            v-if="loading"
            type="card, card-heading, list-item-three-line, image"
            class="my-4"
          ></v-skeleton-loader>
          
          <!-- 오류 표시 -->
          <v-alert
            v-else-if="error"
            type="error"
            outlined
            class="my-4"
          >
            {{ error }}
            <template v-slot:append>
              <v-btn
                text
                small
                color="error"
                @click="fetchRequestDetails"
              >
                다시 시도
              </v-btn>
            </template>
          </v-alert>
          
          <template v-else-if="request">
            <!-- 요청 헤더 -->
            <v-card outlined class="mb-4">
              <v-card-title class="d-flex justify-space-between">
                <div>
                  <span class="text-h5">요청 #{{ request.requestId }}</span>
                  <v-chip
                    :color="getStatusColor(request.status)"
                    text-color="white"
                    class="ml-2"
                  >
                    {{ getStatusText(request.status) }}
                  </v-chip>
                </div>
                
                <div>
                  <v-btn
                    v-if="request.status === 'requested'"
                    color="primary"
                    class="mr-2"
                    @click="openAssignDialog"
                  >
                    <v-icon left>mdi-account-check</v-icon>
                    기사 배정
                  </v-btn>
                  
                  <v-btn
                    v-if="['requested', 'assigned'].includes(request.status)"
                    color="error"
                    @click="confirmCancel"
                  >
                    <v-icon left>mdi-cancel</v-icon>
                    취소
                  </v-btn>
                </div>
              </v-card-title>
              
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-calendar</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>예약 날짜</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(request.scheduledDate) }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-calendar-clock</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>요청일</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(request.createdAt) }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item v-if="request.assignedDriver">
                      <v-list-item-icon>
                        <v-icon>mdi-account-hard-hat</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>배정 기사</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ getDriverName(request.assignedDriver) }}
                          ({{ getVehicleNumber(request.assignedVehicle) }})
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-account</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>고객명</v-list-item-title>
                        <v-list-item-subtitle>{{ request.customer.name }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-phone</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>연락처</v-list-item-title>
                        <v-list-item-subtitle>{{ request.customer.contact }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn
                          icon
                          small
                          :href="`tel:${request.customer.contact}`"
                        >
                          <v-icon color="primary">mdi-phone</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                    
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-map-marker</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>수거 주소</v-list-item-title>
                        <v-list-item-subtitle>{{ request.customer.address }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            
            <!-- 요청 상세 정보 -->
            <v-row>
              <v-col cols="12" md="6">
                <v-card outlined height="100%">
                  <v-card-title>폐기물 정보</v-card-title>
                  <v-card-text>
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-recycle</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>폐기물 유형</v-list-item-title>
                        <v-list-item-subtitle>{{ getWasteTypeText(request.wasteType) }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item>
                      <v-list-item-icon>
                        <v-icon>mdi-weight</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>예상 무게</v-list-item-title>
                        <v-list-item-subtitle>{{ request.wasteAmount }}kg</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    
                    <v-list-item v-if="request.notes">
                      <v-list-item-icon>
                        <v-icon>mdi-note-text</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>참고 사항</v-list-item-title>
                        <v-list-item-subtitle>{{ request.notes }}</v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card outlined height="100%">
                  <v-card-title>위치 정보</v-card-title>
                  <v-card-text>
                    <div id="map" style="height: 300px;"></div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- 진행 상황 및 사진 -->
            <v-card outlined class="mt-4" v-if="request.status !== 'requested'">
              <v-card-title>진행 상황</v-card-title>
              <v-card-text>
                <v-timeline dense>
                  <v-timeline-item
                    color="primary"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.createdAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">요청 생성</h3>
                      <p class="text-caption">
                        {{ request.customer.name }}님이 {{ getWasteTypeText(request.wasteType) }} 수거를 요청했습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                  
                  <v-timeline-item
                    v-if="request.status !== 'requested'"
                    color="blue"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.updatedAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">기사 배정</h3>
                      <p class="text-caption">
                        {{ getDriverName(request.assignedDriver) }} 기사에게 배정되었습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                  
                  <v-timeline-item
                    v-if="request.status === 'in_progress' || request.status === 'completed'"
                    color="orange"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.updatedAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">작업 시작</h3>
                      <p class="text-caption">
                        기사가 수거 작업을 시작했습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                  
                  <v-timeline-item
                    v-if="request.status === 'completed'"
                    color="success"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.updatedAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">작업 완료</h3>
                      <p class="text-caption">
                        폐기물 수거가 완료되었습니다.
                      </p>
                    </div>
                  </v-timeline-item>
                  
                  <v-timeline-item
                    v-if="request.status === 'cancelled'"
                    color="error"
                    small
                  >
                    <template v-slot:opposite>
                      <span class="text-caption">{{ formatDate(request.updatedAt) }}</span>
                    </template>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-bold">요청 취소</h3>
                      <p class="text-caption">
                        요청이 취소