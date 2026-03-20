import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { login, logout as logoutApi } from '../api/auth'

const PROFILE_KEY = 'user_profile'
const PERMISSION_KEY = 'user_permissions'

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const profile = ref(readJson(PROFILE_KEY, {}))
  const permissions = ref(readJson(PERMISSION_KEY, []))

  const isLoggedIn = computed(() => Boolean(token.value))
  const displayName = computed(() => profile.value.realName || profile.value.username || '管理员')

  const persist = () => {
    localStorage.setItem('token', token.value)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile.value))
    localStorage.setItem(PERMISSION_KEY, JSON.stringify(permissions.value))
  }

  const setSession = (session) => {
    token.value = session.token || ''
    profile.value = {
      adminId: session.adminId,
      username: session.username,
      realName: session.realName
    }
    permissions.value = session.permissions || []
    persist()
  }

  const clearSession = () => {
    token.value = ''
    profile.value = {}
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem(PROFILE_KEY)
    localStorage.removeItem(PERMISSION_KEY)
  }

  const loginAction = async (form) => {
    const response = await login(form)
    setSession(response.data || {})
    return response
  }

  const logoutAction = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore logout API failures and clear local session anyway.
    } finally {
      clearSession()
    }
  }

  return {
    token,
    profile,
    permissions,
    isLoggedIn,
    displayName,
    setSession,
    clearSession,
    loginAction,
    logoutAction
  }
})
