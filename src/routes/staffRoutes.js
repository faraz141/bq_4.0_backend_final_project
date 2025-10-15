const express = require("express");
const router = express.Router();
const {
  bookAppointmentForPatient,
  updateAppointmentStatus,
  getTodaySchedules,
  getDailySchedule,
  getAllAppointments,
} = require("../controllers/staffController");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");


router.post(
  "/book-appointment",
  authenticate,
  authorizeRoles("staff", "subadmin"),
  bookAppointmentForPatient
);
router.put(
  "/appointments/:id/status",
  authenticate,
  authorizeRoles("staff", "subadmin"),
  updateAppointmentStatus
);
router.get(
  "/today-schedules",
  authenticate,
  authorizeRoles("staff", "subadmin"),
  getTodaySchedules
);
router.get(
  "/daily-schedule/:date",
  authenticate,
  authorizeRoles("staff", "subadmin"),
  getDailySchedule
);
router.get(
  "/appointments",
  authenticate,
  authorizeRoles("staff", "subadmin"),
  getAllAppointments
);

module.exports = router;
