<template>
  <div class="lifecycle-page">
    <el-row :gutter="18" class="summary-row">
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-label">会员总量</div>
          <div class="summary-value">{{ lifecycle.totalMembers }}</div>
          <div class="summary-note">当前生命周期分析样本</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card active-card">
          <div class="summary-label">活跃会员</div>
          <div class="summary-value">{{ lifecycle.activeCount }}</div>
          <div class="summary-note">近期仍有消费行为</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card silent-card">
          <div class="summary-label">沉睡会员</div>
          <div class="summary-value">{{ lifecycle.silentCount }}</div>
          <div class="summary-note">未流失，但活跃不足</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card lost-card">
          <div class="summary-label">流失会员</div>
          <div class="summary-value">{{ lifecycle.lostCount }}</div>
          <div class="summary-note">需重点召回的客群</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="18" class="content-row">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>生命周期趋势</span>
              <el-radio-group v-model="period" size="small" @change="loadData">
                <el-radio-button label="DAY">按日</el-radio-button>
                <el-radio-button label="MONTH">按月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-view"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="panel-header">
              <span>会员状态分布</span>
              <span class="panel-subtitle">按当前系统可识别状态展示</span>
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
              <span>运营解读</span>
            </div>
          </template>
          <div class="insight-item">
            <div class="insight-title">新增转化</div>
            <div class="insight-desc">
              当前统计周期内新增会员共 <strong>{{ lifecycle.newMemberTotal }}</strong> 人。
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-title">会员健康度</div>
            <div class="insight-desc">
              活跃率 <strong>{{ activeRate }}%</strong>，流失率 <strong>{{ lostRate }}%</strong>。
            </div>
          </div>
          <div class="insight-item">
            <div class="insight-title">召回优先级</div>
            <div class="insight-desc">
              沉睡与流失会员合计 <strong>{{ lifecycle.silentCount + lifecycle.lostCount }}</strong> 人，建议配合优惠券与积分触达。
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="insight-card">
          <template #header>
            <div class="panel-header">
              <span>生命周期建议</span>
            </div>
          </template>
          <div class="action-item">
            <div class="action-tag active-tag">活跃会员</div>
            <div class="action-text">适合通过积分规则和等级权益持续提升复购频次。</div>
          </div>
          <div class="action-item">
            <div class="action-tag silent-tag">沉睡会员</div>
            <div class="action-text">更适合做限时优惠、唤醒短信和低门槛券包。</div>
          </div>
          <div class="action-item">
            <div class="action-tag lost-tag">流失会员</div>
            <div class="action-text">建议建立独立召回活动，并结合最近一次消费时间做分层召回。</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getLifecycleData } from '../../api/analysis'

const period = ref('DAY')
const lifecycle = ref({
  totalMembers: 0,
  activeCount: 0,
  lostCount: 0,
  silentCount: 0,
  newMemberTotal: 0,
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
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  if (!distributionChart) {
    distributionChart = echarts.init(distributionChartRef.value)
  }

  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增会员', '活跃会员', '流失会员'] },
    grid: { left: 26, right: 20, bottom: 26, top: 40, containLabel: true },
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
        name: '活跃会员',
        type: 'line',
        smooth: true,
        data: lifecycle.value.trend.activeMember,
        itemStyle: { color: '#0f766e' }
      },
      {
        name: '流失会员',
        type: 'line',
        smooth: true,
        data: lifecycle.value.trend.churnMember,
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
        labelLine: { show: false },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
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
        })),
        label: {
          formatter: '{b}\n{d}%',
          show: false, 
          position: 'center' 
        }
      }
    ]
  })
}

async function loadData() {
  const result = await getLifecycleData(period.value)
  lifecycle.value = result.data
  renderCharts()
}

function handleResize() {
  trendChart?.resize()
  distributionChart?.resize()
}

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

.summary-row,
.content-row {
  margin-bottom: 18px;
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
