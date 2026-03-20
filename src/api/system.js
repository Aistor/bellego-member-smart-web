import { storeList, operationLogList, adminList, roleList, permissionList } from '../mock/data'

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

const successResponse = (data) => ({
    code: 200,
    message: '操作成功',
    data
})

// === 1. 门店管理 (Store) ===

export const getStores = async () => {
    await delay(150)
    return successResponse([...storeList])
}

export const addStore = async (data) => {
    await delay(200)
    const newStore = {
        ...data,
        id: storeList.length > 0 ? Math.max(...storeList.map(s => s.id)) + 1 : 1,
        status: 1,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
    storeList.push(newStore)
    return successResponse(newStore)
}

export const updateStore = async (id, data) => {
    await delay(200)
    const index = storeList.findIndex(s => s.id === id)
    if (index !== -1) {
        storeList[index] = { ...storeList[index], ...data }
        return successResponse(storeList[index])
    }
    return Promise.reject(new Error('门店不存在'))
}

export const deleteStore = async (id) => {
    await delay(150)
    const index = storeList.findIndex(s => s.id === id)
    if (index !== -1) {
        storeList.splice(index, 1)
        return successResponse()
    }
    return Promise.reject(new Error('门店不存在'))
}

export const updateStoreStatus = async (id, status) => {
    await delay(100)
    const index = storeList.findIndex(s => s.id === id)
    if (index !== -1) {
        storeList[index].status = status
        return successResponse()
    }
    return Promise.reject(new Error('门店不存在'))
}

// === 2. 操作日志 (Operation Log) ===

export const getOperationLogs = async () => {
    await delay(200)
    const list = [...operationLogList].sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
    return successResponse(list)
}

// === 3. 管理员管理 (Admin) ===

export const getAdmins = async () => {
    await delay(200)
    return successResponse([...adminList])
}

export const addAdmin = async (data) => {
    await delay()
    const newAdmin = {
        ...data,
        id: adminList.length > 0 ? Math.max(...adminList.map(a => a.id)) + 1 : 1,
        status: 1,
        password: '已加密隐藏',
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
    adminList.push(newAdmin)
    return successResponse(newAdmin)
}

export const updateAdmin = async (id, data) => {
    await delay()
    const index = adminList.findIndex(a => a.id === id)
    if (index !== -1) {
        adminList[index] = { ...adminList[index], ...data }
        return successResponse(adminList[index])
    }
    return Promise.reject(new Error('账号不存在'))
}

export const deleteAdmin = async (id) => {
    await delay(100)
    const index = adminList.findIndex(a => a.id === id)
    if (index !== -1) {
        adminList.splice(index, 1)
        return successResponse()
    }
    return Promise.reject(new Error('账号不存在'))
}

export const updateAdminStatus = async (id, status) => {
    await delay(150)
    const index = adminList.findIndex(a => a.id === id)
    if (index !== -1) {
        if (adminList[index].username === 'admin' && status === 0) {
            return Promise.reject(new Error('超级管理员不允许禁用'))
        }
        adminList[index].status = status
        return successResponse()
    }
    return Promise.reject(new Error('账号不存在'))
}


// === 4. 角色管理 (Role) ===

export const getRoles = async () => {
    await delay(150)
    return successResponse([...roleList])
}

export const addRole = async (data) => {
    await delay()
    const newRole = {
        ...data,
        id: roleList.length > 0 ? Math.max(...roleList.map(r => r.id)) + 1 : 1,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
    roleList.push(newRole)
    return successResponse(newRole)
}

export const updateRole = async (id, data) => {
    await delay()
    const index = roleList.findIndex(r => r.id === id)
    if (index !== -1) {
        roleList[index] = { ...roleList[index], ...data }
        return successResponse(roleList[index])
    }
    return Promise.reject(new Error('角色不存在'))
}

export const deleteRole = async (id) => {
    await delay(150)
    const index = roleList.findIndex(r => r.id === id)
    if (index !== -1) {
        roleList.splice(index, 1)
        return successResponse()
    }
    return Promise.reject(new Error('角色不存在'))
}

// === 5. 权限管理 (Permission) ===

export const getPermissions = async () => {
    await delay(150)
    // 返回扁平化原始数组即可，前端自行构建树
    return successResponse(JSON.parse(JSON.stringify(permissionList)))
}

export const addPermission = async (data) => {
    await delay()
    const newPerm = {
        ...data,
        id: permissionList.length > 0 ? Math.max(...permissionList.map(p => p.id)) + 1 : 1,
        create_time: new Date().toISOString().replace('T', ' ').slice(0, 10)
    }
    permissionList.push(newPerm)
    return successResponse(newPerm)
}

export const updatePermission = async (id, data) => {
    await delay()
    const index = permissionList.findIndex(p => p.id === id)
    if (index !== -1) {
        permissionList[index] = { ...permissionList[index], ...data }
        return successResponse(permissionList[index])
    }
    return Promise.reject(new Error('权限节点不存在'))
}

export const deletePermission = async (id) => {
    await delay(150)
    const index = permissionList.findIndex(p => p.id === id)
    if (index !== -1) {
        permissionList.splice(index, 1)
        return successResponse()
    }
    return Promise.reject(new Error('权限节点不存在'))
}
