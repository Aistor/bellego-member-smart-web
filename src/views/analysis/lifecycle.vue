<template>
  <div class="lifecycle-page">
    <el-row :gutter="18" class="toolbar-row">
      <el-col :span="24">
        <el-card shadow="never">
          <div class="toolbar">
            <div>
              <div class="toolbar-title">会员生命周期</div>
              <div class="toolbar-subtitle">默认展示全部时期趋势，可切换查看某个月的新增变化</div>
            </div>
            <el-select v-model="selectedMonth" style="width: 180px">
              <el-option label="全部时期" value="ALL" />
              <el-option
                v-for="month in lifecycle.availableMonths"
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
        <el-card shadow="never" class="summary-card">
          <div class="summary-label">{{ selectedMonth === 'ALL' ? '全部时期新增会员' : `${selectedMonth} 新增会员` }}</div>
          <div class="summary-value">{{ selectedPeriodNewMembers }}</div>
          <div class="summary-note">按创建时间趋势汇总</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card active-card">
          <div class="summary-label">当前活跃会员</div>
          <div class="summary-value">{{ lifecycle.activeCount }}</div>
          <div class="summary-note">后端返回当前快照</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card silent-card">
          <div class="summary-label">当前沉睡会员</div>
          <div class="summary-value">{{ lifecycle.silentCount }}</div>
          <div class="summary-note">当前快照口径</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card lost-card">
          <div class="summary-label">当前流失会员</div>
          <div class="summary-value">{{ lifecycle.lostCount }}</div>
          <div class="summary-note">当前快照口径</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="content-row">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>新增趋势</span>
              <span class="panel-subtitle">{{ selectedMonth === 'ALL' ? '全部时期' : `${selectedMonth} 明细` }}</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-view"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>当前会员状态分布</span>
              <span class="panel-subtitle">当前系统快照</span>
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
            <div class="insight-title">新增表现</div>
            <div class="insight-desc">
              {{ selectedMonth === 'ALL' ? '全部时期内' : `${selectedMonth} 内` }}新增会员共
              <strong>{{ selectedPeriodNewMembers }}</strong> 人。
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-title">当前健康度</div>
            <div class="insight-desc">
              活跃率 <strong>{{ activeRate }}%</strong>，流失率 <strong>{{ lostRate }}%</strong>。
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-title">说明</div>
            <div class="insight-desc">
              月份切换当前只影响“新增趋势”和所选时期新增人数；活跃、沉睡、流失仍使用后端当前快照。
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
            <div class="action-text">优先用等级权益和积分激励提高复购频次。</div>
          </div>
          <div class="action-item">
            <div class="action-tag silent-tag">沉睡会员</div>
            <div class="action-text">适合低门槛券、限时唤醒活动和节日触达。</div>
          </div>
          <div class="action-item">
            <div class="action-tag lost-tag">流失会员</div>
            <div class="action-text">建议按最近消费时间再做细分召回，控制补贴成本。</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { getLifecycleData } from '../../api/analysis'

const selectedMonth = ref('ALL')
const lifecycle = ref({
  totalMembers: 0,
  activeCount: 0,
  lostCount: 0,
  silentCount: 0,
  newMemberTotal: 0,
  availableMonths: [],
  trend: {
    categories: [],
    newMember: [],
    activeMember: [],
    churnMember: []
  },
  distribution: []
})

const trendChartRef = ref(null)
const distributionChartRef = ref(null)

let trendChart
let distributionChart

const filteredTrend = computed(() => {
  if (selectedMonth.value === 'ALL') {
    return lifecycle.value.trend
  }

  const indexes = lifecycle.value.trend.categories
    .map((date, index) => ({ date, index }))
    .filter((item) => String(item.date).startsWith(selectedMonth.value))
    .map((item) => item.index)

  return {
    categories: indexes.map((index) => lifecycle.value.trend.categories[index]),
    newMember: indexes.map((index) => lifecycle.value.trend.newMember[index]),
    activeMember: indexes.map((index) => lifecycle.value.trend.activeMember[index]),
    churnMember: indexes.map((index) => lifecycle.value.trend.churnMember[index])
  }
})

const selectedPeriodNewMembers = computed(() =>
  filteredTrend.value.newMember.reduce((sum, value) => sum + Number(value || 0), 0)
)

const activeRate = computed(() =>
  lifecycle.value.totalMembers
    ? ((lifecycle.value.activeCount / lifecycle.value.totalMembers) * 100).toFixed(1)
    : '0.0'
)

const lostRate = computed(() =>
  lifecycle.value.totalMembers
    ? ((lifecycle.value.lostCount / lifecycle.value.totalMembers) * 100).toFixed(1)
    : '0.0'
)

function renderCharts() {
  if (!trendChart) trendChart = echarts.init(trendChartRef.value)
  if (!distributionChart) distributionChart = echarts.init(distributionChartRef.value)

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增会员', '活跃会员', '流失会员'], bottom: 0 },
    grid: { left: 26, right: 20, bottom: 26, top: 40, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: filteredTrend.value.categories
    },
    yAxis: { type: 'value', name: '人数' },
    series: [
      {
        name: '新增会员',
        type: 'line',
        smooth: true,
        data: filteredTrend.value.newMember,
        itemStyle: { color: '#2563eb' },
        areaStyle: { color: 'rgba(37, 99, 235, 0.08)' }
      },
      {
        name: '活跃会员',
        type: 'line',
        smooth: true,
        data: filteredTrend.value.activeMember,
        itemStyle: { color: '#0f766e' }
      },
      {
        name: '流失会员',
        type: 'line',
        smooth: true,
        data: filteredTrend.value.churnMember,
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
          borderWidth: 1.5
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
  const result = await getLifecycleData('DAY')
  lifecycle.value = result.data
  renderCharts()
}

function handleResize() {
  trendChart?.resize()
  distributionChart?.resize()
}

watch(selectedMonth, () => {
  renderCharts()
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
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8px;
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
