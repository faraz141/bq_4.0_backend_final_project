const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/UserModel");
const Joi = require("joi");

const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  departmentId: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required()
});

// Patient books appointment with specific doctor
exports.bookAppointment = async (req, res) => {
  try {
    const { error } = bookAppointmentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { doctorId, departmentId, date, time } = req.body;
    const userId = req.user._id; // Patient ID from auth

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['Booked', 'Attended'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'Active') {
      return res.status(400).json({ message: "Doctor not available" });
    }

    // Create appointment
    const appointment = new Appointment({
      doctorId,
      userId,
      departmentId,
      date,
      time,
      status: 'Booked',
      createdBy: userId
    });

    await appointment.save();
    
    // Populate appointment details
    await appointment.populate([
      { path: 'doctorId', select: 'name specialization' },
      { path: 'departmentId', select: 'name' }
    ]);

    res.status(201).json({ 
      message: "Appointment booked successfully", 
      appointment 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get patient's appointment history (past and upcoming)
exports.getMyAppointmentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, upcoming } = req.query;
    
    let filter = { userId };
    if (status) filter.status = status;
    
    const today = new Date().toISOString().slice(0, 10);
    
    if (upcoming === 'true') {
      filter.date = { $gte: today };
    } else if (upcoming === 'false') {
      filter.date = { $lt: today };
    }

    const appointments = await Appointment.find(filter)
      .populate([
        { 
          path: 'doctorId', 
          select: 'name specialization',
          populate: { path: 'departmentId', select: 'name' }
        },
        { path: 'departmentId', select: 'name description' }
      ])
      .sort({ date: -1, time: 1 });

    // Separate past and upcoming appointments
    const pastAppointments = appointments.filter(apt => apt.date < today);
    const upcomingAppointments = appointments.filter(apt => apt.date >= today);

    res.json({
      patient: {
        id: req.user._id,
        name: req.user.name
      },
      summary: {
        total: appointments.length,
        upcoming: upcomingAppointments.length,
        past: pastAppointments.length,
        attended: appointments.filter(apt => apt.status === 'Attended').length,
        missed: appointments.filter(apt => apt.status === 'Missed').length
      },
      appointments: {
        upcoming: upcomingAppointments,
        past: pastAppointments
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel appointment (only for upcoming appointments)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user._id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId,
      status: 'Booked'
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or cannot be cancelled" });
    }

    // Check if appointment is in the future
    const today = new Date().toISOString().slice(0, 10);
    if (appointment.date <= today) {
      return res.status(400).json({ message: "Cannot cancel past or today's appointments" });
    }

    await Appointment.findByIdAndDelete(appointmentId);
    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Staff function to update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Booked', 'Attended', 'Missed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate([
      { path: 'doctorId', select: 'name specialization' },
      { path: 'userId', select: 'name email' },
      { path: 'departmentId', select: 'name' }
    ]);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ 
      message: "Appointment status updated successfully", 
      appointment 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all appointments (Admin/Staff view)
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, doctorId, departmentId, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) filter.date = date;
    if (doctorId) filter.doctorId = doctorId;
    if (departmentId) filter.departmentId = departmentId;

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialization')
      .populate('userId', 'name email contact')
      .populate('departmentId', 'name')
      .sort({ date: -1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAppointments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
