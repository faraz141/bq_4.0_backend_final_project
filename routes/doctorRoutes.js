const express = require('express');
const router = express.Router();
const {
  getTodayAppointments,
  getMonthlyStatistics,
  getPatientHistory,
  getDoctors,
  getDoctorAvailability
} = require('../controllers/doctorController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.get('/', authenticate, getDoctors);
router.get('/:doctorId/availability', authenticate, getDoctorAvailability);

// Doctor-specific routes
router.get('/my/today-appointments', authenticate, authorizeRoles('doctor'), getTodayAppointments);
router.get('/my/monthly-statistics', authenticate, authorizeRoles('doctor'), getMonthlyStatistics);
router.get('/my/patient-history', authenticate, authorizeRoles('doctor'), getPatientHistory);

module.exports = router;
