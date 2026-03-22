<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card blue-card">
          <div class="stat-header">
            <span>总会员数</span>
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-value">{{ totalMembers }}</div>
          <div class="stat-footer">基于新版分析接口聚合</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card red-card">
          <div class="stat-header">
            <span>累计营业额</span>
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-value">￥{{ totalRevenue.toFixed(2) }}</div>
          <div class="stat-footer">来源于每日消费趋势分析</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card green-card">
          <div class="stat-header">
            <span>累计积分</span>
            <el-icon><Present /></el-icon>
          </div>
          <div class="stat-value">{{ totalPoints }}</div>
          <div class="stat-footer">来源于会员总积分汇总</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card orange-card">
          <div class="stat-header">
            <span>券核销率</span>
            <el-icon><Ticket /></el-icon>
          </div>
          <div class="stat-value">{{ couponConversionRate }}%</div>
          <div class="stat-footer">发放 {{ totalIssuedCoupons }} / 核销 {{ totalUsedCoupons }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>每日消费趋势</span>
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

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新大额消费记录</span>
            </div>
          </template>
          <el-table :data="recentRecords" border style="width: 100%" show-overflow-tooltip stripe>
            <el-table-column prop="id" label="记录ID" width="160" />
            <el-table-column prop="memberName" label="会员名称" width="120" />
            <el-table-column prop="storeName" label="门店" width="200" />
            <el-table-column prop="amount" label="消费金额">
              <template #default="{ row }">
                <span class="expense-text">￥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="pointsEarned" label="获得积分">
              <template #default="{ row }">
                <span class="point-text">+{{ row.pointsEarned }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="consumeTime" label="消费时间" width="200" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getDashboardSummary } from '../../api/analysis'

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

const lineChartRef = ref(null)
const pieChartRef = ref(null)

function renderCharts() {
  const lineChart = echarts.init(lineChartRef.value)
  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: lineData.value.map((item) => item.consumeDate)
    },
    yAxis: { type: 'value', name: '营业额' },
    series: [
      {
        data: lineData.value.map((item) => Number(item.totalAmount || 0)),
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
  })

  const pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [
      {
        name: '等级分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '40%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 1.5
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: pieData.value
      }
    ]
  })

  window.addEventListener('resize', () => {
    lineChart.resize()
    pieChart.resize()
  })
}

async function loadData() {
  const result = await getDashboardSummary()
  const data = result.data
  totalMembers.value = data.totalMembers
  totalRevenue.value = Number(data.totalRevenue || 0)
  totalPoints.value = data.totalPoints
  totalIssuedCoupons.value = data.totalIssuedCoupons
  totalUsedCoupons.value = data.totalUsedCoupons
  recentRecords.value = data.recentRecords
  lineData.value = data.lineData
  pieData.value = data.pieData
  renderCharts()
}

onMounted(loadData)
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.stat-card {
  border: none;
  border-radius: 8px;
  color: #fff;
}

.blue-card {
  background: linear-gradient(135deg, #1890ff 0%, #36a3f7 100%);
}

.red-card {
  background: linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%);
}

.green-card {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.orange-card {
  background: linear-gradient(135deg, #fa8c16 0%, #ffa940 100%);
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

.card-header {
  font-weight: bold;
}

.expense-text {
  color: #f56c6c;
  font-weight: bold;
}

.point-text {
  color: #67c23a;
}
</style>
