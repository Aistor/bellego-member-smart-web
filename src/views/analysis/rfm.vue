<template>
  <div class="rfm-page">
    <el-row :gutter="18" class="toolbar-row">
      <el-col :span="24">
        <el-card shadow="never">
          <div class="toolbar">
            <div>
              <div class="toolbar-title">RFM 客群分层</div>
              <div class="toolbar-subtitle">默认统计全部时期，可切换到任意月份查看当月会员价值结构</div>
            </div>
            <el-select v-model="selectedMonth" style="width: 180px" @change="loadData">
              <el-option label="全部时期" value="ALL" />
              <el-option
                v-for="month in availableMonths"
                :key="month"
                :label="month"
                :value="month"
              />
            </el-select>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="overview-row">
      <el-col :span="6">
        <el-card shadow="never" class="overview-card">
          <div class="overview-label">RFM 覆盖会员</div>
          <div class="overview-value">{{ totalMembers }}</div>
          <div class="overview-note">{{ selectedMonth === 'ALL' ? '全部时期' : `${selectedMonth} 当月` }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="overview-card">
          <div class="overview-label">高价值客群占比</div>
          <div class="overview-value">{{ highValueRate }}%</div>
          <div class="overview-note">重要价值 + 重要发展</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="overview-card">
          <div class="overview-label">平均消费频次</div>
          <div class="overview-value">{{ averageFrequency }}</div>
          <div class="overview-note">按当前选择时期实时计算</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="overview-card">
          <div class="overview-label">平均消费金额</div>
          <div class="overview-value">￥{{ averageMonetary }}</div>
          <div class="overview-note">按当前选择时期实时计算</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="content-row">
      <el-col :span="8">
        <el-card shadow="never" class="segment-card">
          <template #header>
            <div class="panel-header">
              <span>客群细分</span>
              <el-tag type="info">{{ segmentSummary.length }} 个分群</el-tag>
            </div>
          </template>

          <div
            v-for="item in segmentSummary"
            :key="item.label"
            class="segment-item"
            :class="{ active: activeSegment === item.label }"
            @click="activeSegment = activeSegment === item.label ? 'ALL' : item.label"
          >
            <div class="segment-top">
              <div class="segment-name">
                <span class="segment-dot" :style="{ background: segmentColor(item.label) }"></span>
                {{ item.label }}
              </div>
              <div class="segment-count">{{ item.count }} 人</div>
            </div>
            <div class="segment-metrics">
              <span>近购 {{ item.avgRecency }} 天</span>
              <span>频次 {{ item.avgFrequency }}</span>
              <span>金额 ￥{{ item.avgMonetary }}</span>
            </div>
            <div class="segment-progress">
              <div
                class="segment-progress-bar"
                :style="{ width: `${totalMembers ? (item.count / totalMembers) * 100 : 0}%`, background: segmentColor(item.label) }"
              ></div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="panel-header">
              <span>RFM 散点分布</span>
              <el-radio-group v-model="activeSegment" size="small">
                <el-radio-button label="ALL">全部</el-radio-button>
                <el-radio-button
                  v-for="item in segmentSummary"
                  :key="item.label"
                  :label="item.label"
                >
                  {{ shortSegmentLabel(item.label) }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="scatterChartRef" class="chart-view"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="content-row">
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>客群人数分布</span>
              <span class="panel-subtitle">当前选择时期的客群规模</span>
            </div>
          </template>
          <div ref="barChartRef" class="chart-view small"></div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>会员明细</span>
              <span class="panel-subtitle">{{ activeSegment === 'ALL' ? '全部客群' : activeSegment }}</span>
            </div>
          </template>

          <el-table :data="tableRows" border stripe height="360">
            <el-table-column prop="memberName" label="会员" min-width="120" />
            <el-table-column prop="segmentLabel" label="客群" min-width="140" />
            <el-table-column prop="recencyDays" label="最近消费(天)" width="110" />
            <el-table-column prop="frequency" label="消费频次" width="90" />
            <el-table-column prop="monetary" label="累计消费" width="120">
              <template #default="{ row }">￥{{ Number(row.monetary || 0).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column label="R/F/M" min-width="100">
              <template #default="{ row }">
                {{ row.rLevel }}/{{ row.fLevel }}/{{ row.mLevel }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { getRfmData } from '../../api/analysis'

const scatterChartRef = ref(null)
const barChartRef = ref(null)
const activeSegment = ref('ALL')
const selectedMonth = ref('ALL')
const availableMonths = ref([])
const totalMembers = ref(0)
const segments = ref([])
const segmentSummary = ref([])

let scatterChart
let barChart

const filteredSegments = computed(() => {
  if (activeSegment.value === 'ALL') return segments.value
  return segments.value.filter((item) => item.segmentLabel === activeSegment.value)
})

const highValueRate = computed(() => {
  const highValueCount = segmentSummary.value
    .filter((item) => ['重要价值客户', '重要发展客户'].includes(item.label))
    .reduce((sum, item) => sum + item.count, 0)
  return totalMembers.value ? ((highValueCount / totalMembers.value) * 100).toFixed(1) : '0.0'
})

const averageFrequency = computed(() => {
  if (!segments.value.length) return '0.0'
  const total = segments.value.reduce((sum, item) => sum + Number(item.frequency || 0), 0)
  return (total / segments.value.length).toFixed(1)
})

const averageMonetary = computed(() => {
  if (!segments.value.length) return '0.00'
  const total = segments.value.reduce((sum, item) => sum + Number(item.monetary || 0), 0)
  return (total / segments.value.length).toFixed(2)
})

const tableRows = computed(() =>
  [...filteredSegments.value].sort((a, b) => Number(b.monetary || 0) - Number(a.monetary || 0))
)

function segmentColor(label) {
  if (label.includes('价值')) return '#0f766e'
  if (label.includes('保持')) return '#d97706'
  if (label.includes('发展')) return '#2563eb'
  if (label.includes('挽留')) return '#dc2626'
  return '#64748b'
}

function shortSegmentLabel(label) {
  return label.replace('客户', '')
}

function renderScatterChart() {
  if (!scatterChartRef.value) return
  if (!scatterChart) scatterChart = echarts.init(scatterChartRef.value)

  const scatterData = filteredSegments.value.map((item) => [
    Number(item.recencyDays || 0),
    Number(item.frequency || 0),
    Number(item.monetary || 0),
    item.memberName || item.memberId || '未知会员',
    item.segmentLabel,
    Number(item.rLevel || 0),
    Number(item.fLevel || 0),
    Number(item.mLevel || 0)
  ])

  scatterChart.setOption({
    grid: { left: 52, right: 24, top: 70, bottom: 56 },
    tooltip: {
      formatter(param) {
        const value = param.value
        return `
          <div style="padding: 4px 6px;">
            <div style="font-weight: 700; margin-bottom: 6px;">${value[3]}</div>
            <div>客群：${value[4]}</div>
            <div>最近消费：${value[0]} 天前</div>
            <div>消费频次：${value[1]} 次</div>
            <div>累计消费：￥${Number(value[2] || 0).toFixed(2)}</div>
            <div>R/F/M：${value[5]}/${value[6]}/${value[7]}</div>
          </div>
        `
      }
    },
    xAxis: {
      type: 'value',
      name: 'R 最近消费天数',
      nameLocation: 'middle',
      nameGap: 32,
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.18)' } }
    },
    yAxis: {
      type: 'value',
      name: 'F 消费频次',
      nameLocation: 'middle',
      nameGap: 42,
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.18)' } }
    },
    series: [
      {
        type: 'scatter',
        data: scatterData,
        symbolSize(data) {
          return Math.max(18, Math.sqrt(Number(data[2] || 0)) * 0.6)
        },
        itemStyle: {
          color(param) {
            return segmentColor(param.value[4])
          },
          opacity: 0.85,
          shadowBlur: 14,
          shadowColor: 'rgba(15, 23, 42, 0.14)'
        }
      }
    ]
  })
}

function renderBarChart() {
  if (!barChartRef.value) return
  if (!barChart) barChart = echarts.init(barChartRef.value)

  barChart.setOption({
    grid: { left: 20, right: 16, top: 10, bottom: 36, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: segmentSummary.value.map((item) => shortSegmentLabel(item.label)),
      axisLabel: { interval: 0 }
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        type: 'bar',
        barWidth: 26,
        data: segmentSummary.value.map((item) => ({
          value: item.count,
          itemStyle: {
            color: segmentColor(item.label),
            borderRadius: [8, 8, 0, 0]
          }
        }))
      }
    ]
  })
}

