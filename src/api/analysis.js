import request from '../utils/request'

export const getRfmData = () => request.get('/analysis/rfm')
export const getLifecycleData = (params) => request.get('/analysis/lifecycle', { params })
export const getOrderAmountData = () => request.get('/analysis/behavior/order-amount')
export const getRepurchaseData = () => request.get('/analysis/behavior/repurchase')
export const getTimeDistributionData = () => request.get('/analysis/behavior/time-distribution')
