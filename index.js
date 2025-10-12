const express = require("express");
require("dotenv").config();
const app = express();
const dbConnection = require("./config/db_connection");
const departmentRoutes = require("./routes/departmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const staffRoutes = require("./routes/staffRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/departments", departmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/staff", staffRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
