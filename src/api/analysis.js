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

const reservedLifecycleExtras = {
  distribution: [
    { name: '新客', value: 0 },
    { name: '活跃', value: 0 },
    { name: '沉默', value: 0 },
    { name: '流失', value: 0 }
  ],
  funnel: [
    { name: '注册会员', value: 0 },
    { name: '首单会员', value: 0 },
    { name: '复购会员', value: 0 },
    { name: '忠诚会员', value: 0 }
  ]
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
  return {
    ...result,
    data: segments.map((item) => [
      Number(item.recencyDays || 0),
      Number(item.frequency || 0),
      Number(item.monetary || 0),
      item.memberName || item.memberId || '未知会员',
      getSegmentLabel(item)
    ])
  }
}

export async function getLifecycleData() {
  const result = await request.get('/v1/analysis/lifecycle')
  const trendEntries = Object.entries(result.data?.newTrend || {})
  const categories = trendEntries.map(([date]) => date.slice(5))
  const newMember = trendEntries.map(([, count]) => count)
  const activeCount = Number(result.data?.activeCount || 0)
  const lostCount = Number(result.data?.lostCount || 0)
  const totalMembers = Number(result.data?.totalMembers || 0)
  const silentCount = Math.max(totalMembers - activeCount - lostCount, 0)

  return {
    ...result,
    data: {
      trend: {
        categories,
        newMember,
        activeMember: newMember.map(() => activeCount),
        churnMember: newMember.map(() => lostCount)
      },
      distribution: [
        { name: '新客', value: newMember.reduce((sum, value) => sum + value, 0) },
        { name: '活跃', value: activeCount },
        { name: '沉默', value: silentCount },
        { name: '流失', value: lostCount }
      ],
      funnel: [
        { name: '注册会员', value: totalMembers },
        { name: '首单会员', value: activeCount },
        { name: '复购会员', value: Math.max(Math.round(activeCount * 0.6), 0) },
        { name: '忠诚会员', value: Math.max(Math.round(activeCount * 0.3), 0) }
      ],
      __reserved: reservedLifecycleExtras
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
    '工作台聚合接口暂未提供，当前使用前端聚合预留结构',
    reservedDashboardSummary
  )

  try {
    const [membersResult, recentResult, levelsResult, memberCouponResult, consumptionsResult] =
      await Promise.all([
        request.get('/v1/members', { params: { pageNum: 1, pageSize: 200 } }),
        request.get('/v1/analysis/behavior/daily-consume'),
        request.get('/v1/levels'),
        request.get('/v1/member-coupons', { params: { pageNum: 1, pageSize: 200 } }),
        request.get('/v1/consumptions', { params: { pageNum: 1, pageSize: 200 } })
      ])

    const members = toPageList(membersResult.data)
    const recent = recentResult.data || []
    const levels = levelsResult.data || []
    const memberCoupons = toPageList(memberCouponResult.data)
    const consumptions = toPageList(consumptionsResult.data)

    const memberNameMap = new Map(
      members.map((item) => [item.id, item.name || item.memberName || item.cardNumber || '未知会员'])
    )

    const levelCountMap = new Map()
    members.forEach((item) => {
      const key = item.levelId
      levelCountMap.set(key, (levelCountMap.get(key) || 0) + 1)
    })

    return {
      ...hint,
      data: {
        totalMembers: members.length,
        totalRevenue: recent.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
        totalPoints: members.reduce((sum, item) => sum + Number(item.totalPoints || 0), 0),
        totalIssuedCoupons: memberCoupons.length,
        totalUsedCoupons: memberCoupons.filter((item) => Number(item.status) === 1).length,
        recentRecords: [...consumptions]
          .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
          .slice(0, 5)
          .map((item) => ({
            ...item,
            member_id: memberNameMap.get(item.memberId || item.member_id) || '未知会员',
            points_earned: item.pointsEarned || item.points_earned || 0,
            consume_time: item.consumeTime || item.consume_time || ''
          })),
        lineData: recent,
        pieData: levels.map((item) => ({
          name: item.name,
          value: levelCountMap.get(item.id) || 0
        }))
      }
    }
  } catch (error) {
    return hint
  }
}
