const { CronJob } = require("cron");
const moment = require("moment");
const Appointment = require("../models/appointmentModel");
const Doctor = require("../models/doctorModel");
const User = require("../models/UserModel");
const Staff = require("../models/staffModel");
const Department = require("../models/deparmentModel");

// Model for storing daily statistics
const mongoose = require("mongoose");

const dailyStatsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD
  totalAppointments: { type: Number, default: 0 },
  attendedAppointments: { type: Number, default: 0 },
  missedAppointments: { type: Number, default: 0 },
  bookedAppointments: { type: Number, default: 0 },
  departmentStats: [
    {
      departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
      departmentName: String,
      totalAppointments: Number,
      attended: Number,
      missed: Number,
      booked: Number,
    },
  ],
  doctorStats: [
    {
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
      doctorName: String,
      specialization: String,
      totalAppointments: Number,
      attended: Number,
      missed: Number,
      booked: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const DailyStats = mongoose.model("DailyStats", dailyStatsSchema);

class CronJobService {
  constructor() {
    this.jobs = [];
    this.initializeCronJobs();
  }

  initializeCronJobs() {
    // 1. Appointment Status Update - Every night at 12:00 AM
    this.createJob(
      "appointmentCleanup",
      "0 0 * * *",
      this.updateMissedAppointments.bind(this)
    );

    // 2. Daily Statistics Generation - Every morning at 6:00 AM
    this.createJob(
      "dailyStats",
      "0 6 * * *",
      this.generateDailyStatistics.bind(this)
    );

    // 3. Data Cleanup Tasks - Every Sunday at 2:00 AM
    this.createJob(
      "weeklyCleanup",
      "0 2 * * 0",
      this.performWeeklyCleanup.bind(this)
    );

    // 4. Reminder Notifications - Every hour (conceptual - would integrate with notification service)
    this.createJob("reminders", "0 * * * *", this.processReminders.bind(this));

    console.log("Cron jobs initialized successfully");
  }

  createJob(name, schedule, task) {
    try {
      const job = new CronJob(
        schedule,
        async () => {
          console.log(
            `[${new Date().toISOString()}] Starting cron job: ${name}`
          );
          try {
            await task();
            console.log(
              `[${new Date().toISOString()}] Completed cron job: ${name}`
            );
          } catch (error) {
            console.error(
              `[${new Date().toISOString()}] Error in cron job ${name}:`,
              error
            );
          }
        },
        null,
        true,
        "UTC"
      );

      this.jobs.push({ name, job, schedule });
      job.start();
      console.log(`Cron job '${name}' scheduled with pattern: ${schedule}`);
    } catch (error) {
      console.error(`Failed to create cron job '${name}':`, error);
    }
  }

  // 1. Automatically mark appointments as "Missed" if not attended by end of day
  async updateMissedAppointments() {
    try {
      const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");

      const result = await Appointment.updateMany(
        {
          date: yesterday,
          status: "Booked",
        },
        {
          $set: { status: "Missed" },
        }
      );

      console.log(
        `Updated ${result.modifiedCount} appointments to 'Missed' status for date: ${yesterday}`
      );

      // Log the action
      await this.logCronAction("appointment_status_update", {
        date: yesterday,
        appointmentsUpdated: result.modifiedCount,
        action: "marked_as_missed",
      });
    } catch (error) {
      console.error("Error updating missed appointments:", error);
    }
  }

  // 2. Generate and store daily summaries
  async generateDailyStatistics() {
    try {
      const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");

      // Check if stats already exist for this date
      const existingStats = await DailyStats.findOne({ date: yesterday });
      if (existingStats) {
        console.log(`Daily statistics already exist for ${yesterday}`);
        return;
      }

      // Generate overall statistics
      const overallStats = await Appointment.aggregate([
        { $match: { date: yesterday } },
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
        { $match: { date: yesterday } },
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
        { $match: { date: yesterday } },
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
        date: yesterday,
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
      console.log(`Daily statistics generated for ${yesterday}`);

      // Log the action
      await this.logCronAction("daily_statistics_generation", {
        date: yesterday,
        totalAppointments: dailyStats.totalAppointments,
        departmentsProcessed: departmentStats.length,
        doctorsProcessed: doctorStats.length,
      });
    } catch (error) {
      console.error("Error generating daily statistics:", error);
    }
  }

  // 3. Weekly data cleanup tasks
  async performWeeklyCleanup() {
    try {
      const thirtyDaysAgo = moment().subtract(30, "days").format("YYYY-MM-DD");

      // Remove very old daily statistics (older than 1 year)
      const oneYearAgo = moment().subtract(1, "year").format("YYYY-MM-DD");
      const oldStatsResult = await DailyStats.deleteMany({
        date: { $lt: oneYearAgo },
      });

      console.log(
        `Cleaned up ${oldStatsResult.deletedCount} old daily statistics records`
      );

      // Log inactive users (conceptual - might move them to archived collection)
      const inactiveUsersCount = await User.countDocuments({
        role: "patient",
        createdAt: { $lt: new Date(thirtyDaysAgo) },
        // Add condition to check if user has no recent appointments
      });

      console.log(
        `Found ${inactiveUsersCount} potentially inactive users (created more than 30 days ago)`
      );

      // Log the cleanup action
      await this.logCronAction("weekly_cleanup", {
        oldStatsDeleted: oldStatsResult.deletedCount,
        inactiveUsersFound: inactiveUsersCount,
        cleanupDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in weekly cleanup:", error);
    }
  }

  // 4. Process reminder notifications (conceptual)
  async processReminders() {
    try {
      const tomorrow = moment().add(1, "day").format("YYYY-MM-DD");
      const currentHour = moment().hour();
      const reminderTime = `${String(currentHour + 1).padStart(2, "0")}:00`;

      // Find appointments that need reminders (1 day before appointment)
      const upcomingAppointments = await Appointment.find({
        date: tomorrow,
        time: { $regex: `^${reminderTime}` },
        status: "Booked",
      })
        .populate("userId", "name email contact")
        .populate("doctorId", "name specialization");

      console.log(
        `Found ${upcomingAppointments.length} appointments needing reminders for ${tomorrow} at ${reminderTime}`
      );

      // In a real implementation, you would integrate with:
      // - Email service (SendGrid, AWS SES, etc.)
      // - SMS service (Twilio, etc.)
      // - Push notification service

      // For now, just log the reminders
      upcomingAppointments.forEach((appointment) => {
        console.log(
          `Reminder needed for: ${appointment.userId.name} - Appointment with Dr. ${appointment.doctorId.name} on ${appointment.date} at ${appointment.time}`
        );
      });

      // Log the reminder processing
      await this.logCronAction("reminder_processing", {
        appointmentsProcessed: upcomingAppointments.length,
        reminderDate: tomorrow,
        reminderTime: reminderTime,
        processedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error processing reminders:", error);
    }
  }

  // Helper method to log cron job actions
  async logCronAction(actionType, data) {
    try {
      // You could create a separate CronLog model to track all cron job executions
      console.log(`[CRON LOG] ${actionType}:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error logging cron action:", error);
    }
  }

  // Method to get job status
  getJobStatus() {
    return this.jobs.map(({ name, schedule }) => ({
      name,
      schedule,
      status: "running",
    }));
  }

  // Method to stop all jobs
  stopAllJobs() {
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    });
  }

  // Method to start all jobs
  startAllJobs() {
    this.jobs.forEach(({ name, job }) => {
      job.start();
      console.log(`Started cron job: ${name}`);
    });
  }
}

// Export both the service class and the DailyStats model
module.exports = { CronJobService, DailyStats };
