import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api/v1',
  timeout: 10000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const payload = response.data
    if (typeof payload?.code === 'number' && payload.code !== 200) {
      ElMessage.error(payload.message || '请求失败')
      return Promise.reject(new Error(payload.message || 'Request failed'))
    }
    return payload
  },
  (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message ||
      error.message ||
      '网络异常，请稍后重试'

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user_profile')
      localStorage.removeItem('user_permissions')
      if (location.pathname !== '/login') {
        location.href = '/login'
      }
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request
