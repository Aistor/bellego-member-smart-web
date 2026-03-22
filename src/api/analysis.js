import request from '../utils/request'

const reservedDashboardSummary = {
  totalMembers: 0,
  totalRevenue: 0,
  totalPoints: 0,
  totalIssuedCoupons: 0,
  totalUsedCoupons: 0,
  recentRecords: [],
  lineData: [],
  pieData: []
}

const reservedBehaviorRadar = {
  male: [45, 58, 72, 61, 55, 48],
  female: [62, 74, 56, 69, 64, 52]
}

function reservedResponse(message, data) {
  return {
    code: 200,
    message,
    data,
    __reserved: true
  }
}

function toPageList(payload) {
  if (Array.isArray(payload)) {
    return payload
  }
  return payload?.records || []
}

function getSegmentLabel(item) {
  const r = Number(item.rLevel || 0)
  const f = Number(item.fLevel || 0)
  const m = Number(item.mLevel || 0)

  if (r >= 4 && f >= 4 && m >= 4) return '重要价值客户'
  if (r <= 2 && f >= 4) return '重要保持客户'
  if (r >= 4 && (f >= 2 || m >= 3)) return '重要发展客户'
  if (r <= 2 && (f <= 2 || m <= 2)) return '重要挽留客户'
  return '一般价值客户'
}

export async function getRfmData() {
  const result = await request.get('/v1/analysis/rfm')
  const segments = result.data?.segments || []

  const segmentSummaryMap = new Map()
  segments.forEach((item) => {
    const label = getSegmentLabel(item)
    const summary = segmentSummaryMap.get(label) || {
      label,
      count: 0,
      avgRecency: 0,
      avgFrequency: 0,
      avgMonetary: 0
    }

    summary.count += 1
    summary.avgRecency += Number(item.recencyDays || 0)
    summary.avgFrequency += Number(item.frequency || 0)
    summary.avgMonetary += Number(item.monetary || 0)
    segmentSummaryMap.set(label, summary)
  })

  const segmentSummary = [...segmentSummaryMap.values()]
    .map((item) => ({
      ...item,
      avgRecency: item.count ? Math.round(item.avgRecency / item.count) : 0,
      avgFrequency: item.count ? Number((item.avgFrequency / item.count).toFixed(1)) : 0,
      avgMonetary: item.count ? Number((item.avgMonetary / item.count).toFixed(2)) : 0
    }))
    .sort((a, b) => b.count - a.count)

  return {
    ...result,
    data: {
      totalMembers: Number(result.data?.totalMembers || segments.length || 0),
      segments: segments.map((item) => ({
        ...item,
        segmentLabel: getSegmentLabel(item)
      })),
      scatterData: segments.map((item) => [
        Number(item.recencyDays || 0),
        Number(item.frequency || 0),
        Number(item.monetary || 0),
        item.memberName || item.memberId || '未知会员',
        getSegmentLabel(item),
        Number(item.rLevel || 0),
        Number(item.fLevel || 0),
        Number(item.mLevel || 0)
      ]),
      segmentSummary
    }
  }
}

export async function getLifecycleData(period = 'DAY') {
  const result = await request.get('/v1/analysis/lifecycle', {
    params: { period }
  })
  const trendEntries = Object.entries(result.data?.newTrend || {})
  const categories = trendEntries.map(([date]) => date)
  const newMember = trendEntries.map(([, count]) => Number(count || 0))
  const activeCount = Number(result.data?.activeCount || 0)
  const lostCount = Number(result.data?.lostCount || 0)
  const totalMembers = Number(result.data?.totalMembers || 0)
  const silentCount = Math.max(totalMembers - activeCount - lostCount, 0)

  return {
    ...result,
    data: {
      totalMembers,
      activeCount,
      lostCount,
      silentCount,
      newMemberTotal: newMember.reduce((sum, value) => sum + value, 0),
      trend: {
        categories,
        newMember,
        activeMember: newMember.map(() => activeCount),
        churnMember: newMember.map(() => lostCount)
      },
      distribution: [
        { name: '新增', value: newMember.reduce((sum, value) => sum + value, 0) },
        { name: '活跃', value: activeCount },
        { name: '沉默', value: silentCount },
        { name: '流失', value: lostCount }
      ],
      funnel: [
        { name: '注册会员', value: totalMembers },
        { name: '活跃会员', value: activeCount },
        { name: '复购会员', value: Math.max(Math.round(activeCount * 0.6), 0) },
        { name: '忠诚会员', value: Math.max(Math.round(activeCount * 0.3), 0) }
      ]
    }
  }
}

export async function getBehaviorData() {
  const [orderAmountResult, timeDistributionResult] = await Promise.all([
    request.get('/v1/analysis/behavior/order-amount'),
    request.get('/v1/analysis/behavior/time-distribution')
  ])

  const bucketMap = orderAmountResult.data?.buckets || {}
  const buckets = ['0-100', '101-300', '301-500', '500+']
  const distribution = timeDistributionResult.data?.distribution || {}
  const times = Object.keys(distribution).sort((a, b) => Number(a) - Number(b))

  return {
    code: 200,
    message: '操作成功',
    data: {
      orderAmountHistogram: buckets.map((key) => Number(bucketMap[key] || 0)),
      radar: reservedBehaviorRadar,
      hotTime: {
        times: times.map((hour) => `${hour.padStart(2, '0')}:00`),
        data: times.map((hour) => Number(distribution[hour] || 0))
      }
    }
  }
}

export async function getDashboardSummary() {
  const hint = reservedResponse(
    '当前仍无专用工作台聚合接口，使用已实现分析接口进行前端聚合',
    reservedDashboardSummary
  )

  try {
    const [
      membersResult,
      dailyConsumeResult,
      levelCountResult,
      memberCouponResult,
      consumptionsResult
    ] = await Promise.all([
      request.get('/v1/members', { params: { pageNum: 1, pageSize: 200 } }),
      request.get('/v1/analysis/behavior/daily-consume'),
      request.get('/v1/analysis/behavior/level-count'),
      request.get('/v1/member-coupons', { params: { pageNum: 1, pageSize: 200 } }),
      request.get('/v1/consumptions', { params: { pageNum: 1, pageSize: 200 } })
    ])

    const members = toPageList(membersResult.data)
    const dailyConsume = dailyConsumeResult.data || []
    const levelCounts = levelCountResult.data || []
    const memberCoupons = toPageList(memberCouponResult.data)
    const consumptions = toPageList(consumptionsResult.data)

    return {
      ...hint,
      data: {
        totalMembers: membersResult.data?.total || members.length,
        totalRevenue: dailyConsume.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
        totalPoints: members.reduce((sum, item) => sum + Number(item.totalPoints || 0), 0),
        totalIssuedCoupons: memberCoupons.length,
        totalUsedCoupons: memberCoupons.filter((item) => Number(item.status) === 1).length,
        recentRecords: [...consumptions]
          .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
          .slice(0, 5)
          .map((item) => ({
            ...item,
            memberName: item.memberName || '未知会员'
          })),
        lineData: dailyConsume,
        pieData: levelCounts.map((item) => ({
          name: item.levelName,
          value: Number(item.count || 0)
        }))
      }
    }
  } catch (error) {
    return hint
  }
}
