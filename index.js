const express = require("express");
require("dotenv").config();
const app = express();
const dbConnection = require("./config/db_connection");
const { CronJobService } = require("./services/cronJobService");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Professional Health Check Endpoint
app.get("/health", async (req, res) => {
  const startTime = Date.now();

  try {
    // Check database connection
    const dbStatus = await checkDatabaseHealth();

    // Check cron job status (if available)
    const cronStatus = cronService
      ? {
          status: "running",
          jobCount: cronService.getJobStatus().length,
          jobs: cronService.getJobStatus(),
        }
      : {
          status: "not_initialized",
          jobCount: 0,
          jobs: [],
        };

    // System information
    const systemInfo = {
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || "development",
    };

    const responseTime = Date.now() - startTime;

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
      responseTime: `${responseTime}ms`,
      version: "1.0.0",
      service: "Hospital Management System API",
      database: dbStatus,
      cronJobs: cronStatus,
      system: systemInfo,
      endpoints: {
        auth: "/api/auth",
        admin: "/api/admin",
        staff: "/api/staff",
        doctors: "/api/doctors",
        appointments: "/api/appointments",
        analytics: "/api/analytics",
        departments: "/api/departments",
        cron: "/api/cron",
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
      service: "Hospital Management System API",
      version: "1.0.0",
    });
  }
});

// Database health check function
async function checkDatabaseHealth() {
  try {
    const mongoose = require("mongoose");

    if (mongoose.connection.readyState === 1) {
      // Test database query
      const User = require("./models/UserModel");
      await User.findOne().limit(1);

      return {
        status: "connected",
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      };
    } else {
      return {
        status: "disconnected",
        readyState: mongoose.connection.readyState,
      };
    }
  } catch (error) {
    return {
      status: "error",
      error: error.message,
    };
  }
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/cron", require("./routes/cronRoutes"));

// Additional monitoring endpoints
app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    service: "Hospital Management System",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/system/info", async (req, res) => {
  try {
    const User = require("./models/UserModel");
    const Doctor = require("./models/doctorModel");
    const Staff = require("./models/staffModel");
    const Department = require("./models/deparmentModel");
    const Appointment = require("./models/appointmentModel");

    const stats = {
      system: {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
      database: {
        totalUsers: await User.countDocuments(),
        totalDoctors: await Doctor.countDocuments(),
        totalStaff: await Staff.countDocuments(),
        totalDepartments: await Department.countDocuments(),
        totalAppointments: await Appointment.countDocuments(),
        todayAppointments: await Appointment.countDocuments({
          date: new Date().toISOString().slice(0, 10),
        }),
      },
      lastUpdated: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: "Unable to fetch system information",
      message: error.message,
    });
  }
});

// Initialize cron jobs
let cronService;
try {
  cronService = new CronJobService();
  console.log("Cron jobs service initialized successfully");
} catch (error) {
  console.error("Failed to initialize cron jobs:", error);
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  if (cronService) {
    cronService.stopAllJobs();
  }
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  if (cronService) {
    cronService.stopAllJobs();
  }
  process.exit(0);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
