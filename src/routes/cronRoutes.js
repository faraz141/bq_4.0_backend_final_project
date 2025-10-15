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


router.get(
  "/daily-statistics",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getDailyStatistics
);


router.get(
  "/statistics/:date",
  authenticate,
  authorizeRoles("admin", "subadmin"),
  getStatsByDate
);


router.post(
  "/generate-statistics",
  authenticate,
  authorizeRoles("admin"),
  generateStatsForDate
);


router.post(
  "/update-missed-appointments",
  authenticate,
  authorizeRoles("admin"),
  updateMissedAppointmentsForDate
);


router.get(
  "/cron-summary",
  authenticate,
  authorizeRoles("admin"),
  getCronJobSummary
);

module.exports = router;
