const express = require('express');
const router = express.Router();
const {
  bookAppointmentForPatient,
  updateAppointmentStatus,
  getTodaySchedules,
  getAllAppointments
} = require('../controllers/staffController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Staff Routes
router.post('/book-appointment', authenticate, authorizeRoles('staff', 'subadmin'), bookAppointmentForPatient);
router.put('/appointments/:id/status', authenticate, authorizeRoles('staff', 'subadmin'), updateAppointmentStatus);
router.get('/today-schedules', authenticate, authorizeRoles('staff', 'subadmin'), getTodaySchedules);
router.get('/appointments', authenticate, authorizeRoles('staff', 'subadmin'), getAllAppointments);

module.exports = router;