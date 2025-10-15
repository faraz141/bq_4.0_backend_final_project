const express = require("express");
require("dotenv").config();
const app = express();
const dbConnection = require("./src/config/db_connection");
const { CronJobService } = require("./src/services/cronJobService");
const authRoutes = require("./src/routes/authRoutes");
const departmentRoutes = require("./src/routes/departmentRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes");
const appointmentRoutes = require("./src/routes/appointmentRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const staffRoutes = require("./src/routes/staffRoutes");
const healthRoutes = require("./src/routes/healthRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


let cronService;
try {
  cronService = new CronJobService();
 
  app.locals.cronService = cronService;
  console.log("Cron jobs service initialized successfully");
} catch (error) {
  console.error("Failed to initialize cron jobs:", error);
}


app.use("/", healthRoutes);


app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/analytics", require("./src/routes/analyticsRoutes"));
app.use("/api/cron", require("./src/routes/cronRoutes"));


process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  if (cronService) {
    cronService.stopAllJobs();
  }
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  if (cronService) {
    cronService.stopAllJobs();
  }
  process.exit(0);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
