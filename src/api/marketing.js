import request from '../utils/request'

const pageDefaults = {
  pageNum: 1,
  pageSize: 10
}

export function getCoupons(params = {}) {
  return request.get('/v1/coupons', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function getCouponDetail(id) {
  return request.get(`/v1/coupons/${id}`)
}

export function createCoupon(data) {
  return request.post('/v1/coupons', data)
}

export function updateCoupon(id, data) {
  return request.put(`/v1/coupons/${id}`, data)
}

export function deleteCoupon(id) {
  return request.delete(`/v1/coupons/${id}`)
}

export function updateCouponStatus(id, status) {
  return request.put(`/v1/coupons/${id}/status`, { status })
}

export function issueCoupon(id, data) {
  return request.post(`/v1/coupons/${id}/issue`, data)
}

export function getMemberCoupons(params = {}) {
  return request.get('/v1/member-coupons', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function useMemberCoupon(id) {
  return request.put(`/v1/member-coupons/${id}/use`)
}

export function getPointRules() {
  return request.get('/v1/point-rules')
}

export function createPointRule(data) {
  return request.post('/v1/point-rules', data)
}

export function updatePointRule(id, data) {
  return request.put(`/v1/point-rules/${id}`, data)
}

export function deletePointRule(id) {
  return request.delete(`/v1/point-rules/${id}`)
}

export function updatePointRuleStatus(id, status) {
  return request.put(`/v1/point-rules/${id}/status`, { status })
}

export function getPointDetails(params = {}) {
  return request.get('/v1/point-details', {
    params: {
      ...pageDefaults,
      ...params
    }
  })
}

export function importPointDetails(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/v1/point-details/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
