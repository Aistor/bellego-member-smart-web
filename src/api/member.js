import request from '../utils/request'

export const getMembers = (params) => request.get('/members', { params })
export const getMemberDetail = (id) => request.get(`/members/${id}`)
export const createMember = (data) => request.post('/members', data)
export const updateMember = (id, data) => request.put(`/members/${id}`, data)
export const updateMemberStatus = (id, status) => request.put(`/members/${id}/status`, { status })
export const importMembers = (formData) =>
  request.post('/members/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const getLevels = () => request.get('/levels')
export const getLevelDetail = (id) => request.get(`/levels/${id}`)
export const createLevel = (data) => request.post('/levels', data)
export const updateLevel = (id, data) => request.put(`/levels/${id}`, data)
export const deleteLevel = (id) => request.delete(`/levels/${id}`)
export const updateLevelStatus = (id, status) => request.put(`/levels/${id}/status`, { status })

export const getConsumptions = (params) => request.get('/consumptions', { params })
export const getConsumptionDetail = (id) => request.get(`/consumptions/${id}`)
export const createConsumption = (data) => request.post('/consumptions', data)
export const importConsumptions = (formData) =>
  request.post('/consumptions/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
