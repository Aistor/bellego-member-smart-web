<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">生命周期分析</h2>
        <p class="page-subtitle">支持按日或按月查看新增会员趋势、活跃会员和流失会员概况。</p>
      </div>
      <div class="toolbar-actions">
        <el-select v-model="period" style="width: 140px" @change="loadData">
          <el-option label="按日" value="DAY" />
          <el-option label="按月" value="MONTH" />
        </el-select>
      </div>
    </div>

    <div class="stat-grid">
      <el-card class="page-card"><div class="mini-title">会员总数</div><div class="mini-value">{{ summary.totalMembers }}</div></el-card>
      <el-card class="page-card"><div class="mini-title">活跃会员</div><div class="mini-value">{{ summary.activeCount }}</div></el-card>
      <el-card class="page-card"><div class="mini-title">流失会员</div><div class="mini-value">{{ summary.lostCount }}</div></el-card>
    </div>

    <div ref="chartRef" class="chart"></div>
  </el-card>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getLifecycleData } from '../../api/analysis'

const period = ref('DAY')
const summary = ref({
  totalMembers: 0,
  activeCount: 0,
  lostCount: 0,
  newTrend: {}
})
const chartRef = ref()
let chart

const renderChart = async () => {
  await nextTick()
  if (!chart) chart = echarts.init(chartRef.value)
  const trend = summary.value.newTrend || {}
  chart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: Object.keys(trend) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: Object.values(trend), itemStyle: { color: '#14b8a6' } }]
  })
}

const loadData = async () => {
  const response = await getLifecycleData({ period: period.value })
  summary.value = response.data || {}
  renderChart()
}

const resize = () => chart?.resize()

onMounted(() => {
  loadData()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
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
  height: 360px;
  margin-top: 20px;
}
</style>
