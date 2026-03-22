import { defineStore } from 'pinia'
import { ref } from 'vue'

const storedProfile = localStorage.getItem('user-profile')

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const profile = ref(storedProfile ? JSON.parse(storedProfile) : null)

  function setToken(value) {
    token.value = value
    localStorage.setItem('token', value)
  }

  function setProfile(value) {
    profile.value = value
    localStorage.setItem('user-profile', JSON.stringify(value))
  }

  function setLoginState(data) {
    setToken(data.token)
    setProfile({
      adminId: data.adminId,
      username: data.username,
      realName: data.realName,
      permissions: data.permissions || []
    })
  }

  function logout() {
    token.value = ''
    profile.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user-profile')
  }

  return {
    token,
    profile,
    setToken,
    setProfile,
    setLoginState,
    logout
  }
})
