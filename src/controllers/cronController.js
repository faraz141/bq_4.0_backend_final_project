const { DailyStats } = require("../services/cronJobService");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");

// Get daily statistics
exports.getDailyStatistics = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    const skip = (page - 1) * limit;

    const dailyStats = await DailyStats.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await DailyStats.countDocuments(filter);

    // Calculate summary statistics
    const summaryStats = await DailyStats.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          avgDailyAppointments: { $avg: "$totalAppointments" },
          totalAppointments: { $sum: "$totalAppointments" },
          totalAttended: { $sum: "$attendedAppointments" },
          totalMissed: { $sum: "$missedAppointments" },
          totalBooked: { $sum: "$bookedAppointments" },
        },
      },
      {
        $addFields: {
          overallAttendanceRate: {
            $cond: [
              { $eq: ["$totalAppointments", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$totalAttended", "$totalAppointments"] },
                  100,
                ],
              },
            ],
          },
          overallMissedRate: {
            $cond: [
              { $eq: ["$totalAppointments", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$totalMissed", "$totalAppointments"] },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]);

    res.json({
      summary: summaryStats[0] || {
        totalDays: 0,
        avgDailyAppointments: 0,
        totalAppointments: 0,
        totalAttended: 0,
        totalMissed: 0,
        totalBooked: 0,
        overallAttendanceRate: 0,
        overallMissedRate: 0,
      },
      dailyStatistics: dailyStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalRecords: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get statistics for a specific date
exports.getStatsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const stats = await DailyStats.findOne({ date })
      .populate("departmentStats.departmentId", "name description")
      .populate("doctorStats.doctorId", "name specialization status");

    if (!stats) {
      return res
        .status(404)
        .json({ message: "Statistics not found for this date" });
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manually trigger daily statistics generation for a specific date
exports.generateStatsForDate = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Check if stats already exist
    const existingStats = await DailyStats.findOne({ date });
    if (existingStats) {
      return res
        .status(400)
        .json({ message: "Statistics already exist for this date" });
    }

    // Generate statistics manually
    const overallStats = await Appointment.aggregate([
      { $match: { date } },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          attendedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] },
          },
          bookedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] },
          },
        },
      },
    ]);

    // Generate department-wise statistics
    const departmentStats = await Appointment.aggregate([
      { $match: { date } },
      {
        $lookup: {
          from: "departments",
          localField: "departmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      {
        $group: {
          _id: "$departmentId",
          departmentName: { $first: "$department.name" },
          totalAppointments: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
        },
      },
    ]);

    // Generate doctor-wise statistics
    const doctorStats = await Appointment.aggregate([
      { $match: { date } },
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
          _id: "$doctorId",
          doctorName: { $first: "$doctor.name" },
          specialization: { $first: "$doctor.specialization" },
          totalAppointments: { $sum: 1 },
          attended: {
            $sum: { $cond: [{ $eq: ["$status", "Attended"] }, 1, 0] },
          },
          missed: { $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] } },
          booked: { $sum: { $cond: [{ $eq: ["$status", "Booked"] }, 1, 0] } },
        },
      },
    ]);

    // Create daily statistics record
    const dailyStats = new DailyStats({
      date,
      totalAppointments: overallStats[0]?.totalAppointments || 0,
      attendedAppointments: overallStats[0]?.attendedAppointments || 0,
      missedAppointments: overallStats[0]?.missedAppointments || 0,
      bookedAppointments: overallStats[0]?.bookedAppointments || 0,
      departmentStats: departmentStats.map((dept) => ({
        departmentId: dept._id,
        departmentName: dept.departmentName,
        totalAppointments: dept.totalAppointments,
        attended: dept.attended,
        missed: dept.missed,
        booked: dept.booked,
      })),
      doctorStats: doctorStats.map((doc) => ({
        doctorId: doc._id,
        doctorName: doc.doctorName,
        specialization: doc.specialization,
        totalAppointments: doc.totalAppointments,
        attended: doc.attended,
        missed: doc.missed,
        booked: doc.booked,
      })),
    });

    await dailyStats.save();

    res.status(201).json({
      message: "Daily statistics generated successfully",
      stats: dailyStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manually update missed appointments for a specific date
exports.updateMissedAppointmentsForDate = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Only allow updating past dates
    if (moment(date).isAfter(moment().subtract(1, "day"))) {
      return res
        .status(400)
        .json({ message: "Can only update appointments for past dates" });
    }

    const result = await Appointment.updateMany(
      {
        date,
        status: "Booked",
      },
      {
        $set: { status: "Missed" },
      }
    );

    res.json({
      message: `Updated ${result.modifiedCount} appointments to 'Missed' status`,
      date,
      updatedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get cron job execution summary
exports.getCronJobSummary = async (req, res) => {
  try {
    // Get latest daily stats to show cron job activity
    const latestStats = await DailyStats.findOne().sort({ date: -1 });

    // Get appointment cleanup statistics
    const today = moment().format("YYYY-MM-DD");
    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");

    const todayBooked = await Appointment.countDocuments({
      date: today,
      status: "Booked",
    });
    const yesterdayMissed = await Appointment.countDocuments({
      date: yesterday,
      status: "Missed",
    });

    // Get total daily stats count
    const totalDailyStatsRecords = await DailyStats.countDocuments();

    // Get upcoming appointments that would need reminders
    const tomorrow = moment().add(1, "day").format("YYYY-MM-DD");
    const upcomingAppointments = await Appointment.countDocuments({
      date: tomorrow,
      status: "Booked",
    });

    res.json({
      cronJobStatus: {
        appointmentCleanup: {
          description: "Marks booked appointments as missed after end of day",
          schedule: "Daily at 12:00 AM",
          lastRun: latestStats
            ? `Stats available for ${latestStats.date}`
            : "No recent data",
          nextRun: "Tonight at 12:00 AM",
        },
        dailyStatsGeneration: {
          description: "Generates daily appointment statistics",
          schedule: "Daily at 6:00 AM",
          lastRun: latestStats ? latestStats.createdAt : "No data",
          totalRecords: totalDailyStatsRecords,
        },
        weeklyCleanup: {
          description: "Cleans up old data and identifies inactive users",
          schedule: "Weekly on Sunday at 2:00 AM",
          nextRun: "Next Sunday at 2:00 AM",
        },
        reminderProcessing: {
          description: "Processes appointment reminders",
          schedule: "Every hour",
          upcomingReminders: upcomingAppointments,
        },
      },
      currentMetrics: {
        todayBookedAppointments: todayBooked,
        yesterdayMissedAppointments: yesterdayMissed,
        tomorrowUpcomingAppointments: upcomingAppointments,
        dailyStatsRecords: totalDailyStatsRecords,
        latestStatsDate: latestStats ? latestStats.date : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
