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


router.post("/book", bookAppointment); 
router.get("/patient/:patientId", getPatientAppointmentHistory);
router.delete("/patient/:patientId/cancel/:appointmentId", cancelAppointmentByPatientId); 
router.get("/search-patient/:patientId", searchPatient); 


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
