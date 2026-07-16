# CoachingPro — Frontend

Next.js frontend for CoachingPro Multi-Tenant Coaching Management Platform.

## What is this?

Ye ek web application hai jo 4 alag alag dashboards provide karti hai:
- Super Admin — poore platform ko manage karta hai
- Coaching Admin — apni coaching center manage karta hai
- Teacher — apne courses aur students manage karta hai
- Student — apna course content aur progress dekhta hai

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Zustand (state management)
- TanStack Query (API calls)
- React Hook Form + Zod (forms)
- Sonner (notifications)
- Axios (HTTP)

## Local Setup

### Step 1 — Clone karo

git clone https://github.com/yourusername/coaching-platform.git
cd coaching-platform/coaching-frontend

### Step 2 — Dependencies install karo

npm install

### Step 3 — Environment file banao

.env.local file banao root mein:

NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

### Step 4 — Run karo

npm run dev

Browser mein kholo: http://localhost:3000

## Login Credentials (Local Testing)

| Role           | Email                      | Password   |
|----------------|----------------------------|------------|
| Super Admin    | admin@platform.com         | Admin@123  |
| Coaching Admin | rajesh@abccoaching.com     | Admin@123  |
| Teacher        | amit@abccoaching.com       | Teacher@123|
| Student        | rahul@gmail.com            | Student@123|

## Project Structure

coaching-frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/login/         # Login page
│   │   ├── (super-admin)/        # Super Admin pages
│   │   ├── (coaching-admin)/     # Coaching Admin pages
│   │   ├── (teacher)/            # Teacher pages
│   │   ├── (student)/            # Student pages
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Redirects to login
│   │   └── providers.tsx         # TanStack Query provider
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx     # Sidebar + main layout
│   │   │   ├── SidebarLink.tsx         # Nav link component
│   │   │   ├── SuperAdminSidebar.tsx
│   │   │   └── CoachingAdminSidebar.tsx
│   │   └── shared/
│   │       ├── RouteGuard.tsx          # Auth protection
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── PdfAccessManager.tsx    # PDF grant/revoke UI
│   │
│   ├── lib/
│   │   ├── axios.ts              # Axios instance with interceptors
│   │   └── api/
│   │       ├── superAdmin.ts     # Super Admin API calls
│   │       └── coachingAdmin.ts  # Coaching Admin API calls
│   │
│   ├── store/
│   │   └── authStore.ts          # Zustand auth state (persisted)
│   │
│   └── types/
│       └── index.ts              # TypeScript interfaces
│
├── next.config.ts                # API proxy config
├── .env.local                    # Local environment vars
└── package.json

## Pages Available

### Super Admin (/super-admin/...)
- /dashboard — Platform stats + recent coachings
- /coachings — All coaching centers, create/activate/deactivate
- /activity-logs — Platform-wide activity history

### Coaching Admin (/coaching-admin/...)
- /dashboard — Stats + recent students + notices
- /students — List, create, search, delete students
- /students/enroll — Enroll student in course + batch
- /students/[id] — Student detail + results
- /teachers — List, create, delete teachers
- /teachers/[id] — Teacher detail
- /courses — Courses with module + PDF manager
- /batches — Batches per course
- /batches/students — See which students are in each batch
- /attendance — Mark attendance (batch + date)
- /attendance/sheet — 7-day P/A attendance table
- /fees — Record payments + recent 5 payments
- /results — Add + view test results
- /notices — Notice board
- /settings — Coaching profile + enrollment format

### Teacher (/teacher/...)
- /dashboard — Courses, batches, mark attendance
- /courses — Manage modules + PDFs
- /roadmap — View course roadmap with PDFs
- /attendance — 7-day attendance sheet
- /results — Upload + view results
- /notices — View notices
- /profile — Profile + change password

### Student (/student/...)
- /dashboard — Course info + results + notices
- /roadmap — Learning path with PDF viewer
- /attendance — Attendance records
- /fees — Fee payment history
- /results — Test results with grades
- /notices — Notices
- /profile — Profile + change password

## How Routing Works

Har role ka apna alag URL prefix hai:
- /super-admin/* — sirf SUPER_ADMIN dekh sakta hai
- /coaching-admin/* — sirf COACHING_ADMIN dekh sakta hai
- /teacher/* — sirf TEACHER dekh sakta hai
- /student/* — sirf STUDENT dekh sakta hai

Login karne ke baad automatically sahi dashboard pe redirect hota hai.
Wrong URL pe navigate karne pe login pe redirect ho jata hai.
(RouteGuard component ye handle karta hai)

## API Proxy

next.config.ts mein proxy configured hai:
/api/* → NEXT_PUBLIC_BACKEND_URL/api/*

Matlab frontend /api/auth/login call karta hai,
jo automatically backend pe forward ho jati hai.
CORS issues nahi hote is wajah se.

## Vercel pe Deploy

1. GitHub pe push karo
2. vercel.com pe import karo
3. Environment variable add karo:
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
4. Deploy karo

## Environment Variables

| Variable | Local Value | Production Value |
|----------|-------------|------------------|
| NEXT_PUBLIC_BACKEND_URL | http://localhost:8080 | https://your-aws-url.com |