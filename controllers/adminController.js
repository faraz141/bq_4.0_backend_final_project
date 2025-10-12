const User = require("../models/UserModel");
const Staff = require("../models/staffModel");
const Doctor = require("../models/doctorModel");
const Department = require("../models/deparmentModel");
const Appointment = require("../models/appointmentModel");
const Joi = require("joi");

// Validation schemas
const createStaffSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  departmentId: Joi.string().required(),
  role: Joi.string().valid('staff', 'subadmin').optional()
});

const createDoctorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  specialization: Joi.string().required(),
  departmentId: Joi.string().required(),
  availableDays: Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')).optional(),
  timeSlots: Joi.array().items(Joi.object({
    startTime: Joi.string().required(),
    endTime: Joi.string().required()
  })).optional()
});

// Staff Management
exports.createStaff = async (req, res) => {
  try {
    const { error } = createStaffSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password, departmentId, role } = req.body;
    
    // Check if email already exists
    const userExists = await User.findOne({ email });
    const staffExists = await Staff.findOne({ email });
    const doctorExists = await Doctor.findOne({ email });
    
    if (userExists || staffExists || doctorExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const staff = new Staff({
      name,
      email,
      password,
      departmentId,
      role: role || 'staff',
      createdBy: req.user._id
    });

    await staff.save();
    res.status(201).json({ message: "Staff created successfully", staff: { ...staff.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { name, departmentId, role } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, departmentId, role },
      { new: true }
    ).select('-password');
    
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select('-password').populate('departmentId', 'name');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Doctor Management
exports.createDoctor = async (req, res) => {
  try {
    const { error } = createDoctorSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password, specialization, departmentId, availableDays, timeSlots } = req.body;
    
    // Check if email already exists
    const userExists = await User.findOne({ email });
    const staffExists = await Staff.findOne({ email });
    const doctorExists = await Doctor.findOne({ email });
    
    if (userExists || staffExists || doctorExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const doctor = new Doctor({
      name,
      email,
      password,
      specialization,
      departmentId,
      availableDays: availableDays || [],
      timeSlots: timeSlots || [],
      createdBy: req.user._id
    });

    await doctor.save();
    res.status(201).json({ message: "Doctor created successfully", doctor: { ...doctor.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { name, specialization, departmentId, availableDays, timeSlots, status } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { name, specialization, departmentId, availableDays, timeSlots, status },
      { new: true }
    ).select('-password');
    
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password').populate('departmentId', 'name');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign multiple doctors to departments
exports.assignDoctorsToDepartment = async (req, res) => {
  try {
    const { doctorIds, departmentId, availableDays, timeSlots } = req.body;
    
    const updatePromises = doctorIds.map(doctorId => 
      Doctor.findByIdAndUpdate(
        doctorId,
        { 
          departmentId,
          availableDays: availableDays || [],
          timeSlots: timeSlots || []
        },
        { new: true }
      )
    );

    const updatedDoctors = await Promise.all(updatePromises);
    res.json({ message: "Doctors assigned successfully", doctors: updatedDoctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hospital Statistics for Admin Dashboard
exports.getHospitalStatistics = async (req, res) => {
  try {
    // Appointments by department
    const appointmentsByDepartment = await Appointment.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $group: {
          _id: '$department.name',
          totalAppointments: { $sum: 1 },
          attended: { $sum: { $cond: [{ $eq: ['$status', 'Attended'] }, 1, 0] } },
          missed: { $sum: { $cond: [{ $eq: ['$status', 'Missed'] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ['$status', 'Booked'] }, 1, 0] } }
        }
      },
      {
        $sort: { totalAppointments: -1 }
      }
    ]);

    // Overall statistics
    const totalStats = await Appointment.aggregate([
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          attended: { $sum: { $cond: [{ $eq: ['$status', 'Attended'] }, 1, 0] } },
          missed: { $sum: { $cond: [{ $eq: ['$status', 'Missed'] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ['$status', 'Booked'] }, 1, 0] } }
        }
      }
    ]);

    // Count by entity type
    const totalDoctors = await Doctor.countDocuments();
    const totalStaff = await Staff.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDepartments = await Department.countDocuments();

    res.json({
      appointmentsByDepartment,
      overallStats: totalStats[0] || { totalAppointments: 0, attended: 0, missed: 0, booked: 0 },
      entityCounts: {
        doctors: totalDoctors,
        staff: totalStaff,
        patients: totalPatients,
        departments: totalDepartments
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;