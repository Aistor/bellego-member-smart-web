<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" style="background: linear-gradient(135deg, #1890ff 0%, #36a3f7 100%); color: white;">
          <div class="stat-header">
            <span>总会员数</span>
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-value">{{ totalMembers }}</div>
          <div class="stat-footer">较上月 <span class="trend up">+12%</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" style="background: linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%); color: white;">
          <div class="stat-header">
            <span>累计营业额 (元)</span>
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-value">￥{{ totalRevenue.toFixed(2) }}</div>
          <div class="stat-footer">较上月 <span class="trend up">+8.5%</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" style="background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); color: white;">
          <div class="stat-header">
            <span>累计发放积分</span>
            <el-icon><Present /></el-icon>
          </div>
          <div class="stat-value">{{ totalPoints }}</div>
          <div class="stat-footer">较上月 <span class="trend up">+15%</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card" style="background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%); color: white;">
          <div class="stat-header">
            <span>卡券转化率</span>
            <el-icon><Ticket /></el-icon>
          </div>
          <div class="stat-value">{{ couponConversionRate }}%</div>
          <div class="stat-footer">发放 {{ totalIssuedCoupons }} / 核销 {{ totalUsedCoupons }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>近七日营业额趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>会员等级分布</span>
            </div>
          </template>
          <div ref="pieChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新大额消费记录</span>
            </div>
          </template>
          <el-table :data="recentRecords" border style="width: 100%">
            <el-table-column prop="id" label="流水号" width="100" />
            <el-table-column label="会员姓名" width="150">
              <template #default="scope">
                {{ getMemberName(scope.row.member_id) }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="消费金额(元)">
              <template #default="scope">
                <span style="color: #f56c6c; font-weight: bold;">￥{{ scope.row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="points_earned" label="获得积分">
              <template #default="scope">
                <span style="color: #67c23a;">+{{ scope.row.points_earned }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="consume_time" label="消费时间" width="200" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
// 不再直接引入数组，改为调用模拟接口，为了演示，我们可以通过 Promise.all 抓取数据
// 但更好的做法是，将 Dashboard 的聚合数据单独作为一个统一接口放在 analysis 里
import { getDashboardSummary } from '../../api/analysis'

// ----- State -----
const totalMembers = ref(0)
const totalRevenue = ref(0)
const totalPoints = ref(0)
const totalIssuedCoupons = ref(0)
const totalUsedCoupons = ref(0)
const recentRecords = ref([])
const lineData = ref([])
const pieData = ref([])

const couponConversionRate = computed(() => {
  if (totalIssuedCoupons.value === 0) return '0.0'
  return ((totalUsedCoupons.value / totalIssuedCoupons.value) * 100).toFixed(1)
})

const getMemberName = (id) => {
  // 后端返回时已经携带了名字在 recentRecords 中（模拟接口会处理好）
  return id
}

// ----- 图表渲染 -----
const lineChartRef = ref(null)
const pieChartRef = ref(null)

const renderCharts = () => {
  // 渲染折线图
  const lineChart = echarts.init(lineChartRef.value)
  const lineOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['03-01', '03-02', '03-03', '03-04', '03-05', '03-06', '03-07']
    },
    yAxis: { type: 'value', name: '营业额 (元)' },
    series: [
      {
        data: lineData.value,
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24,144,255,0.8)' },
            { offset: 1, color: 'rgba(24,144,255,0.1)' }
          ])
        },
        itemStyle: { color: '#1890ff' }
      }
    ]
  }
  lineChart.setOption(lineOption)

  // 渲染饼图
  const pieChart = echarts.init(pieChartRef.value)
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [
      {
        name: '等级分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: pieData.value
      }
    ]
  }
  pieChart.setOption(pieOption)

  window.addEventListener('resize', () => {
    lineChart.resize()
    pieChart.resize()
  })
}

const loadData = async () => {
  try {
    const res = await getDashboardSummary()
    if (res.code === 200) {
      const data = res.data
      totalMembers.value = data.totalMembers
      totalRevenue.value = data.totalRevenue
      totalPoints.value = data.totalPoints
      totalIssuedCoupons.value = data.totalIssuedCoupons
      totalUsedCoupons.value = data.totalUsedCoupons
      recentRecords.value = data.recentRecords
      lineData.value = data.lineData
      pieData.value = data.pieData
      
      // 数据加载完后渲染图表
      renderCharts()
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}
.stat-card {
  border: none;
  border-radius: 8px;
}
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  opacity: 0.9;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin: 15px 0;
}
.stat-footer {
  font-size: 13px;
  opacity: 0.9;
}
.trend {
  font-weight: bold;
}
.trend.up {
  color: #fff;
}
.card-header {
  font-weight: bold;
}
</style>
