const express = require("express");
const router = express.Router();
const {
  getDoctorsMonthlyReport,
  getAdminDashboard,
  getStaffDailySchedule,
  getMissedVsAttendedReport,
  getUserAppointmentHistory,
} = require("../controllers/analyticsController");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Doctors Monthly Appointment Report
router.get(
  "/doctors-monthly-report",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getDoctorsMonthlyReport
);

// Admin Dashboard
router.get(
  "/admin-dashboard",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getAdminDashboard
);

// Staff Daily Schedule
router.get(
  "/daily-schedule",
  authenticate,
  authorizeRoles("admin", "subadmin", "staff"),
  getStaffDailySchedule
);

// Missed vs Attended Report
router.get(
  "/missed-vs-attended",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getMissedVsAttendedReport
);

// User Appointment History with Details
router.get(
  "/user-history/:userId",
  authenticate,
  authorizeRoles("admin", "subadmin", "staff"),
  getUserAppointmentHistory
);

module.exports = router;
