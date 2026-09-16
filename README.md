<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

# 🏥 MKMC — Hospital Management System

A **full-stack, production-ready Hospital Management System** built for **Mehmood Khan Medical Center (MKMC)**. The platform digitizes every aspect of hospital operations — from patient registration and appointment scheduling to biometric staff attendance, HL7 interoperability, inpatient bed management, lab workflows, financial reporting, and a public-facing website.

> **Live Demo:** Frontend deployed on Vercel · Backend API on Vercel Serverless Functions

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Authentication & Authorization](#-authentication--authorization)
- [Background Services](#-background-services)
- [HL7 Integration](#-hl7-integration)
- [Default Credentials](#-default-credentials)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 🖥️ Public Website
- Modern, responsive landing page with hero section, services showcase, and doctor profiles
- Contact form with email notifications
- SEO-optimized pages (Home, About, Services, Doctors, Contact)

### 👨‍💼 Admin Dashboard
- **Real-time analytics** with interactive ECharts visualizations (patient trends, revenue, appointment stats)
- KPI cards with trend indicators (patients registered, appointments today, revenue, etc.)
- Bed occupancy heatmap and inpatient overview

### 👥 Staff & Role Management
- Full CRUD for staff members (Doctors, Receptionists, Lab Technicians, etc.)
- **Granular permission system** — Roles with configurable permissions (40+ permissions)
- Dynamic sidebar navigation based on assigned permissions
- Staff profile management with image upload

### 🩺 Patient Management
- Patient registration with auto-generated **MR Numbers** (Medical Record Numbers)
- Full patient directory with search, filter, and pagination
- Patient history tracking (appointments, lab tests, prescriptions, bed assignments)

### 📅 Appointment System
- Appointment scheduling with doctor selection, date/time picker
- Status workflow: `PENDING → CONFIRMED → COMPLETED / CANCELLED`
- Queue token generation for reception and lab departments
- Doctor consultation fee integration

### 🔬 Laboratory Module
- Lab test ordering with test catalog management
- Test status workflow: `PENDING → ACCEPTED → COMPLETED`
- Report file upload (PDF/image) for completed tests
- HL7 order (ORM^O01) and result (ORU^R01) message support

### 💊 Prescriptions
- Doctors can write prescriptions linked to appointments
- Diagnosis, prescription content, and follow-up date tracking

### 🏨 Inpatient / Bed Management
- **Ward → Room → Bed** hierarchy management
- Room categories with per-day pricing
- Real-time bed status tracking: `AVAILABLE | OCCUPIED | MAINTENANCE | CLEANING | RESERVED`
- Patient bed assignment with admission/discharge workflow
- Transfer tracking between beds
- **Automated bed status transitions** — beds automatically move from `CLEANING → AVAILABLE` after 15 minutes
- Daily rate billing and discharge billing

### 💰 Finance & Transactions
- Comprehensive income/expense tracking
- Transaction categories (Consultation Fee, Lab Test Fee, Bed Rent, Salary, etc.)
- Payment methods: `CASH | CARD | ONLINE | BANK_TRANSFER`
- Transaction status management: `PENDING | PAID | CANCELLED`
- Financial summary with charts and period filtering
- Staff salary management (base salary, allowances, deductions)

### ⏰ Attendance & Biometric Integration
- **ZKTeco biometric device integration** via `zk-attendance-sdk`
- Automatic periodic device sync (every 30 seconds)
- Real-time attendance record processing with check-in/check-out detection
- **Daily attendance summary** with automated calculations:
  - Late detection (with 15-min grace period)
  - Early departure detection
  - Overtime calculation
  - Shift-aware status: `PRESENT | LATE | EARLY_DEPARTURE | ABSENT | OFF_DAY | INCOMPLETE`
- Biometric PIN mapping for staff identity resolution
- Simulated/mock device mode for development

### 🔀 HL7 Interoperability
- **HL7 v2.x message support** using `simple-hl7`
- ADT (Admit/Discharge/Transfer) messages — `ADT^A01`, `ADT^A03`
- Order messages — `ORM^O01`
- Result messages — `ORU^R01`
- HTTP-based HL7 transport with configurable endpoints
- Inbound HL7 message receiver with API key authentication
- Full HL7 message logging with audit trail

### 📊 Reports & Analytics
- Reports dashboard with permission-gated access
- Financial reports, patient statistics, and attendance summaries

### 🔐 Security
- JWT-based authentication with configurable expiry
- **Two-Factor Authentication (2FA)** via email OTP
- Password reset flow with OTP verification
- Login notification emails (IP address, device/browser info)
- Bcrypt password hashing
- Helmet.js security headers
- CORS configuration with origin whitelisting
- Role-based + Permission-based access control middleware

### ✉️ Email Notifications
- Templated HTML emails via Nodemailer (Gmail SMTP)
- Login alerts, OTP delivery, password change confirmations, profile update notifications

### 📁 File Uploads
- Profile image uploads (staff & admin)
- Lab report file uploads
- Service image uploads
- Multer-based multipart handling

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI library |
| **Vite** | 7.x | Build tool & dev server |
| **React Router DOM** | 7.x | Client-side routing |
| **TailwindCSS** | 4.x | Utility-first CSS framework |
| **Axios** | 1.x | HTTP client |
| **ECharts** | 6.x | Data visualization & charts |
| **Formik + Yup** | Latest | Form handling & validation |
| **Lucide React** | Latest | Icon library |
| **React Hot Toast** | 2.x | Toast notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.x | Web framework |
| **Prisma** | 6.x | ORM & database toolkit |
| **PostgreSQL** | 15+ | Relational database (via Neon) |
| **pg** | 8.x | PostgreSQL driver (raw queries) |
| **JSON Web Token** | 9.x | Authentication tokens |
| **bcryptjs** | 3.x | Password hashing |
| **Nodemailer** | 7.x | Email service |
| **Multer** | 2.x | File upload handling |
| **Helmet** | 8.x | Security HTTP headers |
| **express-validator** | 7.x | Request validation |
| **Yup** | 1.x | Schema validation |
| **Day.js** | 1.x | Date manipulation |
| **simple-hl7** | 3.x | HL7 message parsing/building |
| **zk-attendance-sdk** | 2.x | ZKTeco biometric device SDK |
| **uuid** | 13.x | Unique ID generation |
| **Nodemon** | 3.x | Hot-reload dev server |

### Infrastructure
| Service | Purpose |
|---|---|
| **Vercel** | Frontend & Backend hosting (serverless) |
| **Neon** | Serverless PostgreSQL database |
| **Gmail SMTP** | Transactional email delivery |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC WEBSITE                           │
│              Home · About · Services · Doctors · Contact        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                     REACT FRONTEND (Vite + TailwindCSS)         │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Auth Module  │  │ Admin Panel  │  │    Staff Portal        │  │
│  │  - Login     │  │  - Dashboard │  │  - Doctor Dashboard    │  │
│  │  - 2FA       │  │  - Patients  │  │  - Staff Dashboard     │  │
│  │  - Forgot PW │  │  - Staff     │  │  - Appointments        │  │
│  │              │  │  - Roles     │  │  - Lab Tests           │  │
│  │              │  │  - Appts     │  │  - Patients            │  │
│  │              │  │  - Lab Tests │  │  - Finance             │  │
│  │              │  │  - Finance   │  │                        │  │
│  │              │  │  - Beds      │  │                        │  │
│  │              │  │  - Shifts    │  │                        │  │
│  │              │  │  - Attendance│  │                        │  │
│  │              │  │  - Reports   │  │                        │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
│                          │ Axios HTTP (REST API)                 │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    EXPRESS BACKEND (Node.js)                     │
│                                                                 │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │  Auth     │  │ Middleware   │  │  Services    │               │
│  │  JWT      │  │  - Auth      │  │  - Biometric │               │
│  │  OTP      │  │  - RBAC      │  │  - HL7       │               │
│  │  2FA      │  │  - Upload    │  │  - Mail      │               │
│  │           │  │  - Validate  │  │  - MR Number │               │
│  └──────────┘  └─────────────┘  └──────────────┘               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Controllers (Admin / Staff / Web)            │   │
│  │  Auth · Staff · Patients · Appointments · LabTests ·     │   │
│  │  Finance · Beds · Wards · Rooms · Shifts · Attendance ·  │   │
│  │  Roles · Permissions · Services · Reports · HL7          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │ Prisma ORM                            │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                  POSTGRESQL DATABASE (Neon)                      │
│                                                                 │
│  Admin · Staff · Role · Permission · Patient · Appointment ·   │
│  Prescription · Test · LabTest · Transaction · Ward · Room ·   │
│  Bed · BedAssignment · Shift · ShiftSlot · StaffShift ·        │
│  BiometricDevice · AttendanceRecord · DailyAttendanceSummary · │
│  QueueToken · Hl7Log · ContactMessage · Service · OTP ·        │
│  StaffSalary · RoomCategory · HospitalAssetRent ·              │
│  TransactionCategory                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
Hospital_Management_System/
├── backend/
│   ├── api/
│   │   └── index.js              # Vercel serverless entry point
│   ├── app.js                     # Express app configuration
│   ├── index.js                   # Local development server entry
│   ├── config/
│   │   ├── database.js            # PostgreSQL pool configuration
│   │   └── prismaClient.js        # Prisma client singleton
│   ├── controllers/
│   │   ├── admin/                 # 22 admin controllers
│   │   │   ├── authController.js
│   │   │   ├── staffController.js
│   │   │   ├── patientController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── labTestController.js
│   │   │   ├── financeController.js
│   │   │   ├── bedController.js
│   │   │   ├── wardController.js
│   │   │   ├── roomController.js
│   │   │   ├── shiftController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── roleController.js
│   │   │   ├── permissionController.js
│   │   │   ├── serviceController.js
│   │   │   ├── departmentController.js
│   │   │   ├── homeController.js
│   │   │   ├── ReportController.js
│   │   │   └── ...
│   │   ├── staff/                 # 12 staff controllers
│   │   │   ├── authController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── patientController.js
│   │   │   ├── labTestController.js
│   │   │   ├── clinicalController.js
│   │   │   └── ...
│   │   ├── web/                   # 3 public web controllers
│   │   │   ├── contactController.js
│   │   │   ├── doctorController.js
│   │   │   └── serviceController.js
│   │   └── hl7Controller.js       # HL7 interoperability
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT token verification
│   │   ├── permissionMiddleware.js # Role-permission access control
│   │   ├── roleMiddleware.js      # Role-based gating
│   │   ├── errorHandler.js        # Global error handler
│   │   ├── uploadMiddleware.js    # Multer file upload (profiles)
│   │   ├── uploadReportMiddleware.js   # Lab report uploads
│   │   ├── uploadServiceMiddleware.js  # Service image uploads
│   │   ├── hl7ReceiveAuth.js      # HL7 API key auth
│   │   └── validate.js            # Express-validator runner
│   ├── models/                    # 24 Prisma model wrappers
│   │   ├── Admin.js, Appointment.js, Bed.js, Patient.js,
│   │   │   Staff.js, Transaction.js, Ward.js, Room.js, ...
│   │   └── ...
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (28 models)
│   │   ├── seed.js                # Comprehensive seed data
│   │   └── migrations/            # Prisma migration history
│   ├── routes/
│   │   ├── admin/                 # Admin API routes
│   │   ├── staff/                 # Staff API routes
│   │   ├── web/                   # Public website routes
│   │   ├── api/                   # HL7 integration routes
│   │   └── publicRoutes.js        # Unauthenticated routes
│   ├── services/
│   │   ├── biometricService.js    # ZKTeco device integration
│   │   ├── mailService.js         # Email notification service
│   │   ├── MrNumberService.js     # MR number generation
│   │   └── hl7/
│   │       ├── HL7Builder.js      # HL7 message construction
│   │       ├── HL7Parser.js       # HL7 message parsing
│   │       ├── HL7Facade.js       # HL7 workflow orchestration
│   │       └── HL7HttpTransporter.js  # HTTP transport layer
│   ├── utils/
│   │   ├── ApiResponse.js         # Standardized API response format
│   │   ├── asyncHandler.js        # Async error wrapper
│   │   ├── bedAutomation.js       # Auto bed status transitions
│   │   ├── jwtHelper.js           # JWT sign/verify helpers
│   │   ├── otpHelper.js           # OTP generation
│   │   └── sidebarConfig.js       # Dynamic sidebar menu config
│   ├── validations/admin/         # 10 validation schemas
│   ├── package.json
│   └── vercel.json                # Vercel deployment config
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Root component
│   │   ├── main.jsx               # React entry point
│   │   ├── index.css              # Global styles
│   │   ├── api/                   # API layer (admin/staff/web)
│   │   │   ├── admin/             # 18 admin API modules
│   │   │   ├── staff/             # 6 staff API modules
│   │   │   └── web/               # Public API module
│   │   ├── components/
│   │   │   ├── dashboard/         # Data tables, modals, lists
│   │   │   ├── finance/           # Billing step component
│   │   │   ├── layout/            # Sidebar, header, footer
│   │   │   ├── ui/                # Reusable UI (DatePicker, SearchableSelect, etc.)
│   │   │   └── web/               # Public site components (Hero, ServiceGrid, etc.)
│   │   ├── helpers/               # localStorage, toast helpers
│   │   ├── layouts/               # AuthLayout, DashboardLayout, WebLayout
│   │   ├── middleware/            # ProtectedRoute, PermissionGuard
│   │   ├── pages/
│   │   │   ├── admin/             # 16 admin page modules
│   │   │   │   ├── Dashboard.jsx (32KB — rich analytics)
│   │   │   │   ├── appointments/, attendance/, departments/,
│   │   │   │   │   finance/, inpatient/, lab/, patients/,
│   │   │   │   │   payments/, reports/, roles/, services/,
│   │   │   │   │   shifts/, staff/, tests/
│   │   │   │   └── Profile.jsx
│   │   │   ├── staff/             # Doctor & Staff dashboards
│   │   │   │   ├── DoctorDashboard.jsx
│   │   │   │   ├── StaffDashboard.jsx
│   │   │   │   ├── appointments/, finance/, lab/, patients/
│   │   │   │   └── Profile.jsx
│   │   │   ├── web/               # Public website pages
│   │   │   │   ├── Home.jsx, About.jsx, Services.jsx,
│   │   │   │   │   Doctors.jsx, Contact.jsx
│   │   │   └── auth/              # Login, Logout, 2FA, Forgot PW
│   │   ├── routes/                # Route definitions (admin/staff/auth)
│   │   ├── services/ApiService.js # Axios HTTP client singleton
│   │   └── validations/           # Client-side Yup schemas
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── vercel.json                # Vercel SPA rewrite config
│
├── credentials.md                 # Demo login credentials
├── run.sh                         # Quick-start script (Linux/Mac)
└── README.md
```

---

## 📋 Prerequisites

Ensure you have the following installed:

| Requirement | Minimum Version |
|---|---|
| **Node.js** | 18.x or higher |
| **npm** | 9.x or higher |
| **PostgreSQL** | 15.x (or use [Neon](https://neon.tech) for serverless) |
| **Git** | Latest |

Optional:
- **ZKTeco biometric device** (for live attendance tracking; simulation mode available for development)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MuhammadAbdullah20111/Hospital_Management_System.git
cd Hospital_Management_System
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories (see [Environment Variables](#-environment-variables) section below).

### 5. Set Up the Database

```bash
cd ../backend

# Generate Prisma client
npx prisma generate

# Run migrations against your database
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed
```

### 6. Start the Application

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Or use the provided script (Linux/macOS):

```bash
chmod +x run.sh
./run.sh
```

The application will be available at:
- **Frontend:** http://127.0.0.1:5173
- **Backend API:** http://localhost:5000/api

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database — Individual connection parameters
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
DB_SSL=true

# Database — Prisma connection URL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# HL7 Integration
HL7_DEFAULT_ENDPOINT_URL=http://localhost:5000/api/hl7/receive
HL7_OUTBOUND_TIMEOUT_MS=30000
HL7_RECEIVE_API_KEY=your_hl7_api_key

# Biometric (optional — set to true for development without physical devices)
SIMULATE_BIOMETRIC=true
```

### Frontend (`frontend/.env`)

```env
# API Base URL — points to your backend
VITE_BASE_URL=http://127.0.0.1:5000/api
```

> **⚠️ Important:** For Gmail SMTP, you need to generate an [App Password](https://myaccount.google.com/apppasswords) (not your regular Gmail password). Enable 2-Step Verification on your Google account first.

---

## 🗄 Database Setup

### Option A: Neon (Recommended — Serverless PostgreSQL)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project and database
3. Copy the connection string to your `DATABASE_URL` environment variable
4. Neon supports SSL and connection pooling out of the box

### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE hospital_management;
   ```
3. Update the `.env` with your local credentials

### Running Migrations & Seeding

```bash
cd backend

# Apply all pending migrations
npx prisma migrate dev

# Seed the database with comprehensive sample data
# This creates: admins, staff, roles, permissions, departments,
# patients, appointments, lab tests, transactions, wards,
# rooms, beds, shifts, biometric devices, and more
npx prisma db seed

# Open Prisma Studio (visual database browser)
npx prisma studio
```

The seed script creates a full Pakistani hospital dataset including:
- **2 System Admins** (Kamran Ahmed, Sana Malik)
- **2 Receptionists** (Shahzaib Raza, Nida Khan)
- **2 Lab Technicians** (Hamza Qureshi, Sadia Mirza)
- **6 Doctors** across multiple departments
- **Multiple departments** (Cardiology, Orthopedics, Pediatrics, etc.)
- **40+ permissions** mapped to roles
- **Sample patients, appointments, lab tests, transactions, wards, rooms, and beds**

---

## ▶️ Running the Application

### Development Mode

```bash
# Backend (hot-reload with Nodemon)
cd backend
npm run dev        # Starts on http://localhost:5000

# Frontend (Vite dev server)
cd frontend
npm run dev        # Starts on http://127.0.0.1:5173
```

### Production Build

```bash
# Backend
cd backend
npm start          # Runs node index.js

# Frontend
cd frontend
npm run build      # Outputs to dist/
npm run preview    # Preview the production build
```

### Available Scripts

#### Backend
| Script | Command | Description |
|---|---|---|
| `npm run dev` | `nodemon index.js` | Start dev server with hot reload |
| `npm start` | `node index.js` | Start production server |
| `npm run build` | `prisma generate` | Generate Prisma client |
| `npm run db:migrate` | `npx prisma migrate dev` | Run database migrations |
| `npm run db:generate` | `npx prisma generate` | Regenerate Prisma client |
| `npm run db:studio` | `npx prisma studio` | Open Prisma visual editor |

#### Frontend
| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Start Vite dev server |
| `npm run build` | `vite build` | Create production bundle |
| `npm run preview` | `vite preview` | Preview production build |
| `npm run lint` | `eslint .` | Run ESLint checks |

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

The project is pre-configured for Vercel with `vercel.json` files in both `backend/` and `frontend/`.

#### Backend Deployment

1. Import the `backend/` directory as a new Vercel project
2. Set the root directory to `backend`
3. Add all environment variables from `backend/.env` to Vercel's project settings
4. Set the build command to `prisma generate`
5. The API routes are automatically handled via `api/index.js` (Vercel serverless function)

> **Note:** File uploads (multer) are ephemeral on Vercel's serverless runtime. For persistent file storage in production, migrate to Vercel Blob, Cloudinary, or AWS S3.

#### Frontend Deployment

1. Import the `frontend/` directory as a new Vercel project
2. Set the root directory to `frontend`
3. Set `VITE_BASE_URL` to your deployed backend URL (e.g., `https://your-backend.vercel.app/api`)
4. Build command: `npm run build`
5. Output directory: `dist`

---

## 📡 API Reference

### Base URL
```
Development: http://localhost:5000/api
Production:  https://your-backend.vercel.app/api
```

### Route Groups

#### Public Routes (No Authentication)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/` | Health check + DB status |
| `GET` | `/api/web/services` | List hospital services |
| `GET` | `/api/web/doctors` | List doctors |
| `POST` | `/api/web/contact` | Submit contact form |

#### Admin Routes (`/api/admin/*`) — JWT + Admin Auth Required
| Resource | Endpoints | Operations |
|---|---|---|
| **Auth** | `/auth/login`, `/auth/verify-2fa`, `/auth/forgot-password`, `/auth/reset-password` | Login, 2FA, Password Reset |
| **Dashboard** | `/home/dashboard-stats` | KPI stats, trends |
| **Staff** | `/staff` | CRUD + Profile Image Upload |
| **Roles** | `/roles` | CRUD + Permission Assignment |
| **Permissions** | `/permissions` | List All |
| **Patients** | `/patients` | CRUD + MR Number Generation |
| **Appointments** | `/appointments` | CRUD + Status Management |
| **Lab Tests** | `/lab-tests` | CRUD + Report Upload |
| **Tests** | `/tests` | Test Catalog CRUD |
| **Finance** | `/finance` | Transactions + Summary |
| **Departments** | `/departments` | CRUD |
| **Services** | `/services` | CRUD + Image Upload |
| **Shifts** | `/shifts` | CRUD + Slot Management |
| **Attendance** | `/attendance` | View + Biometric Sync |
| **Wards** | `/wards` | CRUD |
| **Rooms** | `/rooms` | CRUD + Category |
| **Beds** | `/beds` | CRUD + Status + Assignment |
| **Reports** | `/reports` | Analytics Data |

#### Staff Routes (`/api/staff/*`) — JWT + Staff Auth Required
| Resource | Endpoints | Operations |
|---|---|---|
| **Auth** | `/auth/login`, `/auth/verify-2fa`, `/auth/forgot-password` | Login, 2FA, Password Reset |
| **Dashboard** | `/home/dashboard-stats` | Role-specific stats |
| **Appointments** | `/appointments` | View + Create + Prescriptions |
| **Patients** | `/patients` | View + Register |
| **Lab Tests** | `/lab-tests` | View + Accept + Complete |
| **Finance** | `/finance` | View Transactions |

#### HL7 Routes (`/api/hl7/*`) — API Key Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/hl7/send/admit` | Send ADT^A01 message |
| `POST` | `/api/hl7/send/discharge` | Send ADT^A03 message |
| `POST` | `/api/hl7/send/lab-order` | Send ORM^O01 message |
| `POST` | `/api/hl7/send/lab-result` | Send ORU^R01 message |
| `POST` | `/api/hl7/receive` | Receive inbound HL7 messages |

### Response Format

All API responses follow a standardized format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

---

## 🔒 Authentication & Authorization

### Authentication Flow

```
1. User submits email/password → POST /api/admin/auth/login
                                  or POST /api/staff/auth/login
2. Server validates credentials (bcrypt compare)
3. If 2FA enabled → OTP sent to email → User submits OTP → POST /auth/verify-2fa
4. JWT token issued (valid for 7 days)
5. Client stores token in localStorage
6. All subsequent requests include: Authorization: Bearer <token>
```

### Authorization Layers

1. **`authMiddleware`** — Verifies JWT token and attaches `req.user`
2. **`roleMiddleware`** — Checks user type (SYSTEM_ADMIN vs STAFF)
3. **`permissionMiddleware`** — Checks granular permissions against the user's role

### Permission Categories

| Module | Permissions |
|---|---|
| **Dashboard** | `view-dashboard` |
| **Staff** | `view-staff`, `create-staff`, `edit-staff`, `delete-staff` |
| **Roles** | `view-roles`, `create-roles`, `edit-roles`, `delete-roles` |
| **Patients** | `view-patient`, `create-patient`, `edit-patient`, `delete-patient` |
| **Appointments** | `view-appointment`, `create-appointment`, `edit-appointment`, `delete-appointment` |
| **Lab Tests** | `view-labtest`, `create-labtest`, `edit-labtest`, `delete-labtest` |
| **Finance** | `view-finance`, `create-finance`, `edit-finance`, `delete-finance` |
| **Inpatient** | `view-ward`, `create-ward`, ..., `view-room`, ..., `view-bed`, ... |
| **Shifts** | `view-shift`, `create-shift`, `edit-shift`, `delete-shift` |
| **Attendance** | `view-attendance` |
| **Reports** | `view-reports` |
| ... | **40+ total permissions** |

---

## ⚙️ Background Services

The local development server (`index.js`) starts the following background services:

### 1. Bed Automation Service
- **Interval:** Every 60 seconds
- **Action:** Automatically transitions beds from `CLEANING` → `AVAILABLE` after 15 minutes
- **Purpose:** Eliminates manual bed status updates after housekeeping

### 2. Biometric Device Sync
- **Interval:** Every 30 seconds
- **Action:** Connects to all active ZKTeco devices, pulls attendance logs, processes check-in/check-out records, and recalculates daily attendance summaries
- **Purpose:** Keeps attendance data synchronized within 1 minute of physical punches

### 3. Startup Migrations
- **Runs once** on server start
- Ensures all required permissions exist in the database
- Assigns new permissions to the ADMIN role
- Cleans up deprecated permissions

> **Note:** Background services only run in `index.js` (local/VPS deployment). They do **not** run on Vercel's serverless environment.

---

## 🔀 HL7 Integration

The system supports **HL7 v2.x** messaging for healthcare interoperability:

### Message Types Supported

| Type | Trigger Event | Description |
|---|---|---|
| `ADT^A01` | Patient Admit | Sends patient demographics upon bed assignment |
| `ADT^A03` | Patient Discharge | Notifies external systems of patient discharge |
| `ORM^O01` | Lab Order | Sends lab test order to LIS (Lab Information System) |
| `ORU^R01` | Lab Result | Sends/receives lab test results |

### Architecture

```
Hospital System → HL7Builder → HL7HttpTransporter → External System
                                                          ↓
Hospital System ← HL7Parser ← hl7Controller/receive ← Inbound POST
```

### Configuration

```env
HL7_DEFAULT_ENDPOINT_URL=http://localhost:5000/api/hl7/receive
HL7_OUTBOUND_TIMEOUT_MS=30000
HL7_RECEIVE_API_KEY=sk_live_hl7_default_key_123
```

---

## 🔑 Default Credentials

> **Password for all accounts:** `password123`

| Role | Email | Name |
|---|---|---|
| **Admin** | `kamran.admin@mkmc.com` | Kamran Ahmed |
| **Admin** | `sana.admin@mkmc.com` | Sana Malik |
| **Receptionist** | `shahzaib.frontdesk@mkmc.com` | Shahzaib Raza |
| **Receptionist** | `nida.frontdesk@mkmc.com` | Nida Khan |
| **Lab Technician** | `hamza.labs@mkmc.com` | Hamza Qureshi |
| **Lab Technician** | `sadia.labs@mkmc.com` | Sadia Mirza |
| **Doctor** | `dr.muhammad.tariq@mkmc.com` | Dr. Muhammad Tariq |
| **Doctor** | `dr.aisha.khan@mkmc.com` | Dr. Aisha Khan |
| **Doctor** | `dr.bilal.ahmed@mkmc.com` | Dr. Bilal Ahmed |
| **Doctor** | `dr.sana.ali@mkmc.com` | Dr. Sana Ali |
| **Doctor** | `dr.usman.raza@mkmc.com` | Dr. Usman Raza |
| **Doctor** | `dr.zainab.fatimah@mkmc.com` | Dr. Zainab Fatimah |

### Login URLs
- **Admin Panel:** `/auth/admin/login`
- **Staff Portal:** `/auth/staff/login`

---

## 📸 Screenshots

> *Add screenshots of your application here to showcase the UI.*

<!-- 
![Admin Dashboard](screenshots/admin-dashboard.png)
![Patient Registration](screenshots/patient-registration.png)
![Bed Management](screenshots/bed-management.png)
-->

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request

### Commit Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Formatting (no code change)
- `refactor:` — Code restructuring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for <strong>Mehmood Khan Medical Center</strong>
</p>
