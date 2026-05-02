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

async function getAllPagedRecords(path, params = {}) {
  const pageSize = 200
  let pageNum = 1
  let total = Infinity
  const records = []

  while (records.length < total) {
    const result = await request.get(path, {
      params: {
        ...params,
        pageNum,
        pageSize
      }
    })

    const pageData = result.data || {}
    const pageRecords = pageData.records || []
    total = Number(pageData.total || pageRecords.length || 0)
    records.push(...pageRecords)

    if (!pageRecords.length || pageRecords.length < pageSize) {
      break
    }

    pageNum += 1
  }

  return records
}

function buildLifecycleTrendSeries(trendMap, categories) {
  return categories.map((date) => {
    const rawValue = trendMap?.[date]
    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return null
    }
    return Number(rawValue || 0)
  })
}

function getSegmentLabel(item) {
  const r = Number(item.rLevel || 0)
  const f = Number(item.fLevel || 0)
  const m = Number(item.mLevel || 0)

  if (r >= 4 && f >= 4 && m >= 4) return '重要价值客户'
  if (r >= 4 && f <= 2 && m >= 4) return '重要发展客户'
  if (r >= 2 && f >= 4 && m <= 2) return '重要保持客户'
  if (r <= 2 && f >= 4 && m >= 4) return '重要挽留客户'
  return '一般价值客户'
}

export async function getRfmStartDate() {
  const result = await request.get('/v1/analysis/start-date')
  return result.data || ''
}

export async function getRfmData(selectedMonth = 'ALL') {
  const params = {}
  if (selectedMonth && selectedMonth !== 'ALL') {
    params.date = selectedMonth
  }

  const result = await request.get('/v1/analysis/rfm', { params })

  const rawSegments = result.data?.segments || []
  const totalMembers = Number(result.data?.totalMembers || 0)

  const segments = rawSegments.map((item) => ({
    ...item,
    monetary: Number(item.monetary || 0),
    frequency: Number(item.frequency || 0),
    recencyDays: Number(item.recencyDays || 0),
    rLevel: Number(item.rLevel || 0),
    fLevel: Number(item.fLevel || 0),
    mLevel: Number(item.mLevel || 0),
    segmentLabel: getSegmentLabel(item)
  }))

  const segmentSummaryMap = new Map()
  segments.forEach((item) => {
    const summary = segmentSummaryMap.get(item.segmentLabel) || {
      label: item.segmentLabel,
      count: 0,
      avgRecency: 0,
      avgFrequency: 0,
      avgMonetary: 0
    }

    summary.count += 1
    summary.avgRecency += item.recencyDays
    summary.avgFrequency += item.frequency
    summary.avgMonetary += item.monetary
    segmentSummaryMap.set(item.segmentLabel, summary)
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
    code: 200,
    message: '操作成功',
    data: {
      totalMembers,
      segments,
      segmentSummary
    }
  }
}

export async function getMemberCategory(date) {
  const result = await request.get('/v1/analysis/category', {
    params: { date }
  })
  
  const categories = result.data || []
  const activeCount = Number(categories.find(item => item.category === '活跃会员')?.count || 0)
  const silentCount = Number(categories.find(item => item.category === '沉默会员')?.count || 0)
  const lostCount = Number(categories.find(item => item.category === '流失会员')?.count || 0)
  const totalMembers = activeCount + silentCount + lostCount

  return {
    ...result,
    data: {
      totalMembers,
      activeCount,
      silentCount,
      lostCount,
      distribution: categories.map(item => ({
        name: item.category.replace('会员', ''),
        value: Number(item.count || 0)
      }))
    }
  }
}

export async function getMemberGrowth(date) {
  const result = await request.get('/v1/analysis/growth', {
    params: { date }
  })
  
  const growthData = result.data || []
  const categories = growthData.map(item => item.date)
  const newMember = growthData.map(item => Number(item.count || 0))
  const newMemberTotal = newMember.reduce((sum, value) => sum + value, 0)

  return {
    ...result,
    data: {
      categories,
      newMember,
      newMemberTotal,
      growthData
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
