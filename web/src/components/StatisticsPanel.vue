<template>
  <v-card outlined>
    <v-card-title class="d-flex justify-space-between">
      <span>{{ title || '통계 대시보드' }}</span>
      <v-btn
        icon
        small
        @click="refreshData"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text>
      <!-- 필터 영역 -->
      <v-row class="mb-4">
        <v-col cols="12" sm="4">
          <v-select
            v-model="period"
            :items="periodOptions"
            label="기간"
            outlined
            dense
            hide-details
          ></v-select>
        </v-col>
        
        <v-col cols="12" sm="4">
          <v-select
            v-model="wasteType"
            :items="wasteTypeOptions"
            label="폐기물 유형"
            outlined
            dense
            hide-details
          ></v-select>
        </v-col>
        
        <v-col cols="12" sm="4">
          <v-btn-toggle
            v-model="chartType"
            mandatory
            dense
            class="float-right"
          >
            <v-btn small value="bar">
              <v-icon small>mdi-chart-bar</v-icon>
            </v-btn>
            <v-btn small value="line">
              <v-icon small>mdi-chart-line</v-icon>
            </v-btn>
            <v-btn small value="pie">
              <v-icon small>mdi-chart-pie</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      
      <!-- 요약 통계 -->
      <v-row class="mb-4">
        <v-col cols="12" sm="3">
          <v-card outlined class="stat-card">
            <v-card-text class="text-center">
              <div class="text-h4 font-weight-bold primary--text">
                {{ totalRequests }}
              </div>
              <div class="text-caption">총 요청 수</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="3">
          <v-card outlined class="stat-card">
            <v-card-text class="text-center">
              <div class="text-h4 font-weight-bold success--text">
                {{ completedRequests }}
              </div>
              <div class="text-caption">완료된 요청</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="3">
          <v-card outlined class="stat-card">
            <v-card-text class="text-center">
              <div class="text-h4 font-weight-bold warning--text">
                {{ pendingRequests }}
              </div>
              <div class="text-caption">진행 중인 요청</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="3">
          <v-card outlined class="stat-card">
            <v-card-text class="text-center">
              <div class="text-h4 font-weight-bold">
                {{ completionRate }}%
              </div>
              <div class="text-caption">완료율</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- 차트 -->
      <v-row>
        <v-col cols="12">
          <v-card outlined height="300">
            <v-card-text>
              <div v-if="loading" class="d-flex justify-center align-center" style="height: 250px">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
              
              <div v-else class="chart-container" style="height: 250px">
                <bar-chart
                  v-if="chartType === 'bar'"
                  :chart-data="chartData"
                  :options="chartOptions"
                ></bar-chart>
                
                <line-chart
                  v-if="chartType === 'line'"
                  :chart-data="chartData"
                  :options="chartOptions"
                ></line-chart>
                
                <pie-chart
                  v-if="chartType === 'pie'"
                  :chart-data="pieChartData"
                  :options="pieChartOptions"
                ></pie-chart>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { Bar, Line, Pie } from 'vue-chartjs';

// 차트 컴포넌트 정의
const BarChart = {
  extends: Bar,
  props: ['chartData', 'options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    chartData() {
      this.renderChart(this.chartData, this.options);
    }
  }
};

const LineChart = {
  extends: Line,
  props: ['chartData', 'options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    chartData() {
      this.renderChart(this.chartData, this.options);
    }
  }
};

const PieChart = {
  extends: Pie,
  props: ['chartData', 'options'],
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    chartData() {
      this.renderChart(this.chartData, this.options);
    }
  }
};

export default {
  name: 'StatisticsPanel',
  
  components: {
    BarChart,
    LineChart,
    PieChart
  },
  
  props: {
    title: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data: () => ({
    period: 'week',
    wasteType: 'all',
    chartType: 'bar',
    
    periodOptions: [
      { text: '일주일', value: 'week' },
      { text: '한 달', value: 'month' },
      { text: '분기', value: 'quarter' },
      { text: '연간', value: 'year' }
    ],
    
    wasteTypeOptions: [
      { text: '전체', value: 'all' },
      { text: '일반 폐기물', value: 'general' },
      { text: '재활용', value: 'recycle' },
      { text: '음식물', value: 'food' },
      { text: '건설 폐기물', value: 'construction' },
      { text: '위험 폐기물', value: 'hazardous' }
    ],
    
    // 차트 옵션
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    },
    
    pieChartOptions: {
      responsive: true,
      maintainAspectRatio: false
    }
  }),
  
  computed: {
    // 통계 데이터
    totalRequests() {
      return this.data.totalRequests || 0;
    },
    
    completedRequests() {
      return this.data.completedRequests || 0;
    },
    
    pendingRequests() {
      return this.data.pendingRequests || 0;
    },
    
    completionRate() {
      if (!this.totalRequests) return 0;
      
      return Math.round((this.completedRequests / this.totalRequests) * 100);
    },
    
    // 차트 데이터
    chartData() {
      if (!this.data.timeSeriesData) {
        return {
          labels: [],
          datasets: [{
            label: '요청 수',
            data: [],
            backgroundColor: 'rgba(42, 157, 143, 0.5)',
            borderColor: '#2A9D8F',
            borderWidth: 1
          }]
        };
      }
      
      const timeSeriesData = this.data.timeSeriesData;
      
      // 기간에 따른 데이터 필터링
      let filteredData = [];
      if (this.period === 'week') {
        filteredData = timeSeriesData.slice(-7);
      } else if (this.period === 'month') {
        filteredData = timeSeriesData.slice(-30);
      } else if (this.period === 'quarter') {
        filteredData = timeSeriesData.slice(-90);
      } else {
        filteredData = timeSeriesData.slice(-365);
      }
      
      // 폐기물 유형에 따른 데이터 필터링
      if (this.wasteType !== 'all') {
        filteredData = filteredData.map(item => ({
          date: item.date,
          counts: {
            ...item.counts,
            total: item.counts[this.wasteType] || 0
          }
        }));
      }
      
      return {
        labels: filteredData.map(item => item.date),
        datasets: [{
          label: '요청 수',
          data: filteredData.map(item => item.counts.total),
          backgroundColor: 'rgba(42, 157, 143, 0.5)',
          borderColor: '#2A9D8F',
          borderWidth: 1
        }]
      };
    },
    
    pieChartData() {
      if (!this.data.wasteTypeData) {
        return {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: []
          }]
        };
      }
      
      const wasteTypeData = this.data.wasteTypeData;
      
      return {
        labels: Object.keys(wasteTypeData).map(key => {
          const labels = {
            general: '일반 폐기물',
            recycle: '재활용',
            food: '음식물',
            construction: '건설 폐기물',
            hazardous: '위험 폐기물'
          };
          
          return labels[key] || key;
        }),
        datasets: [{
          data: Object.values(wasteTypeData),
          backgroundColor: [
            '#2A9D8F',
            '#E9C46A',
            '#F4A261',
            '#E76F51',
            '#264653'
          ]
        }]
      };
    }
  },
  
  watch: {
    period() {
      this.refreshData();
    },
    
    wasteType() {
      this.refreshData();
    }
  },
  
  methods: {
    refreshData() {
      this.$emit('refresh', {
        period: this.period,
        wasteType: this.wasteType
      });
    }
  }
};
</script>

<style scoped>
.stat-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
