import api from '@/lib/axios'

export const superAdminApi = {

  getAnalytics: async () => {
    const res = await api.get('/super-admin/analytics')
    return res.data
  },

  getAllCoachings: async () => {
    const res = await api.get('/super-admin/coachings')
    return res.data
  },

  createCoaching: async (data: {
    coachingName:  string
    ownerName:     string
    email:         string
    phone:         string
    address?:      string
    adminPassword: string
    plan:          string
  }) => {
    const res = await api.post('/super-admin/coachings', data)
    return res.data
  },

  activateCoaching: async (id: string) => {
    const res = await api.patch(`/super-admin/coachings/${id}/activate`)
    return res.data
  },

  deactivateCoaching: async (id: string) => {
    const res = await api.patch(`/super-admin/coachings/${id}/deactivate`)
    return res.data
  },

  getAllLogs: async () => {
    const res = await api.get('/super-admin/activity-logs')
    return res.data
  },
}