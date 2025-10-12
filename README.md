# Hospital Management System

A comprehensive Hospital Management System built with Node.js, Express.js, and MongoDB. This backend-only application implements role-based authentication and management of hospital workflows, including doctors, staff, appointments, and patients.

## 🚀 Features

### User Roles & Capabilities

#### **Admin**

- ✅ Create, update, and delete departments
- ✅ Create, update, and delete staff, doctor, and sub-admin accounts
- ✅ Assign multiple doctors to departments with available days and time slots
- ✅ View hospital statistics (appointments by department, missed vs attended, etc.)
- ✅ Access comprehensive analytics and reports
- ✅ Manage cron jobs and automated tasks

#### **Staff**

- ✅ Login using credentials provided by Admin
- ✅ Book appointments for patients with specific doctors
- ✅ Automatically find next available slot if requested slot is full
- ✅ Update appointment status (Attended, Missed)
- ✅ View today's schedules for all doctors
- ✅ Access daily schedule reports with patient details

#### **Doctor**

- ✅ Login with credentials created by Admin
- ✅ View today's appointments with patient details and timings
- ✅ Access monthly statistics of appointments
- ✅ View historical data of patients treated
- ✅ Check personal appointment analytics

#### **Patient/User**

- ✅ Register and login through the system
- ✅ Book appointments with specific doctors
- ✅ View appointment history (past and upcoming)
- ✅ Cancel upcoming appointments
- ✅ View detailed appointment information

### Technical Features

#### **Database Models**

- ✅ **Users**: Patient details with name, email, password, age, gender, contact, address
- ✅ **Doctors**: Doctor details with specialization, departmentId, availableDays, timeSlots, status
- ✅ **Departments**: Hospital departments with name, description, createdBy
- ✅ **Staff**: Staff login credentials and details with departmentId, role
- ✅ **Appointments**: Booking and status data with doctorId, userId, date, time, status, createdBy

#### **Aggregation Pipelines**

- ✅ **Doctors Monthly Appointment Report**: Count appointments grouped by month
- ✅ **Admin Dashboard**: Appointments grouped by department
- ✅ **Staff Daily Schedule**: Joined data of doctors and patients for today
- ✅ **Missed vs Attended Appointment Report**: For hospital statistics
- ✅ **User Appointment History**: With doctor and department details

#### **Performance Optimization**

- ✅ **Mongoose Indexes** implemented on:
  - Users Collection: email (unique), role, departmentIds, specialization
  - Doctors Collection: email (unique), departmentId, specialization, status
  - Appointments Collection: doctorId + date (compound), userId, date, status, departmentId
  - Staff Collection: email (unique), departmentId, role
  - Departments Collection: name (unique), createdBy

#### **Cron Jobs Implementation**

- ✅ **Appointment Status Update**: Automatically mark appointments as "Missed" if not attended by end of day
- ✅ **Daily Statistics Generation**: Generate and store daily summaries (attended/missed appointments)
- ✅ **Weekly Data Cleanup**: Remove expired data and identify inactive users
- ✅ **Notification Scheduler**: Process reminder notifications (framework ready)

## 📁 Project Structure

```
Hospital_Mangement_System/
├── config/
│   └── db_connection.js          # MongoDB connection
├── controllers/
│   ├── adminController.js        # Admin management functions
│   ├── analyticsController.js    # Aggregation pipelines & reports
│   ├── appointmentController.js  # Patient appointment management
│   ├── authController.js         # Authentication (register/login)
│   ├── cronController.js         # Cron job management
│   ├── departmentController.js   # Department CRUD operations
│   ├── doctorController.js       # Doctor-specific functions
│   └── staffController.js        # Staff-specific functions
├── middleware/
│   └── authMiddleware.js         # JWT authentication & role authorization
├── models/
│   ├── UserModel.js              # Patient/Admin user model
│   ├── doctorModel.js            # Doctor model
│   ├── staffModel.js             # Staff model
│   ├── deparmentModel.js         # Department model
│   └── appointmentModel.js       # Appointment model
├── routes/
│   ├── adminRoutes.js            # Admin API endpoints
│   ├── analyticsRoutes.js        # Analytics & reports endpoints
│   ├── appointmentRoutes.js      # Appointment API endpoints
│   ├── authRoutes.js             # Authentication endpoints
│   ├── cronRoutes.js             # Cron job management endpoints
│   ├── departmentRoutes.js       # Department API endpoints
│   ├── doctorRoutes.js           # Doctor API endpoints
│   └── staffRoutes.js            # Staff API endpoints
├── services/
│   └── cronJobService.js         # Cron job implementation
├── index.js                      # Main application entry point
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Hospital_Mangement_System
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   MongoURI=mongodb://localhost:27017/hospital_management
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Start the application**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify installation**
   - Visit `http://localhost:3000/health` - should return `{"ok": true}`

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/register    # Register new user (patient/admin)
POST /api/auth/login       # Login for all user types
```

### Admin Management

```
POST   /api/admin/staff           # Create staff member
PUT    /api/admin/staff/:id       # Update staff member
DELETE /api/admin/staff/:id       # Delete staff member
GET    /api/admin/staff           # Get all staff

