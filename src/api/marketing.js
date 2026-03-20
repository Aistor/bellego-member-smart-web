import request from '../utils/request'

export const getCoupons = (params) => request.get('/coupons', { params })
export const getCouponDetail = (id) => request.get(`/coupons/${id}`)
export const createCoupon = (data) => request.post('/coupons', data)
export const updateCoupon = (id, data) => request.put(`/coupons/${id}`, data)
export const deleteCoupon = (id) => request.delete(`/coupons/${id}`)
export const updateCouponStatus = (id, status) => request.put(`/coupons/${id}/status`, { status })
export const issueCoupon = (id, data) => request.post(`/coupons/${id}/issue`, data)

export const getMemberCoupons = (params) => request.get('/member-coupons', { params })
export const useMemberCoupon = (id) => request.put(`/member-coupons/${id}/use`)

export const getPointRules = () => request.get('/point-rules')
export const createPointRule = (data) => request.post('/point-rules', data)
export const updatePointRule = (id, data) => request.put(`/point-rules/${id}`, data)
export const deletePointRule = (id) => request.delete(`/point-rules/${id}`)
export const updatePointRuleStatus = (id, status) => request.put(`/point-rules/${id}/status`, { status })

export const getPointDetails = (params) => request.get('/point-details', { params })
export const importPointDetails = (formData) =>
  request.post('/point-details/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
