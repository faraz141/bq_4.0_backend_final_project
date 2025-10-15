const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["Booked", "Attended", "Missed"],
    default: "Booked",
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ departmentId: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
