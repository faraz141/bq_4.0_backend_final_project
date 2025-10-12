const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/UserModel");
const Staff = require("../models/staffModel");
const Department = require("../models/deparmentModel");

// Doctors Monthly Appointment Report: Count appointments grouped by month
exports.getDoctorsMonthlyReport = async (req, res) => {
  try {
    const { year, doctorId } = req.query;

    let matchCondition = {};
    if (year) {
      matchCondition.date = { $regex: `^${year}` };
    }
    if (doctorId) {
      matchCondition.doctorId = doctorId;
    }

    const monthlyReport = await Appointment.aggregate([
      { $match: matchCondition },
      {
        $addFields: {
          monthYear: { $substr: ["$date", 0, 7] }, // Extract YYYY-MM
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
      { $unwind: "$doctor" },
      {
        $group: {
          _id: {
            doctorId: "$doctorId",
            doctorName: "$doctor.name",
            specialization: "$doctor.specialization",
            month: "$monthYear",
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
        $group: {
          _id: {
            doctorId: "$_id.doctorId",
            doctorName: "$_id.doctorName",
            specialization: "$_id.specialization",
          },
          monthlyData: {
            $push: {
              month: "$_id.month",
              totalAppointments: "$totalAppointments",
              attended: "$attended",
              missed: "$missed",
              booked: "$booked",
            },
          },
          totalYearlyAppointments: { $sum: "$totalAppointments" },
          totalYearlyAttended: { $sum: "$attended" },
          totalYearlyMissed: { $sum: "$missed" },
        },
      },
      { $sort: { totalYearlyAppointments: -1 } },
    ]);

    res.json({
      year: year || "All Years",
      doctorsMonthlyReport: monthlyReport,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Dashboard: Appointments grouped by department
exports.getAdminDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchCondition = {};
    if (startDate && endDate) {
      matchCondition.date = { $gte: startDate, $lte: endDate };
    }

    const appointmentsByDepartment = await Appointment.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
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
      { $unwind: "$department" },
      { $unwind: "$doctor" },
      {
        $group: {
          _id: {
            departmentId: "$department._id",
            departmentName: "$department.name",
          },
          totalAppointments: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
          uniqueDoctors: { $addToSet: "$doctor._id" },
          uniquePatients: { $addToSet: "$userId" },
          doctorNames: { $addToSet: "$doctor.name" },
        },
      },
      {
        $project: {
          departmentId: "$_id.departmentId",
          departmentName: "$_id.departmentName",
          totalAppointments: 1,
          attended: 1,
          missed: 1,
          booked: 1,
          attendanceRate: {
            $cond: [
              { $eq: ["$totalAppointments", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$attended", "$totalAppointments"] },
                  100,
                ],
              },
            ],
          },
          doctorCount: { $size: "$uniqueDoctors" },
          patientCount: { $size: "$uniquePatients" },
          doctorNames: 1,
          _id: 0,
        },
      },
      { $sort: { totalAppointments: -1 } },
    ]);

    // Overall hospital statistics
    const overallStats = await Appointment.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
          uniquePatients: { $addToSet: "$userId" },
          uniqueDoctors: { $addToSet: "$doctorId" },
        },
      },
      {
        $project: {
          totalAppointments: 1,
          attended: 1,
          missed: 1,
          booked: 1,
          overallAttendanceRate: {
            $cond: [
              { $eq: ["$totalAppointments", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$attended", "$totalAppointments"] },
                  100,
                ],
              },
            ],
          },
          uniquePatients: { $size: "$uniquePatients" },
          uniqueDoctors: { $size: "$uniqueDoctors" },
          _id: 0,
        },
      },
    ]);

    // Entity counts
    const entityCounts = {
      totalDoctors: await Doctor.countDocuments(),
      activeDoctors: await Doctor.countDocuments({ status: "Active" }),
      totalStaff: await Staff.countDocuments(),
      totalPatients: await User.countDocuments({ role: "patient" }),
      totalDepartments: await Department.countDocuments(),
    };

    res.json({
      period: startDate && endDate ? `${startDate} to ${endDate}` : "All Time",
      departmentWiseStats: appointmentsByDepartment,
      overallStats: overallStats[0] || {
        totalAppointments: 0,
        attended: 0,
        missed: 0,
        booked: 0,
        overallAttendanceRate: 0,
        uniquePatients: 0,
        uniqueDoctors: 0,
      },
      entityCounts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Staff Daily Schedule: Joined data of doctors and patients for today
exports.getStaffDailySchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    const dailySchedule = await Appointment.aggregate([
      { $match: { date: targetDate } },
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
      { $unwind: "$doctor" },
      { $unwind: "$patient" },
      { $unwind: "$department" },
      {
        $project: {
          appointmentId: "$_id",
          time: 1,
          status: 1,
          doctor: {
            id: "$doctor._id",
            name: "$doctor.name",
            specialization: "$doctor.specialization",
          },
          patient: {
            id: "$patient._id",
            name: "$patient.name",
            email: "$patient.email",
            contact: "$patient.contact",
            age: "$patient.age",
            gender: "$patient.gender",
          },
          department: {
            id: "$department._id",
            name: "$department.name",
          },
        },
      },
      { $sort: { time: 1 } },
    ]);

    // Group by doctor for easier viewing
    const scheduleByDoctor = await Appointment.aggregate([
      { $match: { date: targetDate } },
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
      { $unwind: "$doctor" },
      { $unwind: "$patient" },
      { $unwind: "$department" },
      {
        $group: {
          _id: "$doctor._id",
          doctorName: { $first: "$doctor.name" },
          specialization: { $first: "$doctor.specialization" },
          department: { $first: "$department.name" },
          appointments: {
            $push: {
              appointmentId: "$_id",
              time: "$time",
              status: "$status",
              patient: {
                id: "$patient._id",
                name: "$patient.name",
                email: "$patient.email",
                contact: "$patient.contact",
                age: "$patient.age",
                gender: "$patient.gender",
              },
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
        $addFields: {
          appointments: {
            $sortArray: { input: "$appointments", sortBy: { time: 1 } },
          },
        },
      },
      { $sort: { doctorName: 1 } },
    ]);

    res.json({
      date: targetDate,
      totalAppointments: dailySchedule.length,
      appointmentsList: dailySchedule,
      scheduleByDoctor,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Missed vs Attended Appointment Report: For hospital statistics
exports.getMissedVsAttendedReport = async (req, res) => {
  try {
    const { startDate, endDate, departmentId, doctorId } = req.query;

    let matchCondition = {};
    if (startDate && endDate) {
      matchCondition.date = { $gte: startDate, $lte: endDate };
    }
    if (departmentId) {
      matchCondition.departmentId = departmentId;
    }
    if (doctorId) {
      matchCondition.doctorId = doctorId;
    }

    const report = await Appointment.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
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
      { $unwind: "$department" },
      { $unwind: "$doctor" },
      {
        $group: {
          _id: {
            status: "$status",
            departmentName: "$department.name",
            doctorName: "$doctor.name",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            departmentName: "$_id.departmentName",
            doctorName: "$_id.doctorName",
          },
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          totalAppointments: { $sum: "$count" },
        },
      },
      {
        $addFields: {
          attended: {
            $reduce: {
              input: "$statusCounts",
              initialValue: 0,
              in: {
                $cond: [
                  { $eq: ["$$this.status", "Attended"] },
                  "$$this.count",
                  "$$value",
                ],
              },
            },
          },
          missed: {
            $reduce: {
              input: "$statusCounts",
              initialValue: 0,
              in: {
                $cond: [
                  { $eq: ["$$this.status", "Missed"] },
                  "$$this.count",
                  "$$value",
                ],
              },
            },
          },
          booked: {
            $reduce: {
              input: "$statusCounts",
              initialValue: 0,
              in: {
                $cond: [
                  { $eq: ["$$this.status", "Booked"] },
                  "$$this.count",
                  "$$value",
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          attendanceRate: {
            $cond: [
              { $eq: ["$totalAppointments", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$attended", "$totalAppointments"] },
                  100,
                ],
              },
            ],
          },
          missedRate: {
            $cond: [
              { $eq: ["$totalAppointments", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$missed", "$totalAppointments"] },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: { totalAppointments: -1 } },
    ]);

    // Overall summary
    const overallSummary = await Appointment.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const summaryObj = {
      totalAppointments: 0,
      attended: 0,
      missed: 0,
      booked: 0,
    };

    overallSummary.forEach((item) => {
      summaryObj.totalAppointments += item.count;
      summaryObj[item._id.toLowerCase()] = item.count;
    });

    summaryObj.attendanceRate =
      summaryObj.totalAppointments > 0
        ? Math.round(
            (summaryObj.attended / summaryObj.totalAppointments) * 100 * 100
          ) / 100
        : 0;
    summaryObj.missedRate =
      summaryObj.totalAppointments > 0
        ? Math.round(
            (summaryObj.missed / summaryObj.totalAppointments) * 100 * 100
          ) / 100
        : 0;

    res.json({
      period: startDate && endDate ? `${startDate} to ${endDate}` : "All Time",
      overallSummary: summaryObj,
      detailedReport: report,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User Appointment History: With doctor and department details
exports.getUserAppointmentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 50 } = req.query;

    let matchCondition = { userId };
    if (status) {
      matchCondition.status = status;
    }

    const appointmentHistory = await Appointment.aggregate([
      { $match: matchCondition },
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
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$doctor" },
      { $unwind: "$department" },
      { $unwind: "$patient" },
      {
        $project: {
          appointmentId: "$_id",
          date: 1,
          time: 1,
          status: 1,
          createdAt: 1,
          patient: {
            id: "$patient._id",
            name: "$patient.name",
            email: "$patient.email",
          },
          doctor: {
            id: "$doctor._id",
            name: "$doctor.name",
            specialization: "$doctor.specialization",
          },
          department: {
            id: "$department._id",
            name: "$department.name",
            description: "$department.description",
          },
        },
      },
      { $sort: { date: -1, time: -1 } },
      { $limit: parseInt(limit) },
    ]);

    // Get appointment statistics for the user
    const userStats = await Appointment.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      userId,
      userStatistics: userStats[0] || {
        totalAppointments: 0,
        attended: 0,
        missed: 0,
        booked: 0,
      },
      appointmentHistory,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
