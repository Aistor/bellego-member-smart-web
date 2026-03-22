import request from '../utils/request'

const pageDefaults = {
  pageNum: 1,
  pageSize: 10
}

export function login(data) {
  return request.post('/v1/auth/login', data)
}

export function logout() {
  return request.post('/v1/auth/logout')
}

export function getStores(params = {}) {
  return request.get('/v1/stores', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function getStoreDetail(id) {
  return request.get(`/v1/stores/${id}`)
}

export function createStore(data) {
  return request.post('/v1/stores', data)
}

export function updateStore(id, data) {
  return request.put(`/v1/stores/${id}`, data)
}

export function deleteStore(id) {
  return request.delete(`/v1/stores/${id}`)
}

export function updateStoreStatus(id, status) {
  return request.put(`/v1/stores/${id}/status`, { status })
}

export function getOperationLogs(params = {}) {
  return request.get('/v1/logs', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function getLogDetail(id) {
  return request.get(`/v1/logs/${id}`)
}

export function getAdmins(params = {}) {
  return request.get('/v1/admins', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function getAdminRoleIds(id) {
  return request.get(`/v1/admins/${id}/roles`)
}

export function createAdmin(data) {
  return request.post('/v1/admins', data)
}

export function updateAdmin(id, data) {
  return request.put(`/v1/admins/${id}`, data)
}

export function deleteAdmin(id) {
  return request.delete(`/v1/admins/${id}`)
}

export function updateAdminStatus(id, status) {
  return request.put(`/v1/admins/${id}/status`, { status })
}

export function assignAdminRoles(id, roleIds) {
  return request.put(`/v1/admins/${id}/roles`, { roleIds })
}

export function getRoles(params = {}) {
  return request.get('/v1/roles', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function getRolePermissionIds(id) {
  return request.get(`/v1/roles/${id}/permissions`)
}

export function createRole(data) {
  return request.post('/v1/roles', data)
}

export function updateRole(id, data) {
  return request.put(`/v1/roles/${id}`, data)
}

export function deleteRole(id) {
  return request.delete(`/v1/roles/${id}`)
}

export function assignRolePermissions(id, permissionIds) {
  return request.put(`/v1/roles/${id}/permissions`, { permissionIds })
}

export function getPermissionTree() {
  return request.get('/v1/permissions/tree')
}

export function createPermission(data) {
  return request.post('/v1/permissions', data)
}

export function updatePermission(id, data) {
  return request.put(`/v1/permissions/${id}`, data)
}

export function deletePermission(id) {
  return request.delete(`/v1/permissions/${id}`)
}
