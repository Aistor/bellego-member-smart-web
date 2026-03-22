<template>
  <div class="lifecycle-page">
    <el-row :gutter="18" class="toolbar-row">
      <el-col :span="24">
        <el-card shadow="never">
          <div class="toolbar">
            <div>
              <div class="toolbar-title">会员生命周期</div>
              <div class="toolbar-subtitle">
                默认查看全部时期趋势，可切换到指定月份查看对应月底的生命周期快照
              </div>
            </div>
            <el-select v-model="selectedMonth" style="width: 180px">
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

    <el-row :gutter="18" class="summary-row">
      <el-col :span="6">
        <el-card shadow="never" class="summary-card total-card">
          <div class="summary-label">{{ snapshotLabel }}会员总量</div>
          <div class="summary-value">{{ lifecycle.totalMembers }}</div>
          <div class="summary-note">{{ snapshotNote }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card active-card">
          <div class="summary-label">{{ snapshotLabel }}活跃会员</div>
          <div class="summary-value">{{ lifecycle.activeCount }}</div>
          <div class="summary-note">距快照时间 30 天内有消费</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card silent-card">
          <div class="summary-label">{{ snapshotLabel }}沉默会员</div>
          <div class="summary-value">{{ lifecycle.silentCount }}</div>
          <div class="summary-note">距快照时间 31-90 天未消费</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card lost-card">
          <div class="summary-label">{{ snapshotLabel }}流失会员</div>
          <div class="summary-value">{{ lifecycle.lostCount }}</div>
          <div class="summary-note">超过 90 天未消费或从未消费</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="content-row">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>会员状态趋势</span>
              <span class="panel-subtitle">
                {{ selectedMonth === 'ALL' ? '全部时期趋势' : `${selectedMonth} 对应时期趋势` }}
              </span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-view"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>生命周期状态分布</span>
              <span class="panel-subtitle">{{ snapshotNote }}</span>
            </div>
          </template>
          <div ref="distributionChartRef" class="chart-view"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="content-row">
      <el-col :span="12">
        <el-card shadow="never" class="insight-card">
          <template #header>
            <div class="panel-header">
              <span>周期解读</span>
            </div>
          </template>
          <div class="insight-item">
            <div class="insight-title">新增会员</div>
            <div class="insight-desc">
              趋势区间内累计新增
              <strong>{{ lifecycle.newMemberTotal }}</strong>
              人，{{ selectedMonth === 'ALL' ? '当前查看的是最新快照表现。' : `当前快照月份为 ${lifecycle.month || selectedMonth}。` }}
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-title">会员健康度</div>
            <div class="insight-desc">
              活跃率 <strong>{{ activeRate }}%</strong>，沉默率 <strong>{{ silentRate }}%</strong>，流失率
              <strong>{{ lostRate }}%</strong>。
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-title">口径说明</div>
            <div class="insight-desc">
              生命周期卡片和分布图均使用后端返回的生命周期快照；切换月份后，页面会按该月份月底重新获取状态统计。
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="insight-card">
          <template #header>
            <div class="panel-header">
              <span>运营建议</span>
            </div>
          </template>
          <div class="action-item">
            <div class="action-tag active-tag">活跃会员</div>
            <div class="action-text">优先承接积分、等级权益和复购活动，继续放大高频消费价值。</div>
          </div>
          <div class="action-item">
            <div class="action-tag silent-tag">沉默会员</div>
            <div class="action-text">适合用限时优惠券、节日触达和轻提醒活动，尽快拉回到活跃区间。</div>
          </div>
          <div class="action-item">
            <div class="action-tag lost-tag">流失会员</div>
            <div class="action-text">建议结合最近一次消费时间与客单价做分层召回，避免无差别补贴。</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { getLifecycleData } from '../../api/analysis'

const selectedMonth = ref('ALL')
const availableMonths = ref([])
const lifecycle = ref({
  totalMembers: 0,
  activeCount: 0,
  lostCount: 0,
  silentCount: 0,
  newMemberTotal: 0,
  month: null,
  trend: {
    categories: [],
    newMember: [],
    silentMember: [],
    lostMember: []
  },
  distribution: []
})

const trendChartRef = ref(null)
const distributionChartRef = ref(null)

let trendChart
let distributionChart

const snapshotLabel = computed(() =>
  selectedMonth.value === 'ALL' ? '当前' : `${lifecycle.value.month || selectedMonth.value} `
)

const snapshotNote = computed(() =>
  selectedMonth.value === 'ALL'
    ? '当前系统快照'
    : `${lifecycle.value.month || selectedMonth.value} 月底快照`
)

const activeRate = computed(() =>
  lifecycle.value.totalMembers
    ? ((lifecycle.value.activeCount / lifecycle.value.totalMembers) * 100).toFixed(1)
    : '0.0'
)

const silentRate = computed(() =>
  lifecycle.value.totalMembers
    ? ((lifecycle.value.silentCount / lifecycle.value.totalMembers) * 100).toFixed(1)
    : '0.0'
)

const lostRate = computed(() =>
  lifecycle.value.totalMembers
    ? ((lifecycle.value.lostCount / lifecycle.value.totalMembers) * 100).toFixed(1)
    : '0.0'
)

function renderCharts() {
  if (!trendChartRef.value || !distributionChartRef.value) return
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)
  if (!distributionChart) distributionChart = echarts.init(distributionChartRef.value)

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增会员', '沉默会员', '流失会员'], bottom: 0 },
    grid: { left: 26, right: 20, bottom: 40, top: 40, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: lifecycle.value.trend.categories
    },
    yAxis: { type: 'value', name: '人数' },
    series: [
      {
        name: '新增会员',
        type: 'line',
        smooth: true,
        data: lifecycle.value.trend.newMember,
        itemStyle: { color: '#2563eb' },
        areaStyle: { color: 'rgba(37, 99, 235, 0.08)' }
      },
      {
        name: '沉默会员',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: lifecycle.value.trend.silentMember,
        itemStyle: { color: '#d97706' }
      },
      {
        name: '流失会员',
        type: 'line',
        smooth: true,
        connectNulls: false,
        data: lifecycle.value.trend.lostMember,
        itemStyle: { color: '#dc2626' }
      }
    ]
  })

  distributionChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '会员状态',
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '46%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: { show: false, position: 'center', formatter: '{b}\n{d}%' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: lifecycle.value.distribution.map((item) => ({
          ...item,
          itemStyle: {
            color:
              item.name === '活跃'
                ? '#0f766e'
                : item.name === '沉默'
                  ? '#d97706'
                  : item.name === '流失'
                    ? '#dc2626'
                    : '#2563eb'
          }
        }))
      }
    ]
  })
}

