<template>
  <div>
    <div class="page-header">
      <div>
        <h2 class="page-title">系统概览</h2>
      </div>
      <el-button :loading="loading" @click="loadData">刷新数据</el-button>
    </div>

    <div class="stat-grid">
      <el-card v-for="item in statCards" :key="item.label" shadow="hover" class="page-card stat-card">
        <div class="stat-label">{{ item.label }}</div>
        <div class="stat-value">{{ item.value }}</div>
        <div class="stat-desc">{{ item.desc }}</div>
      </el-card>
    </div>

    <el-row :gutter="16" class="chart-row">
      <el-col :lg="16" :xs="24">
        <el-card class="page-card chart-card" shadow="hover">
          <template #header>近期营业额趋势</template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :lg="8" :xs="24">
        <el-card class="page-card chart-card" shadow="hover">
          <template #header>会员等级分布</template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="page-card latest-card" shadow="hover">
      <template #header>最新消费记录</template>
      <el-table :data="recentConsumptions" v-loading="loading" border stripe show-overflow-tooltip>
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
import { getMembers, getConsumptions, getRecentConsumptions, getLevelCount } from '../../api/member'
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
  { label: '会员总数', value: summary.value.members },
  { label: '累计营业额', value: `¥ ${formatCurrency(summary.value.revenue)}` },
  { label: '优惠券发放', value: summary.value.issuedCoupons },
  { label: '系统配置', value: summary.value.stores + summary.value.admins }
])

const renderCharts = async () => {
  await nextTick()
  if (!lineChartRef.value || !pieChartRef.value) return

  if (!lineChart) lineChart = echarts.init(lineChartRef.value)
  if (!pieChart) pieChart = echarts.init(pieChartRef.value)

  const lineSource = summary.value.recentConsumptions

  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: lineSource.map((item) => item.consumeDate), name: '日期' },
    yAxis: { type: 'value', name: '营业额 (元)' },
    series: [
      {
        type: 'line',
        smooth: true,
        data: lineSource.map((item) => item.totalAmount),
        areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24,144,255,0.8)' },
          { offset: 1, color: 'rgba(24,144,255,0.1)' }
        ])
      },
        itemStyle: { color: '#0ea5e9' }
      }
    ]
  })

  const levelRows = summary.value.levelRows || []
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['38%', '72%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: false,
        itemStyle: {             
          borderRadius: 8,  
          borderColor: '#fff',   
          borderWidth: 1         
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        labelLine: { show: false },
        data: levelRows.map((item) => ({ name: item.levelName, value: item.count || 0 }))
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
    const [memberRes, levelCountRes, recentConsumptionRes, consumptionRes, couponRes, memberCouponRes, pointRuleRes, storeRes, adminRes] =
      await Promise.all([
        getMembers({ pageNum: 1, pageSize: 8 }),
        getLevelCount(),
        getRecentConsumptions(),
        getConsumptions({ pageNum: 1, pageSize: 10 }),
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
      recentConsumptions: recentConsumptionRes.data || [],
      coupons: couponPage.total,
      issuedCoupons: memberCouponPage.total,
      pointRules: (pointRuleRes.data || []).length,
      stores: storePage.total,
      admins: adminPage.total,
      revenue: (consumptionPage.records || []).reduce((sum, item) => sum + Number(item.amount || 0), 0),
      levelRows: levelCountRes.data
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
