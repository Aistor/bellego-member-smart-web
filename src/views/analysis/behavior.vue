<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>会员客单价分布 (本月)</span>
            </div>
          </template>
          <div ref="barChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>消费品类偏好 雷达图</span>
            </div>
          </template>
          <div ref="radarChartRef" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>高频消费时段热力分布 (模拟)</span>
        </div>
      </template>
      <div ref="heatmapChartRef" style="width: 100%; height: 400px;"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getBehaviorData } from '../../api/analysis'

const barChartRef = ref(null)
const radarChartRef = ref(null)
const heatmapChartRef = ref(null)

onMounted(async () => {
  let chartData = null
  try {
    const res = await getBehaviorData()
    if (res.code === 200) {
      chartData = res.data
    }
  } catch (error) {
    console.error('Failed to load Behavior data:', error)
    return
  }

  // 1. 客单价柱状分布图
  const barChart = echarts.init(barChartRef.value)
  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: ['0-50元', '51-100元', '101-200元', '201-500元', '500元以上'],
        axisTick: { alignWithLabel: true }
      }
    ],
    yAxis: [{ type: 'value', name: '人数' }],
    series: [
      {
        name: '分布人数', type: 'bar', barWidth: '60%',
        data: chartData.orderAmountHistogram,
        itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }
      }
    ]
  }
  barChart.setOption(barOption)

  // 2. 消费偏好雷达图
  const radarChart = echarts.init(radarChartRef.value)
  const radarOption = {
    tooltip: {},
    legend: { data: ['男性会员群', '女性会员群'], bottom: 0 },
    radar: {
      indicator: [
        { name: '生鲜水果', max: 100 },
        { name: '休闲零食', max: 100 },
        { name: '酒水饮料', max: 100 },
        { name: '日用洗护', max: 100 },
        { name: '粮油副食', max: 100 },
        { name: '熟食面包', max: 100 }
      ]
    },
    series: [
      {
        name: '品类偏好对比',
        type: 'radar',
        data: [
          {
            value: chartData.radar.male,
            name: '男性会员群',
            areaStyle: { color: 'rgba(64, 158, 255, 0.4)' }
          },
          {
            value: chartData.radar.female,
            name: '女性会员群',
            areaStyle: { color: 'rgba(245, 108, 108, 0.4)' }
          }
        ]
      }
    ]
  }
  radarChart.setOption(radarOption)

  // 3. 消费时段热力图
  const heatChart = echarts.init(heatmapChartRef.value)
  const heatOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: chartData.hotTime.times
    },
    yAxis: { type: 'value', name: '客流量指数' },
    series: [
      {
        data: chartData.hotTime.data,
        type: 'line', smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgb(255, 158, 68)' },
            { offset: 1, color: 'rgb(255, 70, 131)' }
          ])
        },
        lineStyle: { color: 'rgb(255, 70, 131)' },
        itemStyle: { color: 'rgb(255, 70, 131)' }
      }
    ]
  }
  heatChart.setOption(heatOption)

  window.addEventListener('resize', () => {
    barChart.resize()
    radarChart.resize()
    heatChart.resize()
  })
})
</script>

<style scoped>
</style>
