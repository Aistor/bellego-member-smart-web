import { couponList, memberCouponList, pointRuleList, pointDetailList } from '../mock/data'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

const successResponse = (data) => ({
    code: 200,
    message: '操作成功',
    data
})

// === 1. 卡券管理 (Coupon) ===

export const getCoupons = async () => {
    await delay(200)
    return successResponse([...couponList])
}

export const deleteCoupon = async (id) => {
    await delay(200)
    const index = couponList.findIndex(c => c.id === id)
    if (index !== -1) {
        couponList.splice(index, 1)
        return successResponse()
    }
    return Promise.reject(new Error('卡券不存在'))
}

export const issueCoupon = async (data) => {
    await delay(400)
    const { coupon_id, targetType, member_id } = data
    const couponIndex = couponList.findIndex(c => c.id === coupon_id)

    if (couponIndex === -1) return Promise.reject(new Error('无效的卡券'))
    if (couponList[couponIndex].total_issued >= couponList[couponIndex].stock) {
        return Promise.reject(new Error('该卡券库存不足！'))
    }

    // 模拟扣库存
    couponList[couponIndex].total_issued += 1

    if (targetType === 1 && member_id) {
        const newMemberCoupon = {
            id: memberCouponList.length > 0 ? Math.max(...memberCouponList.map(c => c.id)) + 1 : 1,
            member_id,
            coupon_id,
            code: 'CPN' + Date.now().toString().slice(-8),
            status: 0,
            receive_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
            use_time: null,
            expire_time: couponList[couponIndex].end_time
        }
        memberCouponList.push(newMemberCoupon)
    }
    return successResponse()
}

// === 2. 会员卡券 (Member Coupon) ===

export const getMemberCoupons = async () => {
    await delay(200)
    const list = [...memberCouponList].sort((a, b) => new Date(b.receive_time) - new Date(a.receive_time))
    return successResponse(list)
}

export const useMemberCoupon = async (id) => {
    await delay(300)
    const index = memberCouponList.findIndex(mc => mc.id === id)
    if (index !== -1) {
        memberCouponList[index].status = 1
        memberCouponList[index].use_time = new Date().toISOString().replace('T', ' ').slice(0, 19)
        return successResponse(memberCouponList[index])
    }
    return Promise.reject(new Error('查无此券'))
}

// === 3. 积分规则 (Point Rule) ===

export const getPointRules = async () => {
    await delay(150)
    return successResponse([...pointRuleList])
}

export const addPointRule = async (data) => {
    await delay(200)
    const newRule = {
        ...data,
        id: pointRuleList.length > 0 ? Math.max(...pointRuleList.map(r => r.id)) + 1 : 1,
        status: 1,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
    pointRuleList.push(newRule)
    return successResponse(newRule)
}

export const updatePointRule = async (id, data) => {
    await delay(200)
    const index = pointRuleList.findIndex(r => r.id === id)
    if (index !== -1) {
        pointRuleList[index] = { ...pointRuleList[index], ...data }
        return successResponse(pointRuleList[index])
    }
    return Promise.reject(new Error('规则未找到'))
}

export const deletePointRule = async (id) => {
    await delay(150)
    const index = pointRuleList.findIndex(r => r.id === id)
    if (index !== -1) {
        pointRuleList.splice(index, 1)
        return successResponse()
    }
    return Promise.reject(new Error('规则未找到'))
}

export const updatePointRuleStatus = async (id, status) => {
    await delay(100)
    const index = pointRuleList.findIndex(r => r.id === id)
    if (index !== -1) {
        pointRuleList[index].status = status
        return successResponse()
    }
    return Promise.reject(new Error('规则未找到'))
}


// === 4. 积分明细 (Point Detail) ===

export const getPointDetails = async () => {
    await delay(200)
    const list = [...pointDetailList].sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
    return successResponse(list)
}
