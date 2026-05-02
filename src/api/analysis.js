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

function getPeriodMonthList(dateList) {
  return [...new Set(dateList.filter(Boolean).map((date) => String(date).slice(0, 7)))].sort().reverse()
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

function buildScoreMap(values, reverse = false) {
  if (!values.length) return new Map()

  const sorted = [...values].sort((a, b) => a - b)
  const thresholdAt = (percent) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * percent))]
  const thresholds = [thresholdAt(0.2), thresholdAt(0.4), thresholdAt(0.6), thresholdAt(0.8)]

  const getScore = (value) => {
    if (value <= thresholds[0]) return reverse ? 5 : 1
    if (value <= thresholds[1]) return reverse ? 4 : 2
    if (value <= thresholds[2]) return reverse ? 3 : 3
    if (value <= thresholds[3]) return reverse ? 2 : 4
    return reverse ? 1 : 5
  }

  return new Map(values.map((value) => [value, getScore(value)]))
}

export async function getRfmData(selectedMonth = 'ALL') {
  const [members, consumptions] = await Promise.all([
    getAllPagedRecords('/v1/members'),
    getAllPagedRecords('/v1/consumptions')
  ])

  const availableMonths = getPeriodMonthList(consumptions.map((item) => item.consumeTime))
  const filteredConsumptions =
    selectedMonth && selectedMonth !== 'ALL'
      ? consumptions.filter((item) => String(item.consumeTime || '').startsWith(selectedMonth))
      : consumptions

  const groupedByMember = new Map()
  filteredConsumptions.forEach((item) => {
    const memberId = item.memberId
    const group = groupedByMember.get(memberId) || []
    group.push(item)
    groupedByMember.set(memberId, group)
  })

  const periodEndDate =
    selectedMonth && selectedMonth !== 'ALL'
      ? new Date(`${selectedMonth}-31T23:59:59`)
      : new Date()

  const memberMap = new Map(members.map((item) => [item.id, item]))

  const rows = [...groupedByMember.entries()].map(([memberId, records]) => {
    const lastConsumeTime = [...records]
      .map((item) => new Date(item.consumeTime))
      .sort((a, b) => b - a)[0]

    const monetary = records.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const frequency = records.length
    const recencyDays = Math.max(
      0,
      Math.ceil((periodEndDate.getTime() - lastConsumeTime.getTime()) / (1000 * 60 * 60 * 24))
    )
    const member = memberMap.get(memberId) || {}

    return {
      memberId,
      memberName: member.name || records[0]?.memberName || '未知会员',
      recencyDays,
      frequency,
      monetary: Number(monetary.toFixed(2))
    }
  })

  const recencyScoreMap = buildScoreMap(rows.map((item) => item.recencyDays), true)
  const frequencyScoreMap = buildScoreMap(rows.map((item) => item.frequency))
  const monetaryScoreMap = buildScoreMap(rows.map((item) => item.monetary))

  const segments = rows.map((item) => {
    const rLevel = recencyScoreMap.get(item.recencyDays) || 1
    const fLevel = frequencyScoreMap.get(item.frequency) || 1
    const mLevel = monetaryScoreMap.get(item.monetary) || 1

    return {
      ...item,
      rLevel,
      fLevel,
      mLevel,
      segmentLabel: getSegmentLabel({ rLevel, fLevel, mLevel })
    }
  })

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
      totalMembers: segments.length,
      availableMonths,
      selectedMonth,
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
