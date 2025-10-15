const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Doctor = require("../models/doctorModel");
const Staff = require("../models/staffModel");
const Department = require("../models/deparmentModel");
const Appointment = require("../models/appointmentModel");

const checkDatabaseHealth = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
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
};

/**
 * Professional Health Check Endpoint
 * Returns comprehensive health status including database, cron jobs, and system info
 * @route GET /health
 * @access Public
 */
const getHealthStatus = async (req, res) => {
  const startTime = Date.now();

  try {
    const dbStatus = await checkDatabaseHealth();

    const cronService = req.app.locals.cronService;
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
};

/**
 * Simple Status Check
 * Returns basic status information
 * @route GET /status
 * @access Public
 */
const getStatus = (req, res) => {
  res.json({
    status: "ok",
    service: "Hospital Management System",
    timestamp: new Date().toISOString(),
  });
};

/**
 * System Information Endpoint
 * Returns detailed system statistics including database counts
 * @route GET /api/system/info
 * @access Public
 */
const getSystemInfo = async (req, res) => {
  try {
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
};

module.exports = {
  getHealthStatus,
  getStatus,
  getSystemInfo,
};
