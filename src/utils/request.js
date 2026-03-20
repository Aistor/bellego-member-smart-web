import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
    timeout: 5000
})

// Request interceptor
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// Response interceptor
request.interceptors.response.use(
    response => {
        const res = response.data
        // Assuming 200 is business success code
        if (res.code && res.code !== 200) {
            ElMessage.error(res.message || '请求失败')
            return Promise.reject(new Error(res.message || 'Error'))
        }
        return res
    },
    error => {
        ElMessage.error(error.message || '网络错误')
        return Promise.reject(error)
    }
)

export default request