async function loadData() {
  const month = selectedMonth.value === 'ALL' ? '' : selectedMonth.value
  const result = await getLifecycleData('DAY', month)
  lifecycle.value = result.data

  if (!availableMonths.value.length) {
    availableMonths.value = result.data.availableMonths || []
  }

  await nextTick()
  renderCharts()
}

function handleResize() {
  trendChart?.resize()
  distributionChart?.resize()
}

watch(selectedMonth, async () => {
  await loadData()
})

onMounted(async () => {
  await loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  distributionChart?.dispose()
})
</script>

<style scoped>
.lifecycle-page {
  padding: 10px;
}

.toolbar-row,
.summary-row,
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

.summary-card {
  min-height: 128px;
}

.summary-label {
  color: #64748b;
  font-size: 13px;
}

.summary-value {
  margin: 14px 0 10px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
  color: #0f172a;
}

.summary-note {
  color: #94a3b8;
  font-size: 12px;
}

.total-card {
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
}

.active-card {
  background: linear-gradient(180deg, #ffffff 0%, #f2fbf9 100%);
}

.silent-card {
  background: linear-gradient(180deg, #ffffff 0%, #fff8ef 100%);
}

.lost-card {
  background: linear-gradient(180deg, #ffffff 0%, #fff3f2 100%);
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

.chart-view {
  width: 100%;
  height: 360px;
}

.insight-card {
  min-height: 100%;
}

.insight-item,
.action-item {
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.insight-item:last-child,
.action-item:last-child {
  border-bottom: 0;
}

.insight-title {
  margin-bottom: 8px;
  font-weight: 600;
  color: #0f172a;
}

.insight-desc,
.action-text {
  color: #64748b;
  line-height: 1.75;
}

.action-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
}

.active-tag {
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
}

.silent-tag {
  background: rgba(217, 119, 6, 0.1);
  color: #d97706;
}

.lost-tag {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}
</style>
