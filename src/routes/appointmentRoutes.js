const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getMyAppointmentHistory,
  getPatientAppointmentHistory,
  cancelAppointment,
  cancelAppointmentByPatientId,
  updateAppointmentStatus,
  getAllAppointments,
  searchPatient,
  getAllPatients,
} = require("../controllers/appointmentController");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.post("/book", bookAppointment); // Book appointment without registration
router.get("/patient/:patientId", getPatientAppointmentHistory); // Get appointment history by patient ID
router.delete("/patient/:patientId/cancel/:appointmentId", cancelAppointmentByPatientId); // Cancel appointment by patient ID
router.get("/search-patient/:patientId", searchPatient); // Search patient by patient ID

// Authenticated Patient routes (kept for backward compatibility)
router.get(
  "/my-history",
  authenticate,
  authorizeRoles("patient"),
  getMyAppointmentHistory
);
router.delete(
  "/:id/cancel",
  authenticate,
  authorizeRoles("patient"),
  cancelAppointment
);

// Admin/Staff routes
router.put(
  "/:id/status",
  authenticate,
  authorizeRoles("admin", "subadmin", "staff"),
  updateAppointmentStatus
);
router.get(
  "/all",
  authenticate,
  authorizeRoles("admin", "subadmin", "staff"),
  getAllAppointments
);
router.get(
  "/patients",
  authenticate,
  authorizeRoles("admin", "subadmin", "staff"),
  getAllPatients
);

module.exports = router;
