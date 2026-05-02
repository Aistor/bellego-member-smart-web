<template>
  <div class="store-data-page">
    <el-card shadow="never" class="filter-card">
      <div class="filter-bar">
        <span class="filter-label">门店分析</span>
        <el-select v-model="selectedStoreId" placeholder="全部门店" clearable style="width: 200px" @change="loadData">
          <el-option
            v-for="store in storeList"
            :key="store.id"
            :label="store.name"
            :value="store.id"
          />
        </el-select>
      </div>
    </el-card>

    <el-row :gutter="18" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>会员客单价分布</span>
            </div>
          </template>
          <div ref="barChartRef" class="chart-view"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>消费偏好雷达图</span>
            </div>
          </template>
          <div ref="radarChartRef" class="chart-view"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="chart-row">
      <template #header>
        <div class="card-header">
          <span>高频消费时段分布</span>
        </div>
      </template>
      <div ref="heatmapChartRef" class="chart-view wide"></div>
    </el-card>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getStoreAnalysisData } from '../../api/analysis'
import { getStores } from '../../api/system'

const barChartRef = ref(null)
const radarChartRef = ref(null)
const heatmapChartRef = ref(null)
const selectedStoreId = ref('')
const storeList = ref([])

let barChart
let radarChart
let heatChart

async function fetchStores() {
  const result = await getStores({ pageSize: 200 })
  storeList.value = result.data?.records || []
}

async function loadData() {
  const result = await getStoreAnalysisData(selectedStoreId.value)
  const chartData = result.data

  if (!barChart) barChart = echarts.init(barChartRef.value)
  barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: ['0-100元', '101-300元', '301-500元', '500元以上'],
        axisTick: { alignWithLabel: true }
      }
    ],
    yAxis: [{ type: 'value', name: '订单数' }],
    series: [
      {
        name: '分布数量',
        type: 'bar',
        barWidth: '60%',
        data: chartData.orderAmountHistogram,
        itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }
      }
    ]
  })

  if (!radarChart) radarChart = echarts.init(radarChartRef.value)
  radarChart.setOption({
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
  })

  if (!heatChart) heatChart = echarts.init(heatmapChartRef.value)
  heatChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: chartData.hotTime.times
    },
    yAxis: { type: 'value', name: '热度指数' },
    series: [
      {
        data: chartData.hotTime.data,
        type: 'line',
        smooth: true,
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
  })
}

function handleResize() {
  barChart?.resize()
  radarChart?.resize()
  heatChart?.resize()
}

onMounted(async () => {
  await fetchStores()
  await loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  barChart?.dispose()
  radarChart?.dispose()
  heatChart?.dispose()
})
</script>

<style scoped>
.store-data-page {
  padding: 0;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

.filter-label {
  font-weight: 700;
  font-size: 18px;
  color: #0f172a;
}

.chart-row {
  margin-bottom: 16px;
}

.chart-view {
  width: 100%;
  height: 350px;
}

.chart-view.wide {
  height: 400px;
}
</style>
