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
              <span>门店消费</span>
              <el-select v-model="consumptionDate" placeholder="全部时期" clearable style="width: 160px" size="small" @change="loadConsumptionData">
                <el-option label="全部时期" value="" />
                <el-option
                  v-for="month in availableMonths"
                  :key="month"
                  :label="month"
                  :value="month"
                />
              </el-select>
            </div>
          </template>
          <div v-if="!consumptionNoData" ref="consumptionChartRef" class="chart-view"></div>
          <div v-else class="chart-view no-data">
            <span>暂无数据</span>
          </div>
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
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getStoreAnalysisData, getStoreConsumption, getStartDate } from '../../api/analysis'
import { getStores } from '../../api/system'

const barChartRef = ref(null)
const consumptionChartRef = ref(null)
const heatmapChartRef = ref(null)
const selectedStoreId = ref('')
const consumptionDate = ref('')
const availableMonths = ref([])
const consumptionNoData = ref(false)
const storeList = ref([])

let barChart
let consumptionChart
let heatChart

function generateMonthList(startDate) {
  if (!startDate) return []
  const [startYear, startMonth] = startDate.split('-').map(Number)
  const now = new Date()
  const endYear = now.getFullYear()
  const endMonth = now.getMonth() + 1

  const months = []
  let year = startYear
  let month = startMonth

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return months.reverse()
}

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

async function loadConsumptionData() {
  const stores = await getStoreConsumption(consumptionDate.value)
  if (!stores || stores.length === 0) {
    consumptionNoData.value = true
    if (consumptionChart) {
      consumptionChart.dispose()
      consumptionChart = null
    }
    return
  }
  consumptionNoData.value = false
  await nextTick()
  if (!consumptionChart) consumptionChart = echarts.init(consumptionChartRef.value)
  consumptionChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter(params) {
        const item = params[0]
        return `${item.name}<br/>累计消费：￥${Number(item.value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: stores.map((s) => s.storeName),
        axisTick: { alignWithLabel: true },
        axisLabel: { interval: 0, rotate: 15 }
      }
    ],
    yAxis: [{ type: 'value', name: '消费金额(元)' }],
    series: [
      {
        name: '累计消费',
        type: 'bar',
        barWidth: '50%',
        data: stores.map((s) => Number(s.totalAmount || 0)),
        itemStyle: { color: '#2563eb', borderRadius: [6, 6, 0, 0] }
      }
    ]
  })
}

function handleResize() {
  barChart?.resize()
  consumptionChart?.resize()
  heatChart?.resize()
}

onMounted(async () => {
  const startDate = await getStartDate()
  availableMonths.value = generateMonthList(startDate)
  await fetchStores()
  await loadData()
  await loadConsumptionData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  barChart?.dispose()
  consumptionChart?.dispose()
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

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
}
</style>
