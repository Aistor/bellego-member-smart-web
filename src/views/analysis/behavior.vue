<template>
  <div>
    <div class="page-header">
      <div>
        <h2 class="page-title">消费行为分析</h2>
        <p class="page-subtitle">整合客单价分布、复购率和消费时段分布。</p>
      </div>
      <el-button @click="loadData">刷新</el-button>
    </div>

    <div class="stat-grid">
      <el-card class="page-card"><div class="mini-title">消费会员数</div><div class="mini-value">{{ repurchase.consumingMembers || 0 }}</div></el-card>
      <el-card class="page-card"><div class="mini-title">复购会员数</div><div class="mini-value">{{ repurchase.repurchaseMembers || 0 }}</div></el-card>
      <el-card class="page-card"><div class="mini-title">复购率</div><div class="mini-value">{{ formatPercent(repurchase.repurchaseRate || 0) }}</div></el-card>
    </div>

    <el-row :gutter="16" style="margin-top: 18px">
      <el-col :lg="12" :xs="24">
        <el-card class="page-card chart-card">
          <template #header>客单价分布</template>
          <div ref="orderChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :lg="12" :xs="24">
        <el-card class="page-card chart-card">
          <template #header>消费时段分布</template>
          <div ref="timeChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getOrderAmountData, getRepurchaseData, getTimeDistributionData } from '../../api/analysis'
import { formatPercent } from '../../utils/format'

const repurchase = ref({})
const orderBuckets = ref({})
const timeDistribution = ref({})
const orderChartRef = ref()
const timeChartRef = ref()
let orderChart
let timeChart

const renderCharts = async () => {
  await nextTick()
  if (!orderChart) orderChart = echarts.init(orderChartRef.value)
  if (!timeChart) timeChart = echarts.init(timeChartRef.value)

  orderChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Object.keys(orderBuckets.value || {}) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: Object.values(orderBuckets.value || {}), itemStyle: { color: '#38bdf8' } }]
  })

  timeChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Object.keys(timeDistribution.value || {}) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: Object.values(timeDistribution.value || {}), itemStyle: { color: '#f59e0b' } }]
  })
}

const loadData = async () => {
  const [orderRes, repurchaseRes, timeRes] = await Promise.all([
    getOrderAmountData(),
    getRepurchaseData(),
    getTimeDistributionData()
  ])
  orderBuckets.value = orderRes.data?.buckets || {}
  repurchase.value = repurchaseRes.data || {}
  timeDistribution.value = timeRes.data?.distribution || {}
  renderCharts()
}

const resize = () => {
  orderChart?.resize()
  timeChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  orderChart?.dispose()
  timeChart?.dispose()
})
</script>

<style scoped>
.mini-title {
  color: #64748b;
}

.mini-value {
  margin-top: 12px;
  font-size: 30px;
  font-weight: 800;
}

.chart {
  height: 320px;
}
</style>
