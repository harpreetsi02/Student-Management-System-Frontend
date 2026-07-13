import api from '@/lib/axios'
import { Course } from '@/types'

export const coachingAdminApi = {

  // Profile
  getProfile: async () => {
    const res = await api.get('/coaching-admin/profile')
    return res.data
  },

  updateProfile: async (data: any) => {
    const res = await api.put('/coaching-admin/profile', data)
    return res.data
  },

  // Students
  getStudents: async (search?: string) => {
    const res = await api.get('/coaching-admin/students', {
      params: search ? { search } : {},
    })
    return res.data
  },

  createStudent: async (data: any) => {
    const res = await api.post('/coaching-admin/students', data)
    return res.data
  },

  deleteStudent: async (id: string) => {
    const res = await api.delete(`/coaching-admin/students/${id}`)
    return res.data
  },

  toggleStudentStatus: async (id: string, active: boolean) => {
    const url = active
      ? `/coaching-admin/students/${id}/deactivate`
      : `/coaching-admin/students/${id}/activate`
    const res = await api.patch(url)
    return res.data
  },

  enrollStudent: async (
    studentId: string,
    courseId: string,
    batchId: string
  ) => {
    const res = await api.post(
      `/coaching-admin/students/${studentId}/enroll`,
      null,
      { params: { courseId, batchId } }
    )
    return res.data
  },

  // Teachers
  getTeachers: async (search?: string) => {
    const res = await api.get('/coaching-admin/teachers', {
      params: search ? { search } : {},
    })
    return res.data
  },

  createTeacher: async (data: any) => {
    const res = await api.post('/coaching-admin/teachers', data)
    return res.data
  },

  deleteTeacher: async (id: string) => {
    const res = await api.delete(`/coaching-admin/teachers/${id}`)
    return res.data
  },

  // Courses
  getCourses: async (search?: string): Promise<Course[]> => {
    const res = await api.get('/coaching-admin/courses', {
      params: search ? { search } : {},
    })
    return res.data
  },

  createCourse: async (data: any) => {
    const res = await api.post('/coaching-admin/courses', data)
    return res.data
  },

  deleteCourse: async (id: string) => {
    const res = await api.delete(`/coaching-admin/courses/${id}`)
    return res.data
  },

  // Batches
  getBatches: async (courseId: string) => {
    const res = await api.get(
      `/coaching-admin/courses/${courseId}/batches`
    )
    return res.data
  },

  createBatch: async (data: any) => {
    const res = await api.post('/coaching-admin/batches', data)
    return res.data
  },

  deleteBatch: async (batchId: string) => {
    const res = await api.delete(`/coaching-admin/batches/${batchId}`)
    return res.data
  },

  // Modules
  getModules: async (courseId: string) => {
    const res = await api.get(
      `/coaching-admin/courses/${courseId}/modules`
    )
    return res.data
  },

  createModule: async (courseId: string, data: any) => {
    const res = await api.post(
      `/coaching-admin/courses/${courseId}/modules`,
      data
    )
    return res.data
  },

  deleteModule: async (courseId: string, moduleId: string) => {
    const res = await api.delete(
      `/coaching-admin/courses/${courseId}/modules/${moduleId}`
    )
    return res.data
  },

  reorderModules: async (courseId: string, data: any) => {
    const res = await api.put(
      `/coaching-admin/courses/${courseId}/modules/reorder`,
      data
    )
    return res.data
  },

  // Attendance
  markAttendance: async (data: any) => {
    const res = await api.post('/coaching-admin/attendance/mark', data)
    return res.data
  },

  getBatchAttendance: async (batchId: string, date: string) => {
    const res = await api.get(
      `/coaching-admin/attendance/batch/${batchId}`,
      { params: { date } }
    )
    return res.data
  },

  getStudentAttendance: async (studentId: string, batchId: string) => {
    const res = await api.get(
      `/coaching-admin/attendance/student/${studentId}/batch/${batchId}`
    )
    return res.data
  },

  // Fees
  addPayment: async (data: any) => {
    const res = await api.post('/coaching-admin/fees/payment', data)
    return res.data
  },

  getFeesSummary: async (studentId: string, courseId: string) => {
    const res = await api.get(
      `/coaching-admin/fees/student/${studentId}/course/${courseId}`
    )
    return res.data
  },

  // Results
  addResult: async (data: any) => {
    const res = await api.post('/coaching-admin/results', data)
    return res.data
  },

  getStudentResults: async (studentId: string) => {
    const res = await api.get(
      `/coaching-admin/results/student/${studentId}`
    )
    return res.data
  },

  // Notices
  getNotices: async () => {
    const res = await api.get('/coaching-admin/notices')
    return res.data
  },

  createNotice: async (data: any) => {
    const res = await api.post('/coaching-admin/notices', data)
    return res.data
  },

  deleteNotice: async (id: string) => {
    const res = await api.delete(`/coaching-admin/notices/${id}`)
    return res.data
  },

  // PDF Upload
  uploadPdf: async (moduleId: string, title: string, file: File) => {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('file', file)
    const res = await api.post(
      `/pdfs/modules/${moduleId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return res.data
  },
  
  getPdfs: async (moduleId: string) => {
    const res = await api.get(`/pdfs/modules/${moduleId}`)
    return res.data
  },
  
  deletePdf: async (pdfId: string) => {
    const res = await api.delete(`/pdfs/${pdfId}`)
    return res.data
  },
  
  lockPdf: async (pdfId: string) => {
    const res = await api.patch(`/pdfs/${pdfId}/lock`)
    return res.data
  },
  
  unlockPdf: async (pdfId: string) => {
    const res = await api.patch(`/pdfs/${pdfId}/unlock`)
    return res.data
  },

  getRecentPayments: async () => {
    const res = await api.get('/coaching-admin/fees/recent')
    return res.data
  },

  // PDF Access management
  grantPdfAccess: async (pdfId: string, studentId: string) => {
    const res = await api.post(
      `/coaching-admin/pdfs/${pdfId}/grant/${studentId}`
    )
    return res.data
  },
  
  revokePdfAccess: async (pdfId: string, studentId: string) => {
    const res = await api.delete(
      `/coaching-admin/pdfs/${pdfId}/revoke/${studentId}`
    )
    return res.data
  },
  
  grantPdfToBatch: async (pdfId: string, batchId: string) => {
    const res = await api.post(
      `/coaching-admin/pdfs/${pdfId}/grant-batch/${batchId}`
    )
    return res.data
  },
  
  getPdfAccessList: async (pdfId: string) => {
    const res = await api.get(`/coaching-admin/pdfs/${pdfId}/access`)
    return res.data
  },
  
  getStudentPdfs: async (moduleId: string) => {
    const res = await api.get(`/pdfs/student/modules/${moduleId}`)
    return res.data
  },
}