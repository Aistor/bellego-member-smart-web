import request from '../utils/request'

const pageDefaults = {
  pageNum: 1,
  pageSize: 10
}

export function getMembers(params = {}) {
  return request.get('/v1/members', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function getMemberDetail(id) {
  return request.get(`/v1/members/${id}`)
}

export function createMember(data) {
  return request.post('/v1/members', data)
}

export function updateMember(id, data) {
  return request.put(`/v1/members/${id}`, data)
}

export function updateMemberStatus(id, status) {
  return request.put(`/v1/members/${id}/status`, { status })
}

export function importMembers(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/v1/members/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getLevels() {
  return request.get('/v1/levels')
}

export function getLevelDetail(id) {
  return request.get(`/v1/levels/${id}`)
}

export function createLevel(data) {
  return request.post('/v1/levels', data)
}

export function updateLevel(id, data) {
  return request.put(`/v1/levels/${id}`, data)
}

export function deleteLevel(id) {
  return request.delete(`/v1/levels/${id}`)
}

export function updateLevelStatus(id, status) {
  return request.put(`/v1/levels/${id}/status`, { status })
}

export function getLevelCount() {
  return request.get('/v1/levelCount')
}

export function getConsumptions(params = {}) {
  return request.get('/v1/consumptions', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function getConsumptionDetail(id) {
  return request.get(`/v1/consumptions/${id}`)
}

export function createConsumption(data) {
  return request.post('/v1/consumptions', data)
}

export function importConsumptions(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/v1/consumptions/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getRecentConsumptionTrend() {
  return request.get('/v1/consumptions/recent')
}
