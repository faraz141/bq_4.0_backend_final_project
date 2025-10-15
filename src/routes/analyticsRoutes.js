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


router.get(
  "/doctors-monthly-report",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getDoctorsMonthlyReport
);


router.get(
  "/admin-dashboard",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getAdminDashboard
);


router.get(
  "/daily-schedule",
  authenticate,
  authorizeRoles("admin", "subadmin", "staff"),
  getStaffDailySchedule
);


router.get(
  "/missed-vs-attended",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getMissedVsAttendedReport
);


router.get(
  "/user-history/:userId",
  authenticate,
  authorizeRoles("admin", "subadmin", "staff"),
  getUserAppointmentHistory
);

module.exports = router;
