import request from '../utils/request'

export const getStores = (params) => request.get('/stores', { params })
export const getStoreDetail = (id) => request.get(`/stores/${id}`)
export const createStore = (data) => request.post('/stores', data)
export const updateStore = (id, data) => request.put(`/stores/${id}`, data)
export const deleteStore = (id) => request.delete(`/stores/${id}`)
export const updateStoreStatus = (id, status) => request.put(`/stores/${id}/status`, { status })

export const getLogs = (params) => request.get('/logs', { params })
export const getLogDetail = (id) => request.get(`/logs/${id}`)

export const getAdmins = (params) => request.get('/admins', { params })
export const createAdmin = (data) => request.post('/admins', data)
export const updateAdmin = (id, data) => request.put(`/admins/${id}`, data)
export const deleteAdmin = (id) => request.delete(`/admins/${id}`)
export const updateAdminStatus = (id, status) => request.put(`/admins/${id}/status`, { status })
export const assignAdminRoles = (id, roleIds) => request.put(`/admins/${id}/roles`, { roleIds })

export const getRoles = (params) => request.get('/roles', { params })
export const createRole = (data) => request.post('/roles', data)
export const updateRole = (id, data) => request.put(`/roles/${id}`, data)
export const deleteRole = (id) => request.delete(`/roles/${id}`)
export const assignRolePermissions = (id, permissionIds) =>
  request.put(`/roles/${id}/permissions`, { permissionIds })

export const getPermissionTree = () => request.get('/permissions/tree')
export const createPermission = (data) => request.post('/permissions', data)
export const updatePermission = (id, data) => request.put(`/permissions/${id}`, data)
export const deletePermission = (id) => request.delete(`/permissions/${id}`)
