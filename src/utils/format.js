export const formatCurrency = (value) => {
  const amount = Number(value || 0)
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export const formatPercent = (value) => `${(Number(value || 0) * 100).toFixed(2)}%`

export const getStatusLabel = (value) => (Number(value) === 1 ? '启用' : '禁用')

export const getGenderLabel = (value) => {
  if (Number(value) === 1) return '男'
  if (Number(value) === 0) return '女'
  return '未知'
}

export const getCouponStatusLabel = (value) => (Number(value) === 1 ? '已使用' : '未使用')

export const getPermissionTypeLabel = (value) => (Number(value) === 1 ? '菜单' : '按钮')

export const getPointTypeLabel = (value) => (Number(value) === 1 ? '消费获得积分' : `类型 ${value}`)

export const normalizePageData = (payload) => ({
  records: payload?.records || [],
  total: payload?.total || 0,
  current: payload?.current || payload?.pageNum || 1,
  size: payload?.size || payload?.pageSize || 10
})