async function loadData() {
  const result = await getRfmData(selectedMonth.value)
  totalMembers.value = Number(result.data?.totalMembers || 0)
  segments.value = result.data?.segments || []
  segmentSummary.value = result.data?.segmentSummary || []
  availableMonths.value = (result.data?.availableMonths || []);

  if (!segmentSummary.value.some((item) => item.label === activeSegment.value)) {
    activeSegment.value = 'ALL'
  }

  await nextTick()
  renderScatterChart()
  renderBarChart()
}

function handleResize() {
  scatterChart?.resize()
  barChart?.resize()
}

watch(activeSegment, () => {
  renderScatterChart()
})

onMounted(async () => {
  await loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  scatterChart?.dispose()
  barChart?.dispose()
})
</script>

<style scoped>
.rfm-page {
  padding: 10px;
}

.toolbar-row,
.overview-row,
.content-row {
  margin-bottom: 18px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toolbar-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.toolbar-subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
}

.overview-card {
  min-height: 132px;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.14), transparent 36%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.overview-label {
  color: #64748b;
  font-size: 13px;
}

.overview-value {
  margin: 14px 0 10px;
  font-size: 32px;
  line-height: 1;
  font-weight: 700;
  color: #0f172a;
}

.overview-note {
  font-size: 12px;
  color: #94a3b8;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-subtitle {
  color: #94a3b8;
  font-size: 12px;
}

.segment-card {
  min-height: 100%;
}

.segment-item {
  padding: 14px 14px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.segment-item:hover,
.segment-item.active {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.26);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.segment-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.segment-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
}

.segment-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.segment-count {
  font-weight: 700;
  color: #1e293b;
}

.segment-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 10px;
}

.segment-progress {
  height: 7px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.segment-progress-bar {
  height: 100%;
  border-radius: inherit;
}

.chart-card {
  min-height: 100%;
}

.chart-view {
  width: 100%;
  height: 420px;
}

.chart-view.small {
  height: 360px;
}
</style>
