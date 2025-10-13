const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/UserModel");
const Patient = require("../models/patientModel");
const Staff = require("../models/staffModel");
const Joi = require("joi");
const mongoose = require("mongoose");

// Flexible schema for both new and existing patients
const bookAppointmentSchema = Joi.object({
  // Patient identification (use patientId for existing, or provide details for new)
  patientId: Joi.string().optional(),
  
  // New patient fields (required only if patientId is not provided)
  patientName: Joi.string().when('patientId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  patientEmail: Joi.string().email().when('patientId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  patientContact: Joi.string().when('patientId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  patientAge: Joi.number().when('patientId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  patientGender: Joi.string().valid('Male', 'Female', 'Other').when('patientId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  patientAddress: Joi.string().optional(),
  emergencyContact: Joi.string().optional(),
  
  // Appointment details (always required)
  doctorId: Joi.string().required(),
  departmentId: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required(),
});

// Book appointment for patient (new or existing)
exports.bookAppointmentForPatient = async (req, res) => {
  try {
    const { error } = bookAppointmentSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { 
      patientId, 
      patientName, 
      patientEmail, 
      patientContact, 
      patientAge, 
      patientGender, 
      patientAddress, 
      emergencyContact,
      doctorId, 
      departmentId, 
      date, 
      time 
    } = req.body;

    // Get staff's department
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Verify the appointment is for staff's department only
    if (departmentId !== staff.departmentId.toString()) {
      return res.status(403).json({ 
        message: "You can only book appointments for your own department" 
      });
    }

    // Verify doctor belongs to staff's department
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (doctor.departmentId.toString() !== staff.departmentId.toString()) {
      return res.status(403).json({ 
        message: "This doctor does not belong to your department" 
      });
    }

    let patient;
    let isNewPatient = false;

    // FLOW 1: Existing Patient - Book with Patient ID
    if (patientId) {
      // Check if patientId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findById(patientId);
      }
      
      // If not found by _id, try to find by patientId field (e.g., PAT-2025-000001)
      if (!patient) {
        patient = await Patient.findOne({ patientId: patientId });
      }

      if (!patient) {
        return res.status(404).json({ 
          message: "Patient not found. Please provide patient details to register as a new patient." 
        });
      }
    } 
    // FLOW 2: New Patient - Book with full details
    else {
      // Validate that required fields are provided
      if (!patientName || !patientEmail || !patientContact || !patientAge || !patientGender) {
        return res.status(400).json({ 
          message: "For new patients, please provide: patientName, patientEmail, patientContact, patientAge, and patientGender" 
        });
      }

      // Check if patient already exists by email or contact
      patient = await Patient.findOne({
        $or: [{ email: patientEmail }, { contact: patientContact }]
      });

      if (patient) {
        return res.status(400).json({ 
          message: `Patient already exists with Patient ID: ${patient.patientId}. Please use this Patient ID to book appointments.`,
          existingPatientId: patient.patientId
        });
      }

      // Create new patient with auto-generated ID
      patient = new Patient({
        name: patientName,
        email: patientEmail,
        contact: patientContact,
        age: patientAge,
        gender: patientGender,
        address: patientAddress,
        emergencyContact: emergencyContact,
      });
      await patient.save();
      isNewPatient = true;
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ["Booked", "Attended"] },
    });

    if (existingAppointment) {
      // Find next available slot and create appointment request
      const nextAvailableSlot = await findNextAvailableSlot(doctorId, date);

      if (nextAvailableSlot) {
        const appointment = new Appointment({
          doctorId,
          patientId: patient._id,
          departmentId,
          date: nextAvailableSlot.date,
          time: nextAvailableSlot.time,
          status: "Booked",
          createdBy: req.user._id,
        });

        await appointment.save();
        await appointment.populate([
          { path: "doctorId", select: "name specialization" },
          { path: "patientId", select: "patientId name email contact" },
          { path: "departmentId", select: "name" },
        ]);

        const response = {
          message: isNewPatient
            ? "New patient registered. Requested slot was full. Appointment booked in next available slot."
            : "Requested slot was full. Appointment booked in next available slot.",
          isNewPatient: isNewPatient,
          patientId: patient.patientId,
          appointment,
          nextAvailable: true,
        };

        if (isNewPatient) {
          response.note = "Save your Patient ID for future appointments.";
        }

        return res.status(201).json(response);
      } else {
        return res
          .status(400)
          .json({ message: "No available slots found for this doctor" });
      }
    }

    // Book in requested slot
    const appointment = new Appointment({
      doctorId,
      patientId: patient._id,
      departmentId,
      date,
      time,
      status: "Booked",
      createdBy: req.user._id,
    });

    await appointment.save();
    await appointment.populate([
      { path: "doctorId", select: "name specialization" },
      { path: "patientId", select: "patientId name email contact" },
      { path: "departmentId", select: "name" },
    ]);

    const response = {
      message: isNewPatient 
        ? "New patient registered and appointment booked successfully" 
        : "Appointment booked successfully for existing patient",
      isNewPatient: isNewPatient,
      patientId: patient.patientId,
      patientDetails: {
        id: patient._id,
        patientId: patient.patientId,
        name: patient.name,
        email: patient.email,
        contact: patient.contact,
      },
      appointment: appointment,
    };

    if (isNewPatient) {
      response.note = "Save your Patient ID for future appointments. You can book future appointments using just this Patient ID.";
    }

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update appointment status (Attended, Missed) - Only for staff's department
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Attended", "Missed"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'Attended' or 'Missed'" });
    }

    // Get staff's department
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Find appointment and check if it belongs to staff's department
    const appointmentCheck = await Appointment.findById(req.params.id);
    if (!appointmentCheck) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointmentCheck.departmentId.toString() !== staff.departmentId.toString()) {
      return res.status(403).json({ 
        message: "You can only update appointments in your own department" 
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate([
      { path: "doctorId", select: "name specialization" },
      { path: "patientId", select: "patientId name email contact" },
      { path: "departmentId", select: "name" },
    ]);

    res.json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View today's schedules for staff's department only
exports.getTodaySchedules = async (req, res) => {
  try {
    // Get staff's department
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const today = new Date().toISOString().slice(0, 10);

    const todayAppointments = await Appointment.aggregate([
      {
        $match: { 
          date: today,
          departmentId: staff.departmentId
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: "$doctor",
      },
      {
        $unwind: "$patient",
      },
      {
        $unwind: "$department",
      },
      {
        $group: {
          _id: "$doctor._id",
          doctorName: { $first: "$doctor.name" },
          specialization: { $first: "$doctor.specialization" },
          department: { $first: "$department.name" },
          appointments: {
            $push: {
              appointmentId: "$_id",
              patientId: "$patient.patientId",
              patientName: "$patient.name",
              patientEmail: "$patient.email",
              patientContact: "$patient.contact",
              time: "$time",
              status: "$status",
              date: "$date",
            },
          },
          totalAppointments: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
        },
      },
      {
        $sort: { doctorName: 1 },
      },
    ]);

    res.json({ date: today, schedules: todayAppointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all appointments with filtering options - Only for staff's department
exports.getAllAppointments = async (req, res) => {
  try {
    // Get staff's department
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const { status, date, doctorId } = req.query;
    
    // Always filter by staff's department
    const filter = { departmentId: staff.departmentId };

    if (status) filter.status = status;
    if (date) filter.date = date;
    if (doctorId) {
      // Verify doctor belongs to staff's department
      const doctor = await Doctor.findById(doctorId);
      if (!doctor || doctor.departmentId.toString() !== staff.departmentId.toString()) {
        return res.status(403).json({ 
          message: "This doctor does not belong to your department" 
        });
      }
      filter.doctorId = doctorId;
    }

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialization")
      .populate("patientId", "patientId name email contact")
      .populate("departmentId", "name")
      .sort({ date: -1, time: 1 });

    res.json({
      total: appointments.length,
      appointments: appointments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get daily schedule for a specific date - Only for staff's department
exports.getDailySchedule = async (req, res) => {
  try {
    // Get staff's department
    const staff = await Staff.findById(req.user._id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const { date } = req.params;
    
    // Validate date format
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        message: "Invalid date format. Use YYYY-MM-DD" 
      });
    }

    const dailyAppointments = await Appointment.aggregate([
      {
        $match: { 
          date: date,
          departmentId: staff.departmentId
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: "$doctor",
      },
      {
        $unwind: "$patient",
      },
      {
        $unwind: "$department",
      },
      {
        $group: {
          _id: "$doctor._id",
          doctorName: { $first: "$doctor.name" },
          specialization: { $first: "$doctor.specialization" },
          department: { $first: "$department.name" },
          appointments: {
            $push: {
              appointmentId: "$_id",
              patientId: "$patient.patientId",
              patientName: "$patient.name",
              patientEmail: "$patient.email",
              patientContact: "$patient.contact",
              time: "$time",
              status: "$status",
              date: "$date",
            },
          },
          totalAppointments: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
        },
      },
      {
        $sort: { doctorName: 1 },
      },
    ]);

    res.json({ 
      date: date, 
      schedules: dailyAppointments,
      totalDoctors: dailyAppointments.length,
      totalAppointments: dailyAppointments.reduce((sum, doc) => sum + doc.totalAppointments, 0)
    });
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
      const dayName = checkDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      if (!doctor.availableDays.includes(dayName)) continue;

      // Check each time slot
      for (const slot of doctor.timeSlots) {
        const existingAppointment = await Appointment.findOne({
          doctorId,
          date: dateString,
          time: slot.startTime,
          status: { $in: ["Booked", "Attended"] },
        });

        if (!existingAppointment) {
          return { date: dateString, time: slot.startTime };
        }
      }
    }

    return null;
  } catch (err) {
    console.error("Error finding next available slot:", err);
    return null;
  }
}

module.exports = exports;
