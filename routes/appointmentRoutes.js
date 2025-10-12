const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointmentHistory,
  cancelAppointment,
  updateAppointmentStatus,
  getAllAppointments
} = require('../controllers/appointmentController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Patient routes
router.post('/book', authenticate, authorizeRoles('patient'), bookAppointment);
router.get('/my-history', authenticate, authorizeRoles('patient'), getMyAppointmentHistory);
router.delete('/:id/cancel', authenticate, authorizeRoles('patient'), cancelAppointment);

// Admin/Staff routes
router.put('/:id/status', authenticate, authorizeRoles('admin', 'subadmin', 'staff'), updateAppointmentStatus);
router.get('/all', authenticate, authorizeRoles('admin', 'subadmin', 'staff'), getAllAppointments);

module.exports = router;
