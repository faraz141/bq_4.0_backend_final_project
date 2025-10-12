const express = require("express");
const router = express.Router();
const {
  getDailyStatistics,
  getStatsByDate,
  generateStatsForDate,
  updateMissedAppointmentsForDate,
  getCronJobSummary,
} = require("../controllers/cronController");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Get daily statistics with pagination and filtering
router.get(
  "/daily-statistics",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getDailyStatistics
);

// Get statistics for a specific date
router.get(
  "/statistics/:date",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getStatsByDate
);

// Manually generate statistics for a specific date
router.post(
  "/generate-statistics",
  authenticate,
  authorizeRoles("admin"),
  generateStatsForDate
);

// Manually update missed appointments for a specific date
router.post(
  "/update-missed-appointments",
  authenticate,
  authorizeRoles("admin"),
  updateMissedAppointmentsForDate
);

// Get cron job execution summary and status
router.get(
  "/cron-summary",
  authenticate,
  authorizeRoles("admin"),
  getCronJobSummary
);

module.exports = router;
