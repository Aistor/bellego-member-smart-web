<template>
  <el-card class="page-card">
    <div class="page-header">
      <div>
        <h2 class="page-title">RFM 分析</h2>
        <p class="page-subtitle">展示最近消费、消费频次和消费金额的会员分层情况。</p>
      </div>
      <el-button :loading="loading" @click="loadData">刷新</el-button>
    </div>

    <div ref="chartRef" class="chart"></div>

    <el-table :data="segments" v-loading="loading" border>
      <el-table-column prop="memberId" label="会员 ID" min-width="120" />
      <el-table-column prop="memberName" label="会员姓名" min-width="120" />
      <el-table-column prop="recencyDays" label="最近消费天数" min-width="120" />
      <el-table-column prop="frequency" label="消费次数" min-width="100" />
      <el-table-column prop="monetary" label="累计消费金额" min-width="130" />
      <el-table-column prop="rLevel" label="R 评分" min-width="80" />
      <el-table-column prop="fLevel" label="F 评分" min-width="80" />
      <el-table-column prop="mLevel" label="M 评分" min-width="80" />
    </el-table>
  </el-card>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getRfmData } from '../../api/analysis'

const loading = ref(false)
const chartRef = ref()
const segments = ref([])
let chart

const renderChart = async () => {
  await nextTick()
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    xAxis: { name: '最近消费天数' },
    yAxis: { name: '消费次数' },
    series: [
      {
        type: 'scatter',
        symbolSize: (value) => Math.max(12, Number(value[2]) / 100),
        data: segments.value.map((item) => [item.recencyDays, item.frequency, item.monetary, item.memberName])
      }
    ]
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const response = await getRfmData()
    segments.value = response.data?.segments || []
    renderChart()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', resize)
})

const resize = () => chart?.resize()

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<style scoped>
.chart {
  height: 360px;
  margin-bottom: 20px;
}
</style>