POST   /api/admin/doctors         # Create doctor
PUT    /api/admin/doctors/:id     # Update doctor
DELETE /api/admin/doctors/:id     # Delete doctor
GET    /api/admin/doctors         # Get all doctors

POST   /api/admin/assign-doctors  # Assign doctors to departments
GET    /api/admin/hospital-statistics # Hospital overview statistics
```

### Staff Operations

```
POST /api/staff/book-appointment       # Book appointment for patient
PUT  /api/staff/appointments/:id/status # Update appointment status
GET  /api/staff/today-schedules        # View today's doctor schedules
GET  /api/staff/appointments           # Get all appointments with filters
```

### Doctor Functions

```
GET /api/doctors/                           # Get doctors list
GET /api/doctors/:doctorId/availability     # Check doctor availability
GET /api/doctors/my/today-appointments      # Doctor's today appointments
GET /api/doctors/my/monthly-statistics      # Doctor's monthly stats
GET /api/doctors/my/patient-history         # Doctor's patient history
```

### Patient/Appointment Management

```
POST   /api/appointments/book              # Book appointment (patient)
GET    /api/appointments/my-history        # Patient's appointment history
DELETE /api/appointments/:id/cancel        # Cancel appointment (patient)
PUT    /api/appointments/:id/status        # Update appointment status (staff)
GET    /api/appointments/all               # Get all appointments (admin/staff)
```

### Department Management

```
GET    /api/departments     # Get all departments
POST   /api/departments     # Create department (admin)
PUT    /api/departments/:id # Update department (admin)
DELETE /api/departments/:id # Delete department (admin)
```

### Analytics & Reports

```
GET /api/analytics/doctors-monthly-report  # Monthly appointment reports by doctor
GET /api/analytics/admin-dashboard         # Department-wise appointment statistics
GET /api/analytics/daily-schedule          # Today's schedule with patient details
GET /api/analytics/missed-vs-attended      # Attendance vs missed appointment report
GET /api/analytics/user-history/:userId    # User's complete appointment history
```

### Cron Job Management

```
GET  /api/cron/daily-statistics           # Get daily statistics with pagination
GET  /api/cron/statistics/:date           # Get statistics for specific date
POST /api/cron/generate-statistics        # Manually generate stats for date
POST /api/cron/update-missed-appointments # Manually update missed appointments
GET  /api/cron/cron-summary               # Get cron job execution summary
```

## 🔐 Authentication & Authorization

The system uses JWT-based authentication with role-based access control:

- **Headers**: `Authorization: Bearer <jwt_token>`
- **Roles**: admin, subadmin, staff, doctor, patient
- **Protected Routes**: Most endpoints require authentication
- **Role Restrictions**: Specific roles can access specific endpoints

## 🤖 Automated Tasks (Cron Jobs)

### Scheduled Tasks:

1. **Daily at 12:00 AM**: Mark missed appointments
2. **Daily at 6:00 AM**: Generate daily statistics
3. **Weekly (Sunday 2:00 AM)**: Data cleanup tasks
4. **Hourly**: Process appointment reminders (framework ready)

## 🔧 Usage Examples

### Create an Admin User (First Time Setup)

```bash
POST /api/auth/register
{
  "name": "Hospital Admin",
  "email": "admin@hospital.com",
  "password": "password123",
  "role": "admin"
}
```

### Admin Creates a Doctor

```bash
POST /api/admin/doctors
Authorization: Bearer <admin_jwt_token>
{
  "name": "Dr. John Smith",
  "email": "dr.john@hospital.com",
  "password": "doctor123",
  "specialization": "Cardiology",
  "departmentId": "department_id_here",
  "availableDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "timeSlots": [
    {"startTime": "09:00", "endTime": "09:30"},
    {"startTime": "09:30", "endTime": "10:00"},
    {"startTime": "10:00", "endTime": "10:30"}
  ]
}
```

### Patient Books Appointment

```bash
POST /api/appointments/book
Authorization: Bearer <patient_jwt_token>
{
  "doctorId": "doctor_id_here",
  "departmentId": "department_id_here",
  "date": "2024-12-15",
  "time": "09:00"
}
```

## � Health Monitoring & System Status

### Health Check Endpoints

```
GET /health           # Comprehensive health check with database status
GET /status           # Basic service status
GET /api/system/info  # Detailed system information and statistics
```

The `/health` endpoint provides:

- Database connectivity status
- Cron job status monitoring
- System uptime and memory usage
- Service availability confirmation
- Response time metrics

### System Information

The `/api/system/info` endpoint returns:

- Current user, doctor, staff, department, and appointment counts
- Today's appointment statistics
- System performance metrics
- Database health indicators

## 📮 Postman Collection

A complete Postman collection is included with the project:

### Files Included:

- `Hospital_Management_System.postman_collection.json` - Complete API collection
- `Hospital_Management_System.postman_environment.json` - Environment variables

### Collection Features:

- ✅ Pre-configured authentication flows
- ✅ Sample data for all endpoints
- ✅ Environment variables for easy testing
- ✅ Organized folders by user roles
- ✅ Test scripts for response validation

### Import Instructions:

1. Open Postman
2. Click "Import" → "Upload Files"
3. Select both JSON files
4. Set the environment to "Hospital Management System"
5. Update `baseUrl` and `authToken` variables as needed

## �📊 Key Features Implemented

### ✅ Complete Role-Based System

- Separate models for Users (patients/admin), Doctors, and Staff
- Comprehensive authentication system supporting all user types
- Role-based route protection and authorization

### ✅ Advanced Appointment Management

- Smart slot booking with automatic next-available-slot finder
- Comprehensive appointment history and analytics
- Status management (Booked, Attended, Missed)

### ✅ Powerful Analytics & Reporting

- MongoDB aggregation pipelines for complex reports
- Real-time dashboard statistics
- Monthly, daily, and historical reporting

### ✅ Performance Optimized

- Strategic database indexing for fast queries
- Compound indexes for optimal query performance
- Efficient aggregation pipelines

### ✅ Automated Operations

- Cron jobs for appointment status management
- Daily statistics generation
- Automated cleanup tasks
- Notification framework (extensible)

## 🚦 Getting Started - Quick Test

1. **Start the server**: `npm run dev`
2. **Register an admin**: POST to `/api/auth/register` with role: "admin"
3. **Login as admin**: POST to `/api/auth/login`
4. **Create a department**: POST to `/api/departments`
5. **Create a doctor**: POST to `/api/admin/doctors`
6. **Register as patient**: POST to `/api/auth/register` (default role: "patient")
7. **Book appointment**: POST to `/api/appointments/book`

## 🔍 System Requirements Met

- ✅ **Node.js, Express.js, MongoDB**: Complete implementation
- ✅ **Role-based authentication**: All 5 roles implemented
- ✅ **Hospital workflow management**: Complete CRUD operations
- ✅ **Aggregation pipelines**: All 5 required pipelines implemented
- ✅ **Mongoose indexes**: Performance optimization completed
- ✅ **Cron jobs**: 4 automated tasks implemented
- ✅ **Database design**: All required collections with proper relationships

This Hospital Management System is production-ready and fully implements all requirements specified in the PDF documentation. (Backend)

A backend system for managing hospital operations — including appointments, departments, doctors, staff, and patients — built using Node.js, Express, and MongoDB.

🚀 Tech Stack

Node.js (Express)

MongoDB (Mongoose)

JWT Authentication

bcrypt.js for password hashing

dotenv for environment configuration

CORS enabled for frontend integration

⚙️ Project Setup
1️⃣ Clone the repository
git clone https://github.com/yourusername/hms-backend.git
cd hms-backend

2️⃣ Install dependencies
npm install

3️⃣ Create .env file
PORT=3000
MONGO_URI=mongodb://localhost:27017/hospitalDB
JWT_SECRET=supersecret

4️⃣ Run the server
npm run dev

Server runs at ➜ http://localhost:3000

🏗️ Folder Structure
├── controllers/
│ ├── authController.js
│ ├── appointmentController.js
│ ├── doctorController.js
│ └── departmentController.js
│
├── middleware/
│ ├── authMiddleware.js
│
├── models/
│ ├── User.js
│ ├── Appointment.js
│ └── Department.js
│
├── routes/
│ ├── authRoutes.js
│ ├── appointmentRoutes.js
│ ├── doctorRoutes.js
│ ├── departmentRoutes.js
│
├── index.js
└── .env

🔐 Authentication Flow
🧾 Register (Patient)

POST /api/auth/register

{
"name": "Darshan",
"email": "darshan@example.com",
"password": "123456",
"role": "patient"
}

🔑 Login (All Users)

POST /api/auth/login

{
"email": "darshan@example.com",
"password": "123456"
}

Response:

{
"token": "<JWT_TOKEN>"
}

Use this token in Postman:

Authorization: Bearer <JWT_TOKEN>

🏥 Admin Routes
➕ Create Department

POST /api/departments

{
"name": "Cardiology",
"description": "Heart and related care"
}

🔁 Update Department

PUT /api/departments/:id

❌ Delete Department

DELETE /api/departments/:id

👩‍⚕️ Create Doctor / Staff / Sub-Admin

POST /api/auth/register

{
"name": "Dr. Ahmed",
"email": "dr.ahmed@example.com",
"password": "123456",
"role": "doctor"
}

🧩 Assign Doctor Availability

PUT /api/doctors/:id/availability

{
"departmentIds": ["6703a0..."],
"availableSlots": [
{ "day": "Monday", "startTime": "09:00", "endTime": "13:00" },
{ "day": "Wednesday", "startTime": "10:00", "endTime": "15:00" }
]
}

👨‍💼 Staff Routes
🗓️ Create Appointment

POST /api/appointments

{
"patientId": "6703b1...",
"doctorId": "6703b2...",
"departmentId": "6703b3...",
"date": "2025-10-07",
"startTime": "10:00",
"endTime": "10:30"
}

🔁 Update Appointment Status

PUT /api/appointments/:id/status

{
"status": "attended"
}

📅 Get Today’s Appointments

GET /api/appointments/today

✅ Returns all appointments scheduled for today with doctor and patient info.

👨‍⚕️ Doctor Routes
📋 View My Appointments

GET /api/appointments/my

📊 Get Monthly Stats

(Can be extended to group by month)

🧾 Get Patient History

GET /api/patients/history

👤 Patient Routes
🩺 Book Appointment

POST /api/appointments

📅 View Appointment History

GET /api/appointments/my

🔍 Testing in Postman
Step-by-Step Testing Order

1️⃣ Register Admin

/api/auth/register with "role": "admin"

2️⃣ Login as Admin

Copy token

3️⃣ Create Departments

4️⃣ Register Doctor & Staff

5️⃣ Login as Staff

6️⃣ Create Appointments

7️⃣ Check Today’s Appointments

/api/appointments/today

8️⃣ Login as Doctor

/api/appointments/my

9️⃣ Login as Patient

/api/appointments/my

🧪 Example Database (Seed Data)

Optional: create seed.js to add test data

node seed.js

🛠️ Common Issues
Issue Cause Fix
Cannot find module '../models/User' Wrong file name or path Ensure correct case: models/User.js
[] empty array in /today No appointments for current date Create one with today’s date
JWT Error Missing token Add Authorization header
📊 Future Enhancements

Automated email/SMS reminders

Doctor leave management

Payment system integration

Admin dashboard with charts (missed vs attended)

👨‍💻 Author

Darshan Kumar
Full Stack Developer | Node.js | React | MongoDB
