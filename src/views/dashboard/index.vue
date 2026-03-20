<template>
  <div>
    <div class="page-header">
      <div>
        <h2 class="page-title">系统概览</h2>
        <p class="page-subtitle">汇总核心业务数据，便于快速确认系统运行状态。</p>
      </div>
      <el-button :loading="loading" @click="loadData">刷新数据</el-button>
    </div>

    <div class="stat-grid">
      <el-card v-for="item in statCards" :key="item.label" class="page-card stat-card">
        <div class="stat-label">{{ item.label }}</div>
        <div class="stat-value">{{ item.value }}</div>
        <div class="stat-desc">{{ item.desc }}</div>
      </el-card>
    </div>

    <el-row :gutter="16" class="chart-row">
      <el-col :lg="16" :xs="24">
        <el-card class="page-card chart-card">
          <template #header>最近消费金额走势</template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <el-card class="page-card chart-card">
          <template #header>会员等级分布</template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="page-card latest-card">
      <template #header>最新消费记录</template>
      <el-table :data="recentConsumptions" v-loading="loading" border>
        <el-table-column prop="memberId" label="会员 ID" min-width="120" />
        <el-table-column prop="storeId" label="门店 ID" min-width="120" />
        <el-table-column label="消费金额" min-width="120">
          <template #default="{ row }">¥ {{ formatCurrency(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="pointsEarned" label="获得积分" min-width="100" />
        <el-table-column prop="consumeTime" label="消费时间" min-width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { getMembers, getLevels, getConsumptions } from '../../api/member'
import { getCoupons, getMemberCoupons, getPointRules } from '../../api/marketing'
import { getStores, getAdmins } from '../../api/system'
import { normalizePageData, formatCurrency } from '../../utils/format'

const loading = ref(false)
const lineChartRef = ref()
const pieChartRef = ref()
const recentConsumptions = ref([])
const summary = ref({
  members: 0,
  levels: 0,
  coupons: 0,
  issuedCoupons: 0,
  pointRules: 0,
  stores: 0,
  admins: 0,
  revenue: 0
})

let lineChart
let pieChart

const statCards = computed(() => [
  { label: '会员总数', value: summary.value.members, desc: `会员等级 ${summary.value.levels} 个` },
  { label: '累计消费额', value: `¥ ${formatCurrency(summary.value.revenue)}`, desc: '基于最近拉取的消费记录汇总' },
  { label: '优惠券发放', value: summary.value.issuedCoupons, desc: `优惠券模板 ${summary.value.coupons} 张` },
  { label: '系统配置', value: summary.value.stores + summary.value.admins, desc: `门店 ${summary.value.stores} / 管理员 ${summary.value.admins}` }
])

const renderCharts = async () => {
  await nextTick()
  if (!lineChartRef.value || !pieChartRef.value) return

  if (!lineChart) lineChart = echarts.init(lineChartRef.value)
  if (!pieChart) pieChart = echarts.init(pieChartRef.value)

  const lineSource = [...recentConsumptions.value]
    .reverse()
    .map((item) => [item.consumeTime?.slice(0, 10) || '-', Number(item.amount || 0)])

  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: lineSource.map((item) => item[0]) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        smooth: true,
        data: lineSource.map((item) => item[1]),
        areaStyle: {},
        itemStyle: { color: '#0ea5e9' }
      }
    ]
  })

  const levelRows = summary.value.levelRows || []
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['38%', '72%'],
        data: levelRows.map((item) => ({ name: item.name, value: item.memberCount || 0 }))
      }
    ]
  })
}

const handleResize = () => {
  lineChart?.resize()
  pieChart?.resize()
}

const loadData = async () => {
  loading.value = true
  try {
    const [memberRes, levelRes, consumptionRes, couponRes, memberCouponRes, pointRuleRes, storeRes, adminRes] =
      await Promise.all([
        getMembers({ pageNum: 1, pageSize: 8 }),
        getLevels(),
        getConsumptions({ pageNum: 1, pageSize: 8 }),
        getCoupons({ pageNum: 1, pageSize: 1 }),
        getMemberCoupons({ pageNum: 1, pageSize: 1 }),
        getPointRules(),
        getStores({ pageNum: 1, pageSize: 1 }),
        getAdmins({ pageNum: 1, pageSize: 1 })
      ])

    const memberPage = normalizePageData(memberRes.data)
    const consumptionPage = normalizePageData(consumptionRes.data)
    const couponPage = normalizePageData(couponRes.data)
    const memberCouponPage = normalizePageData(memberCouponRes.data)
    const storePage = normalizePageData(storeRes.data)
    const adminPage = normalizePageData(adminRes.data)

    recentConsumptions.value = consumptionPage.records || []
    summary.value = {
      members: memberPage.total,
      levels: (levelRes.data || []).length,
      coupons: couponPage.total,
      issuedCoupons: memberCouponPage.total,
      pointRules: (pointRuleRes.data || []).length,
      stores: storePage.total,
      admins: adminPage.total,
      revenue: (consumptionPage.records || []).reduce((sum, item) => sum + Number(item.amount || 0), 0),
      levelRows: (levelRes.data || []).map((item) => ({
        ...item,
        memberCount: Number(item.memberCount || 0)
      }))
    }

    renderCharts()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.stat-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 252, 0.96));
}

.stat-label {
  color: #64748b;
}

.stat-value {
  margin: 12px 0;
  font-size: 30px;
  font-weight: 800;
  color: #0f172a;
}

.stat-desc {
  color: #94a3b8;
}

.chart-row {
  margin-top: 18px;
}

.chart {
  height: 320px;
}

.latest-card {
  margin-top: 18px;
}
</style>
