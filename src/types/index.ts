export type Role =
  | 'SUPER_ADMIN'
  | 'COACHING_ADMIN'
  | 'TEACHER'
  | 'STUDENT'

export interface AuthState {
  accessToken:     string | null
  refreshToken:    string | null
  userId:          string | null
  name:            string | null
  role:            Role   | null
  coachingId:      string | null
  isAuthenticated: boolean
}

export interface Coaching {
  id:            string
  name:          string
  logoUrl:       string | null
  ownerName:     string
  email:         string
  phone:         string
  address:       string | null
  plan:          string
  active:        boolean
  totalStudents: number
  totalTeachers: number
  totalCourses:  number
  createdAt:     string
}

export interface Student {
  id:               string
  name:             string
  email:            string
  phone:            string
  enrollmentNumber: string
  gender:           string | null
  city:             string | null
  state:            string | null
  active:           boolean
  createdAt:        string
}

export interface Teacher {
  id:              string
  name:            string
  email:           string
  phone:           string
  subject:         string | null
  active:          boolean
  assignedCourses: string[]
  assignedBatches: string[]
}

export interface Course {
  id:               string
  name:             string
  description:      string | null
  category:         string | null
  duration:         string | null
  totalFees:        number
  registrationFees: number
  status:           'ACTIVE' | 'INACTIVE' | 'COMPLETED'
  shortCode:        string | null
  totalBatches:     number
  createdAt:        string
}

export interface Batch {
  id:          string
  name:        string
  courseId:    string
  courseName:  string
  teacherId:   string | null
  teacherName: string | null
  startTime:   string | null
  endTime:     string | null
  active:      boolean
}

export interface Module {
  id:          string
  name:        string
  description: string | null
  orderIndex:  number
  unlockType:  'MANUAL' | 'DATE' | 'ATTENDANCE' | 'FEES'
  unlockDate:  string | null
  locked:      boolean
}

export interface Notice {
  id:        string
  title:     string
  content:   string
  scope:     'GENERAL' | 'COURSE' | 'BATCH'
  scopeId:   string | null
  createdAt: string
}

export interface ActivityLog {
  id:          string
  coachingId:  string | null
  actorId:     string
  actorName:   string
  eventType:   string
  description: string
  createdAt:   string
}

export interface Analytics {
  totalCoachings:   number
  activeCoachings:  number
  inactiveCoachings:number
  totalStudents:    number
  totalTeachers:    number
  totalCourses:     number
}

export interface FeesSummary {
  totalFees:      number
  paidAmount:     number
  dueAmount:      number
  paymentHistory: PaymentRecord[]
}

export interface PaymentRecord {
  amount:  number
  type:    string
  date:    string
  remarks: string
}

export interface AttendanceSummary {
  presentDays: number
  absentDays:  number
  totalDays:   number
  percentage:  number
}