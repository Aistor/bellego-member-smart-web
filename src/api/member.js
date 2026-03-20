import { memberList, memberLevelList, consumptionRecordList } from '../mock/data'

// 模拟网络请求延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 生成统一的成功响应格式
const successResponse = (data) => ({
    code: 200,
    message: '操作成功',
    data
})

// === 1. 会员管理 (Member) ===

export const getMembers = async (params = {}) => {
    await delay()
    let list = [...memberList]

    if (params.card_number) {
        list = list.filter(item => item.card_number.includes(params.card_number))
    }
    if (params.phone) {
        list = list.filter(item => item.phone.includes(params.phone))
    }

    // 简易分页模拟
    const total = list.length
    const page = params.page || 1
    const pageSize = params.pageSize || 10
    const start = (page - 1) * pageSize
    const records = list.slice(start, start + pageSize)

    return successResponse({ records, total })
}

export const getMemberById = async (id) => {
    await delay(100)
    const member = memberList.find(m => m.id === id)
    return successResponse(member)
}

export const addMember = async (data) => {
    await delay()
    const newMember = {
        ...data,
        id: memberList.length > 0 ? Math.max(...memberList.map(m => m.id)) + 1 : 1,
        total_points: 0,
        total_consumption: 0,
        status: 1,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
    memberList.unshift(newMember)
    return successResponse(newMember)
}

export const updateMember = async (id, data) => {
    await delay()
    const index = memberList.findIndex(m => m.id === id)
    if (index !== -1) {
        memberList[index] = { ...memberList[index], ...data, update_time: new Date().toISOString().replace('T', ' ').slice(0, 19) }
        return successResponse(memberList[index])
    }
    return Promise.reject(new Error('会员不存在'))
}

export const updateMemberStatus = async (id, status) => {
    await delay(150)
    const index = memberList.findIndex(m => m.id === id)
    if (index !== -1) {
        memberList[index].status = status
        return successResponse()
    }
    return Promise.reject(new Error('会员不存在'))
}


// === 2. 会员等级 (Member Level) ===

export const getLevels = async () => {
    await delay(200)
    const list = [...memberLevelList].sort((a, b) => a.level - b.level)
    return successResponse(list)
}

export const addLevel = async (data) => {
    await delay()
    const newLevel = {
        ...data,
        id: memberLevelList.length > 0 ? Math.max(...memberLevelList.map(l => l.id)) + 1 : 1,
        status: 1,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
    memberLevelList.push(newLevel)
    return successResponse(newLevel)
}

export const updateLevel = async (id, data) => {
    await delay()
    const index = memberLevelList.findIndex(l => l.id === id)
    if (index !== -1) {
        memberLevelList[index] = { ...memberLevelList[index], ...data }
        return successResponse(memberLevelList[index])
    }
    return Promise.reject(new Error('等级不存在'))
}

export const deleteLevel = async (id) => {
    await delay(100)
    const index = memberLevelList.findIndex(l => l.id === id)
    if (index !== -1) {
        memberLevelList.splice(index, 1)
        return successResponse()
    }
    return Promise.reject(new Error('等级不存在'))
}

export const updateLevelStatus = async (id, status) => {
    await delay(100)
    const index = memberLevelList.findIndex(l => l.id === id)
    if (index !== -1) {
        memberLevelList[index].status = status
        return successResponse()
    }
    return Promise.reject(new Error('等级不存在'))
}

// === 3. 消费记录 (Consumption Record) ===

export const getConsumptions = async () => {
    await delay(250)
    const list = [...consumptionRecordList].sort((a, b) => new Date(b.consume_time) - new Date(a.consume_time))
    return successResponse(list)
}

export const addConsumption = async (data) => {
    await delay(400)
    const mockPoints = Math.floor(data.amount)

    const newRecord = {
        id: consumptionRecordList.length > 0 ? Math.max(...consumptionRecordList.map(c => c.id)) + 1 : 1,
        ...data,
        points_earned: mockPoints,
        consume_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }

    consumptionRecordList.unshift(newRecord)

    // 联动更新会员数据
    const memberIndex = memberList.findIndex(m => m.id === data.member_id)
    if (memberIndex !== -1) {
        memberList[memberIndex].total_points += mockPoints
        memberList[memberIndex].total_consumption += data.amount
        memberList[memberIndex].last_consume_time = newRecord.consume_time
    }

    return successResponse({ record: newRecord, earnedPoints: mockPoints })
}
