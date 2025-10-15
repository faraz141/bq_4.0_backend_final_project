const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/UserModel");
const Patient = require("../models/patientModel");
const Joi = require("joi");
const mongoose = require("mongoose");

// Flexible schema for both new and existing patients
const bookAppointmentSchema = Joi.object({
  doctorId: Joi.string().required(),
  departmentId: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required(),

  // For existing patients - just provide patientId
  patientId: Joi.string().optional(),

  // For new patients - provide full details
  patientName: Joi.string().when("patientId", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  patientEmail: Joi.string().email().when("patientId", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  patientContact: Joi.string().when("patientId", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  patientAge: Joi.number().min(1).max(120).when("patientId", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  patientGender: Joi.string()
    .valid("Male", "Female", "Other")
    .when("patientId", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
  patientAddress: Joi.string().optional(),
  emergencyContact: Joi.string().optional(),
});

// Patient books appointment without authentication (public endpoint)
// Supports two flows:
// 1. New Patient: Provide full details (name, email, contact, age, gender) - auto-generates Patient ID
// 2. Existing Patient: Provide only patientId (e.g., PAT-2025-000001)
exports.bookAppointment = async (req, res) => {
  try {
    const { error } = bookAppointmentSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const {
      doctorId,
      departmentId,
      date,
      time,
      patientId,
      patientName,
      patientEmail,
      patientContact,
      patientAge,
      patientGender,
      patientAddress,
      emergencyContact,
    } = req.body;

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ["Booked", "Attended"] },
    });

    if (existingAppointment) {
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    }

    // Verify doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== "Active") {
      return res.status(400).json({ message: "Doctor not available" });
    }

    // Check if the requested date is an available day for the doctor
    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    if (!doctor.availableDays.includes(dayName)) {
      return res.status(400).json({
        message: `Doctor is not available on ${dayName}s`,
      });
    }

    // Check if the requested time slot exists in doctor's timeSlots
    const timeSlotExists = doctor.timeSlots.some(
      (slot) => slot.startTime === time
    );
    if (!timeSlotExists) {
      return res.status(400).json({
        message:
          "Invalid time slot. Please check doctor's available time slots.",
      });
    }

    let patient;
    let isNewPatient = false;

    // FLOW 1: Existing Patient - Book with Patient ID
    if (patientId) {
      // Check if patientId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        // Try to find patient by MongoDB _id
        patient = await Patient.findById(patientId);
      }

      // If not found by _id, try to find by patientId field (e.g., PAT-2025-000001)
      if (!patient) {
        patient = await Patient.findOne({ patientId: patientId });
      }

      if (!patient) {
        return res.status(404).json({
          message:
            "Patient not found. Please provide patient details to register as a new patient.",
        });
      }
    }
    // FLOW 2: New Patient - Book with full details
    else {
      // Validate that required fields are provided
      if (
        !patientName ||
        !patientEmail ||
        !patientContact ||
        !patientAge ||
        !patientGender
      ) {
        return res.status(400).json({
          message:
            "For new patients, please provide: patientName, patientEmail, patientContact, patientAge, and patientGender",
        });
      }

      // Check if patient already exists by email or contact
      patient = await Patient.findOne({
        $or: [{ email: patientEmail }, { contact: patientContact }],
      });

      if (patient) {
        // Patient exists but didn't provide patientId
        return res.status(400).json({
          message: `Patient already exists with Patient ID: ${patient.patientId}. Please use this Patient ID to book appointments.`,
          existingPatientId: patient.patientId,
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

    // Create appointment
    const appointment = new Appointment({
      doctorId,
      patientId: patient._id,
      departmentId,
      date,
      time,
      status: "Booked",
    });

    await appointment.save();

    // Populate appointment details
    await appointment.populate([
      { path: "doctorId", select: "name specialization" },
      { path: "departmentId", select: "name" },
      { path: "patientId", select: "patientId name email contact age gender" },
    ]);

    // Prepare response based on patient type
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

    // Add note for new patients
    if (isNewPatient) {
      response.note =
        "Save your Patient ID for future appointments. You can book future appointments using just this Patient ID.";
    }

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get patient's appointment history by patient ID (public endpoint)
exports.getPatientAppointmentHistory = async (req, res) => {
  try {
    const { patientId } = req.params; // Patient ID from URL parameter
    const { status, upcoming } = req.query;

    // Find patient by patientId
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    let filter = { patientId: patient._id };
    if (status) filter.status = status;

    const today = new Date().toISOString().slice(0, 10);

    if (upcoming === "true") {
      filter.date = { $gte: today };
    } else if (upcoming === "false") {
      filter.date = { $lt: today };
    }

    const appointments = await Appointment.find(filter)
      .populate([
        {
          path: "doctorId",
          select: "name specialization",
          populate: { path: "departmentId", select: "name" },
        },
        { path: "departmentId", select: "name description" },
      ])
      .sort({ date: -1, time: 1 });

    // Separate past and upcoming appointments
    const pastAppointments = appointments.filter((apt) => apt.date < today);
    const upcomingAppointments = appointments.filter(
      (apt) => apt.date >= today
    );

    res.json({
      patient: {
        patientId: patient.patientId,
        name: patient.name,
        email: patient.email,
        contact: patient.contact,
      },
      summary: {
        total: appointments.length,
        upcoming: upcomingAppointments.length,
        past: pastAppointments.length,
        attended: appointments.filter((apt) => apt.status === "Attended")
          .length,
        missed: appointments.filter((apt) => apt.status === "Missed").length,
      },
      appointments: {
        upcoming: upcomingAppointments,
        past: pastAppointments,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get patient's appointment history (for authenticated users - kept for backward compatibility)
exports.getMyAppointmentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, upcoming } = req.query;

    let filter = { userId };
    if (status) filter.status = status;

    const today = new Date().toISOString().slice(0, 10);

    if (upcoming === "true") {
      filter.date = { $gte: today };
    } else if (upcoming === "false") {
      filter.date = { $lt: today };
    }

    const appointments = await Appointment.find(filter)
      .populate([
        {
          path: "doctorId",
          select: "name specialization",
          populate: { path: "departmentId", select: "name" },
        },
        { path: "departmentId", select: "name description" },
      ])
      .sort({ date: -1, time: 1 });

    // Separate past and upcoming appointments
    const pastAppointments = appointments.filter((apt) => apt.date < today);
    const upcomingAppointments = appointments.filter(
      (apt) => apt.date >= today
    );

    res.json({
      patient: {
        id: req.user._id,
        name: req.user.name,
      },
      summary: {
        total: appointments.length,
        upcoming: upcomingAppointments.length,
        past: pastAppointments.length,
        attended: appointments.filter((apt) => apt.status === "Attended")
          .length,
        missed: appointments.filter((apt) => apt.status === "Missed").length,
      },
      appointments: {
        upcoming: upcomingAppointments,
        past: pastAppointments,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel appointment by patient ID (public endpoint)
exports.cancelAppointmentByPatientId = async (req, res) => {
  try {
    const { appointmentId, patientId } = req.params;

    // Find patient by patientId
    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patient._id,
      status: "Booked",
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or cannot be cancelled" });
    }

    // Check if appointment is in the future
    const today = new Date().toISOString().slice(0, 10);
    if (appointment.date <= today) {
      return res
        .status(400)
        .json({ message: "Cannot cancel past or today's appointments" });
    }

    await Appointment.findByIdAndDelete(appointmentId);
    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel appointment (only for upcoming appointments) - kept for authenticated users
exports.cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user._id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId,
      status: "Booked",
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or cannot be cancelled" });
    }

    // Check if appointment is in the future
    const today = new Date().toISOString().slice(0, 10);
    if (appointment.date <= today) {
      return res
        .status(400)
        .json({ message: "Cannot cancel past or today's appointments" });
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

    if (!["Booked", "Attended", "Missed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
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

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all appointments (Admin/Staff view)
exports.getAllAppointments = async (req, res) => {
  try {
    const {
      status,
      date,
      doctorId,
      departmentId,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) filter.date = date;
    if (doctorId) filter.doctorId = doctorId;
    if (departmentId) filter.departmentId = departmentId;

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialization")
      .populate("patientId", "patientId name email contact age gender")
      .populate("departmentId", "name")
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
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search patient by patient ID (public endpoint)
exports.searchPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      patient: {
        patientId: patient.patientId,
        name: patient.name,
        email: patient.email,
        contact: patient.contact,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        createdAt: patient.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all patients (Admin/Staff view)
exports.getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { patientId: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { contact: { $regex: search, $options: "i" } },
        ],
      };
    }

    const patients = await Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Patient.countDocuments(filter);

    res.json({
      patients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPatients: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
