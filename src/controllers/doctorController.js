const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/UserModel");

exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const doctorId = req.user._id;

    const appointments = await Appointment.find({
      doctorId,
      date: today,
    })
      .populate("userId", "name email age gender contact address")
      .populate("departmentId", "name")
      .sort({ time: 1 });

    res.json({
      date: today,
      doctor: {
        id: req.user._id,
        name: req.user.name,
        specialization: req.user.specialization,
      },
      appointments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMonthlyStatistics = async (req, res) => {
  try {
    const { year, month } = req.query;
    const doctorId = req.user._id;

    let matchCondition = { doctorId };

    if (year && month) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
      matchCondition.date = { $gte: startDate, $lte: endDate };
    }

    const monthlyStats = await Appointment.aggregate([
      { $match: matchCondition },
      {
        $addFields: {
          monthYear: { $substr: ["$date", 0, 7] },
        },
      },
      {
        $group: {
          _id: "$monthYear",
          totalAppointments: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json({
      doctorId,
      monthlyStatistics: monthlyStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatientHistory = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { doctorId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const patientHistory = await Appointment.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "userId",
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
      { $unwind: "$patient" },
      { $unwind: "$department" },
      {
        $group: {
          _id: "$patient._id",
          patientName: { $first: "$patient.name" },
          patientEmail: { $first: "$patient.email" },
          patientAge: { $first: "$patient.age" },
          patientGender: { $first: "$patient.gender" },
          patientContact: { $first: "$patient.contact" },
          totalVisits: { $sum: 1 },
          lastVisit: { $max: "$date" },
          firstVisit: { $min: "$date" },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          appointments: {
            $push: {
              date: "$date",
              time: "$time",
              status: "$status",
              department: "$department.name",
            },
          },
        },
      },
      { $sort: { lastVisit: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    const totalPatients = await Appointment.distinct("userId", {
      doctorId,
    }).then((ids) => ids.length);

    res.json({
      patientHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPatients / limit),
        totalPatients,
        hasNext: page * limit < totalPatients,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const { departmentId, specialization, status } = req.query;
    const filter = {};

    if (departmentId) filter.departmentId = departmentId;
    if (specialization) filter.specialization = new RegExp(specialization, "i");
    if (status) filter.status = status;

    const doctors = await Doctor.find(filter)
      .select("-password")
      .populate("departmentId", "name description");

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findById(doctorId).select(
      "name specialization availableDays timeSlots"
    );
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (date) {
      const dayName = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      const isAvailable = doctor.availableDays.includes(dayName);

      if (!isAvailable) {
        return res.json({
          doctor: {
            id: doctor._id,
            name: doctor.name,
            specialization: doctor.specialization,
          },
          date,
          available: false,
          slots: [],
        });
      }

      const bookedSlots = await Appointment.find({
        doctorId,
        date,
        status: { $in: ["Booked", "Attended"] },
      }).select("time");

      const bookedTimes = bookedSlots.map((slot) => slot.time);
      const availableSlots = doctor.timeSlots.filter(
        (slot) => !bookedTimes.includes(slot.startTime)
      );

      res.json({
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
        },
        date,
        dayName,
        available: true,
        totalSlots: doctor.timeSlots.length,
        availableSlots,
        bookedSlots: bookedTimes,
      });
    } else {
      res.json({
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialization: doctor.specialization,
        },
        availableDays: doctor.availableDays,
        timeSlots: doctor.timeSlots,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
