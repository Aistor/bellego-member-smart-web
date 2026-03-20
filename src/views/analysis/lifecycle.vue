<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员生命周期趋势分析 (最近30天)</span>
        </div>
      </template>
      <div ref="lineChartRef" style="width: 100%; height: 400px;"></div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>当前阶段分布比例</span>
            </div>
          </template>
          <div ref="pieChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>阶段流转漏斗</span>
            </div>
          </template>
          <div ref="funnelChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getLifecycleData } from '../../api/analysis'

const lineChartRef = ref(null)
const pieChartRef = ref(null)
const funnelChartRef = ref(null)

onMounted(async () => {
  let chartData = null
  try {
    const res = await getLifecycleData()
    if (res.code === 200) {
      chartData = res.data
    }
  } catch (error) {
    console.error('Failed to load Lifecycle data:', error)
    return
  }

  // 1. 生命周期折线趋势图
  const lineChart = echarts.init(lineChartRef.value)
  const lineOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增会员', '活跃会员', '流失会员'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.trend.categories
    },
    yAxis: { type: 'value' },
    series: [
      { name: '新增会员', type: 'line', smooth: true, data: chartData.trend.newMember },
      { name: '活跃会员', type: 'line', smooth: true, data: chartData.trend.activeMember },
      { name: '流失会员', type: 'line', smooth: true, data: chartData.trend.churnMember }
    ]
  }
  lineChart.setOption(lineOption)

  // 2. 当前阶段分布饼图
  const pieChart = echarts.init(pieChartRef.value)
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '生命周期阶段',
        type: 'pie',
        radius: '50%',
        data: chartData.distribution,
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
        }
      }
    ]
  }
  pieChart.setOption(pieOption)

  // 3. 留存漏斗图
  const funnelChart = echarts.init(funnelChartRef.value)
  const funnelOption = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}' },
    series: [
      {
        name: '漏斗转化',
        type: 'funnel',
        left: '10%', top: 60, bottom: 60, width: '80%',
        min: 0, max: 100, minSize: '0%', maxSize: '100%',
        sort: 'descending', gap: 2,
        label: { show: true, position: 'inside' },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        data: chartData.funnel
      }
    ]
  }
  funnelChart.setOption(funnelOption)

  window.addEventListener('resize', () => {
    lineChart.resize()
    pieChart.resize()
    funnelChart.resize()
  })
})
</script>

<style scoped>
</style>
