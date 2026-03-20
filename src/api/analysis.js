const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

const successResponse = (data) => ({
    code: 200,
    message: '操作成功',
    data
})

// === 分析模块图表数据模拟 API ===

export const getRfmData = async () => {
    await delay(400)
    // 模拟 RFM 数据 [Recency(最近消费天数), Frequency(消费频次), Monetary(消费金额), 会员名称, 客户类型]
    return successResponse([
        [5, 25, 5000, '张三', '重要价值客户'],
        [10, 15, 3000, '李四', '重要价值客户'],
        [60, 20, 4500, '王五', '重要保持客户'],
        [80, 18, 5200, '赵六', '重要保持客户'],
        [3, 2, 6000, '孙七', '重要发展客户'],
        [12, 5, 8000, '周八', '重要发展客户'],
        [90, 3, 4000, '吴九', '重要挽留客户'],
        [100, 1, 3500, '郑十', '重要挽留客户'],
        [2, 12, 800, '钱一', '一般价值客户'],
        [8, 10, 500, '陈二', '一般价值客户'],
        [45, 1, 150, '林三', '一般发展客户'],
        [120, 2, 200, '宋四', '一般挽留客户']
    ])
}

export const getLifecycleData = async () => {
    await delay(350)
    return successResponse({
        trend: {
            categories: ['03-01', '03-02', '03-03', '03-04', '03-05', '03-06', '03-07'],
            newMember: [120, 132, 101, 134, 90, 230, 210],
            activeMember: [220, 182, 191, 234, 290, 330, 310],
            churnMember: [15, 23, 20, 15, 19, 33, 41]
        },
        distribution: [
            { value: 1048, name: '新手期' },
            { value: 735, name: '成长期' },
            { value: 1580, name: '成熟期' },
            { value: 484, name: '衰退期' },
            { value: 300, name: '流失期' }
        ],
        funnel: [
            { value: 100, name: '注册会员' },
            { value: 80, name: '首单会员' },
            { value: 60, name: '复购会员(>2单)' },
            { value: 40, name: '忠诚活跃会员' }
        ]
    })
}

export const getBehaviorData = async () => {
    await delay(300)
    return successResponse({
        orderAmountHistogram: [150, 430, 520, 200, 80],
        radar: {
            male: [40, 60, 90, 30, 50, 80],
            female: [95, 85, 40, 80, 75, 40]
        },
        hotTime: {
            times: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            data: [50, 200, 150, 180, 300, 800, 450, 100]
        }
    })
}

// === 首页 Dashboard API ===
import { memberList, consumptionRecordList, memberCouponList, memberLevelList } from '../mock/data'

export const getDashboardSummary = async () => {
    await delay(400)

    // 这部分聚合逻辑原本该由后端在数据库里完成
    const totalMembers = memberList.length
    const totalRevenue = consumptionRecordList.reduce((acc, curr) => acc + curr.amount, 0)
    const totalPoints = memberList.reduce((acc, curr) => acc + curr.total_points, 0)

    const totalIssuedCoupons = memberCouponList.length
    const totalUsedCoupons = memberCouponList.filter(c => c.status === 1).length

    // 获取近期5笔最高金额，并带上会员名字
    const recentRecords = [...consumptionRecordList]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(r => {
            const m = memberList.find(x => x.id === r.member_id)
            return {
                ...r,
                member_id: m ? m.name : '未知会员'
            }
        })

    // 折线图
    const lineData = [1200, 2400, 1500, 3200, 2100, 4800, 3500]

    // 等级分布饼图
    const levelCounts = {}
    memberLevelList.forEach(l => { levelCounts[l.id] = 0 })
    memberList.forEach(m => {
        if (levelCounts[m.level_id] !== undefined) {
            levelCounts[m.level_id]++
        }
    })

    const pieData = memberLevelList.map(l => ({
        name: l.name,
        value: levelCounts[l.id]
    }))

    return successResponse({
        totalMembers,
        totalRevenue,
        totalPoints,
        totalIssuedCoupons,
        totalUsedCoupons,
        recentRecords,
        lineData,
        pieData
    })
}
