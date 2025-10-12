const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/UserModel");
const Joi = require("joi");

const bookAppointmentSchema = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().required(),
  departmentId: Joi.string().required(),
  date: Joi.string().required(), // YYYY-MM-DD format
  time: Joi.string().required()
});

// Book appointment for patient
exports.bookAppointmentForPatient = async (req, res) => {
  try {
    const { error } = bookAppointmentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { patientId, doctorId, departmentId, date, time } = req.body;

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['Booked', 'Attended'] }
    });

    if (existingAppointment) {
      // Find next available slot and create appointment request
      const nextAvailableSlot = await findNextAvailableSlot(doctorId, date);
      
      if (nextAvailableSlot) {
        const appointment = new Appointment({
          doctorId,
          userId: patientId,
          departmentId,
          date: nextAvailableSlot.date,
          time: nextAvailableSlot.time,
          status: 'Booked',
          createdBy: req.user._id
        });

        await appointment.save();
        await appointment.populate([
          { path: 'doctorId', select: 'name specialization' },
          { path: 'userId', select: 'name email' },
          { path: 'departmentId', select: 'name' }
        ]);

        return res.status(201).json({
          message: "Requested slot was full. Appointment booked in next available slot.",
          appointment,
          nextAvailable: true
        });
      } else {
        return res.status(400).json({ message: "No available slots found for this doctor" });
      }
    }

    // Book in requested slot
    const appointment = new Appointment({
      doctorId,
      userId: patientId,
      departmentId,
      date,
      time,
      status: 'Booked',
      createdBy: req.user._id
    });

    await appointment.save();
    await appointment.populate([
      { path: 'doctorId', select: 'name specialization' },
      { path: 'userId', select: 'name email' },
      { path: 'departmentId', select: 'name' }
    ]);

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update appointment status (Attended, Missed)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Attended', 'Missed'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Attended' or 'Missed'" });
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

    res.json({ message: "Appointment status updated successfully", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View today's schedules for all doctors
exports.getTodaySchedules = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    const todayAppointments = await Appointment.aggregate([
      {
        $match: { date: today }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'patient'
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $unwind: '$patient'
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$doctor._id',
          doctorName: { $first: '$doctor.name' },
          specialization: { $first: '$doctor.specialization' },
          department: { $first: '$department.name' },
          appointments: {
            $push: {
              appointmentId: '$_id',
              patientName: '$patient.name',
              patientEmail: '$patient.email',
              time: '$time',
              status: '$status',
              date: '$date'
            }
          },
          totalAppointments: { $sum: 1 },
          attended: { $sum: { $cond: [{ $eq: ['$status', 'Attended'] }, 1, 0] } },
          missed: { $sum: { $cond: [{ $eq: ['$status', 'Missed'] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ['$status', 'Booked'] }, 1, 0] } }
        }
      },
      {
        $sort: { doctorName: 1 }
      }
    ]);

    res.json({ date: today, schedules: todayAppointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all appointments with filtering options
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, doctorId, departmentId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) filter.date = date;
    if (doctorId) filter.doctorId = doctorId;
    if (departmentId) filter.departmentId = departmentId;

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialization')
      .populate('userId', 'name email contact')
      .populate('departmentId', 'name')
      .sort({ date: -1, time: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to find next available slot
async function findNextAvailableSlot(doctorId, requestedDate) {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.timeSlots.length) return null;

    // Start from requested date and look for next 30 days
    const startDate = new Date(requestedDate);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      const dateString = checkDate.toISOString().slice(0, 10);
      
      // Check if doctor is available on this day
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (!doctor.availableDays.includes(dayName)) continue;

      // Check each time slot
      for (const slot of doctor.timeSlots) {
        const existingAppointment = await Appointment.findOne({
          doctorId,
          date: dateString,
          time: slot.startTime,
          status: { $in: ['Booked', 'Attended'] }
        });

        if (!existingAppointment) {
          return { date: dateString, time: slot.startTime };
        }
      }
    }

    return null;
  } catch (err) {
    console.error('Error finding next available slot:', err);
    return null;
  }
}

module.exports = exports;